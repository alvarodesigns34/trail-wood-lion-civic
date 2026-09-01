import { rbOf, type SimBody } from "./sim";

export const G = 9.81;

/**
 * Solver estructural simplificado.
 *
 * No resuelve un modelo de elementos finitos: mantiene, por cada conjunto de
 * piezas que forman una estructura, una idea de *quién sostiene a quién* y de
 * *cuánta carga aguanta cada apoyo*. Con eso basta para que un edificio se
 * comporte de forma creíble:
 *
 *  - Cada planta tiene una capacidad de apoyo calculada a partir del peso que
 *    debía soportar al construirse, con un coeficiente de seguridad.
 *  - El daño reduce la integridad, y la integridad reduce la capacidad.
 *  - Si la demanda supera la capacidad, la planta se aplasta progresivamente.
 *  - Si una planta se pierde, las de arriba se quedan sin apoyo y caen. No se
 *    las lanza: simplemente dejan de estar sujetas y la gravedad hace el resto.
 *
 * Los conjuntos que no son pilas verticales (el puente) se resuelven por
 * conectividad: lo que no llega a un apoyo anclado al suelo, se cae.
 */

export type StructureKind = "stack" | "span";

/** Coeficiente de seguridad del diseño: cuánta carga extra aguanta de fábrica. */
const SAFETY = 2.8;
/** Capacidad mínima propia de una pieza, aunque no soporte nada encima. */
const SELF_CAPACITY = 0.5;
/** Umbral de integridad por debajo del cual una pieza ya no sostiene nada. */
const SUPPORT_MIN_INTEGRITY = 0.06;
/** Desplome lateral admisible respecto a la planta inferior, en fracción de ancho. */
const DRIFT_TOLERANCE = 0.42;

interface Group {
  id: string;
  kind: StructureKind;
  members: SimBody[];
  prepared: boolean;
}

function detectKind(members: SimBody[]): StructureKind {
  if (members.length < 2) return "stack";
  const stacked = members.filter((m) => (m.floorIndex ?? -1) >= 0);
  if (stacked.length < 2) return "span";
  for (let i = 1; i < stacked.length; i++) {
    if (stacked[i].home.y <= stacked[i - 1].home.y + 0.05) return "span";
  }
  return members.length === stacked.length ? "stack" : "stack";
}

function prepare(g: Group) {
  if (g.kind === "stack") {
    const floors = g.members.filter((m) => (m.floorIndex ?? -1) >= 0);
    let above = 0;
    for (let i = floors.length - 1; i >= 0; i--) {
      const f = floors[i];
      f.designLoad = above * G;
      f.supportCapacity = SAFETY * f.designLoad + SELF_CAPACITY * f.mass * G;
      above += f.mass;
    }
    // Los apoyos que no son plantas (pilares) sostienen todo el conjunto.
    for (const m of g.members) {
      if ((m.floorIndex ?? -1) >= 0) continue;
      m.designLoad = above * G;
      m.supportCapacity = SAFETY * m.designLoad + SELF_CAPACITY * m.mass * G;
    }
  } else {
    for (const m of g.members) {
      m.designLoad = m.mass * G * 1.6;
      m.supportCapacity = SAFETY * m.designLoad;
    }
  }
  g.prepared = true;
}

export class StructureSolver {
  private groups = new Map<string, Group>();
  private dirty = true;

  markDirty() {
    this.dirty = true;
  }

  clear() {
    this.groups.clear();
    this.dirty = true;
  }

  ensure(bodies: Iterable<SimBody>) {
    if (!this.dirty) return;
    this.groups.clear();
    for (const sb of bodies) {
      if (!sb.buildingId) continue;
      let g = this.groups.get(sb.buildingId);
      if (!g) {
        g = { id: sb.buildingId, kind: "stack", members: [], prepared: false };
        this.groups.set(sb.buildingId, g);
      }
      g.members.push(sb);
    }
    for (const g of this.groups.values()) {
      g.members.sort((a, b) => (a.floorIndex ?? 0) - (b.floorIndex ?? 0));
      g.kind = detectKind(g.members);
      prepare(g);
    }
    this.dirty = false;
  }

  groupOf(id: string) {
    return this.groups.get(id);
  }

  /** Plantas todavía unidas de un edificio, de abajo arriba. */
  attachedFloors(buildingId: string) {
    const g = this.groups.get(buildingId);
    if (!g) return [];
    return g.members.filter((m) => m.attached && !m.destroyed);
  }

  /**
   * Un paso del solver. Devuelve las piezas que deben soltarse este paso,
   * ya marcadas con el retardo de propagación correspondiente.
   */
  step(bodies: Iterable<SimBody>, dt: number) {
    this.ensure(bodies);
    for (const g of this.groups.values()) {
      if (!g.prepared) prepare(g);
      if (g.kind === "stack") this.stepStack(g, dt);
      else this.stepSpan(g, dt);
    }
  }

  private stepStack(g: Group, dt: number) {
    const floors = g.members.filter((m) => (m.floorIndex ?? -1) >= 0);
    const props = g.members.filter((m) => (m.floorIndex ?? -1) < 0);

    // 1. Carga acumulada: sólo cuenta lo que sigue unido a la estructura.
    let above = 0;
    for (let i = floors.length - 1; i >= 0; i--) {
      const f = floors[i];
      f.loadAbove = above * G;
      if (f.attached && !f.destroyed) above += f.mass;
    }
    for (const p of props) p.loadAbove = above * G;

    // 2. Sobrecarga: la integridad cede cuando la demanda supera la capacidad.
    for (const f of g.members) {
      if (!f.attached || f.destroyed) {
        f.overloaded = false;
        continue;
      }
      const capacity = f.supportCapacity * Math.pow(Math.max(0, f.integrity), 1.5);
      const demand = f.loadAbove + f.lateralLoad * 2.5;
      if (capacity <= 1 || demand > capacity) {
        const over = capacity > 1 ? demand / capacity - 1 : 3;
        f.integrity = Math.max(0, f.integrity - dt * (0.5 + 1.8 * Math.min(3, over)));
        f.overloaded = true;
      } else {
        f.overloaded = false;
      }
    }

    // 3. Pérdida de apoyo, de abajo arriba.
    let lostAt = -1;
    let supportIntegrity = 1;
    for (let i = 0; i < floors.length; i++) {
      const f = floors[i];
      if (f.destroyed || !f.attached) {
        if (lostAt < 0) lostAt = i;
        continue;
      }
      const failed = f.integrity <= 0.05 || f.forcedFail;
      const unsupported =
        lostAt >= 0 ||
        supportIntegrity < SUPPORT_MIN_INTEGRITY ||
        (i > 0 && this.drift(f, floors[i - 1]) > DRIFT_TOLERANCE);
      if (failed || unsupported) {
        if (lostAt < 0) lostAt = i;
        if (f.releaseIn < 0) {
          // Propagación: cada planta tarda algo más que la de abajo en perder
          // el apoyo. El desfase hace que el bloque superior se desgrane al
          // caer en vez de bajar entero como un ascensor.
          f.releaseIn = failed && !unsupported ? 0.02 : 0.06 + (i - lostAt) * 0.085;
          f.failReason = failed ? "fallo" : "sin apoyo";
        }
      }
      supportIntegrity = f.integrity;
    }

    // 4. Los apoyos sueltos (pilares) arrastran a todo el conjunto.
    for (const p of props) {
      if (p.destroyed || !p.attached) continue;
      if (p.integrity <= 0.05 || p.forcedFail) {
        if (p.releaseIn < 0) {
          p.releaseIn = 0.02;
          p.failReason = "fallo";
        }
      }
    }
  }

  private drift(a: SimBody, b: SimBody) {
    const ax = rbOf(a)?.translation() ?? a.home;
    const bx = rbOf(b)?.translation() ?? b.home;
    const dx = ax.x - bx.x;
    const dz = ax.z - bx.z;
    const w = Math.max(0.5, Math.min(a.size[0], a.size[2]));
    return Math.hypot(dx, dz) / w;
  }

  /**
   * Estructuras horizontales: lo que no está conectado a un apoyo anclado al
   * suelo se viene abajo. Un BFS por proximidad basta y es barato.
   */
  private stepSpan(g: Group, dt: number) {
    const live = g.members.filter((m) => m.attached && !m.destroyed);
    for (const m of live) {
      const capacity = m.supportCapacity * Math.pow(Math.max(0, m.integrity), 1.5);
      const demand = m.mass * G + m.lateralLoad * 2.5;
      if (capacity <= 1 || demand > capacity) {
        const over = capacity > 1 ? demand / capacity - 1 : 3;
        m.integrity = Math.max(0, m.integrity - dt * (0.5 + 1.8 * Math.min(3, over)));
        m.overloaded = true;
      } else {
        m.overloaded = false;
      }
    }
    const sound = live.filter((m) => m.integrity > SUPPORT_MIN_INTEGRITY && !m.forcedFail);
    const anchored = sound.filter((m) => m.home.y - m.size[1] / 2 <= 0.9);
    const reached = new Set<SimBody>(anchored);
    const queue = [...anchored];
    while (queue.length) {
      const cur = queue.pop()!;
      for (const other of sound) {
        if (reached.has(other)) continue;
        const gap = Math.hypot(
          cur.home.x - other.home.x,
          (cur.home.y - other.home.y) * 0.8,
          cur.home.z - other.home.z,
        );
        const reach =
          (Math.max(cur.size[0], cur.size[2]) + Math.max(other.size[0], other.size[2])) * 0.62 +
          0.5;
        if (gap <= reach) {
          reached.add(other);
          queue.push(other);
        }
      }
    }
    for (const m of live) {
      const failed = m.integrity <= 0.05 || m.forcedFail;
      if (failed || !reached.has(m)) {
        if (m.releaseIn < 0) {
          m.releaseIn = failed ? 0.02 : 0.06 + Math.random() * 0.05;
          m.failReason = failed ? "fallo" : "sin apoyo";
        }
      }
    }
  }
}

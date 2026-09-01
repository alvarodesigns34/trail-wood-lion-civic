import type { RapierRigidBody } from "@react-three/rapier";
import type { Object3D } from "three";
import type { BodyKind } from "./types";
import {
  blastField,
  closestPointOnBox,
  distanceToBox,
  naturalRadius,
  projectedArea,
  segmentThroughBox,
  type Quat,
  type Vec3,
} from "./blast";
import {
  materialOf,
  massFor,
  densityFor,
  strengthOf,
  toughnessOf,
  integrityLabel,
} from "./materials";
import { StructureSolver, G } from "./structure";

/* ------------------------------------------------------------------ */
/* Constantes de simulación                                            */
/* ------------------------------------------------------------------ */

/** Velocidad máxima que una sola onda expansiva puede imprimir (m/s). */
const MAX_BLAST_DV = 40;
/** Velocidad angular máxima tras una explosión (rad/s). */
const MAX_BLAST_SPIN = 9;
/** Empuje mínimo para que un objeto suelto llegue a moverse (m/s). */
const FREE_RELEASE_DV = 0.32;
/** Empuje mínimo para que una pieza estructural se desprenda de golpe (m/s). */
const STRUCT_RELEASE_DV = 1.15;
/** Salto de velocidad a partir del cual consideramos que hubo impacto (m/s). */
const IMPACT_MIN_DV = 2.2;
/** Transmisión de la onda a través de una pieza intacta. */
const SHIELD_BASE = 0.3;
/** Número máximo de escombros vivos a la vez. */
export const MAX_DEBRIS = 110;

const IDENTITY: Quat = { x: 0, y: 0, z: 0, w: 1 };

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export interface SimBody {
  id: string;
  kind: BodyKind;
  name: string;
  buildingId?: string;
  floorIndex?: number;

  /** Material visible (fachada, chapa, cristal). */
  material: string;
  /** Material que aguanta de verdad la estructura. */
  frame: string;
  color: string;
  size: [number, number, number];
  volume: number;
  density: number;
  mass: number;
  resistance: number;
  /** kPa de sobrepresión que aguanta antes de dañarse. */
  strength: number;
  /** J/kg de impacto absorbidos por unidad de integridad. */
  toughness: number;
  brittle: number;

  /** 1 = intacta, 0 = arruinada. Es capacidad estructural, no "vida". */
  integrity: number;
  /** Daño acumulado, sólo para puntuación e interfaz. */
  damageTaken: number;
  /** Sigue formando parte de la estructura (cuerpo fijo). */
  attached: boolean;
  /** Ya es un cuerpo dinámico de Rapier. */
  awakened: boolean;
  destroyed: boolean;
  /** Segundos hasta soltarse. Negativo = no programado. */
  releaseIn: number;
  failReason: string;
  forcedFail: boolean;
  overloaded: boolean;

  home: Vec3;
  designLoad: number;
  supportCapacity: number;
  loadAbove: number;
  lateralLoad: number;
  /** Dirección acumulada de la que vino el daño (para que caiga hacia allí). */
  damageDir: Vec3;

  body: RapierRigidBody | null;
  object: Object3D | null;
  awakenReact: (() => void) | null;
  hideReact: (() => void) | null;

  pendingImpulse: Vec3 | null;
  pendingImpulsePoint: Vec3 | null;
  pendingTorque: Vec3 | null;
  pendingVelocity: Vec3 | null;

  prevVel: Vec3;
  impactCooldown: number;
  freeTime: number;
  age: number;
}

export interface ExplosionFx {
  id: number;
  x: number;
  y: number;
  z: number;
  power: number;
  radius: number;
  t: number;
}

export interface DustBurst {
  id: number;
  x: number;
  y: number;
  z: number;
  power: number;
  color: string;
  t: number;
}

export interface ShockwaveFx {
  id: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  t: number;
}

export interface DebrisRequest {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  w: number;
  h: number;
  d: number;
  color: string;
  material: string;
}

export interface RegisterInput {
  id: string;
  kind: BodyKind;
  name: string;
  buildingId?: string;
  floorIndex?: number;
  material: string;
  resistance: number;
  size: [number, number, number];
  color: string;
  position: [number, number, number];
  /** Fracción de la caja realmente maciza (tubos, celosías, cajas vacías). */
  hollow?: number;
  /** Masa explícita en kg (vehículos). Si falta se deduce de la geometría. */
  mass?: number;
}

type ScoreListener = (evt: {
  damage: number;
  destroyed: number;
  chain: number;
  buildingId?: string;
  kind: string;
}) => void;

let fxId = 1;
let debrisSeq = 1;

const tmpDir: Vec3 = { x: 0, y: 0, z: 0 };

/**
 * Acceso seguro al cuerpo de Rapier. Cuando una pieza se retira, React
 * desmonta su RigidBody y el puntero de WASM deja de ser válido; tocarlo
 * revienta el paso de física entero.
 */
export function rbOf(sb: SimBody | null | undefined): RapierRigidBody | null {
  const rb = sb?.body;
  if (!rb || sb!.destroyed) return null;
  try {
    return rb.isValid() ? rb : null;
  } catch {
    return null;
  }
}

/** Para las plantas de un edificio, el cristal es fachada: aguanta el esqueleto. */
function frameMaterial(kind: BodyKind, material: string) {
  if (kind !== "floor" && kind !== "column") return material;
  const m = materialOf(material).id;
  if (m === "vidrio") return "acero";
  if (m === "ladrillo") return "hormigon";
  return material;
}

/* ------------------------------------------------------------------ */

class Simulation {
  bodies = new Map<string, SimBody>();
  structure = new StructureSolver();

  simTime = 0;
  trauma = 0;
  flash = 0;
  fps = 60;

  /** Viento como campo de velocidad real (m/s), no como fuerza mágica. */
  wind = { vx: 0, vz: 0, until: 0, strength: 0 };
  /** Terremoto: aceleración del terreno (m/s²) con envolvente temporal. */
  quake = { amplitude: 0, freq: 1.4, until: 0, start: 0, dirX: 1, dirZ: 0.35 };
  rumble = 0;
  rumbleIntensity = 0;

  explosions: ExplosionFx[] = [];
  shockwaves: ShockwaveFx[] = [];
  dust: DustBurst[] = [];
  debrisQueue: DebrisRequest[] = [];
  retireQueue: string[] = [];
  meteorQueue: { id: string; x: number; z: number; power: number }[] = [];
  debrisAlive = 0;

  chainWindow = 0;
  chainCount = 0;

  private scoreListeners = new Set<ScoreListener>();
  private fxListeners = new Set<() => void>();

  onScore(fn: ScoreListener) {
    this.scoreListeners.add(fn);
    return () => this.scoreListeners.delete(fn);
  }

  onFx(fn: () => void) {
    this.fxListeners.add(fn);
    return () => this.fxListeners.delete(fn);
  }

  private emitFx() {
    this.fxListeners.forEach((fn) => fn());
  }

  private emitScore(evt: Parameters<ScoreListener>[0]) {
    this.scoreListeners.forEach((fn) => fn(evt));
  }

  reset() {
    this.bodies.clear();
    this.structure.clear();
    this.simTime = 0;
    this.trauma = 0;
    this.flash = 0;
    this.wind = { vx: 0, vz: 0, until: 0, strength: 0 };
    this.quake = { amplitude: 0, freq: 1.4, until: 0, start: 0, dirX: 1, dirZ: 0.35 };
    this.rumble = 0;
    this.rumbleIntensity = 0;
    this.explosions = [];
    this.shockwaves = [];
    this.dust = [];
    this.debrisQueue = [];
    this.retireQueue = [];
    this.meteorQueue = [];
    this.debrisAlive = 0;
    this.chainWindow = 0;
    this.chainCount = 0;
  }

  /* ---------------------------------------------------------------- */
  /* Registro                                                          */
  /* ---------------------------------------------------------------- */

  register(input: RegisterInput) {
    const frame = frameMaterial(input.kind, input.material);
    const volume = Math.max(1e-4, input.size[0] * input.size[1] * input.size[2]);
    const mass = input.mass ?? massFor(input.kind, input.material, input.size, input.hollow);
    const body: SimBody = {
      id: input.id,
      kind: input.kind,
      name: input.name,
      buildingId: input.buildingId,
      floorIndex: input.floorIndex,
      material: input.material,
      frame,
      color: input.color,
      size: input.size,
      volume,
      density: mass / volume,
      mass,
      resistance: input.resistance,
      strength: strengthOf(frame, input.resistance),
      toughness: toughnessOf(frame, input.resistance),
      brittle: materialOf(input.material).brittle,
      integrity: 1,
      damageTaken: 0,
      attached: input.kind !== "debris" && input.kind !== "meteor",
      awakened: input.kind === "debris" || input.kind === "meteor",
      destroyed: false,
      releaseIn: -1,
      failReason: "",
      forcedFail: false,
      overloaded: false,
      home: { x: input.position[0], y: input.position[1], z: input.position[2] },
      designLoad: 0,
      supportCapacity: 0,
      loadAbove: 0,
      lateralLoad: 0,
      damageDir: { x: 0, y: 0, z: 0 },
      body: null,
      object: null,
      awakenReact: null,
      hideReact: null,
      pendingImpulse: null,
      pendingImpulsePoint: null,
      pendingTorque: null,
      pendingVelocity: null,
      prevVel: { x: 0, y: 0, z: 0 },
      impactCooldown: 0,
      freeTime: 0,
      age: 0,
    };
    this.bodies.set(input.id, body);
    if (input.kind === "debris") this.debrisAlive += 1;
    if (input.buildingId) this.structure.markDirty();
  }

  attach(
    id: string,
    body: RapierRigidBody | null,
    object: Object3D | null,
    awakenReact: () => void,
    hideReact?: () => void,
  ) {
    const sb = this.bodies.get(id);
    if (!sb) return;
    sb.body = body;
    sb.object = object;
    sb.awakenReact = awakenReact;
    if (hideReact) sb.hideReact = hideReact;
  }

  /** Suelta la referencia al cuerpo de Rapier sin borrar la pieza. */
  detach(id: string) {
    const sb = this.bodies.get(id);
    if (!sb) return;
    sb.body = null;
    sb.object = null;
  }

  unregister(id: string) {
    const sb = this.bodies.get(id);
    if (sb) {
      if (sb.kind === "debris") this.debrisAlive = Math.max(0, this.debrisAlive - 1);
      if (sb.buildingId) this.structure.markDirty();
    }
    this.bodies.delete(id);
  }

  get(id: string) {
    return this.bodies.get(id);
  }

  /** Densidad efectiva que debe usar el collider de Rapier. */
  densityOf(
    kind: BodyKind,
    material: string,
    hollow?: number,
    mass?: number,
    size?: [number, number, number],
  ) {
    if (mass && size) {
      const v = Math.max(1e-4, size[0] * size[1] * size[2]);
      return mass / v;
    }
    return densityFor(kind, material, hollow);
  }

  /* ---------------------------------------------------------------- */
  /* Liberación de piezas (paso de fijo a dinámico)                    */
  /* ---------------------------------------------------------------- */

  /**
   * Convierte una pieza en cuerpo dinámico. Deliberadamente NO aplica ningún
   * impulso: quien la suelta decide si además hay que empujarla. Por defecto,
   * lo único que actúa es la gravedad.
   */
  release(sb: SimBody, reason = "") {
    if (sb.destroyed) return;
    if (sb.awakened) {
      this.applyPending(sb);
      return;
    }
    sb.awakened = true;
    sb.attached = false;
    sb.releaseIn = -1;
    if (reason) sb.failReason = reason;
    if (sb.buildingId) this.structure.markDirty();
    this.noteChain();
    sb.awakenReact?.();
  }

  /** Alias histórico usado por la interfaz ("Liberar"). */
  awaken(sb: SimBody) {
    this.release(sb, sb.failReason || "manual");
  }

  private noteChain() {
    if (this.chainWindow <= 0) this.chainCount = 0;
    this.chainWindow = 4;
    this.chainCount += 1;
  }

  applyPending(sb: SimBody) {
    const rb = rbOf(sb);
    if (!rb || !sb.awakened) return;
    try {
      if (rb.bodyType() !== 0) rb.setBodyType(0, true);
      rb.wakeUp();
      if (sb.pendingVelocity) {
        const v = rb.linvel();
        rb.setLinvel(
          {
            x: v.x + sb.pendingVelocity.x,
            y: v.y + sb.pendingVelocity.y,
            z: v.z + sb.pendingVelocity.z,
          },
          true,
        );
        sb.pendingVelocity = null;
      }
      if (sb.pendingImpulse) {
        if (sb.pendingImpulsePoint) {
          rb.applyImpulseAtPoint(sb.pendingImpulse, sb.pendingImpulsePoint, true);
        } else {
          rb.applyImpulse(sb.pendingImpulse, true);
        }
        sb.pendingImpulse = null;
        sb.pendingImpulsePoint = null;
        this.clampSpin(rb);
      }
      if (sb.pendingTorque) {
        rb.applyTorqueImpulse(sb.pendingTorque, true);
        sb.pendingTorque = null;
        this.clampSpin(rb);
      }
    } catch {
      /* el cuerpo puede no estar todavía en el mundo */
    }
  }

  private clampSpin(rb: RapierRigidBody) {
    const a = rb.angvel();
    const s = Math.hypot(a.x, a.y, a.z);
    if (s > MAX_BLAST_SPIN) {
      const k = MAX_BLAST_SPIN / s;
      rb.setAngvel({ x: a.x * k, y: a.y * k, z: a.z * k }, true);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Daño                                                              */
  /* ---------------------------------------------------------------- */

  /**
   * Daño estructural puro. No mueve nada ni suelta nada: sólo reduce la
   * capacidad. Quién se cae y cuándo lo decide el solver estructural.
   */
  damage(sb: SimBody, amount: number, dir?: Vec3) {
    if (amount <= 0 || sb.destroyed) return 0;
    const before = sb.integrity;
    sb.integrity = Math.max(0, sb.integrity - amount);
    const applied = before - sb.integrity;
    sb.damageTaken += applied;
    if (dir) {
      sb.damageDir.x += dir.x * applied;
      sb.damageDir.y += dir.y * applied;
      sb.damageDir.z += dir.z * applied;
    }
    if (sb.integrity <= 0) {
      sb.forcedFail = true;
      if (!sb.attached) this.fragment(sb);
      else if (sb.releaseIn < 0) sb.releaseIn = 0.02;
    }
    return applied;
  }

  /* ---------------------------------------------------------------- */
  /* Explosión                                                         */
  /* ---------------------------------------------------------------- */

  /**
   * @param charge carga en kg equivalentes de TNT
   * @param radius radio de efecto (m). Fuera de él la onda no existe.
   */
  explode(x: number, y: number, z: number, charge: number, radius: number) {
    const w = Math.max(0.05, charge);
    const r = Math.max(1.5, radius);
    const scale = Math.min(1, Math.cbrt(w) / 8);
    this.trauma = Math.min(1, this.trauma + 0.12 + scale * 0.7);
    this.flash = Math.min(1, 0.18 + scale * 0.85);
    this.explosions.push({ id: fxId++, x, y, z, power: w, radius: r, t: 0 });
    this.shockwaves.push({ id: fxId++, x, y, z, radius: r, t: 0 });
    this.dust.push({ id: fxId++, x, y, z, power: w, color: "#c1b6a4", t: 0 });
    this.emitFx();

    const origin: Vec3 = { x, y, z };
    const list = [...this.bodies.values()];
    let hit = 0;
    let destroyed = 0;
    let damageAcc = 0;

    for (const sb of list) {
      if (sb.destroyed || sb.kind === "terrain") continue;
      const rb0 = rbOf(sb);
      const p = rb0?.translation() ?? sb.home;
      const q = (rb0?.rotation() as Quat | undefined) ?? IDENTITY;
      const center: Vec3 = { x: p.x, y: p.y, z: p.z };
      const dist = distanceToBox(origin, center, sb.size, q);
      if (dist >= r) continue;

      const shield = this.occlusion(origin, center, sb, list, r);
      if (shield <= 0.015) continue;

      const field = blastField(w, dist, r);
      const overpressure = field.overpressure * shield;
      const specificImpulse = field.impulse * shield;
      if (overpressure <= 0.05 && specificImpulse <= 0.05) continue;

      // Dirección: del foco al centro de la pieza. Sin bonus vertical.
      let dx = center.x - x;
      let dy = center.y - y;
      let dz = center.z - z;
      let len = Math.hypot(dx, dy, dz);
      if (len < 1e-4) {
        const a = Math.random() * Math.PI * 2;
        dx = Math.cos(a);
        dy = 0.12;
        dz = Math.sin(a);
        len = Math.hypot(dx, dy, dz);
      }
      tmpDir.x = dx / len;
      tmpDir.y = dy / len;
      tmpDir.z = dz / len;

      // 1. Daño por sobrepresión.
      let applied = 0;
      if (overpressure > sb.strength) {
        const frac = Math.min(1, Math.pow((overpressure - sb.strength) / (sb.strength * 3.2), 0.8));
        applied = this.damage(sb, frac, tmpDir);
        damageAcc += applied * 100;
      }

      // 2. Empuje por impulso específico sobre el área expuesta.
      const area = projectedArea(sb.size, tmpDir, q);
      const impulse = specificImpulse * area; // N·s
      const dv = Math.min(MAX_BLAST_DV, impulse / sb.mass);
      if (dv > 0.02) hit += 1;

      // Cizalla: el propio empuje también degrada la pieza.
      if (dv > 0.25) damageAcc += this.damage(sb, Math.min(0.5, dv / 9), tmpDir) * 100;

      const structural = sb.attached && !!sb.buildingId;
      const threshold = structural ? STRUCT_RELEASE_DV : FREE_RELEASE_DV;
      if (dv >= threshold || (!sb.attached && sb.awakened && dv > 0.02)) {
        const point = closestPointOnBox(origin, center, sb.size, q);
        const j = dv * sb.mass;
        sb.pendingImpulse = { x: tmpDir.x * j, y: tmpDir.y * j, z: tmpDir.z * j };
        sb.pendingImpulsePoint = point;
        if (structural) sb.forcedFail = true;
        this.release(sb, structural ? "onda expansiva" : "empuje");
      }

      if (sb.integrity <= 0 && !sb.destroyed && !sb.attached) {
        destroyed += 1;
      }
    }

    this.emitScore({
      damage: damageAcc,
      destroyed: 0,
      chain: this.chainCount,
      kind: "explosion",
    });
    return { hit, destroyed, chain: this.chainCount };
  }

  /**
   * Atenuación de la onda por lo que se interpone. Recorre las piezas que
   * cortan el segmento foco→objetivo; cada obstáculo intacto deja pasar poco,
   * y uno ya destrozado deja pasar casi todo. Por eso abrir un boquete en la
   * planta baja hace que la siguiente carga llegue mucho más adentro.
   */
  private occlusion(origin: Vec3, target: Vec3, self: SimBody, list: SimBody[], radius: number) {
    let shield = 1;
    for (const other of list) {
      if (other === self || other.destroyed || !other.attached) continue;
      if (other.kind === "terrain" || other.kind === "debris") continue;
      const p = rbOf(other)?.translation() ?? other.home;
      const thickness = segmentThroughBox(origin, target, {
        center: { x: p.x, y: p.y, z: p.z },
        size: other.size,
      });
      if (thickness <= 0.05) continue;
      const solidity = Math.min(1, (thickness / 2.2) * (0.35 + other.integrity * 0.65));
      const pass = SHIELD_BASE + (1 - SHIELD_BASE) * (1 - solidity);
      shield *= pass;
      if (shield < 0.015) return 0;
    }
    void radius;
    return shield;
  }

  shockwave(x: number, z: number, charge: number) {
    this.explode(x, 1.1, z, charge, naturalRadius(charge) * 1.25);
  }

  suggestedRadius(charge: number) {
    return naturalRadius(charge);
  }

  /* ---------------------------------------------------------------- */
  /* Terremoto y viento                                                */
  /* ---------------------------------------------------------------- */

  /**
   * El terremoto no lanza nada hacia arriba: impone una aceleración del
   * terreno horizontal y oscilante. Las estructuras acusan el cortante en la
   * base (proporcional a la masa que llevan encima), y los cuerpos sueltos
   * reciben la fuerza de inercia correspondiente.
   */
  earthquake(intensity: number) {
    const i = Math.max(0, Math.min(1.2, intensity));
    const a = Math.random() * Math.PI * 2;
    this.quake = {
      amplitude: i * 5.2,
      freq: 1.1 + i * 0.8,
      until: this.simTime + 3 + i * 4,
      start: this.simTime,
      dirX: Math.cos(a),
      dirZ: Math.sin(a),
    };
    this.rumble = this.quake.until - this.simTime;
    this.rumbleIntensity = i;
    this.trauma = Math.min(1, this.trauma + 0.2 + i * 0.35);
    this.emitFx();
    this.emitScore({
      damage: i * 20,
      destroyed: 0,
      chain: this.chainCount,
      kind: "earthquake",
    });
  }

  startWind(strength: number, dirX = 1, dirZ = 0.18) {
    const len = Math.hypot(dirX, dirZ) || 1;
    // 0 → calma, 1 → 45 m/s (huracán severo).
    const speed = Math.max(0, Math.min(1.2, strength)) * 45;
    this.wind = {
      vx: (dirX / len) * speed,
      vz: (dirZ / len) * speed,
      until: this.simTime + 8,
      strength,
    };
  }

  /* ---------------------------------------------------------------- */
  /* Colapsos manuales                                                 */
  /* ---------------------------------------------------------------- */

  collapseBuilding(buildingId: string) {
    const pieces = [...this.bodies.values()].filter(
      (b) => b.buildingId === buildingId && !b.destroyed && b.attached,
    );
    if (!pieces.length) return;
    const base = pieces.reduce((min, p) => Math.min(min, p.floorIndex ?? 0), 99);
    for (const sb of pieces) {
      if ((sb.floorIndex ?? 0) <= base) {
        sb.integrity = Math.min(sb.integrity, 0.02);
        sb.forcedFail = true;
      } else {
        sb.integrity = Math.min(sb.integrity, 0.55);
      }
    }
  }

  collapseAll() {
    const ids = new Set(
      [...this.bodies.values()].map((b) => b.buildingId).filter(Boolean) as string[],
    );
    ids.forEach((id) => this.collapseBuilding(id));
  }

  spawnMeteor(x: number, z: number, power: number) {
    this.meteorQueue.push({ id: `meteor-${debrisSeq++}`, x, z, power });
    this.emitFx();
  }

  /* ---------------------------------------------------------------- */
  /* Fragmentación                                                     */
  /* ---------------------------------------------------------------- */

  fragment(sb: SimBody) {
    if (sb.destroyed) return;
    sb.destroyed = true;
    sb.integrity = 0;
    if (sb.buildingId) this.structure.markDirty();
    sb.hideReact?.();

    const rb = sb.body;
    if (rb && sb.kind !== "debris" && this.debrisAlive < MAX_DEBRIS) {
      const p = rb.translation();
      const v = rb.linvel();
      const [w, h, d] = sb.size;
      const count = Math.max(
        2,
        Math.min(7, Math.round(Math.cbrt(sb.volume) * 1.9 * (0.55 + sb.brittle))),
      );
      // Los escombros conservan aproximadamente la mitad del volumen: el resto
      // se va en polvo. La densidad es la del material, así que un trozo de
      // hormigón sigue pesando como el hormigón.
      const pieceVolume = (sb.volume * 0.5) / count;
      const side = Math.cbrt(pieceVolume);
      for (let i = 0; i < count; i++) {
        const jitter = 0.75 + Math.random() * 0.6;
        const ox = (Math.random() - 0.5) * w * 0.55;
        const oy = (Math.random() - 0.5) * h * 0.55;
        const oz = (Math.random() - 0.5) * d * 0.55;
        const spread = Math.hypot(ox, oy, oz) || 1;
        // Impulso de separación pequeño y radial: los trozos se abren, no salen
        // disparados hacia arriba.
        const burst = 1.1 + sb.brittle * 2.4;
        this.debrisQueue.push({
          id: `debris-${debrisSeq++}`,
          x: p.x + ox,
          y: p.y + oy,
          z: p.z + oz,
          vx: v.x + (ox / spread) * burst + (Math.random() - 0.5) * 0.8,
          vy: v.y + (oy / spread) * burst * 0.6,
          vz: v.z + (oz / spread) * burst + (Math.random() - 0.5) * 0.8,
          w: Math.max(0.26, Math.min(w * 0.7, side * jitter)),
          h: Math.max(0.24, Math.min(h * 0.7, side * jitter)),
          d: Math.max(0.26, Math.min(d * 0.7, side * jitter)),
          color: sb.color,
          material: sb.material,
        });
      }
      this.dust.push({
        id: fxId++,
        x: p.x,
        y: p.y,
        z: p.z,
        power: Math.min(60, sb.volume * 0.6),
        color: materialOf(sb.material).dust,
        t: 0,
      });
      this.emitFx();
    }

    sb.body = null;
    sb.object = null;

    this.emitScore({
      damage: 12,
      destroyed: 1,
      chain: this.chainCount,
      buildingId: sb.buildingId,
      kind: sb.kind,
    });
  }

  /* ---------------------------------------------------------------- */
  /* Paso de simulación                                                */
  /* ---------------------------------------------------------------- */

  /** Se ejecuta antes de cada paso de Rapier, con el dt real del paso. */
  stepSim(dt: number) {
    if (dt <= 0) return;
    try {
      this.stepSimInner(dt);
    } catch (err) {
      if (typeof console !== "undefined") console.warn("[sim] paso interrumpido", err);
    }
  }

  private stepSimInner(dt: number) {
    this.simTime += dt;
    this.trauma = Math.max(0, this.trauma - dt * 1.15);
    this.flash = Math.max(0, this.flash - dt * 2.6);
    this.chainWindow = Math.max(0, this.chainWindow - dt);
    if (this.chainWindow <= 0) this.chainCount = 0;
    this.rumble = Math.max(0, this.rumble - dt);

    this.applyEnvironment(dt);
    this.structure.step(this.bodies.values(), dt);
    this.processReleases(dt);
    this.tickFxTimers(dt);
  }

  private applyEnvironment(dt: number) {
    const windy = this.simTime < this.wind.until;
    const quaking = this.simTime < this.quake.until;
    if (!windy && !quaking) return;

    let qa = 0;
    if (quaking) {
      const t = this.simTime - this.quake.start;
      const total = this.quake.until - this.quake.start;
      // Envolvente: sube rápido y decae. Sin componente vertical sistemática.
      const env = Math.min(1, t / 0.4) * Math.max(0, 1 - t / total) ** 0.7;
      qa = this.quake.amplitude * env * Math.sin(t * this.quake.freq * Math.PI * 2);
    }

    for (const sb of this.bodies.values()) {
      const rb = rbOf(sb);
      if (!rb) continue;

      if (sb.attached) {
        // Estructuras: el sismo se traduce en cortante en la base, y el viento
        // en carga lateral. Nada de esto las mueve; las debilita.
        let lateral = 0;
        if (quaking) {
          const massAbove = sb.loadAbove / G + sb.mass;
          lateral += Math.abs(qa) * massAbove * 0.55;
        }
        if (windy) {
          const speed = Math.hypot(this.wind.vx, this.wind.vz);
          const area = sb.size[1] * Math.max(sb.size[0], sb.size[2]);
          lateral += 0.5 * 1.225 * 1.3 * area * speed * speed;
        }
        sb.lateralLoad = lateral;
        continue;
      }

      sb.lateralLoad = 0;
      if (!sb.awakened) continue;
      let fx = 0;
      let fz = 0;
      if (quaking) {
        // Fuerza de inercia equivalente al movimiento del terreno.
        fx += -qa * this.quake.dirX * sb.mass;
        fz += -qa * this.quake.dirZ * sb.mass;
      }
      if (windy) {
        // Arrastre aerodinámico real: F = ½·ρ·Cd·A·v². Escala con el área y no
        // con la masa, así que una caja vuela y una losa de hormigón no.
        const v = rb.linvel();
        const rx = this.wind.vx - v.x;
        const rz = this.wind.vz - v.z;
        const rel = Math.hypot(rx, rz);
        if (rel > 0.1) {
          const area = sb.size[1] * Math.max(sb.size[0], sb.size[2]);
          const k = 0.5 * 1.225 * 1.15 * area * rel;
          fx += k * rx;
          fz += k * rz;
        }
      }
      rb.resetForces(false);
      if (fx !== 0 || fz !== 0) rb.addForce({ x: fx, y: 0, z: fz }, true);
    }
    void dt;
  }

  private processReleases(dt: number) {
    for (const sb of this.bodies.values()) {
      sb.age += dt;
      if (sb.impactCooldown > 0) sb.impactCooldown -= dt;
      if (sb.awakened && !sb.destroyed) sb.freeTime += dt;

      if (sb.releaseIn >= 0 && sb.attached && !sb.destroyed) {
        sb.releaseIn -= dt;
        if (sb.releaseIn <= 0) {
          // Sesgo de caída hacia el lado dañado: pequeño y en velocidad, para
          // que no dependa de la masa y nunca se convierta en un lanzamiento.
          const dd = sb.damageDir;
          const len = Math.hypot(dd.x, dd.z);
          if (len > 0.01) {
            const k = Math.min(0.75, len * 0.5);
            sb.pendingVelocity = { x: (dd.x / len) * k, y: 0, z: (dd.z / len) * k };
            sb.pendingTorque = {
              x: (dd.z / len) * sb.mass * 0.035,
              y: (Math.random() - 0.5) * sb.mass * 0.008,
              z: -(dd.x / len) * sb.mass * 0.035,
            };
          }
          this.release(sb);
        }
      }

      // Piezas ya sueltas y arruinadas: se deshacen en pleno vuelo.
      if (sb.awakened && !sb.destroyed && sb.integrity <= 0 && sb.kind !== "debris") {
        if (sb.freeTime > 0.28) this.fragment(sb);
      }

      // Fuera del mundo.
      const rbOut = sb.awakened ? rbOf(sb) : null;
      if (rbOut) {
        const p = rbOut.translation();
        if (p.y < -18) {
          if (sb.kind === "debris") this.retire(sb);
          else this.fragment(sb);
        }
      }

      // Retirada de escombros viejos y dormidos: mantiene el rendimiento.
      if (sb.kind === "debris" && sb.age > 26 && rbOf(sb)?.isSleeping()) {
        this.retire(sb);
      }
    }
  }

  private retire(sb: SimBody) {
    if (sb.destroyed) return;
    sb.destroyed = true;
    this.retireQueue.push(sb.id);
    sb.hideReact?.();
    sb.body = null;
    sb.object = null;
  }

  /** Se ejecuta después de cada paso de Rapier: detecta impactos. */
  postStep(dt: number) {
    if (dt <= 0) return;
    try {
      this.postStepInner(dt);
    } catch (err) {
      if (typeof console !== "undefined") console.warn("[sim] postpaso interrumpido", err);
    }
  }

  private postStepInner(dt: number) {
    const gdt = G * dt;
    const impacts: { sb: SimBody; dv: number }[] = [];
    for (const sb of this.bodies.values()) {
      if (!sb.awakened) continue;
      const rb = rbOf(sb);
      if (!rb) continue;
      const v = rb.linvel();
      const dvx = v.x - sb.prevVel.x;
      const dvy = v.y - sb.prevVel.y + gdt;
      const dvz = v.z - sb.prevVel.z;
      sb.prevVel.x = v.x;
      sb.prevVel.y = v.y;
      sb.prevVel.z = v.z;
      if (sb.impactCooldown > 0) continue;
      const dv = Math.hypot(dvx, dvy, dvz);
      if (dv >= IMPACT_MIN_DV) impacts.push({ sb, dv });
    }
    for (const { sb, dv } of impacts) this.resolveImpact(sb, dv);
  }

  /**
   * Un impacto reparte energía: parte se la queda la pieza que golpea y parte
   * se transmite a lo que hay debajo. Así un forjado que cae daña al de abajo
   * y el colapso progresa en vez de detenerse.
   */
  private resolveImpact(sb: SimBody, dv: number) {
    sb.impactCooldown = 0.1;
    const specific = 0.5 * dv * dv; // J/kg
    const self = Math.min(0.85, specific / Math.max(1, sb.toughness));
    if (self > 0.004) this.damage(sb, self);

    const energy = 0.5 * sb.mass * dv * dv;
    if (energy < 4000) return;

    const p = rbOf(sb)?.translation();
    if (!p) return;
    const reach = Math.max(sb.size[0], sb.size[2]) * 0.75 + 1.6;
    const targets: SimBody[] = [];
    for (const other of this.bodies.values()) {
      if (other === sb || other.destroyed) continue;
      if (other.kind === "terrain") continue;
      const q = rbOf(other)?.translation() ?? other.home;
      const dy = p.y - q.y;
      if (dy < -other.size[1] || dy > other.size[1] + reach) continue;
      if (Math.hypot(p.x - q.x, p.z - q.z) > reach + Math.max(other.size[0], other.size[2]) * 0.5) {
        continue;
      }
      targets.push(other);
      if (targets.length >= 5) break;
    }
    if (!targets.length) return;
    const share = (energy * 0.5) / targets.length;
    for (const t of targets) {
      const dmg = Math.min(0.9, share / Math.max(1, t.mass * t.toughness));
      if (dmg > 0.004) this.damage(t, dmg);
    }
    if (energy > 60000) {
      this.trauma = Math.min(1, this.trauma + Math.min(0.25, energy / 3e6));
      this.dust.push({
        id: fxId++,
        x: p.x,
        y: p.y - sb.size[1] * 0.5,
        z: p.z,
        power: Math.min(40, energy / 40000),
        color: materialOf(sb.material).dust,
        t: 0,
      });
      this.emitFx();
    }
  }

  private tickFxTimers(dt: number) {
    if (this.explosions.length) {
      this.explosions = this.explosions.filter((e) => {
        e.t += dt;
        return e.t < 1.8;
      });
    }
    if (this.shockwaves.length) {
      this.shockwaves = this.shockwaves.filter((e) => {
        e.t += dt;
        return e.t < 1.2;
      });
    }
    if (this.dust.length) {
      this.dust = this.dust.filter((e) => {
        e.t += dt;
        return e.t < 2.6;
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Utilidades de edición                                             */
  /* ---------------------------------------------------------------- */

  placeAt(id: string, x: number, z: number) {
    const sb = this.bodies.get(id);
    const rb = rbOf(sb);
    if (!sb || !rb) return;
    const y = Math.max(sb.size[1] / 2 + 0.05, rb.translation().y);
    rb.setTranslation({ x, y, z }, true);
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
    sb.home = { x, y, z };
    if (sb.buildingId) this.structure.markDirty();
  }

  rotateY(id: string, dyaw: number) {
    const sb = this.bodies.get(id);
    const rb = rbOf(sb);
    if (!rb) return;
    const r = rb.rotation();
    const half = dyaw / 2;
    const sy = Math.sin(half);
    const cy = Math.cos(half);
    rb.setRotation(
      {
        x: cy * r.x + sy * r.z,
        y: cy * r.y + sy * r.w,
        z: cy * r.z - sy * r.x,
        w: cy * r.w - sy * r.y,
      },
      true,
    );
  }

  /* ---------------------------------------------------------------- */
  /* Lectura para la interfaz                                          */
  /* ---------------------------------------------------------------- */

  liveState(id: string) {
    const sb = this.bodies.get(id);
    if (!sb) return null;
    const rb = rbOf(sb);
    const p = rb?.translation();
    const r = rb?.rotation();
    const v = rb?.linvel();
    const speed = v ? Math.hypot(v.x, v.y, v.z) : 0;
    let estado = "Estable";
    if (sb.destroyed || (p && p.y < -4)) estado = "Destruido";
    else if (sb.awakened && speed > 1.5) estado = "En colapso";
    else if (sb.awakened) estado = "Suelto";
    else if (sb.releaseIn >= 0) estado = "A punto de ceder";
    else if (sb.overloaded) estado = "Sobrecargado";
    else if (sb.integrity < 0.45) estado = "Inestable";
    else if (sb.integrity < 0.85) estado = "Dañado";

    const capacity = sb.supportCapacity * Math.pow(Math.max(0, sb.integrity), 1.5);
    const uso = capacity > 1 ? Math.min(999, (sb.loadAbove / capacity) * 100) : 0;

    return {
      ...sb,
      px: p?.x ?? sb.home.x,
      py: p?.y ?? sb.home.y,
      pz: p?.z ?? sb.home.z,
      rx: r?.x ?? 0,
      ry: r?.y ?? 0,
      rz: r?.z ?? 0,
      rw: r?.w ?? 1,
      speed,
      estado,
      integridad: sb.integrity,
      integridadLabel: integrityLabel(sb.integrity),
      soporte: sb.attached,
      cargaSoportada: sb.loadAbove,
      capacidad: capacity,
      usoCapacidad: uso,
      // compatibilidad con la interfaz anterior
      health: sb.integrity * 100,
      maxHealth: 100,
    };
  }

  buildingDestroyed(buildingId: string) {
    const pieces = [...this.bodies.values()].filter((b) => b.buildingId === buildingId);
    if (!pieces.length) return false;
    const down = pieces.filter((b) => {
      if (b.destroyed) return true;
      const p = rbOf(b)?.translation();
      return b.awakened && p && (p.y < 1.5 || Math.abs(p.x) + Math.abs(p.z) > 80);
    });
    return down.length / pieces.length > 0.55;
  }

  bridgeDown() {
    const segs = [...this.bodies.values()].filter((b) => b.kind === "bridge");
    if (!segs.length) return false;
    return segs.filter((s) => s.awakened || s.destroyed).length >= segs.length * 0.5;
  }

  /** Resumen para pruebas automáticas y diagnóstico. */
  probe() {
    let awake = 0;
    let destroyed = 0;
    let maxY = -Infinity;
    let maxSpeed = 0;
    let maxUpSpeed = 0;
    let below = 0;
    let flying: string | null = null;
    for (const sb of this.bodies.values()) {
      if (sb.destroyed) {
        destroyed += 1;
        continue;
      }
      if (sb.awakened) awake += 1;
      const rb = rbOf(sb);
      const p = rb?.translation();
      const v = rb?.linvel();
      if (p) {
        if (p.y > maxY) {
          maxY = p.y;
          flying = sb.name;
        }
        if (p.y < -2) below += 1;
      }
      if (v) {
        const s = Math.hypot(v.x, v.y, v.z);
        if (s > maxSpeed) maxSpeed = s;
        if (v.y > maxUpSpeed) maxUpSpeed = v.y;
      }
    }
    return {
      total: this.bodies.size,
      awake,
      destroyed,
      debris: this.debrisAlive,
      maxY: maxY === -Infinity ? 0 : maxY,
      maxSpeed,
      maxUpSpeed,
      below,
      highest: flying,
      simTime: this.simTime,
    };
  }
}

export const sim = new Simulation();

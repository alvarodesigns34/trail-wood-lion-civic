import type { RapierRigidBody } from "@react-three/rapier";
import type { Object3D } from "three";
import type { BodyKind } from "./types";

export interface SimBody {
  id: string;
  kind: BodyKind;
  name: string;
  buildingId?: string;
  floorIndex?: number;
  material: string;
  mass: number;
  resistance: number;
  health: number;
  maxHealth: number;
  size: [number, number, number];
  color: string;
  awakened: boolean;
  destroyed: boolean;
  body: RapierRigidBody | null;
  object: Object3D | null;
  pendingImpulse: { x: number; y: number; z: number } | null;
  pendingTorque: { x: number; y: number; z: number } | null;
  awakenReact: (() => void) | null;
  hideReact: (() => void) | null;
  collapseDelay: number;
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

type ScoreListener = (evt: {
  damage: number;
  destroyed: number;
  chain: number;
  buildingId?: string;
  kind: string;
}) => void;

let fxId = 1;
let debrisSeq = 1;

class Simulation {
  bodies = new Map<string, SimBody>();
  trauma = 0;
  flash = 0;
  simTime = 0;
  wind = { x: 0, z: 0, until: 0 };
  rumble = 0;
  rumbleIntensity = 0;
  explosions: ExplosionFx[] = [];
  shockwaves: ShockwaveFx[] = [];
  dust: DustBurst[] = [];
  debrisQueue: DebrisRequest[] = [];
  meteorQueue: { id: string; x: number; z: number; power: number }[] = [];
  chainWindow = 0;
  chainCount = 0;
  fps = 60;
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
    this.trauma = 0;
    this.flash = 0;
    this.simTime = 0;
    this.wind = { x: 0, z: 0, until: 0 };
    this.rumble = 0;
    this.rumbleIntensity = 0;
    this.explosions = [];
    this.shockwaves = [];
    this.dust = [];
    this.debrisQueue = [];
    this.meteorQueue = [];
    this.chainWindow = 0;
    this.chainCount = 0;
  }

  register(partial: Omit<SimBody, "body" | "object" | "awakened" | "destroyed" | "pendingImpulse" | "pendingTorque" | "awakenReact" | "hideReact" | "collapseDelay" | "health" | "maxHealth"> & { health?: number }) {
    const health = partial.health ?? 100;
    this.bodies.set(partial.id, {
      ...partial,
      health,
      maxHealth: health,
      body: null,
      object: null,
      awakened: false,
      destroyed: false,
      pendingImpulse: null,
      pendingTorque: null,
      awakenReact: null,
      hideReact: null,
      collapseDelay: 0,
    });
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

  unregister(id: string) {
    this.bodies.delete(id);
  }

  get(id: string) {
    return this.bodies.get(id);
  }

  awaken(sb: SimBody) {
    if (sb.destroyed) return;
    if (sb.awakened) {
      this.applyPending(sb);
      return;
    }
    sb.awakened = true;
    this.noteChain();
    sb.awakenReact?.();
  }

  private noteChain() {
    if (this.chainWindow <= 0) this.chainCount = 0;
    this.chainWindow = 4;
    this.chainCount += 1;
  }

  explode(x: number, y: number, z: number, power: number, radius: number) {
    this.trauma = Math.min(1, this.trauma + 0.28 + power / 500);
    this.flash = Math.min(1, 0.35 + power / 280);
    this.explosions.push({ id: fxId++, x, y, z, power, radius, t: 0 });
    this.shockwaves.push({ id: fxId++, x, y, z, radius, t: 0 });
    this.dust.push({ id: fxId++, x, y, z, power, t: 0 });
    this.emitFx();

    let hit = 0;
    let destroyed = 0;
    let damageAcc = 0;

    for (const sb of this.bodies.values()) {
      if (!sb.body || sb.destroyed) continue;
      const p = sb.body.translation();
      const dx = p.x - x;
      const dy = p.y - y;
      const dz = p.z - z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist > radius || dist < 0.0001) continue;

      const falloff = 1 - dist / radius;
      const intensity = power * falloff * falloff;
      const resist = sb.resistance / 100;
      const dmg = intensity * (0.55 + (1 - resist) * 0.9);
      sb.health = Math.max(0, sb.health - dmg);
      damageAcc += dmg;
      hit += 1;

      const need = 12 + sb.resistance * 0.45;
      if (intensity >= need || sb.health < sb.maxHealth * 0.88) {
        const inv = 1 / dist;
        const mass = Math.max(8, sb.mass);
        const mag = intensity * 0.18 * Math.sqrt(mass);
        sb.pendingImpulse = {
          x: dx * inv * mag,
          y: dy * inv * mag + mag * 0.42,
          z: dz * inv * mag,
        };
        sb.pendingTorque = {
          x: (Math.random() - 0.5) * mag * 0.18,
          y: (Math.random() - 0.5) * mag * 0.18,
          z: (Math.random() - 0.5) * mag * 0.18,
        };
        this.awaken(sb);
      }

      if (sb.health <= 0) {
        this.fragment(sb);
        destroyed += 1;
      }
    }

    this.scheduleUnsupported();
    this.emitScore({
      damage: damageAcc,
      destroyed: 0,
      chain: this.chainCount,
      kind: "explosion",
    });
    return { hit, destroyed, chain: this.chainCount };
  }

  applyPending(sb: SimBody) {
    const rb = sb.body;
    if (!rb || !sb.awakened) return;
    try {
      rb.setBodyType(0, true);
      rb.wakeUp();
      if (sb.pendingImpulse) {
        rb.applyImpulse(sb.pendingImpulse, true);
        sb.pendingImpulse = null;
      }
      if (sb.pendingTorque) {
        rb.applyTorqueImpulse(sb.pendingTorque, true);
        sb.pendingTorque = null;
      }
    } catch {
      /* body may not be in world yet */
    }
  }

  fragment(sb: SimBody) {
    if (sb.destroyed) return;
    sb.destroyed = true;
    sb.hideReact?.();
    const rb = sb.body;
    if (rb && sb.kind !== "debris") {
      const p = rb.translation();
      const v = rb.linvel();
      const [w, h, d] = sb.size;
      const pieces = w * h * d > 8 ? 5 : 3;
      for (let i = 0; i < pieces; i++) {
        const s = 0.32 + Math.random() * 0.22;
        this.debrisQueue.push({
          id: `debris-${debrisSeq++}`,
          x: p.x + (Math.random() - 0.5) * w * 0.4,
          y: p.y + (Math.random() - 0.5) * h * 0.3,
          z: p.z + (Math.random() - 0.5) * d * 0.4,
          vx: v.x + (Math.random() - 0.5) * 6,
          vy: v.y + 2 + Math.random() * 4,
          vz: v.z + (Math.random() - 0.5) * 6,
          w: Math.max(0.35, w * s),
          h: Math.max(0.28, h * s),
          d: Math.max(0.35, d * s),
          color: sb.color,
          material: sb.material,
        });
      }
      this.emitFx();
    }
    this.emitScore({
      damage: 20,
      destroyed: 1,
      chain: this.chainCount,
      buildingId: sb.buildingId,
      kind: sb.kind,
    });
  }

  earthquake(intensity: number) {
    this.rumble = 3.2;
    this.rumbleIntensity = intensity;
    this.trauma = Math.min(1, this.trauma + 0.25 + intensity * 0.2);
    this.emitFx();
    for (const sb of this.bodies.values()) {
      if (!sb.body || sb.destroyed) continue;
      if (sb.kind === "terrain") continue;
      const p = sb.body.translation();
      if (p.y > 14) continue;
      const chance = intensity * (1.1 - sb.resistance / 140);
      if (Math.random() < chance * 0.55 || intensity > 0.75) {
        const mass = Math.max(8, sb.mass);
        const mag = intensity * mass * 1.8;
        sb.pendingImpulse = {
          x: (Math.random() - 0.5) * mag * 2.2,
          y: intensity * mass * 0.55,
          z: (Math.random() - 0.5) * mag * 2.2,
        };
        this.awaken(sb);
      }
    }
    this.scheduleUnsupported();
    this.emitScore({
      damage: intensity * 40,
      destroyed: 0,
      chain: this.chainCount,
      kind: "earthquake",
    });
  }

  shockwave(x: number, z: number, power: number) {
    this.explode(x, 1.2, z, power * 0.75, 10 + power * 0.18);
  }

  startWind(strength: number, dirX = 1, dirZ = 0.15) {
    const len = Math.hypot(dirX, dirZ) || 1;
    this.wind = {
      x: (dirX / len) * strength * 18,
      z: (dirZ / len) * strength * 18,
      until: this.simTime + 4.5,
    };
    for (const sb of this.bodies.values()) {
      if (sb.kind === "terrain" || sb.destroyed) continue;
      if (sb.resistance < 50 || strength > 0.7) this.awaken(sb);
    }
  }

  collapseBuilding(buildingId: string) {
    const pieces = [...this.bodies.values()]
      .filter((b) => b.buildingId === buildingId && !b.destroyed)
      .sort((a, b) => (a.floorIndex ?? 0) - (b.floorIndex ?? 0));
    pieces.forEach((sb, i) => {
      sb.collapseDelay = 0.05 + i * 0.07;
    });
  }

  collapseAll() {
    const ids = new Set(
      [...this.bodies.values()].map((b) => b.buildingId).filter(Boolean) as string[],
    );
    ids.forEach((id) => this.collapseBuilding(id));
  }

  spawnMeteor(x: number, z: number, power: number) {
    this.meteorQueue.push({
      id: `meteor-${debrisSeq++}`,
      x,
      z,
      power,
    });
    this.emitFx();
  }

  scheduleUnsupported() {
    const byBuilding = new Map<string, SimBody[]>();
    for (const sb of this.bodies.values()) {
      if (!sb.buildingId || sb.destroyed) continue;
      const list = byBuilding.get(sb.buildingId) ?? [];
      list.push(sb);
      byBuilding.set(sb.buildingId, list);
    }
    for (const list of byBuilding.values()) {
      list.sort((a, b) => (a.floorIndex ?? 0) - (b.floorIndex ?? 0));
      let lost = false;
      for (const sb of list) {
        if (lost && !sb.awakened) {
          sb.collapseDelay = 0.08 + (sb.floorIndex ?? 0) * 0.05;
        }
        if (sb.awakened || sb.destroyed || sb.health < sb.maxHealth * 0.4) {
          lost = true;
        }
      }
    }
  }

  tickFx(dt: number) {
    this.simTime += dt;
    this.trauma = Math.max(0, this.trauma - dt * 1.15);
    this.flash = Math.max(0, this.flash - dt * 2.4);
    this.chainWindow = Math.max(0, this.chainWindow - dt);
    if (this.chainWindow <= 0) this.chainCount = 0;
    this.rumble = Math.max(0, this.rumble - dt);

    for (const sb of this.bodies.values()) {
      if (sb.collapseDelay > 0) {
        sb.collapseDelay -= dt;
        if (sb.collapseDelay <= 0) {
          const mass = Math.max(8, sb.mass);
          sb.pendingImpulse = {
            x: (Math.random() - 0.5) * mass * 0.4,
            y: -mass * 0.2,
            z: (Math.random() - 0.5) * mass * 0.4,
          };
          this.awaken(sb);
        }
      }
      if (sb.awakened && sb.body && !sb.destroyed) {
        const p = sb.body.translation();
        if (p.y < -12) this.fragment(sb);
      }
    }

    this.explosions = this.explosions.filter((e) => {
      e.t += dt;
      return e.t < 1.6;
    });
    this.shockwaves = this.shockwaves.filter((e) => {
      e.t += dt;
      return e.t < 1.1;
    });
    this.dust = this.dust.filter((e) => {
      e.t += dt;
      return e.t < 2.4;
    });
  }

  applyWindAndRumble() {
    const rumbling = this.rumble > 0;
    const windy = this.simTime < this.wind.until;
    if (!rumbling && !windy) return;
    for (const sb of this.bodies.values()) {
      const rb = sb.body;
      if (!rb || sb.destroyed || !sb.awakened) continue;
      const mass = Math.max(4, sb.mass);
      if (windy) {
        rb.addForce({ x: this.wind.x * mass * 0.35, y: 0, z: this.wind.z * mass * 0.35 }, true);
      }
      if (rumbling) {
        const k = this.rumbleIntensity * mass * 2.4;
        rb.applyImpulse(
          {
            x: (Math.random() - 0.5) * k,
            y: Math.random() * k * 0.12,
            z: (Math.random() - 0.5) * k,
          },
          true,
        );
      }
    }
  }

  placeAt(id: string, x: number, z: number) {
    const sb = this.bodies.get(id);
    if (!sb?.body || sb.destroyed) return;
    const y = Math.max(sb.size[1] / 2 + 0.05, sb.body.translation().y);
    sb.body.setTranslation({ x, y, z }, true);
    sb.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    sb.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }

  rotateY(id: string, dyaw: number) {
    const sb = this.bodies.get(id);
    if (!sb?.body || sb.destroyed) return;
    const r = sb.body.rotation();
    const half = dyaw / 2;
    const sy = Math.sin(half);
    const cy = Math.cos(half);
    sb.body.setRotation(
      {
        x: cy * r.x + sy * r.z,
        y: cy * r.y + sy * r.w,
        z: cy * r.z - sy * r.x,
        w: cy * r.w - sy * r.y,
      },
      true,
    );
  }

  liveState(id: string) {
    const sb = this.bodies.get(id);
    if (!sb) return null;
    const p = sb.body?.translation();
    const r = sb.body?.rotation();
    const v = sb.body?.linvel();
    const speed = v ? Math.hypot(v.x, v.y, v.z) : 0;
    let estado = "Estable";
    if (sb.destroyed || (p && p.y < -4)) estado = "Destruido";
    else if (sb.awakened && speed > 1.5) estado = "En colapso";
    else if (sb.awakened) estado = "Inestable";
    else if (sb.health < sb.maxHealth * 0.45) estado = "Fisurado grave";
    else if (sb.health < sb.maxHealth * 0.8) estado = "Fisurado";
    return {
      ...sb,
      px: p?.x ?? 0,
      py: p?.y ?? 0,
      pz: p?.z ?? 0,
      rx: r?.x ?? 0,
      ry: r?.y ?? 0,
      rz: r?.z ?? 0,
      rw: r?.w ?? 1,
      speed,
      estado,
    };
  }

  buildingDestroyed(buildingId: string) {
    const pieces = [...this.bodies.values()].filter((b) => b.buildingId === buildingId);
    if (!pieces.length) return false;
    const down = pieces.filter((b) => {
      if (b.destroyed) return true;
      const p = b.body?.translation();
      return b.awakened && p && (p.y < 1.2 || Math.abs(p.x) + Math.abs(p.z) > 80);
    });
    return down.length / pieces.length > 0.55;
  }

  bridgeDown() {
    const segs = [...this.bodies.values()].filter((b) => b.kind === "bridge");
    if (!segs.length) return false;
    return segs.filter((s) => s.awakened || s.destroyed).length >= segs.length * 0.5;
  }
}

export const sim = new Simulation();

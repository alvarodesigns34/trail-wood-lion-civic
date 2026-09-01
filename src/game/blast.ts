/**
 * Modelo de onda expansiva.
 *
 * La carga se expresa en kilogramos equivalentes de TNT. Las curvas siguen la
 * forma de las leyes de escala de Hopkinson-Cranz (sobrepresión ~ 1/r³ en campo
 * cercano y ~ 1/r² en campo lejano, impulso específico ~ 1/r²) ajustadas para
 * que 1 kg de TNT a 3 m dé ~35 kPa y ~85 Pa·s, valores realistas.
 *
 * Todo el módulo es puro: no toca Rapier ni React, así que se puede razonar y
 * probar de forma aislada.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

const IMPULSE_K = 800; // Pa·s·m² por kg de TNT
const PRESSURE_A = 1750; // kPa·m³ por kg
const PRESSURE_B = 195; // kPa·m² por kg^(2/3)

/** Radio del "bola de fuego": evita singularidades a distancia cero. */
export function nearFieldRadius(charge: number) {
  return 0.55 * Math.cbrt(Math.max(0.01, charge)) + 0.4;
}

export interface BlastField {
  /** Sobrepresión de pico en kPa. Determina el daño. */
  overpressure: number;
  /** Impulso específico en Pa·s. Determina el movimiento. */
  impulse: number;
}

/**
 * @param charge   kg equivalentes de TNT
 * @param distance distancia libre hasta la superficie de la pieza (m)
 * @param cutoff   radio de efecto elegido por el usuario (m)
 */
export function blastField(charge: number, distance: number, cutoff: number): BlastField {
  const w = Math.max(0.01, charge);
  const d = Math.max(0, distance);
  if (d >= cutoff) return { overpressure: 0, impulse: 0 };
  const r = d + nearFieldRadius(w);
  // Corte suave en el borde del radio de efecto: sin escalones bruscos.
  const edge = 1 - (d / cutoff) ** 2;
  const conf = edge * edge;
  const overpressure =
    ((PRESSURE_A * w) / (r * r * r) + (PRESSURE_B * Math.cbrt(w * w)) / (r * r)) * conf;
  const impulse = ((IMPULSE_K * w) / (r * r)) * conf;
  return { overpressure, impulse };
}

/**
 * Distancia a la que la sobrepresión cae por debajo de `limit` kPa (umbral de
 * rotura de vidrio). Sirve para proponer un radio de efecto coherente.
 */
export function naturalRadius(charge: number, limit = 5) {
  const w = Math.max(0.01, charge);
  let lo = 0.1;
  let hi = 400;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const r = mid + nearFieldRadius(w);
    const p = (PRESSURE_A * w) / (r * r * r) + (PRESSURE_B * Math.cbrt(w * w)) / (r * r);
    if (p > limit) lo = mid;
    else hi = mid;
  }
  return lo;
}

/* ------------------------------------------------------------------ */
/* Geometría                                                           */
/* ------------------------------------------------------------------ */

/** Rota `v` por el cuaternión `q`. Si `inverse`, aplica la rotación inversa. */
export function rotateVec(v: Vec3, q: Quat, inverse = false): Vec3 {
  const qx = inverse ? -q.x : q.x;
  const qy = inverse ? -q.y : q.y;
  const qz = inverse ? -q.z : q.z;
  const tx = 2 * (qy * v.z - qz * v.y);
  const ty = 2 * (qz * v.x - qx * v.z);
  const tz = 2 * (qx * v.y - qy * v.x);
  return {
    x: v.x + q.w * tx + (qy * tz - qz * ty),
    y: v.y + q.w * ty + (qz * tx - qx * tz),
    z: v.z + q.w * tz + (qx * ty - qy * tx),
  };
}

const IDENTITY: Quat = { x: 0, y: 0, z: 0, w: 1 };

/**
 * Área proyectada (m²) de una caja orientada vista desde la dirección `dir`.
 * Es lo que convierte el impulso específico en impulso real, y es la razón por
 * la que una losa ancha recibe mucho más empuje que una columna estrecha.
 */
export function projectedArea(size: [number, number, number], dir: Vec3, q: Quat = IDENTITY) {
  const l = rotateVec(dir, q, true);
  const [w, h, d] = size;
  return Math.abs(l.x) * h * d + Math.abs(l.y) * w * d + Math.abs(l.z) * w * h;
}

/** Distancia libre desde `p` hasta la superficie de una caja orientada. */
export function distanceToBox(
  p: Vec3,
  center: Vec3,
  size: [number, number, number],
  q: Quat = IDENTITY,
) {
  const rel = rotateVec({ x: p.x - center.x, y: p.y - center.y, z: p.z - center.z }, q, true);
  const hx = size[0] / 2;
  const hy = size[1] / 2;
  const hz = size[2] / 2;
  const dx = Math.max(0, Math.abs(rel.x) - hx);
  const dy = Math.max(0, Math.abs(rel.y) - hy);
  const dz = Math.max(0, Math.abs(rel.z) - hz);
  return Math.hypot(dx, dy, dz);
}

export interface BoxLike {
  center: Vec3;
  size: [number, number, number];
}

/**
 * ¿El segmento `from`→`to` atraviesa la caja? Devuelve el espesor recorrido
 * dentro de ella (0 si no la corta). Método de las rebanadas, sin rotación:
 * en esta ciudad casi todo está alineado con los ejes y el coste importa.
 */
export function segmentThroughBox(from: Vec3, to: Vec3, box: BoxLike) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-6) return 0;
  const inv = 1 / len;
  const d = [dx * inv, dy * inv, dz * inv];
  const o = [from.x, from.y, from.z];
  const c = [box.center.x, box.center.y, box.center.z];
  const h = [box.size[0] / 2, box.size[1] / 2, box.size[2] / 2];
  let tmin = 0;
  let tmax = len;
  for (let i = 0; i < 3; i++) {
    const lo = c[i] - h[i];
    const hi = c[i] + h[i];
    if (Math.abs(d[i]) < 1e-9) {
      if (o[i] < lo || o[i] > hi) return 0;
      continue;
    }
    const inv2 = 1 / d[i];
    let t1 = (lo - o[i]) * inv2;
    let t2 = (hi - o[i]) * inv2;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return 0;
  }
  return Math.max(0, tmax - tmin);
}

/** Punto de la superficie de la caja más cercano a `p` (en coordenadas mundo). */
export function closestPointOnBox(
  p: Vec3,
  center: Vec3,
  size: [number, number, number],
  q: Quat = { x: 0, y: 0, z: 0, w: 1 },
): Vec3 {
  const rel = rotateVec({ x: p.x - center.x, y: p.y - center.y, z: p.z - center.z }, q, true);
  const hx = size[0] / 2;
  const hy = size[1] / 2;
  const hz = size[2] / 2;
  const local = {
    x: Math.max(-hx, Math.min(hx, rel.x)),
    y: Math.max(-hy, Math.min(hy, rel.y)),
    z: Math.max(-hz, Math.min(hz, rel.z)),
  };
  const world = rotateVec(local, q);
  return { x: center.x + world.x, y: center.y + world.y, z: center.z + world.z };
}

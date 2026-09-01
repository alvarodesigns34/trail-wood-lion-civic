import type { BodyKind } from "./types";

/**
 * Modelo de materiales de DESTRUCT LAB.
 *
 * Todas las magnitudes están en unidades SI y son deliberadamente realistas:
 * la simulación es simplificada, pero las escalas son coherentes entre sí para
 * que la masa, la gravedad y la resistencia se noten de verdad.
 *
 * - density   kg/m³ efectivos sobre la caja envolvente de la pieza (no sobre el
 *             material puro): un perfil de acero es casi todo aire, por eso el
 *             acero estructural aquí "pesa" 2200 y no 7850.
 * - strength  kPa de sobrepresión de explosión que el material aguanta antes de
 *             empezar a dañarse. Valores tomados de tablas reales de daño por
 *             onda expansiva (vidrio ~1-7 kPa, mampostería ~20-35 kPa,
 *             hormigón armado ~120-200 kPa).
 * - toughness J/kg de energía específica de impacto que absorbe por cada unidad
 *             de integridad perdida. Determina cómo aguanta las caídas.
 * - brittle   0 = dúctil (se abolla), 1 = frágil (estalla en fragmentos).
 */
export interface MaterialDef {
  id: string;
  label: string;
  density: number;
  strength: number;
  toughness: number;
  restitution: number;
  friction: number;
  brittle: number;
  dust: string;
}

export const MATERIALS: Record<string, MaterialDef> = {
  hormigon: {
    id: "hormigon",
    label: "Hormigón",
    density: 2300,
    strength: 95,
    toughness: 55,
    restitution: 0.04,
    friction: 0.86,
    brittle: 0.62,
    dust: "#b9b2a4",
  },
  "hormigon-armado": {
    id: "hormigon-armado",
    label: "Hormigón armado",
    density: 2500,
    strength: 175,
    toughness: 140,
    restitution: 0.04,
    friction: 0.88,
    brittle: 0.42,
    dust: "#b3aca0",
  },
  ladrillo: {
    id: "ladrillo",
    label: "Ladrillo",
    density: 1800,
    strength: 32,
    toughness: 22,
    restitution: 0.05,
    friction: 0.9,
    brittle: 0.82,
    dust: "#c09a80",
  },
  acero: {
    id: "acero",
    label: "Acero",
    density: 2200,
    strength: 260,
    toughness: 620,
    restitution: 0.16,
    friction: 0.52,
    brittle: 0.08,
    dust: "#98a0a8",
  },
  metal: {
    id: "metal",
    label: "Metal",
    density: 340,
    strength: 40,
    toughness: 300,
    restitution: 0.11,
    friction: 0.58,
    brittle: 0.1,
    dust: "#9aa2aa",
  },
  madera: {
    id: "madera",
    label: "Madera",
    density: 450,
    strength: 26,
    toughness: 95,
    restitution: 0.2,
    friction: 0.7,
    brittle: 0.45,
    dust: "#a8814e",
  },
  vidrio: {
    id: "vidrio",
    label: "Vidrio",
    density: 2500,
    strength: 6,
    toughness: 5,
    restitution: 0.05,
    friction: 0.36,
    brittle: 0.97,
    dust: "#bcd2da",
  },
  roca: {
    id: "roca",
    label: "Roca",
    density: 2700,
    strength: 210,
    toughness: 90,
    restitution: 0.08,
    friction: 0.9,
    brittle: 0.55,
    dust: "#8d8378",
  },
  asfalto: {
    id: "asfalto",
    label: "Asfalto",
    density: 2300,
    strength: 150,
    toughness: 70,
    restitution: 0.03,
    friction: 0.95,
    brittle: 0.4,
    dust: "#5a5a5c",
  },
};

const ALIASES: Record<string, string> = {
  hormigón: "hormigon",
  "hormigón armado": "hormigon-armado",
  hormigonarmado: "hormigon-armado",
  concreto: "hormigon",
  cristal: "vidrio",
  piedra: "roca",
  acero_estructural: "acero",
};

function normalise(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function materialOf(name?: string): MaterialDef {
  if (!name) return MATERIALS.hormigon;
  const raw = name.trim().toLowerCase();
  const direct = MATERIALS[raw] ?? MATERIALS[ALIASES[raw] ?? ""];
  if (direct) return direct;
  const key = normalise(name);
  return MATERIALS[key] ?? MATERIALS[ALIASES[key] ?? ""] ?? MATERIALS.hormigon;
}

export function materialLabelOf(name?: string) {
  return materialOf(name).label;
}

/**
 * Fracción de la caja envolvente realmente ocupada por materia.
 * Una planta de edificio es casi toda aire (forjado + pilares + tabiques);
 * un bloque de hormigón es macizo.
 */
const OCCUPANCY: Record<BodyKind, number> = {
  floor: 0.13,
  column: 0.8,
  bridge: 0.85,
  prop: 0.7,
  vehicle: 1,
  debris: 0.8,
  meteor: 1,
  terrain: 1,
  core: 0.45,
};

export function occupancyFor(kind: BodyKind) {
  return OCCUPANCY[kind] ?? 0.7;
}

/** Densidad efectiva final (kg/m³) que se pasa al collider de Rapier. */
export function densityFor(kind: BodyKind, material: string | undefined, hollow?: number) {
  const m = materialOf(material);
  return m.density * occupancyFor(kind) * (hollow ?? 1);
}

export function massFor(
  kind: BodyKind,
  material: string | undefined,
  size: [number, number, number],
  hollow?: number,
) {
  const volume = Math.max(1e-4, size[0] * size[1] * size[2]);
  return densityFor(kind, material, hollow) * volume;
}

/**
 * La calidad constructiva (`resistance`, 0-100) modula la resistencia del
 * material sin sustituirla: 50 es la referencia neutra.
 */
export function strengthOf(material: string | undefined, resistance: number) {
  return materialOf(material).strength * (0.45 + Math.max(0, resistance) / 90);
}

export function toughnessOf(material: string | undefined, resistance: number) {
  return materialOf(material).toughness * (0.5 + Math.max(0, resistance) / 100);
}

/** Etiqueta en español del estado de integridad de una pieza. */
export function integrityLabel(integrity: number) {
  if (integrity >= 0.92) return "Intacta";
  if (integrity >= 0.7) return "Fisurada";
  if (integrity >= 0.45) return "Dañada";
  if (integrity >= 0.2) return "Comprometida";
  return "Crítica";
}

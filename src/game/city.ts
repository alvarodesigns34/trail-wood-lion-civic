import type { CatalogItem } from "./types";
import { massFor } from "./materials";

export const FLOOR_H = 2.75;

export const BUILDINGS = [
  {
    id: "west-a",
    name: "Bloque oeste A",
    x: -22,
    z: -14,
    floors: 5,
    w: 6.2,
    d: 6.2,
    color: "#8a8378",
    material: "hormigón",
    resistance: 62,
  },
  {
    id: "west-b",
    name: "Bloque oeste B",
    x: -22,
    z: 4,
    floors: 7,
    w: 7,
    d: 6.4,
    color: "#7a746a",
    material: "hormigón",
    resistance: 64,
  },
  {
    id: "east-center",
    name: "Torre central",
    x: 22,
    z: 2,
    floors: 8,
    w: 8.2,
    d: 8.2,
    color: "#2a313a",
    material: "vidrio",
    resistance: 58,
    isCenter: true,
    glass: true,
  },
  {
    id: "east-blue",
    name: "Edificio azul",
    x: 22,
    z: -16,
    floors: 6,
    w: 7.2,
    d: 6.4,
    color: "#3a5f8a",
    material: "hormigón",
    resistance: 70,
    isBlue: true,
  },
  {
    id: "east-c",
    name: "Bloque este C",
    x: 22,
    z: 16,
    floors: 5,
    w: 6.4,
    d: 6.2,
    color: "#8b8074",
    material: "hormigón",
    resistance: 60,
  },
  // Anillo exterior. Antes esta zona la ocupaban bloques decorativos sin
  // colisión: parecían parte de la ciudad pero eran indestructibles. Ahora son
  // edificios reales, simulados como cualquier otro.
  {
    id: "west-far-n",
    name: "Nave oeste norte",
    x: -40,
    z: -28,
    floors: 3,
    w: 9,
    d: 7.4,
    color: "#6f6a62",
    material: "ladrillo",
    resistance: 42,
  },
  {
    id: "west-far-s",
    name: "Bloque oeste lejano",
    x: -40,
    z: 22,
    floors: 5,
    w: 7.6,
    d: 7,
    color: "#7f7869",
    material: "hormigón",
    resistance: 56,
  },
  {
    id: "east-far-n",
    name: "Almacén este",
    x: 40,
    z: -30,
    floors: 2,
    w: 10,
    d: 8,
    color: "#5f6a70",
    material: "acero",
    resistance: 50,
  },
  {
    id: "east-far-s",
    name: "Torre este lejana",
    x: 40,
    z: 26,
    floors: 6,
    w: 7,
    d: 7,
    color: "#4a5560",
    material: "hormigón",
    resistance: 58,
  },
] as const;

export type BuildingDef = (typeof BUILDINGS)[number];

export const VEHICLES = [
  { id: "car-1", kind: "car" as const, x: -11.4, z: -10, rotY: 0, color: "#c45c4a" },
  { id: "car-2", kind: "car" as const, x: -11.4, z: 8, rotY: Math.PI, color: "#d8d2c6" },
  { id: "van-1", kind: "van" as const, x: -11.6, z: 18, rotY: 0, color: "#4a5a4e" },
  { id: "car-3", kind: "car" as const, x: 11.4, z: -8, rotY: Math.PI, color: "#3d6ea8" },
  { id: "truck-1", kind: "truck" as const, x: 11.8, z: 10, rotY: 0, color: "#c9a227" },
  { id: "car-4", kind: "car" as const, x: 11.4, z: 20, rotY: Math.PI, color: "#2f3338" },
];

export const CRATES = [
  { id: "crate-a", x: -14, z: -4, stacked: 3 },
  { id: "crate-b", x: 14, z: 8, stacked: 2 },
  { id: "crate-c", x: -16, z: 22, stacked: 4 },
];

export const LAMPS = [
  { x: -13.5, z: -12 },
  { x: -13.5, z: 8 },
  { x: 13.5, z: -12 },
  { x: 13.5, z: 8 },
];

export const BARRIERS = [
  { x: -8.6, z: -6, rotY: Math.PI / 2 },
  { x: -8.6, z: 6, rotY: Math.PI / 2 },
  { x: 8.6, z: -6, rotY: Math.PI / 2 },
  { x: 8.6, z: 6, rotY: Math.PI / 2 },
];

export const CATALOG: CatalogItem[] = [
  {
    id: "columna",
    name: "Columna de hormigón",
    group: "construccion",
    kind: "box",
    w: 1.1,
    h: 4,
    d: 1.1,
    material: "hormigón",
    resistance: 78,
    color: "#8a8378",
  },
  {
    id: "muro",
    name: "Muro",
    group: "construccion",
    kind: "box",
    w: 6,
    h: 3.2,
    d: 0.55,
    material: "hormigón",
    resistance: 58,
    color: "#7d776e",
  },
  {
    id: "losa",
    name: "Losa",
    group: "construccion",
    kind: "box",
    w: 6,
    h: 0.5,
    d: 6,
    material: "hormigón",
    resistance: 64,
    color: "#8f897e",
  },
  {
    id: "viga",
    name: "Viga de acero",
    group: "construccion",
    kind: "box",
    w: 8,
    h: 0.45,
    d: 0.45,
    material: "acero",
    resistance: 82,
    color: "#6a7078",
  },
  {
    id: "bloque",
    name: "Bloque",
    group: "construccion",
    kind: "box",
    w: 2,
    h: 2,
    d: 2,
    material: "hormigón",
    resistance: 66,
    color: "#857f74",
  },
  {
    id: "edificio-bajo",
    name: "Edificio bajo",
    group: "estructuras",
    kind: "building",
    floors: 4,
    w: 6,
    d: 6,
    material: "hormigón",
    resistance: 60,
    color: "#8a8378",
  },
  {
    id: "edificio-medio",
    name: "Edificio medio",
    group: "estructuras",
    kind: "building",
    floors: 8,
    w: 7,
    d: 6.4,
    material: "hormigón",
    resistance: 62,
    color: "#7a746a",
  },
  {
    id: "torre",
    name: "Torre",
    group: "estructuras",
    kind: "building",
    floors: 12,
    w: 6.4,
    d: 6.4,
    material: "vidrio",
    resistance: 56,
    color: "#2f3640",
  },
  {
    id: "puente-mod",
    name: "Módulo de puente",
    group: "estructuras",
    kind: "bridge-seg",
    w: 4,
    h: 0.65,
    d: 5.4,
    material: "hormigón",
    resistance: 74,
    color: "#7c7a74",
  },
  {
    id: "antena",
    name: "Torre de antena",
    group: "estructuras",
    kind: "antenna",
    w: 1.2,
    h: 16,
    d: 1.2,
    material: "acero",
    resistance: 40,
    color: "#9aa3ad",
  },
  {
    id: "coche",
    name: "Coche",
    group: "vehiculos",
    kind: "car",
    w: 2,
    h: 1.4,
    d: 4.2,
    material: "metal",
    resistance: 35,
    color: "#c45c4a",
  },
  {
    id: "furgoneta",
    name: "Furgoneta",
    group: "vehiculos",
    kind: "van",
    w: 2.2,
    h: 2.2,
    d: 5.2,
    material: "metal",
    resistance: 40,
    color: "#4a5a4e",
  },
  {
    id: "camion",
    name: "Camión",
    group: "vehiculos",
    kind: "truck",
    w: 2.6,
    h: 2.6,
    d: 7.4,
    material: "metal",
    resistance: 48,
    color: "#c9a227",
  },
  {
    id: "contenedor",
    name: "Contenedor",
    group: "objetos",
    kind: "box",
    w: 6,
    h: 2.6,
    d: 2.5,
    material: "acero",
    resistance: 76,
    color: "#3a6e8a",
  },
  {
    id: "barrera",
    name: "Barrera",
    group: "objetos",
    kind: "box",
    w: 2.1,
    h: 0.9,
    d: 0.42,
    material: "hormigón",
    resistance: 42,
    color: "#c9b48a",
  },
  {
    id: "farola",
    name: "Farola",
    group: "objetos",
    kind: "lamp",
    w: 0.28,
    h: 5.5,
    d: 0.28,
    material: "acero",
    resistance: 22,
    color: "#3a3e44",
  },
  {
    id: "caja",
    name: "Caja",
    group: "objetos",
    kind: "box",
    w: 1.2,
    h: 1.2,
    d: 1.2,
    material: "madera",
    resistance: 22,
    color: "#8a6a3c",
  },
  {
    id: "cisterna",
    name: "Cisterna",
    group: "objetos",
    kind: "tank",
    w: 2.2,
    h: 2.2,
    d: 4.4,
    material: "acero",
    resistance: 60,
    color: "#6a7470",
  },
  {
    id: "rampa",
    name: "Rampa",
    group: "terreno",
    kind: "ramp",
    w: 6,
    h: 2.4,
    d: 8,
    material: "hormigón",
    resistance: 90,
    color: "#6e6a64",
  },
  {
    id: "plataforma",
    name: "Plataforma",
    group: "terreno",
    kind: "box",
    w: 8,
    h: 0.6,
    d: 8,
    material: "hormigón",
    resistance: 92,
    color: "#7a766e",
  },
  {
    id: "muro-contencion",
    name: "Muro de contención",
    group: "terreno",
    kind: "box",
    w: 8,
    h: 3.2,
    d: 1.1,
    material: "hormigón",
    resistance: 88,
    color: "#6c6860",
  },
];

export const CHALLENGES: {
  id: "libre" | "precision" | "cadena" | "puntuacion" | "puente";
  title: string;
  brief: string;
}[] = [
  {
    id: "libre",
    title: "Modo libre",
    brief: "Sin objetivos. Experimenta con la ciudad a tu ritmo.",
  },
  {
    id: "precision",
    title: "Precisión estructural",
    brief: "Destruye el edificio central sin derribar el edificio azul.",
  },
  {
    id: "cadena",
    title: "Colapso en cadena",
    brief: "Provoca un colapso en cadena de al menos 8 piezas en menos de 4 segundos.",
  },
  {
    id: "puntuacion",
    title: "Puntuación máxima",
    brief: "Consigue la máxima puntuación de destrucción en una sola simulación.",
  },
  {
    id: "puente",
    title: "Cirugía de puente",
    brief: "Haz caer el puente con la carga más pequeña posible (≤ 10 kg de TNT).",
  },
];

/**
 * Masa real (kg) de una pieza del catálogo, deducida de su geometría y su
 * material igual que en el resto del mundo. Así lo que dice la interfaz y lo
 * que siente la simulación son la misma cosa.
 */
export function catalogMass(item: CatalogItem) {
  if (item.kind === "building") {
    const h = FLOOR_H * 0.97;
    return massFor("floor", item.material, [item.w ?? 6, h, item.d ?? 6]) * (item.floors ?? 4);
  }
  if (item.kind === "car") return 1400;
  if (item.kind === "van") return 2600;
  if (item.kind === "truck") return 8600;
  if (item.kind === "lamp") return massFor("prop", "acero", [0.28, 5.5, 0.28], 0.18);
  if (item.kind === "antenna") return massFor("column", "acero", [0.7, 2.6, 0.7], 0.12) * 6;
  const kind = item.kind === "bridge-seg" ? "bridge" : item.kind === "ramp" ? "terrain" : "prop";
  return massFor(kind, item.material, [item.w ?? 2, item.h ?? 2, item.d ?? 2]);
}

export function catalogById(id: string) {
  return CATALOG.find((c) => c.id === id);
}

export function materialLabel(mat: string) {
  return mat.charAt(0).toUpperCase() + mat.slice(1);
}

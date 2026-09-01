export type Tool = "select" | "place" | "explode" | "meteor" | "move";

export type CameraMode = "orbit" | "free" | "cinematic" | "follow" | "fps";

export type LeftTab =
  "construccion" | "estructuras" | "vehiculos" | "objetos" | "terreno" | "eventos";

export type ChallengeId = "libre" | "precision" | "cadena" | "puntuacion" | "puente";

export type ChallengeStatus = "idle" | "progress" | "win" | "fail";

export type BodyKind =
  "floor" | "column" | "vehicle" | "prop" | "bridge" | "debris" | "meteor" | "terrain" | "core";

export type TransformMode = "translate" | "rotate";

export type CatalogGroup = Exclude<LeftTab, "eventos">;

export interface CatalogItem {
  id: string;
  name: string;
  group: CatalogGroup;
  kind:
    | "box"
    | "building"
    | "car"
    | "van"
    | "truck"
    | "lamp"
    | "ramp"
    | "antenna"
    | "tank"
    | "bridge-seg";
  w?: number;
  h?: number;
  d?: number;
  mass?: number;
  material?: string;
  resistance?: number;
  floors?: number;
  color?: string;
}

export interface SpawnItem {
  id: string;
  catalogId: string;
  kind: CatalogItem["kind"];
  name: string;
  x: number;
  y: number;
  z: number;
  rotY?: number;
  floors?: number;
  w: number;
  h: number;
  d: number;
  mass: number;
  material: string;
  resistance: number;
  color: string;
  buildingId?: string;
  vx?: number;
  vy?: number;
  vz?: number;
}

export interface RecordedAction {
  t: number;
  type: "explosion" | "earthquake" | "meteor" | "wind" | "collapse" | "shockwave" | "spawn";
  payload: Record<string, number | string>;
}

export interface AiAction {
  type:
    | "explosion"
    | "earthquake"
    | "meteor"
    | "wind"
    | "collapse"
    | "shockwave"
    | "spawn"
    | "timescale"
    | "reset"
    | "camera"
    | "message";
  power?: number;
  radius?: number;
  intensity?: number;
  strength?: number;
  x?: number;
  z?: number;
  height?: number;
  target?: string;
  catalog?: string;
  value?: number;
  mode?: string;
  text?: string;
}

export interface AiResult {
  ok: boolean;
  message: string;
  actions: AiAction[];
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
    __lab?: {
      detonate: (x?: number, z?: number, y?: number) => void;
      pause: () => void;
      play: () => void;
      reset: () => void;
      getScore: () => number;
      getBodyCount: () => number;
      earthquake: (intensity?: number) => void;
      probe: () => Record<string, unknown>;
      setCharge: (power: number, radius?: number) => void;
      explodeAt: (x: number, y: number, z: number, power: number, radius?: number) => void;
      wind: (strength?: number) => void;
      meteor: (x?: number, z?: number, power?: number) => void;
      state: (id: string) => Record<string, unknown> | null;
    };
  }
}

export {};

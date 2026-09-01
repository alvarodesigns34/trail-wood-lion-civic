import { create } from "zustand";
import { catalogById } from "./city";
import { sim } from "./sim";
import { uid } from "@/lib/utils";
import type {
  CameraMode,
  ChallengeId,
  ChallengeStatus,
  LeftTab,
  RecordedAction,
  SpawnItem,
  Tool,
  TransformMode,
} from "./types";

const TIME_SCALES = [0.25, 0.5, 1, 2, 5, 10] as const;

export { TIME_SCALES };

interface LabState {
  started: boolean;
  paused: boolean;
  timeScale: number;
  tool: Tool;
  cameraMode: CameraMode;
  orbitEnabled: boolean;
  selectedId: string | null;
  catalogId: string | null;
  leftTab: LeftTab;
  leftOpen: boolean;
  rightOpen: boolean;
  aiOpen: boolean;
  helpOpen: boolean;
  worldKey: number;
  explosion: { power: number; radius: number; height: number; x: number; z: number };
  marker: { x: number; y: number; z: number } | null;
  transformMode: TransformMode;
  score: number;
  damage: number;
  destroyed: number;
  chain: number;
  bestChain: number;
  bestScore: number;
  challenge: ChallengeId;
  challengeStatus: ChallengeStatus;
  fps: number;
  objects: number;
  simLabel: string;
  extras: SpawnItem[];
  debris: SpawnItem[];
  meteors: { id: string; x: number; z: number; power: number }[];
  replay: { available: boolean; recording: RecordedAction[]; playing: boolean; cursor: number };
  lastMessage: string;
  aiBusy: boolean;
  aiLog: { role: "user" | "lab"; text: string }[];
  shakeEnabled: boolean;
  quality: "alta" | "media";
  sceneReady: boolean;
  hoverGround: { x: number; y: number; z: number } | null;

  start: () => void;
  setPaused: (v: boolean) => void;
  togglePaused: () => void;
  setTimeScale: (v: number) => void;
  setTool: (t: Tool) => void;
  setCameraMode: (m: CameraMode) => void;
  setOrbitEnabled: (v: boolean) => void;
  select: (id: string | null) => void;
  setCatalog: (id: string | null) => void;
  setLeftTab: (t: LeftTab) => void;
  setLeftOpen: (v: boolean) => void;
  setRightOpen: (v: boolean) => void;
  setAiOpen: (v: boolean) => void;
  setHelpOpen: (v: boolean) => void;
  setExplosion: (p: Partial<LabState["explosion"]>) => void;
  setMarker: (m: LabState["marker"]) => void;
  setTransformMode: (m: TransformMode) => void;
  setChallenge: (id: ChallengeId) => void;
  setFps: (n: number) => void;
  setObjects: (n: number) => void;
  setSceneReady: (v: boolean) => void;
  setHoverGround: (p: LabState["hoverGround"]) => void;
  setShakeEnabled: (v: boolean) => void;
  setQuality: (q: "alta" | "media") => void;
  addScore: (p: { damage: number; destroyed: number; chain: number; buildingId?: string; kind: string }) => void;
  spawnExtra: (item: SpawnItem) => void;
  spawnFromCatalog: (catalogId: string, x: number, y: number, z: number) => void;
  pushDebris: (items: SpawnItem[]) => void;
  pushMeteor: (m: { id: string; x: number; z: number; power: number }) => void;
  removeMeteor: (id: string) => void;
  removeExtra: (id: string) => void;
  record: (a: RecordedAction) => void;
  resetWorld: () => void;
  startReplay: () => void;
  stopReplay: () => void;
  consumeReplayAt: (t: number) => RecordedAction[];
  setMessage: (msg: string) => void;
  pushAi: (role: "user" | "lab", text: string) => void;
  setAiBusy: (v: boolean) => void;
}

function loadBest() {
  if (typeof localStorage === "undefined") return 0;
  const n = Number(localStorage.getItem("destruct-lab-best") ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function simLabel(paused: boolean, scale: number) {
  if (paused) return "Pausada";
  if (scale < 1) return `Cámara lenta ${scale.toString().replace(".", ",")}×`;
  if (scale > 1) return `Acelerada ${scale.toString().replace(".", ",")}×`;
  return "En curso";
}

export const useLab = create<LabState>((set, get) => ({
  started: false,
  paused: false,
  timeScale: 1,
  tool: "explode",
  cameraMode: "orbit",
  orbitEnabled: true,
  selectedId: null,
  catalogId: null,
  leftTab: "eventos",
  leftOpen: true,
  rightOpen: true,
  aiOpen: false,
  helpOpen: false,
  worldKey: 1,
  explosion: { power: 70, radius: 16, height: 2.4, x: 0, z: 0 },
  marker: { x: 0, y: 2.4, z: 0 },
  transformMode: "translate",
  score: 0,
  damage: 0,
  destroyed: 0,
  chain: 0,
  bestChain: 0,
  bestScore: loadBest(),
  challenge: "libre",
  challengeStatus: "idle",
  fps: 60,
  objects: 0,
  simLabel: "En curso",
  extras: [],
  debris: [],
  meteors: [],
  replay: { available: false, recording: [], playing: false, cursor: 0 },
  lastMessage: "Listo para experimentar.",
  aiBusy: false,
  aiLog: [],
  shakeEnabled: true,
  quality: "alta",
  sceneReady: false,
  hoverGround: null,

  start: () => set({ started: true }),
  setPaused: (v) => set({ paused: v, simLabel: simLabel(v, get().timeScale) }),
  togglePaused: () => {
    const paused = !get().paused;
    set({ paused, simLabel: simLabel(paused, get().timeScale) });
  },
  setTimeScale: (v) => set({ timeScale: v, paused: false, simLabel: simLabel(false, v) }),
  setTool: (t) => set({ tool: t, leftTab: t === "place" ? get().leftTab : get().leftTab }),
  setCameraMode: (m) => set({ cameraMode: m }),
  setOrbitEnabled: (v) => set({ orbitEnabled: v }),
  select: (id) => set({ selectedId: id, rightOpen: id ? true : get().rightOpen }),
  setCatalog: (id) => set({ catalogId: id, tool: id ? "place" : get().tool }),
  setLeftTab: (t) => set({ leftTab: t, leftOpen: true }),
  setLeftOpen: (v) => set({ leftOpen: v }),
  setRightOpen: (v) => set({ rightOpen: v }),
  setAiOpen: (v) => set({ aiOpen: v }),
  setHelpOpen: (v) => set({ helpOpen: v }),
  setExplosion: (p) => set({ explosion: { ...get().explosion, ...p } }),
  setMarker: (m) => set({ marker: m }),
  setTransformMode: (m) => set({ transformMode: m }),
  setChallenge: (id) =>
    set({
      challenge: id,
      challengeStatus: id === "libre" ? "idle" : "progress",
      lastMessage:
        id === "libre"
          ? "Modo libre."
          : "Reto activado. Observa el panel de puntuación.",
    }),
  setFps: (n) => set({ fps: n }),
  setObjects: (n) => set({ objects: n }),
  setSceneReady: (v) => set({ sceneReady: v }),
  setHoverGround: (p) => set({ hoverGround: p }),
  setShakeEnabled: (v) => set({ shakeEnabled: v }),
  setQuality: (q) => set({ quality: q }),

  addScore: ({ damage, destroyed, chain, buildingId }) => {
    const add = Math.round(damage * 0.35 + destroyed * 48 + Math.max(0, chain - 1) * 12);
    const score = get().score + add;
    const bestChain = Math.max(get().bestChain, chain);
    const bestScore = Math.max(get().bestScore, score);
    if (bestScore > get().bestScore && typeof localStorage !== "undefined") {
      localStorage.setItem("destruct-lab-best", String(bestScore));
    }
    let challengeStatus = get().challengeStatus;
    const ch = get().challenge;
    if (ch === "precision" && challengeStatus === "progress") {
      if (sim.buildingDestroyed("east-blue")) challengeStatus = "fail";
      else if (sim.buildingDestroyed("east-center")) challengeStatus = "win";
    }
    if (ch === "cadena" && chain >= 8) challengeStatus = "win";
    if (ch === "puente" && sim.bridgeDown()) {
      const last = get().replay.recording[get().replay.recording.length - 1];
      const power = typeof last?.payload.power === "number" ? last.payload.power : 99;
      challengeStatus = power <= 40 ? "win" : "fail";
    }
    if (ch === "puntuacion" && score >= 2500) challengeStatus = "win";
    set({
      score,
      damage: get().damage + damage,
      destroyed: get().destroyed + destroyed,
      chain,
      bestChain,
      bestScore,
      challengeStatus,
    });
    void buildingId;
  },

  spawnExtra: (item) => set({ extras: [...get().extras, item] }),

  spawnFromCatalog: (catalogId, x, y, z) => {
    const cat = catalogById(catalogId);
    if (!cat) return;
    const item: SpawnItem = {
      id: uid(cat.id),
      catalogId,
      kind: cat.kind,
      name: cat.name,
      x,
      y,
      z,
      floors: cat.floors,
      w: cat.w ?? 2,
      h: cat.h ?? 2,
      d: cat.d ?? 2,
      mass: cat.mass ?? 80,
      material: cat.material ?? "hormigón",
      resistance: cat.resistance ?? 50,
      color: cat.color ?? "#8a8378",
      buildingId: cat.kind === "building" ? uid("b") : undefined,
    };
    set({ extras: [...get().extras, item], lastMessage: `Colocado: ${cat.name}` });
    get().record({
      t: sim.simTime,
      type: "spawn",
      payload: { catalogId, x, y, z },
    });
  },

  pushDebris: (items) => {
    const debris = [...get().debris, ...items].slice(-90);
    set({ debris });
  },
  pushMeteor: (m) => set({ meteors: [...get().meteors, m] }),
  removeMeteor: (id) => set({ meteors: get().meteors.filter((m) => m.id !== id) }),
  removeExtra: (id) => {
    sim.unregister(id);
    set({
      extras: get().extras.filter((e) => e.id !== id),
      selectedId: get().selectedId === id ? null : get().selectedId,
    });
  },

  record: (a) => {
    if (get().replay.playing) return;
    set({
      replay: {
        available: true,
        recording: [...get().replay.recording, a],
        playing: false,
        cursor: 0,
      },
    });
  },

  resetWorld: () => {
    sim.reset();
    set({
      worldKey: get().worldKey + 1,
      extras: [],
      debris: [],
      meteors: [],
      score: 0,
      damage: 0,
      destroyed: 0,
      chain: 0,
      selectedId: null,
      sceneReady: false,
      paused: false,
      challengeStatus: get().challenge === "libre" ? "idle" : "progress",
      lastMessage: "Simulación reiniciada.",
      marker: { x: 0, y: get().explosion.height, z: 0 },
      replay: get().replay.playing
        ? get().replay
        : { available: get().replay.available, recording: [], playing: false, cursor: 0 },
    });
  },

  startReplay: () => {
    const rec = get().replay.recording;
    if (!rec.length) return;
    set({
      replay: { available: true, recording: rec, playing: true, cursor: 0 },
      timeScale: 0.5,
      paused: false,
      simLabel: simLabel(false, 0.5),
      lastMessage: "Repetición en cámara lenta.",
    });
    get().resetWorld();
    set({
      replay: { available: true, recording: rec, playing: true, cursor: 0 },
    });
  },

  stopReplay: () =>
    set({
      replay: { ...get().replay, playing: false },
      lastMessage: "Repetición finalizada.",
    }),

  consumeReplayAt: (t) => {
    const { replay } = get();
    if (!replay.playing) return [];
    const due: RecordedAction[] = [];
    let cursor = replay.cursor;
    while (cursor < replay.recording.length && replay.recording[cursor].t <= t + 0.02) {
      due.push(replay.recording[cursor]);
      cursor += 1;
    }
    if (cursor !== replay.cursor) set({ replay: { ...replay, cursor } });
    if (cursor >= replay.recording.length && t > (replay.recording.at(-1)?.t ?? 0) + 4) {
      get().stopReplay();
    }
    return due;
  },

  setMessage: (msg) => set({ lastMessage: msg }),
  pushAi: (role, text) => set({ aiLog: [...get().aiLog, { role, text }].slice(-12) }),
  setAiBusy: (v) => set({ aiBusy: v }),
}));

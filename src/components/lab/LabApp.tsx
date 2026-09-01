import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Box,
  BrickWall,
  Building2,
  Camera,
  Car,
  CircleHelp,
  Crosshair,
  Eye,
  Mountain,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Spline,
  Trash2,
  Copy,
  Wind,
  Zap,
  Orbit,
  PersonStanding,
  Clapperboard,
  Focus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useLab, TIME_SCALES } from "@/game/store";
import { sim } from "@/game/sim";
import { CATALOG, CHALLENGES, catalogById, catalogMass, materialLabel } from "@/game/city";
import { integrityLabel } from "@/game/materials";
import { bindInput, isTyping } from "@/game/input";
import { playBoom, playClick, playRumble, playWhoosh, unlockAudio } from "@/game/audio";
import { parseCommand } from "@/lib/ai/parse-command";
import { runExperiment } from "@/lib/ai/experiment";
import { cn, formatEs } from "@/lib/utils";
import type { AiAction, CameraMode, LeftTab, Tool } from "@/game/types";

const Scene = lazy(() => import("./Scene"));

function applyAction(a: AiAction) {
  const lab = useLab.getState();
  switch (a.type) {
    case "explosion": {
      const power = a.power ?? lab.explosion.power;
      const radius = a.radius ?? lab.explosion.radius;
      const height = a.height ?? lab.explosion.height;
      const x = a.x ?? 0;
      const z = a.z ?? 0;
      lab.setExplosion({ power, radius, height, x, z });
      lab.setMarker({ x, y: height, z });
      const res = sim.explode(x, height, z, power, radius);
      playBoom(power);
      void res;
      lab.record({
        t: sim.simTime,
        type: "explosion",
        payload: { x, z, power, radius, height },
      });
      break;
    }
    case "earthquake": {
      const intensity = a.intensity ?? 0.75;
      sim.earthquake(intensity);
      playRumble(intensity);
      lab.record({ t: sim.simTime, type: "earthquake", payload: { intensity } });
      break;
    }
    case "meteor": {
      const x = a.x ?? 0;
      const z = a.z ?? 0;
      const power = a.power ?? 80;
      sim.spawnMeteor(x, z, power);
      playWhoosh();
      lab.record({ t: sim.simTime, type: "meteor", payload: { x, z, power } });
      break;
    }
    case "wind": {
      const strength = a.strength ?? 0.7;
      sim.startWind(strength);
      lab.record({ t: sim.simTime, type: "wind", payload: { strength } });
      break;
    }
    case "collapse": {
      const target = a.target ?? "all";
      if (target === "all") sim.collapseAll();
      else if (target === "bridge") sim.collapseBuilding("bridge");
      else sim.collapseBuilding(target);
      lab.record({ t: sim.simTime, type: "collapse", payload: { target } });
      break;
    }
    case "shockwave": {
      sim.shockwave(a.x ?? 0, a.z ?? 0, a.power ?? 70);
      playBoom(a.power ?? 70);
      lab.record({
        t: sim.simTime,
        type: "shockwave",
        payload: { x: a.x ?? 0, z: a.z ?? 0, power: a.power ?? 70 },
      });
      break;
    }
    case "spawn": {
      if (a.catalog) lab.spawnFromCatalog(a.catalog, a.x ?? 0, 0, a.z ?? 0);
      break;
    }
    case "timescale": {
      if (a.value === 0) lab.setPaused(true);
      else lab.setTimeScale(a.value ?? 1);
      break;
    }
    case "reset":
      lab.resetWorld();
      break;
    case "camera":
      if (a.mode) lab.setCameraMode(a.mode as CameraMode);
      break;
    default:
      break;
  }
}

/** Masa legible: kilos hasta una tonelada, toneladas a partir de ahí. */
function formatMass(kg: number) {
  if (kg >= 1000) return `${formatEs(Math.round((kg / 1000) * 10) / 10)} t`;
  return `${formatEs(Math.round(kg))} kg`;
}

/**
 * `y` sólo llega cuando se hace clic directamente sobre una pieza: en ese caso
 * la carga estalla justo donde se ha señalado, lo que permite atacar una planta
 * alta. Al hacer clic en el suelo se usa la altura del foco del panel.
 */
function detonateAt(x?: number, z?: number, y?: number) {
  const lab = useLab.getState();
  const { power, radius } = lab.explosion;
  const height = y ?? lab.explosion.height;
  const px = x ?? lab.marker?.x ?? lab.explosion.x;
  const pz = z ?? lab.marker?.z ?? lab.explosion.z;
  lab.setMarker({ x: px, y: height, z: pz });
  lab.setExplosion({ x: px, z: pz });
  const res = sim.explode(px, height, pz, power, radius);
  playBoom(power);
  void res;
  lab.record({
    t: sim.simTime,
    type: "explosion",
    payload: { x: px, z: pz, power, radius, height },
  });
  lab.setMessage(
    `Explosión detonada · carga ${formatEs(power)} kg TNT · radio ${formatEs(radius)} m`,
  );
}

export default function LabApp() {
  const started = useLab((s) => s.started);
  const sceneReady = useLab((s) => s.sceneReady);

  useEffect(() => bindInput(), []);

  useEffect(() => {
    const unsub = sim.onScore((evt) => {
      useLab.getState().addScore(evt);
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    window.__lab = {
      detonate: detonateAt,
      pause: () => useLab.getState().setPaused(true),
      play: () => useLab.getState().setPaused(false),
      reset: () => useLab.getState().resetWorld(),
      getScore: () => useLab.getState().score,
      getBodyCount: () => sim.bodies.size,
      earthquake: (intensity = 0.8) => applyAction({ type: "earthquake", intensity }),
      probe: () => sim.probe(),
      setCharge: (power: number, radius?: number) => {
        useLab.getState().setExplosion({ power });
        if (radius !== undefined) useLab.getState().setExplosion({ radius });
      },
      explodeAt: (x: number, y: number, z: number, power: number, radius?: number) => {
        const r = radius ?? useLab.getState().explosion.radius;
        sim.explode(x, y, z, power, r);
        playBoom(power);
      },
      wind: (strength = 0.85) => applyAction({ type: "wind", strength }),
      meteor: (x = 0, z = 0, power = 60) => applyAction({ type: "meteor", x, z, power }),
      state: (id: string) => sim.liveState(id),
    };
    return () => {
      window.__lab = undefined;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const lab = useLab.getState();
      if (e.code === "Space") {
        e.preventDefault();
        lab.togglePaused();
      }
      if (e.code === "Digit1") lab.setTimeScale(0.25);
      if (e.code === "Digit2") lab.setTimeScale(0.5);
      if (e.code === "Digit3") lab.setTimeScale(1);
      if (e.code === "Digit4") lab.setTimeScale(2);
      if (e.code === "Digit5") lab.setTimeScale(5);
      if (e.code === "Digit6") lab.setTimeScale(10);
      if (e.code === "KeyP") lab.setTool("explode");
      if (e.code === "KeyK") lab.setTool("select");
      if (e.code === "KeyM") lab.setTool("move");
      if (e.code === "Delete" || e.code === "Backspace") {
        if (lab.selectedId) lab.removeExtra(lab.selectedId);
      }
      if (e.code === "Escape") {
        lab.select(null);
        lab.setHelpOpen(false);
        lab.setAiOpen(false);
      }
      if (e.code === "KeyH") lab.setHelpOpen(!lab.helpOpen);
      if (e.code === "KeyI") lab.setAiOpen(!lab.aiOpen);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      {started && (
        <Suspense fallback={<LoadingOverlay />}>
          <Scene />
        </Suspense>
      )}
      {!started && <StartScreen />}
      {started && !sceneReady && <LoadingOverlay />}
      {started && (
        <>
          <TopBar />
          <LeftPanel />
          <RightPanel />
          <BottomBar />
          <AiDrawer />
          <HelpOverlay />
          <ChallengeBanner />
          <MobileChrome />
        </>
      )}
    </div>
  );
}

function StartScreen() {
  const start = useLab((s) => s.start);
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(1200px 500px at 70% 20%, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 60%), linear-gradient(180deg, #0c0e12 0%, #070809 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] tracking-[0.42em] text-accent">
          SIMULACIÓN ESTRUCTURAL
        </p>
        <h1 className="mt-4 font-sans text-5xl font-semibold tracking-[-0.04em] text-fg md:text-7xl">
          DESTRUCT LAB
        </h1>
        <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted md:text-lg">
          Laboratorio cinemático de destrucción. Construye una ciudad, aplica fuerzas y observa cómo
          el hormigón, el acero y el vidrio pierden estabilidad.
        </p>
        <button
          type="button"
          className="mt-10 min-h-12 rounded-lg bg-fg px-8 text-sm font-medium tracking-wide text-bg transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => {
            unlockAudio();
            playClick();
            start();
          }}
        >
          Entrar al laboratorio
        </button>
        <p className="mt-5 max-w-md text-xs leading-relaxed text-subtle">
          Clic en el suelo o sobre cualquier pieza para detonar ahí mismo. Pausa con espacio. El
          panel izquierdo coloca estructuras y dispara eventos.
        </p>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-bg/70">
      <p className="font-mono text-xs tracking-[0.28em] text-muted">INICIALIZANDO FÍSICA…</p>
    </div>
  );
}

function TopBar() {
  const fps = useLab((s) => s.fps);
  const objects = useLab((s) => s.objects);
  const simLabel = useLab((s) => s.simLabel);
  const score = useLab((s) => s.score);
  const setAiOpen = useLab((s) => s.setAiOpen);
  const setHelpOpen = useLab((s) => s.setHelpOpen);
  const setLeftOpen = useLab((s) => s.setLeftOpen);
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 md:p-4">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md border border-border bg-surface text-fg md:hidden"
          onClick={() => setLeftOpen(true)}
          aria-label="Abrir herramientas"
        >
          <Menu className="size-4" />
        </button>
        <div className="rounded-md border border-border bg-surface px-3 py-2">
          <p className="font-mono text-[10px] tracking-[0.32em] text-accent">DESTRUCT LAB</p>
          <p className="text-[11px] text-muted">Laboratorio de destrucción</p>
        </div>
      </div>
      <div className="pointer-events-auto hidden items-center gap-2 md:flex">
        <Stat chip="FPS" value={String(fps)} />
        <Stat chip="Objetos" value={String(objects)} />
        <Stat chip="Estado" value={simLabel} />
        <Stat chip="Puntuación" value={formatEs(score)} />
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        <GhostBtn onClick={() => setAiOpen(true)} icon={<Sparkles className="size-4" />}>
          Experimento con IA
        </GhostBtn>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-fg"
          onClick={() => setHelpOpen(true)}
          aria-label="Ayuda"
        >
          <CircleHelp className="size-4" />
        </button>
      </div>
    </header>
  );
}

function Stat({ chip, value }: { chip: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface px-2.5 py-1.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-subtle">{chip}</p>
      <p className="font-mono text-xs tabular-nums text-fg">{value}</p>
    </div>
  );
}

function GhostBtn({
  children,
  onClick,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-fg hover:border-accent/40"
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}

const TABS: { id: LeftTab; label: string; icon: typeof Building2 }[] = [
  { id: "construccion", label: "Construcción", icon: BrickWall },
  { id: "estructuras", label: "Estructuras", icon: Building2 },
  { id: "vehiculos", label: "Vehículos", icon: Car },
  { id: "objetos", label: "Objetos", icon: Box },
  { id: "terreno", label: "Terreno", icon: Mountain },
  { id: "eventos", label: "Eventos", icon: Zap },
];

function LeftPanel() {
  const tab = useLab((s) => s.leftTab);
  const open = useLab((s) => s.leftOpen);
  const setLeftTab = useLab((s) => s.setLeftTab);
  const setLeftOpen = useLab((s) => s.setLeftOpen);
  if (!open) {
    return (
      <button
        type="button"
        className="absolute top-20 left-3 z-20 hidden size-10 items-center justify-center rounded-md border border-border bg-surface md:flex"
        onClick={() => setLeftOpen(true)}
        aria-label="Mostrar panel"
      >
        <ChevronRight className="size-4" />
      </button>
    );
  }
  return (
    <aside
      className={cn(
        "absolute top-20 bottom-20 left-0 z-20 flex w-[min(100%,320px)] flex-col border-r border-border bg-surface md:top-20 md:bottom-20 md:left-3 md:w-[300px] md:rounded-lg md:border",
        "max-md:top-0 max-md:bottom-0",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="font-mono text-[10px] tracking-[0.22em] text-subtle">HERRAMIENTAS</p>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-sm text-muted hover:text-fg"
          onClick={() => setLeftOpen(false)}
          aria-label="Cerrar panel"
        >
          {typeof window !== "undefined" && window.innerWidth < 768 ? (
            <X className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              title={t.label}
              onClick={() => setLeftTab(t.id)}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-md border",
                active
                  ? "border-accent/40 bg-surface-3 text-accent"
                  : "border-transparent text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
      <div className="lab-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "eventos" ? <EventsPanel /> : <CatalogPanel group={tab} />}
      </div>
    </aside>
  );
}

function CatalogPanel({ group }: { group: Exclude<LeftTab, "eventos"> }) {
  const items = CATALOG.filter((c) => c.group === group);
  const catalogId = useLab((s) => s.catalogId);
  const setCatalog = useLab((s) => s.setCatalog);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        Selecciona un elemento y haz clic en el suelo para colocarlo.
      </p>
      {items.map((item) => {
        const active = catalogId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              playClick();
              setCatalog(active ? null : item.id);
              if (!active) useLab.getState().setTool("place");
            }}
            className={cn(
              "flex flex-col items-start rounded-md border px-3 py-2.5 text-left",
              active
                ? "border-accent/50 bg-surface-3"
                : "border-border bg-surface-2 hover:border-subtle",
            )}
          >
            <span className="text-sm text-fg">{item.name}</span>
            <span className="mt-0.5 font-mono text-[10px] text-subtle">
              {item.material ? materialLabel(item.material) : "Estructura"}
              {item.w ? ` · ${item.w}×${item.h}×${item.d}` : ""}
              {` · ${formatMass(catalogMass(item))}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Escala de referencia de cargas, para que la diferencia se note al momento. */
const CHARGE_PRESETS = [
  {
    id: "muy-debil",
    label: "Muy débil",
    short: "0,5 kg",
    kg: 0.5,
    hint: "Apenas mueve objetos pequeños. Rompe cristales cerca del foco.",
  },
  {
    id: "debil",
    label: "Débil",
    short: "3 kg",
    kg: 3,
    hint: "Desplaza cajas y mobiliario. Abolla chapa. No toca la estructura.",
  },
  {
    id: "media",
    label: "Media",
    short: "20 kg",
    kg: 20,
    hint: "Destroza objetos y agrieta el hormigón a corta distancia.",
  },
  {
    id: "fuerte",
    label: "Fuerte",
    short: "120 kg",
    kg: 120,
    hint: "Vuelca vehículos y puede arruinar los apoyos de una planta.",
  },
  {
    id: "extrema",
    label: "Extrema",
    short: "500 kg",
    kg: 500,
    hint: "Arrasa la planta baja y provoca el colapso de todo el edificio.",
  },
] as const;

function EventsPanel() {
  const explosion = useLab((s) => s.explosion);
  const radiusAuto = useLab((s) => s.radiusAuto);
  const setExplosion = useLab((s) => s.setExplosion);
  const setTool = useLab((s) => s.setTool);
  const tool = useLab((s) => s.tool);
  const cameraMode = useLab((s) => s.cameraMode);
  const setCameraMode = useLab((s) => s.setCameraMode);
  const replay = useLab((s) => s.replay);

  return (
    <div className="flex flex-col gap-4">
      <Section title="Explosión">
        <p className="mb-2 text-xs text-muted">
          La carga se mide en kilogramos equivalentes de TNT. La distancia, la masa y el material
          deciden el resultado.
        </p>
        <div className="mb-2 grid grid-cols-5 gap-1">
          {CHARGE_PRESETS.map((preset) => {
            const active = Math.abs(explosion.power - preset.kg) < 0.01;
            return (
              <button
                key={preset.id}
                type="button"
                title={preset.hint}
                onClick={() => {
                  setExplosion({ power: preset.kg });
                  playClick();
                }}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center rounded-md border px-1 py-1 text-[10px] leading-tight",
                  active
                    ? "border-accent/60 bg-surface-3 text-fg"
                    : "border-border bg-surface-2 text-muted hover:text-fg",
                )}
              >
                <span>{preset.label}</span>
                <span className="font-mono text-[9px] text-subtle">{preset.short}</span>
              </button>
            );
          })}
        </div>
        <Slider
          label="Carga (kg TNT)"
          value={explosion.power}
          min={0.25}
          max={500}
          step={0.25}
          onChange={(v) => setExplosion({ power: v })}
        />
        <Slider
          label={`Radio de efecto (m)${radiusAuto ? " · automático" : ""}`}
          value={explosion.radius}
          min={3}
          max={90}
          step={0.5}
          onChange={(v) => setExplosion({ radius: v })}
        />
        {!radiusAuto ? (
          <button
            type="button"
            onClick={() => useLab.getState().setRadiusAuto(true)}
            className="mb-1 text-left text-[10px] text-accent hover:underline"
          >
            Volver al radio automático ({formatEs(sim.suggestedRadius(explosion.power))} m)
          </button>
        ) : null}
        <Slider
          label="Altura del foco (m)"
          value={explosion.height}
          min={0}
          max={30}
          step={0.5}
          onChange={(v) => setExplosion({ height: v })}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <NumField
            label="Posición X"
            value={explosion.x}
            onChange={(v) => setExplosion({ x: v })}
          />
          <NumField
            label="Posición Z"
            value={explosion.z}
            onChange={(v) => setExplosion({ z: v })}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setTool("explode");
            playClick();
          }}
          className={cn(
            "mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-medium",
            tool === "explode" ? "bg-danger text-fg" : "bg-danger/80 text-fg hover:bg-danger",
          )}
        >
          <Crosshair className="size-4" />
          {tool === "explode" ? "Clic para detonar" : "Armar explosión"}
        </button>
        <button
          type="button"
          onClick={() => detonateAt(explosion.x, explosion.z)}
          className="flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface-2 text-sm text-fg hover:bg-surface-3"
        >
          Detonar en la posición
        </button>
      </Section>

      <Section title="Otros eventos">
        <EventBtn
          icon={<Spline className="size-4" />}
          label="Terremoto"
          onClick={() => applyAction({ type: "earthquake", intensity: 0.82 })}
        />
        <EventBtn
          icon={<Zap className="size-4" />}
          label="Impacto de meteorito"
          onClick={() => {
            setTool("meteor");
            useLab.getState().setMessage("Clic en el suelo para lanzar el meteorito.");
          }}
        />
        <EventBtn
          icon={<Wind className="size-4" />}
          label="Onda expansiva"
          onClick={() => applyAction({ type: "shockwave", power: 60, x: 0, z: 0 })}
        />
        <EventBtn
          icon={<Building2 className="size-4" />}
          label="Colapso estructural"
          onClick={() => applyAction({ type: "collapse", target: "east-center" })}
        />
        <EventBtn
          icon={<Wind className="size-4" />}
          label="Viento fuerte"
          onClick={() => applyAction({ type: "wind", strength: 0.85 })}
        />
      </Section>

      <Section title="Cámara">
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              ["orbit", "Órbita", Orbit],
              ["free", "Libre", Camera],
              ["cinematic", "Cinemática", Clapperboard],
              ["follow", "Seguimiento", Focus],
              ["fps", "Primera persona", PersonStanding],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCameraMode(id)}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-md border px-2 text-left text-xs",
                cameraMode === id
                  ? "border-accent/40 bg-surface-3 text-fg"
                  : "border-border text-muted hover:text-fg",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-subtle">
          Libre: WASD + clic derecho para mirar. Primera persona: clic en el lienzo y WASD.
        </p>
      </Section>

      <Section title="Repetición">
        <button
          type="button"
          disabled={!replay.available || replay.recording.length === 0}
          onClick={() => useLab.getState().startReplay()}
          className="flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface-2 text-sm disabled:opacity-40"
        >
          Repetir simulación
        </button>
        <p className="mt-2 text-[11px] text-subtle">
          Tras un evento mayor puedes repetirlo en cámara lenta y cambiar el ángulo.
        </p>
      </Section>
    </div>
  );
}

function EventBtn({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        onClick();
      }}
      className="mb-1.5 flex min-h-11 w-full items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm text-fg hover:bg-surface-3"
    >
      {icon}
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mb-2 block">
      <span className="mb-1 flex justify-between font-mono text-[10px] tracking-wider text-muted uppercase">
        {label}
        <span className="tabular-nums text-fg">{formatEs(value, step < 1 ? 1 : 0)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] text-subtle uppercase">{label}</span>
      <input
        type="number"
        step="0.1"
        // Redondeado: al detonar con el ratón la coordenada llega con toda la
        // precisión del rayo y el campo mostraba cosas como 21.608520264.
        value={Number.isFinite(value) ? Math.round(value * 10) / 10 : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-h-10 rounded-md border border-border bg-bg px-2 font-mono text-sm text-fg outline-none focus:border-accent"
      />
    </label>
  );
}

function RightPanel() {
  const open = useLab((s) => s.rightOpen);
  const selectedId = useLab((s) => s.selectedId);
  const setRightOpen = useLab((s) => s.setRightOpen);
  const challenge = useLab((s) => s.challenge);
  const setChallenge = useLab((s) => s.setChallenge);
  const score = useLab((s) => s.score);
  const damage = useLab((s) => s.damage);
  const destroyed = useLab((s) => s.destroyed);
  const chain = useLab((s) => s.chain);
  const bestScore = useLab((s) => s.bestScore);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 200);
    return () => window.clearInterval(id);
  }, []);

  const live = selectedId ? sim.liveState(selectedId) : null;
  void tick;

  if (!open) {
    return (
      <button
        type="button"
        className="absolute top-20 right-3 z-20 hidden size-10 items-center justify-center rounded-md border border-border bg-surface md:flex"
        onClick={() => setRightOpen(true)}
        aria-label="Mostrar inspector"
      >
        <ChevronLeft className="size-4" />
      </button>
    );
  }

  return (
    <aside className="absolute top-20 right-0 bottom-20 z-20 hidden w-[280px] flex-col border-l border-border bg-surface md:right-3 md:flex md:rounded-lg md:border">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="font-mono text-[10px] tracking-[0.22em] text-subtle">INSPECTOR</p>
        <button
          type="button"
          className="flex size-8 items-center justify-center text-muted hover:text-fg"
          onClick={() => setRightOpen(false)}
          aria-label="Cerrar inspector"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="lab-scroll min-h-0 flex-1 overflow-y-auto p-3">
        <Section title="Objeto seleccionado">
          {!live ? (
            <p className="text-xs text-muted">
              Nada seleccionado. Cambia a la herramienta seleccionar y haz clic en una pieza.
            </p>
          ) : (
            <div className="flex flex-col gap-2 text-xs">
              <Row k="Nombre" v={live.name} />
              <Row k="Material" v={materialLabel(live.material)} />
              <Row k="Masa" v={formatMass(live.mass)} />
              <Row
                k="Tamaño"
                v={`${live.size[0].toFixed(1)} × ${live.size[1].toFixed(1)} × ${live.size[2].toFixed(1)}`}
              />
              <Row k="Resistencia" v={`${formatEs(Math.round(live.strength))} kPa`} />
              <Row
                k="Posición"
                v={`${live.px.toFixed(1)}, ${live.py.toFixed(1)}, ${live.pz.toFixed(1)}`}
              />
              <Row k="Estado" v={live.estado} />
              <Row k="Soporte" v={live.soporte ? "Apoyada" : "Suelta"} />
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div
                  className={cn(
                    "h-full transition-[width] duration-200",
                    live.integridad > 0.6
                      ? "bg-accent"
                      : live.integridad > 0.3
                        ? "bg-warn"
                        : "bg-danger",
                  )}
                  style={{ width: `${Math.max(0, live.integridad * 100)}%` }}
                />
              </div>
              <p className="font-mono text-[10px] text-subtle">
                Integridad {formatEs(Math.round(live.integridad * 100))} % ·{" "}
                {integrityLabel(live.integridad)}
              </p>
              {live.soporte && live.capacidad > 1 ? (
                <>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={cn("h-full", live.usoCapacidad > 100 ? "bg-danger" : "bg-subtle")}
                      style={{ width: `${Math.min(100, live.usoCapacidad)}%` }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-subtle">
                    Carga que soporta {formatMass(live.cargaSoportada / 9.81)} ·{" "}
                    {formatEs(Math.round(live.usoCapacidad))} % de su capacidad
                    {live.overloaded ? " · sobrecargada" : ""}
                  </p>
                </>
              ) : null}
              {!live.soporte && live.speed > 0.2 ? (
                <p className="font-mono text-[10px] text-subtle">
                  Velocidad {formatEs(Math.round(live.speed * 10) / 10)} m/s
                </p>
              ) : null}
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  className="flex min-h-10 items-center justify-center gap-1 rounded-md border border-border text-xs"
                  onClick={() => {
                    useLab.getState().setTool("move");
                    useLab.getState().setMessage("Clic en el suelo para reposicionar.");
                  }}
                >
                  Mover
                </button>
                <button
                  type="button"
                  className="flex min-h-10 items-center justify-center gap-1 rounded-md border border-border text-xs"
                  onClick={() => sim.rotateY(live.id, Math.PI / 12)}
                >
                  Rotar +15°
                </button>
                <button
                  type="button"
                  className="flex min-h-10 items-center justify-center gap-1 rounded-md border border-border text-xs"
                  onClick={() => {
                    const sb = sim.get(live.id);
                    if (!sb) return;
                    sim.awaken(sb);
                  }}
                >
                  <Eye className="size-3.5" /> Liberar
                </button>
                <button
                  type="button"
                  className="flex min-h-10 items-center justify-center gap-1 rounded-md border border-border text-xs"
                  onClick={() => {
                    const sb = sim.get(live.id);
                    if (!sb?.body) return;
                    const p = sb.body.translation();
                    const cat = catalogById("bloque");
                    if (!cat) return;
                    useLab.getState().spawnFromCatalog(cat.id, p.x + 2.2, 0, p.z);
                  }}
                >
                  <Copy className="size-3.5" /> Duplicar
                </button>
                <button
                  type="button"
                  className="col-span-2 flex min-h-10 items-center justify-center gap-1 rounded-md border border-danger/40 text-xs text-danger"
                  onClick={() => {
                    const sb = sim.get(live.id);
                    if (sb) sim.fragment(sb);
                    useLab.getState().select(null);
                  }}
                >
                  <Trash2 className="size-3.5" /> Eliminar
                </button>
              </div>
            </div>
          )}
        </Section>

        <div className="mt-5">
          <Section title="Retos">
            <div className="flex flex-col gap-1.5">
              {CHALLENGES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChallenge(c.id)}
                  className={cn(
                    "rounded-md border px-2.5 py-2 text-left",
                    challenge === c.id
                      ? "border-accent/40 bg-surface-3"
                      : "border-border hover:bg-surface-2",
                  )}
                >
                  <p className="text-xs font-medium text-fg">{c.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{c.brief}</p>
                </button>
              ))}
            </div>
          </Section>
        </div>

        <div className="mt-5">
          <Section title="Marcador">
            <Row k="Puntuación" v={formatEs(score)} />
            <Row k="Daño causado" v={formatEs(damage)} />
            <Row k="Objetos destruidos" v={formatEs(destroyed)} />
            <Row k="Cadena de destrucción" v={formatEs(chain)} />
            <Row k="Mejor puntuación" v={formatEs(bestScore)} />
          </Section>
        </div>
      </div>
    </aside>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted">{k}</span>
      <span className="font-mono text-[11px] tabular-nums text-fg">{v}</span>
    </div>
  );
}

function BottomBar() {
  const paused = useLab((s) => s.paused);
  const timeScale = useLab((s) => s.timeScale);
  const lastMessage = useLab((s) => s.lastMessage);
  const tool = useLab((s) => s.tool);
  const setTool = useLab((s) => s.setTool);
  return (
    <footer className="absolute inset-x-0 bottom-0 z-20 border-t border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 md:px-4">
        <button
          type="button"
          onClick={() => useLab.getState().togglePaused()}
          className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md bg-fg px-4 text-sm font-medium text-bg"
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          <span className="hidden sm:inline">{paused ? "Reproducir" : "Pausar"}</span>
        </button>
        <button
          type="button"
          onClick={() => useLab.getState().resetWorld()}
          className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm text-fg"
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
        <div className="hidden h-6 w-px bg-border sm:block" />
        <p className="hidden font-mono text-[10px] tracking-[0.16em] text-subtle uppercase sm:block">
          Velocidad de simulación
        </p>
        <div className="flex flex-wrap gap-1">
          {TIME_SCALES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => useLab.getState().setTimeScale(s)}
              className={cn(
                "min-h-9 min-w-10 rounded-md px-2 font-mono text-xs tabular-nums",
                timeScale === s && !paused
                  ? "bg-surface-3 text-accent"
                  : "text-muted hover:text-fg",
              )}
            >
              {s.toString().replace(".", ",")}×
            </button>
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          {(
            [
              ["select", "Seleccionar"],
              ["move", "Mover"],
              ["place", "Colocar"],
              ["explode", "Explotar"],
              ["meteor", "Meteorito"],
            ] as [Tool, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTool(id)}
              className={cn(
                "min-h-9 rounded-md px-2.5 text-xs",
                tool === id ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-3 py-1.5 md:px-4">
        <p className="truncate font-mono text-[11px] text-muted">{lastMessage}</p>
      </div>
    </footer>
  );
}

function AiDrawer() {
  const open = useLab((s) => s.aiOpen);
  const busy = useLab((s) => s.aiBusy);
  const log = useLab((s) => s.aiLog);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: 9999 });
  }, [log.length]);
  if (!open) return null;

  async function submit() {
    const prompt = text.trim();
    if (!prompt || busy) return;
    const lab = useLab.getState();
    lab.pushAi("user", prompt);
    lab.setAiBusy(true);
    setText("");
    let result = parseCommand(prompt);
    try {
      const remote = await runExperiment({ data: { prompt } });
      if (remote.ok && remote.actions.length) result = remote;
    } catch {
      /* local fallback */
    }
    lab.pushAi("lab", result.message);
    lab.setMessage(result.message);
    for (const a of result.actions) applyAction(a);
    lab.setAiBusy(false);
  }

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-bg/50 p-3 md:items-center">
      <div className="flex max-h-[min(640px,86dvh)] w-full max-w-lg flex-col rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-accent">
              EXPERIMENTO CON IA
            </p>
            <p className="text-sm text-muted">Describe el ensayo en español</p>
          </div>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-md text-muted hover:text-fg"
            onClick={() => useLab.getState().setAiOpen(false)}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>
        <div
          ref={listRef}
          className="lab-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3"
        >
          {log.length === 0 && (
            <p className="text-sm leading-relaxed text-muted">
              Ejemplo: «Construye un puente de 200 metros y provoca un terremoto fuerte.»
            </p>
          )}
          {log.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={cn(
                "rounded-md px-3 py-2 text-sm",
                m.role === "user" ? "bg-surface-3 text-fg" : "bg-bg text-muted",
              )}
            >
              <p className="mb-1 font-mono text-[10px] tracking-wider text-subtle uppercase">
                {m.role === "user" ? "Tú" : "Laboratorio"}
              </p>
              {m.text}
            </div>
          ))}
        </div>
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe el experimento…"
            className="min-h-11 flex-1 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 rounded-md bg-fg px-4 text-sm font-medium text-bg disabled:opacity-50"
          >
            {busy ? "…" : "Ejecutar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function HelpOverlay() {
  const open = useLab((s) => s.helpOpen);
  const shake = useLab((s) => s.shakeEnabled);
  const quality = useLab((s) => s.quality);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/50 p-4">
      <div className="max-h-[86dvh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-medium">Controles</h2>
          <button
            type="button"
            onClick={() => useLab.getState().setHelpOpen(false)}
            className="flex size-9 items-center justify-center text-muted"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>Clic en el suelo — detonar (herramienta explosión)</li>
          <li>Espacio — pausar / reanudar</li>
          <li>1–6 — velocidad de simulación</li>
          <li>Órbita — arrastrar para orbitar, rueda para zoom, clic derecho para pan</li>
          <li>Cámara libre — WASD, Q/E altura, clic derecho mira</li>
          <li>Primera persona — clic para capturar el puntero, WASD para moverte</li>
          <li>Seleccionar + Mover — clic en pieza, luego clic en el suelo</li>
          <li>H — esta ayuda · I — experimento con IA</li>
        </ul>
        <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
          <button
            type="button"
            className="flex min-h-11 items-center justify-between rounded-md border border-border px-3 text-sm"
            onClick={() => useLab.getState().setShakeEnabled(!shake)}
          >
            <span>Sacudida de cámara</span>
            <span className="font-mono text-xs text-accent">{shake ? "Sí" : "No"}</span>
          </button>
          <button
            type="button"
            className="flex min-h-11 items-center justify-between rounded-md border border-border px-3 text-sm"
            onClick={() => useLab.getState().setQuality(quality === "alta" ? "media" : "alta")}
          >
            <span>Calidad gráfica</span>
            <span className="font-mono text-xs text-accent">
              {quality === "alta" ? "Alta" : "Media"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ChallengeBanner() {
  const status = useLab((s) => s.challengeStatus);
  const challenge = useLab((s) => s.challenge);
  const def = useMemo(() => CHALLENGES.find((c) => c.id === challenge), [challenge]);
  if (challenge === "libre" || status === "idle" || !def) return null;
  const win = status === "win";
  const fail = status === "fail";
  return (
    <div className="pointer-events-none absolute top-20 left-1/2 z-20 hidden w-[min(420px,calc(100%-360px))] -translate-x-1/2 md:block">
      <div
        className={cn(
          "rounded-md border bg-surface/95 px-3 py-2 text-center",
          win ? "border-ok/40" : fail ? "border-danger/40" : "border-border",
        )}
      >
        <p className="font-mono text-[10px] tracking-[0.18em] text-subtle uppercase">
          {win ? "Reto superado" : fail ? "Reto fallido" : "Reto activo"}
        </p>
        <p className="text-sm text-fg">{def.brief}</p>
      </div>
    </div>
  );
}

function MobileChrome() {
  const fps = useLab((s) => s.fps);
  const score = useLab((s) => s.score);
  return (
    <div className="pointer-events-none absolute top-16 right-3 z-20 flex flex-col items-end gap-1 md:hidden">
      <div className="rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10px] tabular-nums text-muted">
        {fps} FPS · {formatEs(score)} pts
      </div>
    </div>
  );
}

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics, useAfterPhysicsStep, useBeforePhysicsStep, useRapier } from "@react-three/rapier";
import * as THREE from "three";
import { useLab } from "@/game/store";
import { sim } from "@/game/sim";
import { BARRIERS, BUILDINGS, CRATES, LAMPS, VEHICLES } from "@/game/city";
import { playBoom } from "@/game/audio";
import {
  Bridge,
  BuildingStack,
  CrateStack,
  DebrisPiece,
  ExtraItem,
  Ground,
  LampPost,
  MeteorBody,
  Piece,
  Skyline,
  VehicleBody,
} from "./pieces";
import { CameraSystem } from "./cameras";
import { FlashLight, FxLayer, ToolGhost } from "./effects";

function Sun() {
  const ref = useRef<THREE.DirectionalLight>(null);
  useEffect(() => {
    const l = ref.current;
    if (!l) return;
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.camera.near = 2;
    l.shadow.camera.far = 140;
    l.shadow.camera.left = -58;
    l.shadow.camera.right = 58;
    l.shadow.camera.top = 58;
    l.shadow.camera.bottom = -58;
    l.shadow.bias = -0.00035;
    l.shadow.normalBias = 0.035;
  }, []);
  return <directionalLight ref={ref} position={[36, 42, 18]} intensity={1.85} color="#ffd8b0" />;
}

/** Paso fijo de Rapier. Todo el tiempo de simulación se mide con él. */
const FIXED_DT = 1 / 60;

function TimeStepper() {
  const { step } = useRapier();
  const fpsAcc = useRef(0);
  const fpsFrames = useRef(0);

  // La simulación avanza dentro del paso de física, nunca con el reloj de
  // pantalla: así la pausa y la cámara lenta escalan el mundo entero de forma
  // coherente (temporizadores de colapso incluidos).
  useBeforePhysicsStep(() => {
    sim.stepSim(FIXED_DT);
  });

  useAfterPhysicsStep(() => {
    sim.postStep(FIXED_DT);
  });

  // `resetWorld` marca la escena como no lista y sólo el `onCreated` del lienzo
  // la volvía a marcar como lista; como al reiniciar no se recrea el lienzo
  // sino el mundo de física, el rótulo "Inicializando física" se quedaba
  // colgado para siempre. Este componente sí se vuelve a montar con el mundo.
  useEffect(() => {
    useLab.getState().setSceneReady(true);
  }, []);

  useFrame((_, dt) => {
    const st = useLab.getState();
    const d = Math.min(dt, 0.1);
    fpsAcc.current += d;
    fpsFrames.current += 1;
    if (fpsAcc.current >= 0.4) {
      useLab.getState().setFps(Math.round(fpsFrames.current / fpsAcc.current));
      useLab.getState().setObjects(sim.bodies.size);
      fpsAcc.current = 0;
      fpsFrames.current = 0;
    }

    if (!st.paused && st.timeScale !== 1) {
      step(Math.min(d * st.timeScale, 0.2));
    }

    if (sim.debrisQueue.length) {
      const req = sim.debrisQueue.splice(0, 12);
      useLab.getState().pushDebris(
        req.map((r) => ({
          id: r.id,
          catalogId: "debris",
          kind: "box",
          name: "Escombro",
          x: r.x,
          y: r.y,
          z: r.z,
          w: r.w,
          h: r.h,
          d: r.d,
          mass: 0,
          material: r.material,
          resistance: 14,
          color: r.color,
          vx: r.vx,
          vy: r.vy,
          vz: r.vz,
        })),
      );
    }
    if (sim.retireQueue.length) {
      const ids = sim.retireQueue.splice(0, 24);
      useLab.getState().retireDebris(ids);
    }
    if (sim.meteorQueue.length) {
      const m = sim.meteorQueue.shift();
      if (m) useLab.getState().pushMeteor(m);
    }
    if (st.replay.playing) {
      const due = useLab.getState().consumeReplayAt(sim.simTime);
      for (const a of due) applyRecorded(a.type, a.payload);
    }
  });

  return null;
}

function applyRecorded(type: string, payload: Record<string, number | string>) {
  if (type === "explosion") {
    sim.explode(
      Number(payload.x),
      Number(payload.height ?? 2),
      Number(payload.z),
      Number(payload.power),
      Number(payload.radius),
    );
    playBoom(Number(payload.power));
  }
  if (type === "earthquake") sim.earthquake(Number(payload.intensity));
  if (type === "meteor")
    sim.spawnMeteor(Number(payload.x), Number(payload.z), Number(payload.power));
  if (type === "wind") sim.startWind(Number(payload.strength));
  if (type === "collapse") {
    const t = String(payload.target);
    if (t === "all") sim.collapseAll();
    else if (t === "bridge") sim.collapseBuilding("bridge");
    else sim.collapseBuilding(t);
  }
  if (type === "shockwave") {
    sim.shockwave(Number(payload.x), Number(payload.z), Number(payload.power));
  }
}

function World() {
  const extras = useLab((s) => s.extras);
  const debris = useLab((s) => s.debris);
  const meteors = useLab((s) => s.meteors);

  return (
    <>
      <hemisphereLight color="#c9d6e4" groundColor="#3a3228" intensity={0.55} />
      <Sun />
      <ambientLight intensity={0.18} />

      <Ground />
      <Skyline />

      {BUILDINGS.map((b) => (
        <BuildingStack
          key={b.id}
          id={b.id}
          name={b.name}
          x={b.x}
          z={b.z}
          floors={b.floors}
          w={b.w}
          d={b.d}
          color={b.color}
          material={b.material}
          resistance={b.resistance}
          glass={"glass" in b && Boolean(b.glass)}
        />
      ))}
      <Bridge />
      {VEHICLES.map((v) => (
        <VehicleBody key={v.id} {...v} />
      ))}
      {LAMPS.map((l, i) => (
        <LampPost key={`lamp-${i}`} id={`lamp-${i}`} x={l.x} z={l.z} />
      ))}
      {CRATES.map((c) => (
        <CrateStack key={c.id} id={c.id} x={c.x} z={c.z} count={c.stacked} />
      ))}
      {BARRIERS.map((b, i) => (
        <Piece
          key={`bar-${i}`}
          id={`bar-${i}`}
          name="Barrera"
          kind="prop"
          position={[b.x, 0.45, b.z]}
          rotation={[0, b.rotY, 0]}
          size={[2.1, 0.9, 0.42]}
          color="#c9b48a"
          material="hormigón"
          resistance={40}
        />
      ))}
      {extras.map((e) => (
        <ExtraItem key={e.id} item={e} />
      ))}
      {debris.map((e) => (
        <DebrisPiece key={e.id} item={e} />
      ))}
      {meteors.map((m) => (
        <MeteorBody key={m.id} {...m} />
      ))}
      <FxLayer />
      <FlashLight />
      <ToolGhost />
      <CameraSystem />
    </>
  );
}

function SceneTint() {
  const { scene, gl } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color("#10141a");
    // La niebla llega ahora hasta el horizonte lejano: los bloques de fondo se
    // ven, pero disueltos, sin poder confundirse con la ciudad simulada.
    scene.fog = new THREE.Fog("#10141a", 70, 300);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.12;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFShadowMap;
  }, [scene, gl]);
  return null;
}

export default function Scene() {
  const worldKey = useLab((s) => s.worldKey);
  const paused = useLab((s) => s.paused);
  const timeScale = useLab((s) => s.timeScale);
  const quality = useLab((s) => s.quality);
  const cameraMode = useLab((s) => s.cameraMode);
  const orbitEnabled = useLab((s) => s.orbitEnabled);

  return (
    <Canvas
      className="absolute inset-0 h-full w-full touch-none"
      shadows
      dpr={quality === "alta" ? [1, 1.5] : [1, 1.1]}
      camera={{ position: [48, 26, 48], fov: 48, near: 0.1, far: 520 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={() => useLab.getState().setSceneReady(true)}
      onPointerMissed={() => {
        if (useLab.getState().tool === "select") useLab.getState().select(null);
      }}
    >
      <SceneTint />
      <Suspense fallback={null}>
        <Physics
          key={worldKey}
          paused={paused || timeScale !== 1}
          timeStep={FIXED_DT}
          gravity={[0, -9.81, 0]}
          numSolverIterations={quality === "alta" ? 12 : 6}
          contactNaturalFrequency={20}
          interpolate
          colliders={false}
        >
          <TimeStepper />
          <World />
        </Physics>
      </Suspense>
      {cameraMode === "orbit" ? (
        <OrbitControls
          makeDefault
          enabled={orbitEnabled}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 - 0.04}
          minDistance={8}
          maxDistance={110}
          target={[2, 4, 0]}
        />
      ) : null}
    </Canvas>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useLab } from "@/game/store";
import { sim } from "@/game/sim";
import type { BodyKind, SpawnItem } from "@/game/types";
import { FLOOR_H } from "@/game/city";
import type { Object3D } from "three";
import { playBoom } from "@/game/audio";
import {
  asphaltTexture,
  facadeTexture,
  riverTexture,
  shadeHex,
  sidewalkTexture,
} from "@/game/textures";
import { densityFor, materialOf } from "@/game/materials";

interface PieceProps {
  id: string;
  name: string;
  kind: BodyKind;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  material: string;
  /** Masa explícita en kg. Si no se da, se deduce de geometría y material. */
  mass?: number;
  /** Fracción de la caja realmente maciza (tubos, celosías, cajas vacías). */
  hollow?: number;
  resistance: number;
  buildingId?: string;
  floorIndex?: number;
  rotation?: [number, number, number];
  metalness?: number;
  roughness?: number;
  initialDynamic?: boolean;
  glass?: boolean;
  onImpact?: () => void;
  linearVelocity?: [number, number, number];
  roofDetail?: boolean;
}

export function Piece({
  id,
  name,
  kind,
  position,
  size,
  color,
  material,
  mass,
  hollow,
  resistance,
  buildingId,
  floorIndex,
  rotation,
  metalness,
  roughness,
  initialDynamic,
  glass,
  onImpact,
  linearVelocity,
  roofDetail,
}: PieceProps) {
  const ref = useRef<RapierRigidBody>(null);
  const obj = useRef<Object3D>(null);
  const [dynamic, setDynamic] = useState(!!initialDynamic);
  const [gone, setGone] = useState(false);
  const [w, h, d] = size;
  const selected = useLab((s) => s.selectedId === id);

  const density = useMemo(
    () => (mass ? mass / Math.max(1e-4, w * h * d) : densityFor(kind, material, hollow)),
    [mass, kind, material, hollow, w, h, d],
  );
  const phys = useMemo(() => materialOf(material), [material]);

  useEffect(() => {
    sim.register({
      id,
      kind,
      name,
      buildingId,
      floorIndex,
      material,
      mass,
      hollow,
      resistance,
      size: [w, h, d],
      color,
      position,
    });
    return () => sim.unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, kind, name, buildingId, floorIndex, material, mass, hollow, resistance, w, h, d, color]);

  useEffect(() => {
    sim.attach(
      id,
      ref.current,
      obj.current,
      () => setDynamic(true),
      () => setGone(true),
    );
    return () => sim.detach(id);
  }, [id, dynamic]);

  useEffect(() => {
    if (!dynamic) return;
    const sb = sim.get(id);
    if (sb) sim.applyPending(sb);
  }, [dynamic, id]);

  const mat = useMemo(
    () => ({
      color,
      roughness:
        roughness ?? (glass ? 0.18 : material === "acero" || material === "metal" ? 0.32 : 0.88),
      metalness:
        metalness ?? (glass ? 0.72 : material === "acero" || material === "metal" ? 0.78 : 0.06),
    }),
    [color, roughness, metalness, glass, material],
  );

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const tool = useLab.getState().tool;
    if (tool === "select" || tool === "move") {
      useLab.getState().select(id);
      if (tool === "move")
        useLab.getState().setMessage("Seleccionado. Clic en el suelo para mover.");
    }
  };

  if (gone) return null;

  return (
    <RigidBody
      ref={ref}
      name={id}
      type={dynamic ? "dynamic" : "fixed"}
      position={position}
      rotation={rotation}
      colliders={false}
      linearDamping={0.04}
      angularDamping={0.28}
      ccd={
        kind === "meteor" ||
        kind === "debris" ||
        (dynamic && (kind === "floor" || kind === "bridge"))
      }
      canSleep
      {...(linearVelocity ? { linearVelocity } : {})}
      {...(onImpact ? { onCollisionEnter: onImpact } : {})}
    >
      <CuboidCollider
        args={[w / 2, h / 2, d / 2]}
        density={density}
        friction={phys.friction}
        restitution={phys.restitution}
      />
      <group ref={obj}>
        {kind === "floor" ? (
          <FloorVisual
            w={w}
            h={h}
            d={d}
            color={color}
            glass={!!glass}
            selected={selected}
            onClick={onClick}
            roofDetail={!!roofDetail}
          />
        ) : (
          <mesh castShadow receiveShadow onClick={onClick}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              color={mat.color}
              roughness={mat.roughness}
              metalness={mat.metalness}
              emissive={selected ? "#6ec8c0" : "#000000"}
              emissiveIntensity={selected ? 0.18 : 0}
            />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
}

function FloorVisual({
  w,
  h,
  d,
  color,
  glass,
  selected,
  onClick,
  roofDetail,
}: {
  w: number;
  h: number;
  d: number;
  color: string;
  glass: boolean;
  selected: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  roofDetail?: boolean;
}) {
  const { side, roof, map } = useMemo(() => {
    const map = facadeTexture(color, glass).clone();
    map.repeat.set(Math.max(1, Math.round(w / 3.2)), Math.max(1, Math.round(h / 2.2)));
    map.needsUpdate = true;
    const sideMat = new THREE.MeshStandardMaterial({
      map,
      color: "#ffffff",
      roughness: glass ? 0.2 : 0.78,
      metalness: glass ? 0.62 : 0.08,
      emissive: selected ? "#6ec8c0" : "#000000",
      emissiveIntensity: selected ? 0.12 : 0,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: shadeHex(color, 0.72),
      roughness: 0.92,
      metalness: 0.05,
      emissive: selected ? "#6ec8c0" : "#000000",
      emissiveIntensity: selected ? 0.1 : 0,
    });
    return { side: sideMat, roof: roofMat, map };
  }, [color, glass, selected, w, h]);

  useEffect(() => {
    return () => {
      side.dispose();
      roof.dispose();
      map.dispose();
    };
  }, [side, roof, map]);

  const materials = useMemo(() => [side, side, roof, roof, side, side], [side, roof]);

  return (
    <group>
      <mesh castShadow receiveShadow onClick={onClick} material={materials}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {roofDetail ? (
        <mesh position={[0, h / 2 + 0.08, 0]} castShadow>
          <boxGeometry args={[w * 0.22, 0.18, d * 0.28]} />
          <meshStandardMaterial color="#3a4048" roughness={0.55} metalness={0.35} />
        </mesh>
      ) : null}
    </group>
  );
}

export function BuildingStack({
  id,
  name,
  x,
  z,
  floors,
  w,
  d,
  color,
  material,
  resistance,
  glass,
}: {
  id: string;
  name: string;
  x: number;
  z: number;
  floors: number;
  w: number;
  d: number;
  color: string;
  material: string;
  resistance: number;
  glass?: boolean;
}) {
  const h = FLOOR_H * 0.97;
  const pieces = [];
  for (let i = 0; i < floors; i++) {
    const y = i * FLOOR_H + h / 2;
    const shade = 1 - i * 0.012;
    pieces.push(
      <Piece
        key={`${id}-f${i}`}
        id={`${id}-f${i}`}
        name={`${name} · planta ${i + 1}`}
        kind="floor"
        buildingId={id}
        floorIndex={i}
        position={[x, y, z]}
        size={[w, h, d]}
        color={shadeHex(color, shade)}
        material={material}
        resistance={resistance}
        glass={glass}
        roofDetail={i === floors - 1}
      />,
    );
  }
  return <group>{pieces}</group>;
}

export function VehicleBody({
  id,
  kind,
  x,
  z,
  rotY,
  color,
}: {
  id: string;
  kind: "car" | "van" | "truck";
  x: number;
  z: number;
  rotY: number;
  color: string;
}) {
  // Masas reales: un camión pesa seis veces lo que un coche y se nota.
  const dim =
    kind === "truck"
      ? { w: 2.5, h: 2.5, d: 7.2, mass: 8600 }
      : kind === "van"
        ? { w: 2.1, h: 2.1, d: 5.1, mass: 2600 }
        : { w: 1.9, h: 1.35, d: 4.2, mass: 1400 };
  const name = kind === "truck" ? "Camión" : kind === "van" ? "Furgoneta" : "Coche";
  const ref = useRef<RapierRigidBody>(null);
  const obj = useRef<Object3D>(null);
  const [dynamic, setDynamic] = useState(false);
  const [gone, setGone] = useState(false);
  const selected = useLab((s) => s.selectedId === id);

  useEffect(() => {
    sim.register({
      id,
      kind: "vehicle",
      name,
      material: "metal",
      mass: dim.mass,
      resistance: 36,
      size: [dim.w, dim.h, dim.d],
      color,
      position: [x, dim.h / 2 + 0.02, z],
    });
    return () => sim.unregister(id);
  }, [id, name, dim.mass, dim.w, dim.h, dim.d, color, x, z]);

  useEffect(() => {
    sim.attach(
      id,
      ref.current,
      obj.current,
      () => setDynamic(true),
      () => setGone(true),
    );
    return () => sim.detach(id);
  }, [id, dynamic]);

  useEffect(() => {
    if (!dynamic) return;
    const sb = sim.get(id);
    if (sb) sim.applyPending(sb);
  }, [dynamic, id]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const tool = useLab.getState().tool;
    if (tool === "select" || tool === "move") useLab.getState().select(id);
  };

  if (gone) return null;

  const cabinH = kind === "car" ? dim.h * 0.55 : dim.h * 0.72;
  const cabinZ = kind === "truck" ? dim.d * 0.22 : 0.15;
  const cabinD = kind === "truck" ? dim.d * 0.38 : dim.d * 0.55;

  return (
    <RigidBody
      ref={ref}
      name={id}
      type={dynamic ? "dynamic" : "fixed"}
      position={[x, dim.h / 2 + 0.02, z]}
      rotation={[0, rotY, 0]}
      colliders={false}
      linearDamping={0.05}
      angularDamping={0.3}
      canSleep
    >
      <CuboidCollider
        args={[dim.w / 2, dim.h / 2, dim.d / 2]}
        density={dim.mass / (dim.w * dim.h * dim.d)}
        friction={0.72}
        restitution={0.1}
      />
      <group ref={obj} onClick={onClick}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[dim.w, dim.h * 0.55, dim.d]} />
          <meshStandardMaterial
            color={color}
            roughness={0.38}
            metalness={0.72}
            emissive={selected ? "#6ec8c0" : "#000000"}
            emissiveIntensity={selected ? 0.16 : 0}
          />
        </mesh>
        <mesh position={[0, dim.h * 0.28, cabinZ]} castShadow>
          <boxGeometry args={[dim.w * 0.88, cabinH, cabinD]} />
          <meshStandardMaterial color="#1a2228" roughness={0.18} metalness={0.65} />
        </mesh>
        {(
          [
            [-dim.w * 0.42, -dim.h * 0.28, dim.d * 0.32],
            [dim.w * 0.42, -dim.h * 0.28, dim.d * 0.32],
            [-dim.w * 0.42, -dim.h * 0.28, -dim.d * 0.32],
            [dim.w * 0.42, -dim.h * 0.28, -dim.d * 0.32],
          ] as const
        ).map((p, i) => (
          <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.22, 10]} />
            <meshStandardMaterial color="#161616" roughness={0.7} metalness={0.2} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

export function LampPost({ id, x, z }: { id: string; x: number; z: number }) {
  const ref = useRef<RapierRigidBody>(null);
  const obj = useRef<Object3D>(null);
  const [dynamic, setDynamic] = useState(false);
  const [gone, setGone] = useState(false);
  const selected = useLab((s) => s.selectedId === id);

  useEffect(() => {
    sim.register({
      id,
      kind: "prop",
      name: "Farola",
      material: "acero",
      hollow: 0.18,
      resistance: 20,
      size: [0.28, 5.5, 0.28],
      color: "#3a3e44",
      position: [x, 2.75, z],
    });
    return () => sim.unregister(id);
  }, [id, x, z]);

  useEffect(() => {
    sim.attach(
      id,
      ref.current,
      obj.current,
      () => setDynamic(true),
      () => setGone(true),
    );
    return () => sim.detach(id);
  }, [id, dynamic]);

  useEffect(() => {
    if (!dynamic) return;
    const sb = sim.get(id);
    if (sb) sim.applyPending(sb);
  }, [dynamic, id]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const tool = useLab.getState().tool;
    if (tool === "select" || tool === "move") useLab.getState().select(id);
  };

  if (gone) return null;

  return (
    <RigidBody
      ref={ref}
      name={id}
      type={dynamic ? "dynamic" : "fixed"}
      position={[x, 2.75, z]}
      colliders={false}
      linearDamping={0.04}
      angularDamping={0.25}
      canSleep
    >
      <CuboidCollider
        args={[0.14, 2.75, 0.14]}
        density={densityFor("prop", "acero", 0.18)}
        friction={0.55}
        restitution={0.16}
      />
      <group ref={obj} onClick={onClick}>
        <mesh castShadow>
          <boxGeometry args={[0.28, 5.5, 0.28]} />
          <meshStandardMaterial
            color="#3a3e44"
            roughness={0.35}
            metalness={0.7}
            emissive={selected ? "#6ec8c0" : "#000000"}
            emissiveIntensity={selected ? 0.16 : 0}
          />
        </mesh>
        <mesh position={[0, 2.7, 0]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#f0e2b8" emissive="#f0d48a" emissiveIntensity={1.8} />
        </mesh>
      </group>
    </RigidBody>
  );
}

export function CrateStack({
  id,
  x,
  z,
  count,
}: {
  id: string;
  x: number;
  z: number;
  count: number;
}) {
  const s = 1.15;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <Piece
          key={`${id}-${i}`}
          id={`${id}-${i}`}
          name="Caja"
          kind="prop"
          position={[x, s / 2 + i * s, z]}
          size={[s, s, s]}
          color={i % 2 ? "#8a6a3c" : "#6e5530"}
          material="madera"
          hollow={0.32}
          resistance={22}
        />
      ))}
    </group>
  );
}

export function Bridge() {
  const segs = [];
  const n = 8;
  const span = 16;
  const segW = span / n;
  for (let i = 0; i < n; i++) {
    const x = -span / 2 + segW / 2 + i * segW;
    segs.push(
      <Piece
        key={`bridge-${i}`}
        id={`bridge-deck-${i}`}
        name={`Tablero del puente ${i + 1}`}
        kind="bridge"
        buildingId="bridge"
        floorIndex={i}
        position={[x, 1.05, 0]}
        size={[segW - 0.05, 0.55, 5.6]}
        color="#7c7a74"
        material="hormigón"
        resistance={72}
      />,
    );
  }
  const rails: [number, number][] = [
    [-7.2, -2.2],
    [-7.2, 2.2],
    [7.2, -2.2],
    [7.2, 2.2],
  ];
  const water = riverTexture();
  water.repeat.set(2, 8);
  return (
    <group>
      {segs}
      {rails.map(([x, z], i) => (
        <Piece
          key={`pillar-${i}`}
          id={`bridge-pillar-${i}`}
          name={`Pilar del puente ${i + 1}`}
          kind="bridge"
          buildingId="bridge"
          floorIndex={-1}
          position={[x, 0.55, z]}
          size={[1.1, 1.1, 1.1]}
          color="#5c5a54"
          material="hormigón"
          resistance={88}
        />
      ))}
      <mesh position={[0, -2.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16.4, 88]} />
        <meshStandardMaterial map={water} color="#8ec8c4" roughness={0.12} metalness={0.62} />
      </mesh>
    </group>
  );
}

function handleGround(p: THREE.Vector3) {
  const { tool, explosion, catalogId, selectedId } = useLab.getState();
  if (tool === "explode") {
    useLab.getState().setMarker({ x: p.x, y: explosion.height, z: p.z });
    useLab.getState().setExplosion({ x: p.x, z: p.z });
    window.__lab?.detonate(p.x, p.z);
    return;
  }
  if (tool === "meteor") {
    const power = useLab.getState().explosion.power;
    sim.spawnMeteor(p.x, p.z, power);
    useLab.getState().record({
      t: sim.simTime,
      type: "meteor",
      payload: { x: p.x, z: p.z, power },
    });
    useLab.getState().setMessage("Meteorito en trayectoria.");
    return;
  }
  if (tool === "place" && catalogId) {
    useLab.getState().spawnFromCatalog(catalogId, p.x, 0, p.z);
    return;
  }
  if (tool === "move" && selectedId) {
    sim.placeAt(selectedId, p.x, p.z);
    useLab.getState().setMessage("Objeto reposicionado.");
    return;
  }
  if (tool === "select") useLab.getState().select(null);
}

export function Ground() {
  const asphalt = asphaltTexture();
  asphalt.repeat.set(1, 14);
  const walk = sidewalkTexture();
  walk.repeat.set(4, 12);

  const onGround = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    handleGround(e.point);
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const { tool } = useLab.getState();
    if (tool === "explode" || tool === "place" || tool === "meteor" || tool === "move") {
      useLab.getState().setHoverGround({ x: e.point.x, y: e.point.y, z: e.point.z });
    }
  };

  return (
    <group>
      <RigidBody type="fixed" colliders={false} position={[-33, -0.5, 0]} friction={1}>
        <CuboidCollider args={[25, 0.5, 46]} />
        <mesh receiveShadow onClick={onGround} onPointerMove={onMove}>
          <boxGeometry args={[50, 1, 92]} />
          <meshStandardMaterial map={walk} color="#9aa0a6" roughness={0.92} metalness={0.04} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[33, -0.5, 0]} friction={1}>
        <CuboidCollider args={[25, 0.5, 46]} />
        <mesh receiveShadow onClick={onGround} onPointerMove={onMove}>
          <boxGeometry args={[50, 1, 92]} />
          <meshStandardMaterial map={walk} color="#9aa0a6" roughness={0.92} metalness={0.04} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[0, -3.4, 0]}>
        <CuboidCollider args={[10, 0.4, 46]} />
      </RigidBody>
      <mesh position={[-12.2, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.4, 88]} />
        <meshStandardMaterial map={asphalt} color="#d0d0d0" roughness={0.95} />
      </mesh>
      <mesh position={[12.2, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.4, 88]} />
        <meshStandardMaterial map={asphalt} color="#d0d0d0" roughness={0.95} />
      </mesh>
    </group>
  );
}

/**
 * Horizonte lejano.
 *
 * Antes eran doce bloques colocados justo al borde de la ciudad, sin colisión
 * ni simulación: parecían edificios como los demás pero eran indestructibles y
 * las piezas los atravesaban. Ahora la zona que ocupaban la llenan edificios
 * reales (ver BUILDINGS) y el horizonte se ha llevado a 140-230 m, donde se lee
 * sin ambigüedad como fondo: siluetas planas, sin sombras, muy metidas en la
 * niebla y fuera del alcance de cualquier evento.
 */
export function Skyline() {
  const blocks = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number; h: number; c: string }[] = [];
    let seed = 20260901;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const rings = [
      { r: 145, n: 26 },
      { r: 190, n: 30 },
      { r: 235, n: 26 },
    ];
    for (const ring of rings) {
      for (let i = 0; i < ring.n; i++) {
        const a = (i / ring.n) * Math.PI * 2 + rnd() * 0.09;
        const r = ring.r + (rnd() - 0.5) * 26;
        const h = 22 + rnd() * 62 * (ring.r / 145);
        const w = 10 + rnd() * 16;
        const shade = 0.14 + rnd() * 0.07;
        const v = Math.round(shade * 255)
          .toString(16)
          .padStart(2, "0");
        out.push({
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          w,
          d: w * (0.7 + rnd() * 0.6),
          h,
          c: `#${v}${v}${Math.round(shade * 275)
            .toString(16)
            .padStart(2, "0")}`,
        });
      }
    }
    return out;
  }, []);

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshBasicMaterial color={b.c} fog />
        </mesh>
      ))}
    </group>
  );
}

export function ExtraItem({ item }: { item: SpawnItem }) {
  if (item.kind === "building") {
    return (
      <BuildingStack
        id={item.buildingId ?? item.id}
        name={item.name}
        x={item.x}
        z={item.z}
        floors={item.floors ?? 4}
        w={item.w}
        d={item.d}
        color={item.color}
        material={item.material}
        resistance={item.resistance}
        glass={item.material === "vidrio"}
      />
    );
  }
  if (item.kind === "car" || item.kind === "van" || item.kind === "truck") {
    return (
      <VehicleBody
        id={item.id}
        kind={item.kind}
        x={item.x}
        z={item.z}
        rotY={item.rotY ?? 0}
        color={item.color}
      />
    );
  }
  if (item.kind === "lamp") {
    return <LampPost id={item.id} x={item.x} z={item.z} />;
  }
  if (item.kind === "antenna") {
    const n = 6;
    return (
      <group>
        {Array.from({ length: n }, (_, i) => (
          <Piece
            key={`${item.id}-${i}`}
            id={`${item.id}-${i}`}
            name={`${item.name} ${i + 1}`}
            kind="column"
            buildingId={item.id}
            floorIndex={i}
            position={[item.x, 1.3 + i * 2.6, item.z]}
            size={[0.7 - i * 0.06, 2.6, 0.7 - i * 0.06]}
            color={item.color}
            material="acero"
            hollow={0.12}
            resistance={38}
          />
        ))}
      </group>
    );
  }
  if (item.kind === "ramp") {
    return (
      <Piece
        id={item.id}
        name={item.name}
        kind="terrain"
        position={[item.x, item.h / 2, item.z]}
        rotation={[0, 0, -0.32]}
        size={[item.w, item.h, item.d]}
        color={item.color}
        material={item.material}
        mass={item.mass || undefined}
        resistance={item.resistance}
      />
    );
  }
  if (item.kind === "tank") {
    return (
      <Piece
        id={item.id}
        name={item.name}
        kind="prop"
        position={[item.x, item.h / 2, item.z]}
        size={[item.w, item.h, item.d]}
        color={item.color}
        material={item.material}
        mass={item.mass}
        resistance={item.resistance}
        metalness={0.82}
        roughness={0.28}
      />
    );
  }
  return (
    <Piece
      id={item.id}
      name={item.name}
      kind={item.kind === "bridge-seg" ? "bridge" : "prop"}
      position={[item.x, item.h / 2 + item.y, item.z]}
      size={[item.w, item.h, item.d]}
      color={item.color}
      material={item.material}
      mass={item.mass || undefined}
      resistance={item.resistance}
    />
  );
}

export function DebrisPiece({ item }: { item: SpawnItem }) {
  return (
    <Piece
      id={item.id}
      name="Escombro"
      kind="debris"
      position={[item.x, item.y, item.z]}
      size={[item.w, item.h, item.d]}
      color={item.color}
      material={item.material}
      resistance={14}
      initialDynamic
      linearVelocity={[item.vx ?? 0, item.vy ?? 0, item.vz ?? 0]}
    />
  );
}

export function MeteorBody({
  id,
  x,
  z,
  power,
}: {
  id: string;
  x: number;
  z: number;
  power: number;
}) {
  const hit = useRef(false);
  return (
    <RigidBody
      type="dynamic"
      position={[x, 48, z]}
      colliders={false}
      ccd
      linearVelocity={[0, -34, 0]}
      onCollisionEnter={(payload) => {
        if (hit.current) return;
        hit.current = true;
        const t = payload.target.rigidBody?.translation();
        const px = t?.x ?? x;
        const py = t?.y ?? 1;
        const pz = t?.z ?? z;
        const r = useLab.getState().explosion.radius * 1.15;
        sim.explode(px, py, pz, power * 1.25, r);
        playBoom(power);
        useLab.getState().removeMeteor(id);
      }}
    >
      <CuboidCollider args={[1.4, 1.4, 1.4]} density={2700} friction={0.8} restitution={0.05} />
      <mesh castShadow>
        <icosahedronGeometry args={[1.6, 0]} />
        <meshStandardMaterial
          color="#6a4030"
          emissive="#ff6a22"
          emissiveIntensity={0.85}
          roughness={0.7}
        />
      </mesh>
      <pointLight color="#ff8020" intensity={16} distance={18} />
    </RigidBody>
  );
}

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sim, type ExplosionFx, type ShockwaveFx, type DustBurst } from "@/game/sim";
import { useLab } from "@/game/store";

export function ExplosionViz({ fx }: { fx: ExplosionFx }) {
  const ball = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const core = useRef<THREE.Mesh>(null);
  const smoke = useRef<THREE.Mesh>(null);
  const smoke2 = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    const t = fx.t;
    const s = (0.5 + t * 5.4) * (0.4 + fx.radius / 26);
    if (ball.current) {
      ball.current.scale.setScalar(s);
      const mat = ball.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.92 - t * 0.95);
    }
    if (core.current) {
      core.current.scale.setScalar(s * 0.42);
      const mat = core.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - t * 1.5);
    }
    if (smoke.current) {
      smoke.current.scale.setScalar(s * 1.15 + t * 2.2);
      smoke.current.position.y = t * 2.4;
      const mat = smoke.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.38 - t * 0.22);
    }
    if (smoke2.current) {
      smoke2.current.scale.setScalar(s * 0.8 + t * 3.1);
      smoke2.current.position.y = t * 3.2;
      const mat = smoke2.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.28 - t * 0.16);
    }
    if (light.current) {
      light.current.intensity = Math.max(0, (28 + fx.power * 0.32) * (1 - t * 1.15));
    }
    void dt;
  });

  return (
    <group position={[fx.x, fx.y, fx.z]}>
      <mesh ref={core}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#fff7e0" transparent opacity={1} depthWrite={false} />
      </mesh>
      <mesh ref={ball}>
        <sphereGeometry args={[1, 22, 22]} />
        <meshBasicMaterial
          color="#ff5a18"
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={smoke}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#4a4038" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh ref={smoke2}>
        <sphereGeometry args={[1.1, 10, 10]} />
        <meshBasicMaterial color="#2a2622" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <pointLight ref={light} color="#ffb36a" intensity={28} distance={48} />
    </group>
  );
}

export function ShockwaveViz({ fx }: { fx: ShockwaveFx }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const s = 0.6 + fx.t * fx.radius * 2.8;
    ref.current.scale.set(s, s, 1);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 0.5 - fx.t * 0.52);
  });
  return (
    <mesh ref={ref} position={[fx.x, fx.y + 0.12, fx.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.82, 1, 56]} />
      <meshBasicMaterial
        color="#f2e6c8"
        transparent
        opacity={0.48}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function makeDustGeo(count: number) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = 0;
    pos[i * 3 + 1] = 0;
    pos[i * 3 + 2] = 0;
    const a = Math.random() * Math.PI * 2;
    const r = 2 + Math.random() * 10;
    vel[i * 3] = Math.cos(a) * r;
    vel[i * 3 + 1] = 4 + Math.random() * 11;
    vel[i * 3 + 2] = Math.sin(a) * r;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  (geo as THREE.BufferGeometry & { vel: Float32Array }).vel = vel;
  return geo;
}

export function DustViz({ fx }: { fx: DustBurst }) {
  const count = 140;
  const geo = useMemo(() => makeDustGeo(count), []);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#c4b49a",
        size: 0.48,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      }),
    [],
  );
  const emberGeo = useMemo(() => makeDustGeo(40), []);
  const emberMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#ff7a32",
        size: 0.22,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  const started = useRef(false);
  const t0 = useRef(0);

  useFrame((_, dt) => {
    if (!started.current) {
      started.current = true;
      t0.current = 0;
    }
    t0.current += dt;
    const step = (g: THREE.BufferGeometry, grav: number) => {
      const pos = g.getAttribute("position") as THREE.BufferAttribute;
      const vel = (g as THREE.BufferGeometry & { vel: Float32Array }).vel;
      const arr = pos.array as Float32Array;
      const n = arr.length / 3;
      for (let i = 0; i < n; i++) {
        arr[i * 3] += vel[i * 3] * dt;
        arr[i * 3 + 1] += vel[i * 3 + 1] * dt;
        arr[i * 3 + 2] += vel[i * 3 + 2] * dt;
        vel[i * 3 + 1] -= grav * dt;
      }
      pos.needsUpdate = true;
    };
    step(geo, 9);
    step(emberGeo, 14);
    mat.opacity = Math.max(0, 0.8 - t0.current * 0.38);
    emberMat.opacity = Math.max(0, 0.95 - t0.current * 0.7);
    void fx;
  });

  return (
    <group position={[fx.x, fx.y + 0.4, fx.z]}>
      <points geometry={geo} material={mat} />
      <points geometry={emberGeo} material={emberMat} />
    </group>
  );
}

export function FxLayer() {
  const tick = useRef(0);
  const [, setN] = useState(0);

  // El tiempo de la simulación lo lleva el paso de física; aquí sólo forzamos
  // el repintado de los efectos a 30 Hz.
  useFrame((_, dt) => {
    tick.current += dt;
    if (tick.current > 1 / 30) {
      tick.current = 0;
      setN((n) => n + 1);
    }
  });

  return (
    <group>
      {sim.explosions.map((e) => (
        <ExplosionViz key={e.id} fx={e} />
      ))}
      {sim.shockwaves.map((e) => (
        <ShockwaveViz key={e.id} fx={e} />
      ))}
      {sim.dust.map((e) => (
        <DustViz key={e.id} fx={e} />
      ))}
    </group>
  );
}

export function FlashLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (ref.current) ref.current.intensity = sim.flash * 70;
  });
  return <pointLight ref={ref} position={[0, 14, 0]} color="#ffe6c4" intensity={0} distance={90} />;
}

export function ToolGhost() {
  const tool = useLab((s) => s.tool);
  const hover = useLab((s) => s.hoverGround);
  const explosion = useLab((s) => s.explosion);
  if (!hover || (tool !== "explode" && tool !== "meteor" && tool !== "place" && tool !== "move")) {
    return null;
  }
  const y = tool === "explode" ? explosion.height : 0.2;
  const r = tool === "place" || tool === "move" ? 1.2 : tool === "meteor" ? 1.6 : explosion.radius;
  return (
    <mesh
      position={[hover.x, y, hover.z]}
      rotation={tool === "explode" ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}
    >
      {tool === "explode" ? (
        <sphereGeometry args={[r, 20, 16]} />
      ) : (
        <circleGeometry args={[r, 32]} />
      )}
      <meshBasicMaterial
        color={
          tool === "meteor"
            ? "#ff6a2a"
            : tool === "place" || tool === "move"
              ? "#6ec8c0"
              : "#e8a070"
        }
        transparent
        opacity={0.14}
        depthWrite={false}
      />
    </mesh>
  );
}

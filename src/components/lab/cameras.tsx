import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useLab } from "@/game/store";
import { sim } from "@/game/sim";
import { held, setInjectedKeys } from "@/game/input";

const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _wish = new THREE.Vector3();
const _look = new THREE.Vector3();
const _shake = new THREE.Vector3();

export function CameraSystem() {
  const mode = useLab((s) => s.cameraMode);
  const selectedId = useLab((s) => s.selectedId);
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(-0.35);
  const speed = useRef(0);
  const looking = useRef(false);

  useEffect(() => {
    window.__controlsTest = {
      getYaw: () => yaw.current,
      getSpeed: () => speed.current,
      setKeys: (codes) => setInjectedKeys(codes),
    };
    return () => {
      window.__controlsTest = undefined;
    };
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: MouseEvent) => {
      if (mode === "free" && e.button === 2) looking.current = true;
    };
    const onUp = () => {
      looking.current = false;
    };
    const onMove = (e: MouseEvent) => {
      if (mode !== "free" || !looking.current) return;
      yaw.current -= e.movementX * 0.0025;
      pitch.current -= e.movementY * 0.0025;
      pitch.current = Math.max(-1.4, Math.min(1.4, pitch.current));
    };
    const onCtx = (e: Event) => e.preventDefault();
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    el.addEventListener("contextmenu", onCtx);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("contextmenu", onCtx);
    };
  }, [gl, mode]);

  useFrame(({ clock }, dt) => {
    const d = Math.min(dt, 0.1);
    const shakeOn = useLab.getState().shakeEnabled;
    const trauma = shakeOn ? sim.trauma : 0;
    const shake = trauma * trauma;
    if (sim.rumble > 0 && shakeOn) {
      camera.position.x += (Math.random() - 0.5) * sim.rumbleIntensity * 0.25;
      camera.position.z += (Math.random() - 0.5) * sim.rumbleIntensity * 0.25;
    }

    if (mode === "cinematic") {
      const t = clock.elapsedTime * 0.1;
      camera.position.set(Math.sin(t) * 46, 22 + Math.sin(t * 0.6) * 4, Math.cos(t) * 46);
      camera.lookAt(4, 6, 0);
    }

    if (mode === "follow") {
      const sb = selectedId ? sim.get(selectedId) : null;
      const p = sb?.body?.translation();
      const target = p ? _look.set(p.x, p.y + 2, p.z) : _look.set(22, 8, 2);
      const desired = new THREE.Vector3(target.x + 14, target.y + 10, target.z + 14);
      camera.position.lerp(desired, 1 - Math.exp(-2.4 * d));
      camera.lookAt(target);
    }

    if (mode === "free" || mode === "fps") {
      camera.getWorldDirection(_fwd);
      if (mode === "free") {
        _fwd.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
        camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
      } else {
        yaw.current = camera.rotation.y;
        _fwd.y = 0;
        _fwd.normalize();
      }
      _right.crossVectors(_fwd, camera.up).normalize();
      _wish.set(0, 0, 0);
      if (held("KeyW") || held("ArrowUp")) _wish.add(_fwd);
      if (held("KeyS") || held("ArrowDown")) _wish.sub(_fwd);
      if (held("KeyD") || held("ArrowRight")) _wish.add(_right);
      if (held("KeyA") || held("ArrowLeft")) _wish.sub(_right);
      if (mode === "free") {
        if (held("KeyE") || held("Space")) _wish.y += 1;
        if (held("KeyQ") || held("ControlLeft")) _wish.y -= 1;
      }
      const sprint = held("ShiftLeft") || held("ShiftRight");
      const max = sprint ? 38 : 16;
      if (_wish.lengthSq() > 0) {
        _wish.normalize();
        camera.position.addScaledVector(_wish, max * d);
        speed.current = max;
      } else {
        speed.current = Math.max(0, speed.current - d * 40);
      }
    } else {
      speed.current = 0;
    }

    if (shake > 0.002) {
      _shake.set(
        (Math.random() - 0.5) * shake * 0.55,
        (Math.random() - 0.5) * shake * 0.4,
        (Math.random() - 0.5) * shake * 0.55,
      );
      camera.position.add(_shake);
    }
  });

  return mode === "fps" ? <PointerLockControls makeDefault /> : null;
}

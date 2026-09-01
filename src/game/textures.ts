import * as THREE from "three";

const facadeCache = new Map<string, THREE.CanvasTexture>();
let asphalt: THREE.CanvasTexture | null = null;
let sidewalk: THREE.CanvasTexture | null = null;
let river: THREE.CanvasTexture | null = null;

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) throw new Error("2d");
  return { c, g };
}

function toTex(c: HTMLCanvasElement, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
  }
  return t;
}

export function facadeTexture(hex: string, glass: boolean) {
  const key = `${hex}-${glass ? "g" : "c"}`;
  const hit = facadeCache.get(key);
  if (hit) return hit;
  const { c, g } = canvas(256);
  g.fillStyle = hex;
  g.fillRect(0, 0, 256, 256);
  if (!glass) {
    g.fillStyle = "rgba(0,0,0,0.08)";
    for (let i = 0; i < 40; i++) {
      g.fillRect(Math.random() * 256, Math.random() * 256, 8, 3);
    }
  }
  const cols = glass ? 6 : 5;
  const rows = glass ? 4 : 3;
  const cw = 256 / cols;
  const ch = 256 / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const lit = Math.random() > (glass ? 0.28 : 0.45);
      if (glass) {
        g.fillStyle = lit ? "rgba(186, 220, 232, 0.72)" : "rgba(18, 28, 36, 0.82)";
      } else {
        g.fillStyle = lit ? "rgba(232, 214, 168, 0.55)" : "rgba(12, 14, 18, 0.78)";
      }
      g.fillRect(x * cw + 7, y * ch + 8, cw - 14, ch - 16);
      g.fillStyle = "rgba(255,255,255,0.06)";
      g.fillRect(x * cw + 7, y * ch + 8, cw - 14, 3);
    }
  }
  const t = toTex(c);
  facadeCache.set(key, t);
  return t;
}

export function asphaltTexture() {
  if (asphalt) return asphalt;
  const { c, g } = canvas(256);
  g.fillStyle = "#1c1d20";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const v = 22 + Math.floor(Math.random() * 28);
    g.fillStyle = `rgb(${v},${v},${v + 2})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  g.fillStyle = "#c9b86a";
  for (let y = 8; y < 256; y += 28) {
    g.fillRect(124, y, 8, 16);
  }
  asphalt = toTex(c, true);
  return asphalt;
}

export function sidewalkTexture() {
  if (sidewalk) return sidewalk;
  const { c, g } = canvas(256);
  g.fillStyle = "#3a3c40";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(0,0,0,0.22)";
  g.lineWidth = 2;
  for (let i = 0; i <= 256; i += 32) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 256);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(256, i);
    g.stroke();
  }
  sidewalk = toTex(c, true);
  return sidewalk;
}

export function riverTexture() {
  if (river) return river;
  const { c, g } = canvas(256);
  const grd = g.createLinearGradient(0, 0, 256, 256);
  grd.addColorStop(0, "#102830");
  grd.addColorStop(0.5, "#1a3d48");
  grd.addColorStop(1, "#0e242c");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(110,200,192,0.12)";
  g.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    g.beginPath();
    g.moveTo(0, 20 + i * 30);
    g.bezierCurveTo(80, 10 + i * 30, 160, 40 + i * 30, 256, 18 + i * 30);
    g.stroke();
  }
  river = toTex(c, true);
  return river;
}

export function shadeHex(hex: string, s: number) {
  const n = hex.replace("#", "");
  if (n.length !== 6) return hex;
  const r = Math.max(0, Math.min(255, Math.round(parseInt(n.slice(0, 2), 16) * s)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(n.slice(2, 4), 16) * s)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(n.slice(4, 6), 16) * s)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

import { i as __toESM } from "../_runtime.mjs";
import { E as require_react, S as Vector3, T as require_jsx_runtime, a as useThree, b as RepeatWrapping, c as BufferGeometry, g as MeshStandardMaterial, i as useFrame, l as CanvasTexture, n as OrbitControls, p as Fog, r as Canvas, s as BufferAttribute, t as PointerLockControls, u as Color, v as PointsMaterial, x as SRGBColorSpace } from "../_libs/@react-three/drei+[...].mjs";
import { a as useLab, c as BUILDINGS, d as LAMPS, f as VEHICLES, i as playBoom, l as CRATES, n as held, o as sim, r as setInjectedKeys, s as BARRIERS, u as FLOOR_H } from "./routes-SzspqvEV.mjs";
import { a as useRapier, i as useBeforePhysicsStep, n as Physics, r as RigidBody, t as CuboidCollider } from "../_libs/@react-three/rapier+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Scene-C9MZP33_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var facadeCache = /* @__PURE__ */ new Map();
var asphalt = null;
var sidewalk = null;
var river = null;
function canvas(size) {
	const c = document.createElement("canvas");
	c.width = size;
	c.height = size;
	const g = c.getContext("2d");
	if (!g) throw new Error("2d");
	return {
		c,
		g
	};
}
function toTex(c, repeat = false) {
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	t.anisotropy = 4;
	t.needsUpdate = true;
	if (repeat) {
		t.wrapS = RepeatWrapping;
		t.wrapT = RepeatWrapping;
	}
	return t;
}
function facadeTexture(hex, glass) {
	const key = `${hex}-${glass ? "g" : "c"}`;
	const hit = facadeCache.get(key);
	if (hit) return hit;
	const { c, g } = canvas(256);
	g.fillStyle = hex;
	g.fillRect(0, 0, 256, 256);
	if (!glass) {
		g.fillStyle = "rgba(0,0,0,0.08)";
		for (let i = 0; i < 40; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 8, 3);
	}
	const cols = glass ? 6 : 5;
	const rows = glass ? 4 : 3;
	const cw = 256 / cols;
	const ch = 256 / rows;
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const lit = Math.random() > (glass ? .28 : .45);
		if (glass) g.fillStyle = lit ? "rgba(186, 220, 232, 0.72)" : "rgba(18, 28, 36, 0.82)";
		else g.fillStyle = lit ? "rgba(232, 214, 168, 0.55)" : "rgba(12, 14, 18, 0.78)";
		g.fillRect(x * cw + 7, y * ch + 8, cw - 14, ch - 16);
		g.fillStyle = "rgba(255,255,255,0.06)";
		g.fillRect(x * cw + 7, y * ch + 8, cw - 14, 3);
	}
	const t = toTex(c);
	facadeCache.set(key, t);
	return t;
}
function asphaltTexture() {
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
	for (let y = 8; y < 256; y += 28) g.fillRect(124, y, 8, 16);
	asphalt = toTex(c, true);
	return asphalt;
}
function sidewalkTexture() {
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
function riverTexture() {
	if (river) return river;
	const { c, g } = canvas(256);
	const grd = g.createLinearGradient(0, 0, 256, 256);
	grd.addColorStop(0, "#102830");
	grd.addColorStop(.5, "#1a3d48");
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
function shadeHex(hex, s) {
	const n = hex.replace("#", "");
	if (n.length !== 6) return hex;
	const r = Math.max(0, Math.min(255, Math.round(parseInt(n.slice(0, 2), 16) * s)));
	const g = Math.max(0, Math.min(255, Math.round(parseInt(n.slice(2, 4), 16) * s)));
	const b = Math.max(0, Math.min(255, Math.round(parseInt(n.slice(4, 6), 16) * s)));
	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
function Piece({ id, name, kind, position, size, color, material, mass, resistance, buildingId, floorIndex, rotation, metalness, roughness, initialDynamic, glass, onImpact, linearVelocity, roofDetail }) {
	const ref = (0, import_react.useRef)(null);
	const obj = (0, import_react.useRef)(null);
	const [dynamic, setDynamic] = (0, import_react.useState)(!!initialDynamic);
	const [gone, setGone] = (0, import_react.useState)(false);
	const [w, h, d] = size;
	const selected = useLab((s) => s.selectedId === id);
	(0, import_react.useEffect)(() => {
		sim.register({
			id,
			kind,
			name,
			buildingId,
			floorIndex,
			material,
			mass,
			resistance,
			size: [
				w,
				h,
				d
			],
			color
		});
		return () => sim.unregister(id);
	}, [
		id,
		kind,
		name,
		buildingId,
		floorIndex,
		material,
		mass,
		resistance,
		w,
		h,
		d,
		color
	]);
	(0, import_react.useEffect)(() => {
		sim.attach(id, ref.current, obj.current, () => setDynamic(true), () => setGone(true));
	}, [id, dynamic]);
	(0, import_react.useEffect)(() => {
		if (!dynamic) return;
		const sb = sim.get(id);
		if (sb) sim.applyPending(sb);
	}, [dynamic, id]);
	const mat = (0, import_react.useMemo)(() => ({
		color,
		roughness: roughness ?? (glass ? .18 : material === "acero" || material === "metal" ? .32 : .88),
		metalness: metalness ?? (glass ? .72 : material === "acero" || material === "metal" ? .78 : .06)
	}), [
		color,
		roughness,
		metalness,
		glass,
		material
	]);
	const onClick = (e) => {
		e.stopPropagation();
		const tool = useLab.getState().tool;
		if (tool === "select" || tool === "move") {
			useLab.getState().select(id);
			if (tool === "move") useLab.getState().setMessage("Seleccionado. Clic en el suelo para mover.");
		}
	};
	if (gone) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RigidBody, {
		ref,
		name: id,
		type: dynamic ? "dynamic" : "fixed",
		position,
		rotation,
		colliders: false,
		mass,
		friction: .92,
		restitution: .06,
		linearDamping: .18,
		angularDamping: .22,
		ccd: kind === "meteor" || kind === "debris",
		canSleep: true,
		...linearVelocity ? { linearVelocity } : {},
		...onImpact ? { onCollisionEnter: onImpact } : {},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, {
			args: [
				w / 2,
				h / 2,
				d / 2
			],
			friction: .92,
			restitution: .05
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: obj,
			children: kind === "floor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorVisual, {
				w,
				h,
				d,
				color,
				glass: !!glass,
				selected,
				onClick,
				roofDetail: !!roofDetail
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				castShadow: true,
				receiveShadow: true,
				onClick,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					w,
					h,
					d
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: mat.color,
					roughness: mat.roughness,
					metalness: mat.metalness,
					emissive: selected ? "#6ec8c0" : "#000000",
					emissiveIntensity: selected ? .18 : 0
				})]
			})
		})]
	});
}
function FloorVisual({ w, h, d, color, glass, selected, onClick, roofDetail }) {
	const { side, roof, map } = (0, import_react.useMemo)(() => {
		const map = facadeTexture(color, glass).clone();
		map.repeat.set(Math.max(1, Math.round(w / 3.2)), Math.max(1, Math.round(h / 2.2)));
		map.needsUpdate = true;
		return {
			side: new MeshStandardMaterial({
				map,
				color: "#ffffff",
				roughness: glass ? .2 : .78,
				metalness: glass ? .62 : .08,
				emissive: selected ? "#6ec8c0" : "#000000",
				emissiveIntensity: selected ? .12 : 0
			}),
			roof: new MeshStandardMaterial({
				color: shadeHex(color, .72),
				roughness: .92,
				metalness: .05,
				emissive: selected ? "#6ec8c0" : "#000000",
				emissiveIntensity: selected ? .1 : 0
			}),
			map
		};
	}, [
		color,
		glass,
		selected,
		w,
		h
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			side.dispose();
			roof.dispose();
			map.dispose();
		};
	}, [
		side,
		roof,
		map
	]);
	const materials = (0, import_react.useMemo)(() => [
		side,
		side,
		roof,
		roof,
		side,
		side
	], [side, roof]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		castShadow: true,
		receiveShadow: true,
		onClick,
		material: materials,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			w,
			h,
			d
		] })
	}), roofDetail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			h / 2 + .08,
			0
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			w * .22,
			.18,
			d * .28
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#3a4048",
			roughness: .55,
			metalness: .35
		})]
	}) : null] });
}
function BuildingStack({ id, name, x, z, floors, w, d, color, material, resistance, glass }) {
	const h = FLOOR_H * .92;
	const pieces = [];
	for (let i = 0; i < floors; i++) {
		const y = i * FLOOR_H + h / 2;
		const shade = 1 - i * .012;
		pieces.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
			id: `${id}-f${i}`,
			name: `${name} · planta ${i + 1}`,
			kind: "floor",
			buildingId: id,
			floorIndex: i,
			position: [
				x,
				y,
				z
			],
			size: [
				w,
				h,
				d
			],
			color: shadeHex(color, shade),
			material,
			mass: 180 + w * d * 2.4,
			resistance,
			glass,
			roofDetail: i === floors - 1
		}, `${id}-f${i}`));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: pieces });
}
function VehicleBody({ id, kind, x, z, rotY, color }) {
	const dim = kind === "truck" ? {
		w: 2.5,
		h: 2.5,
		d: 7.2,
		mass: 260
	} : kind === "van" ? {
		w: 2.1,
		h: 2.1,
		d: 5.1,
		mass: 140
	} : {
		w: 1.9,
		h: 1.35,
		d: 4.2,
		mass: 90
	};
	const name = kind === "truck" ? "Camión" : kind === "van" ? "Furgoneta" : "Coche";
	const ref = (0, import_react.useRef)(null);
	const obj = (0, import_react.useRef)(null);
	const [dynamic, setDynamic] = (0, import_react.useState)(false);
	const [gone, setGone] = (0, import_react.useState)(false);
	const selected = useLab((s) => s.selectedId === id);
	(0, import_react.useEffect)(() => {
		sim.register({
			id,
			kind: "vehicle",
			name,
			material: "metal",
			mass: dim.mass,
			resistance: 36,
			size: [
				dim.w,
				dim.h,
				dim.d
			],
			color
		});
		return () => sim.unregister(id);
	}, [
		id,
		name,
		dim.mass,
		dim.w,
		dim.h,
		dim.d,
		color
	]);
	(0, import_react.useEffect)(() => {
		sim.attach(id, ref.current, obj.current, () => setDynamic(true), () => setGone(true));
	}, [id, dynamic]);
	(0, import_react.useEffect)(() => {
		if (!dynamic) return;
		const sb = sim.get(id);
		if (sb) sim.applyPending(sb);
	}, [dynamic, id]);
	const onClick = (e) => {
		e.stopPropagation();
		const tool = useLab.getState().tool;
		if (tool === "select" || tool === "move") useLab.getState().select(id);
	};
	if (gone) return null;
	const cabinH = kind === "car" ? dim.h * .55 : dim.h * .72;
	const cabinZ = kind === "truck" ? dim.d * .22 : .15;
	const cabinD = kind === "truck" ? dim.d * .38 : dim.d * .55;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RigidBody, {
		ref,
		name: id,
		type: dynamic ? "dynamic" : "fixed",
		position: [
			x,
			dim.h / 2 + .02,
			z
		],
		rotation: [
			0,
			rotY,
			0
		],
		colliders: false,
		mass: dim.mass,
		friction: .92,
		restitution: .06,
		linearDamping: .18,
		angularDamping: .22,
		canSleep: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, {
			args: [
				dim.w / 2,
				dim.h / 2,
				dim.d / 2
			],
			friction: .92,
			restitution: .05
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: obj,
			onClick,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					castShadow: true,
					receiveShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						dim.w,
						dim.h * .55,
						dim.d
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color,
						roughness: .38,
						metalness: .72,
						emissive: selected ? "#6ec8c0" : "#000000",
						emissiveIntensity: selected ? .16 : 0
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						dim.h * .28,
						cabinZ
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						dim.w * .88,
						cabinH,
						cabinD
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: "#1a2228",
						roughness: .18,
						metalness: .65
					})]
				}),
				[
					[
						-dim.w * .42,
						-dim.h * .28,
						dim.d * .32
					],
					[
						dim.w * .42,
						-dim.h * .28,
						dim.d * .32
					],
					[
						-dim.w * .42,
						-dim.h * .28,
						-dim.d * .32
					],
					[
						dim.w * .42,
						-dim.h * .28,
						-dim.d * .32
					]
				].map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						p[0],
						p[1],
						p[2]
					],
					rotation: [
						0,
						0,
						Math.PI / 2
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.28,
						.28,
						.22,
						10
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: "#161616",
						roughness: .7,
						metalness: .2
					})]
				}, i))
			]
		})]
	});
}
function LampPost({ id, x, z }) {
	const ref = (0, import_react.useRef)(null);
	const obj = (0, import_react.useRef)(null);
	const [dynamic, setDynamic] = (0, import_react.useState)(false);
	const [gone, setGone] = (0, import_react.useState)(false);
	const selected = useLab((s) => s.selectedId === id);
	(0, import_react.useEffect)(() => {
		sim.register({
			id,
			kind: "prop",
			name: "Farola",
			material: "acero",
			mass: 26,
			resistance: 20,
			size: [
				.28,
				5.5,
				.28
			],
			color: "#3a3e44"
		});
		return () => sim.unregister(id);
	}, [id]);
	(0, import_react.useEffect)(() => {
		sim.attach(id, ref.current, obj.current, () => setDynamic(true), () => setGone(true));
	}, [id, dynamic]);
	(0, import_react.useEffect)(() => {
		if (!dynamic) return;
		const sb = sim.get(id);
		if (sb) sim.applyPending(sb);
	}, [dynamic, id]);
	const onClick = (e) => {
		e.stopPropagation();
		const tool = useLab.getState().tool;
		if (tool === "select" || tool === "move") useLab.getState().select(id);
	};
	if (gone) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RigidBody, {
		ref,
		name: id,
		type: dynamic ? "dynamic" : "fixed",
		position: [
			x,
			2.75,
			z
		],
		colliders: false,
		mass: 26,
		friction: .9,
		restitution: .05,
		canSleep: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, { args: [
			.14,
			2.75,
			.14
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: obj,
			onClick,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.28,
					5.5,
					.28
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#3a3e44",
					roughness: .35,
					metalness: .7,
					emissive: selected ? "#6ec8c0" : "#000000",
					emissiveIntensity: selected ? .16 : 0
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					2.7,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.22,
					10,
					10
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#f0e2b8",
					emissive: "#f0d48a",
					emissiveIntensity: 1.8
				})]
			})]
		})]
	});
}
function CrateStack({ id, x, z, count }) {
	const s = 1.15;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
		id: `${id}-${i}`,
		name: "Caja",
		kind: "prop",
		position: [
			x,
			s / 2 + i * s,
			z
		],
		size: [
			s,
			s,
			s
		],
		color: i % 2 ? "#8a6a3c" : "#6e5530",
		material: "madera",
		mass: 28,
		resistance: 22
	}, `${id}-${i}`)) });
}
function Bridge() {
	const segs = [];
	const n = 8;
	const segW = 16 / n;
	for (let i = 0; i < n; i++) {
		const x = -7 + i * segW;
		segs.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
			id: `bridge-deck-${i}`,
			name: `Tablero del puente ${i + 1}`,
			kind: "bridge",
			buildingId: "bridge",
			floorIndex: i,
			position: [
				x,
				1.05,
				0
			],
			size: [
				1.95,
				.55,
				5.6
			],
			color: "#7c7a74",
			material: "hormigón",
			mass: 280,
			resistance: 72
		}, `bridge-${i}`));
	}
	const rails = [
		[-7.2, -2.2],
		[-7.2, 2.2],
		[7.2, -2.2],
		[7.2, 2.2]
	];
	const water = riverTexture();
	water.repeat.set(2, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		segs,
		rails.map(([x, z], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
			id: `bridge-pillar-${i}`,
			name: `Pilar del puente ${i + 1}`,
			kind: "bridge",
			buildingId: "bridge",
			floorIndex: -1,
			position: [
				x,
				.55,
				z
			],
			size: [
				1.1,
				1.1,
				1.1
			],
			color: "#5c5a54",
			material: "hormigón",
			mass: 400,
			resistance: 88
		}, `pillar-${i}`)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				-2.35,
				0
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [16.4, 88] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: water,
				color: "#8ec8c4",
				roughness: .12,
				metalness: .62
			})]
		})
	] });
}
function handleGround(p) {
	const { tool, explosion, catalogId, selectedId } = useLab.getState();
	if (tool === "explode") {
		useLab.getState().setMarker({
			x: p.x,
			y: explosion.height,
			z: p.z
		});
		useLab.getState().setExplosion({
			x: p.x,
			z: p.z
		});
		window.__lab?.detonate(p.x, p.z);
		return;
	}
	if (tool === "meteor") {
		const power = useLab.getState().explosion.power;
		sim.spawnMeteor(p.x, p.z, power);
		useLab.getState().record({
			t: sim.simTime,
			type: "meteor",
			payload: {
				x: p.x,
				z: p.z,
				power
			}
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
function Ground() {
	const asphalt = asphaltTexture();
	asphalt.repeat.set(1, 14);
	const walk = sidewalkTexture();
	walk.repeat.set(4, 12);
	const onGround = (e) => {
		e.stopPropagation();
		handleGround(e.point);
	};
	const onMove = (e) => {
		const { tool } = useLab.getState();
		if (tool === "explode" || tool === "place" || tool === "meteor" || tool === "move") useLab.getState().setHoverGround({
			x: e.point.x,
			y: e.point.y,
			z: e.point.z
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RigidBody, {
			type: "fixed",
			colliders: false,
			position: [
				-33,
				-.5,
				0
			],
			friction: 1,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, { args: [
				25,
				.5,
				46
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				receiveShadow: true,
				onClick: onGround,
				onPointerMove: onMove,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					50,
					1,
					92
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					map: walk,
					color: "#9aa0a6",
					roughness: .92,
					metalness: .04
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RigidBody, {
			type: "fixed",
			colliders: false,
			position: [
				33,
				-.5,
				0
			],
			friction: 1,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, { args: [
				25,
				.5,
				46
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				receiveShadow: true,
				onClick: onGround,
				onPointerMove: onMove,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					50,
					1,
					92
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					map: walk,
					color: "#9aa0a6",
					roughness: .92,
					metalness: .04
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RigidBody, {
			type: "fixed",
			colliders: false,
			position: [
				0,
				-3.4,
				0
			],
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, { args: [
				10,
				.4,
				46
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-12.2,
				.04,
				0
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [6.4, 88] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: asphalt,
				color: "#d0d0d0",
				roughness: .95
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				12.2,
				.04,
				0
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [6.4, 88] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: asphalt,
				color: "#d0d0d0",
				roughness: .95
			})]
		})
	] });
}
function Skyline() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: [
		{
			x: -48,
			z: -30,
			w: 10,
			d: 9,
			h: 26,
			c: "#3a4048"
		},
		{
			x: -50,
			z: -12,
			w: 8,
			d: 8,
			h: 18,
			c: "#454b52"
		},
		{
			x: -47,
			z: 8,
			w: 11,
			d: 8,
			h: 32,
			c: "#2e343c"
		},
		{
			x: -49,
			z: 26,
			w: 9,
			d: 9,
			h: 22,
			c: "#41464d"
		},
		{
			x: 48,
			z: -28,
			w: 9,
			d: 8,
			h: 24,
			c: "#323840"
		},
		{
			x: 50,
			z: -8,
			w: 12,
			d: 9,
			h: 36,
			c: "#2a3138"
		},
		{
			x: 47,
			z: 12,
			w: 8,
			d: 8,
			h: 20,
			c: "#3e444c"
		},
		{
			x: 49,
			z: 30,
			w: 10,
			d: 9,
			h: 28,
			c: "#353b42"
		},
		{
			x: -28,
			z: -48,
			w: 8,
			d: 8,
			h: 16,
			c: "#3a3f45"
		},
		{
			x: 8,
			z: -50,
			w: 10,
			d: 8,
			h: 21,
			c: "#2f353c"
		},
		{
			x: 28,
			z: 50,
			w: 9,
			d: 8,
			h: 19,
			c: "#3c4248"
		},
		{
			x: -10,
			z: 50,
			w: 11,
			d: 8,
			h: 27,
			c: "#2c3238"
		}
	].map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			b.x,
			b.h / 2,
			b.z
		],
		castShadow: true,
		receiveShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			b.w,
			b.h,
			b.d
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: b.c,
			roughness: .86,
			metalness: .12
		})]
	}, i)) });
}
function ExtraItem({ item }) {
	if (item.kind === "building") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingStack, {
		id: item.buildingId ?? item.id,
		name: item.name,
		x: item.x,
		z: item.z,
		floors: item.floors ?? 4,
		w: item.w,
		d: item.d,
		color: item.color,
		material: item.material,
		resistance: item.resistance,
		glass: item.material === "vidrio"
	});
	if (item.kind === "car" || item.kind === "van" || item.kind === "truck") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VehicleBody, {
		id: item.id,
		kind: item.kind,
		x: item.x,
		z: item.z,
		rotY: item.rotY ?? 0,
		color: item.color
	});
	if (item.kind === "lamp") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LampPost, {
		id: item.id,
		x: item.x,
		z: item.z
	});
	if (item.kind === "antenna") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: Array.from({ length: 6 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
		id: `${item.id}-${i}`,
		name: `${item.name} ${i + 1}`,
		kind: "column",
		buildingId: item.id,
		floorIndex: i,
		position: [
			item.x,
			1.3 + i * 2.6,
			item.z
		],
		size: [
			.7 - i * .06,
			2.6,
			.7 - i * .06
		],
		color: item.color,
		material: "acero",
		mass: 40,
		resistance: 38
	}, `${item.id}-${i}`)) });
	if (item.kind === "ramp") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
		id: item.id,
		name: item.name,
		kind: "terrain",
		position: [
			item.x,
			item.h / 2,
			item.z
		],
		rotation: [
			0,
			0,
			-.32
		],
		size: [
			item.w,
			item.h,
			item.d
		],
		color: item.color,
		material: item.material,
		mass: item.mass,
		resistance: item.resistance
	});
	if (item.kind === "tank") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
		id: item.id,
		name: item.name,
		kind: "prop",
		position: [
			item.x,
			item.h / 2,
			item.z
		],
		size: [
			item.w,
			item.h,
			item.d
		],
		color: item.color,
		material: item.material,
		mass: item.mass,
		resistance: item.resistance,
		metalness: .82,
		roughness: .28
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
		id: item.id,
		name: item.name,
		kind: item.kind === "bridge-seg" ? "bridge" : "prop",
		position: [
			item.x,
			item.h / 2 + item.y,
			item.z
		],
		size: [
			item.w,
			item.h,
			item.d
		],
		color: item.color,
		material: item.material,
		mass: item.mass,
		resistance: item.resistance
	});
}
function DebrisPiece({ item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
		id: item.id,
		name: "Escombro",
		kind: "debris",
		position: [
			item.x,
			item.y,
			item.z
		],
		size: [
			item.w,
			item.h,
			item.d
		],
		color: item.color,
		material: item.material,
		mass: Math.max(8, item.mass),
		resistance: 10,
		initialDynamic: true,
		linearVelocity: [
			item.vx ?? 0,
			item.vy ?? 2,
			item.vz ?? 0
		]
	});
}
function MeteorBody({ id, x, z, power }) {
	const hit = (0, import_react.useRef)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RigidBody, {
		type: "dynamic",
		position: [
			x,
			48,
			z
		],
		colliders: false,
		mass: 1800,
		ccd: true,
		linearVelocity: [
			0,
			-38,
			0
		],
		friction: .4,
		restitution: .05,
		onCollisionEnter: (payload) => {
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
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, { args: [
				1.4,
				1.4,
				1.4
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [1.6, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#6a4030",
					emissive: "#ff6a22",
					emissiveIntensity: .85,
					roughness: .7
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
				color: "#ff8020",
				intensity: 16,
				distance: 18
			})
		]
	});
}
var _fwd = new Vector3();
var _right = new Vector3();
var _wish = new Vector3();
var _look = new Vector3();
var _shake = new Vector3();
function CameraSystem() {
	const mode = useLab((s) => s.cameraMode);
	const selectedId = useLab((s) => s.selectedId);
	const { camera, gl } = useThree();
	const yaw = (0, import_react.useRef)(0);
	const pitch = (0, import_react.useRef)(-.35);
	const speed = (0, import_react.useRef)(0);
	const looking = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		window.__controlsTest = {
			getYaw: () => yaw.current,
			getSpeed: () => speed.current,
			setKeys: (codes) => setInjectedKeys(codes)
		};
		return () => {
			window.__controlsTest = void 0;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const el = gl.domElement;
		const onDown = (e) => {
			if (mode === "free" && e.button === 2) looking.current = true;
		};
		const onUp = () => {
			looking.current = false;
		};
		const onMove = (e) => {
			if (mode !== "free" || !looking.current) return;
			yaw.current -= e.movementX * .0025;
			pitch.current -= e.movementY * .0025;
			pitch.current = Math.max(-1.4, Math.min(1.4, pitch.current));
		};
		const onCtx = (e) => e.preventDefault();
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
		const d = Math.min(dt, .1);
		const shakeOn = useLab.getState().shakeEnabled;
		const trauma = shakeOn ? sim.trauma : 0;
		const shake = trauma * trauma;
		if (sim.rumble > 0 && shakeOn) {
			camera.position.x += (Math.random() - .5) * sim.rumbleIntensity * .25;
			camera.position.z += (Math.random() - .5) * sim.rumbleIntensity * .25;
		}
		if (mode === "cinematic") {
			const t = clock.elapsedTime * .1;
			camera.position.set(Math.sin(t) * 46, 22 + Math.sin(t * .6) * 4, Math.cos(t) * 46);
			camera.lookAt(4, 6, 0);
		}
		if (mode === "follow") {
			const p = (selectedId ? sim.get(selectedId) : null)?.body?.translation();
			const target = p ? _look.set(p.x, p.y + 2, p.z) : _look.set(22, 8, 2);
			const desired = new Vector3(target.x + 14, target.y + 10, target.z + 14);
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
			const max = held("ShiftLeft") || held("ShiftRight") ? 38 : 16;
			if (_wish.lengthSq() > 0) {
				_wish.normalize();
				camera.position.addScaledVector(_wish, max * d);
				speed.current = max;
			} else speed.current = Math.max(0, speed.current - d * 40);
		} else speed.current = 0;
		if (shake > .002) {
			_shake.set((Math.random() - .5) * shake * .55, (Math.random() - .5) * shake * .4, (Math.random() - .5) * shake * .55);
			camera.position.add(_shake);
		}
	});
	return mode === "fps" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PointerLockControls, { makeDefault: true }) : null;
}
function ExplosionViz({ fx }) {
	const ball = (0, import_react.useRef)(null);
	const light = (0, import_react.useRef)(null);
	const core = (0, import_react.useRef)(null);
	const smoke = (0, import_react.useRef)(null);
	const smoke2 = (0, import_react.useRef)(null);
	useFrame((_, dt) => {
		const t = fx.t;
		const s = (.5 + t * 5.4) * (.4 + fx.radius / 26);
		if (ball.current) {
			ball.current.scale.setScalar(s);
			const mat = ball.current.material;
			mat.opacity = Math.max(0, .92 - t * .95);
		}
		if (core.current) {
			core.current.scale.setScalar(s * .42);
			const mat = core.current.material;
			mat.opacity = Math.max(0, 1 - t * 1.5);
		}
		if (smoke.current) {
			smoke.current.scale.setScalar(s * 1.15 + t * 2.2);
			smoke.current.position.y = t * 2.4;
			const mat = smoke.current.material;
			mat.opacity = Math.max(0, .38 - t * .22);
		}
		if (smoke2.current) {
			smoke2.current.scale.setScalar(s * .8 + t * 3.1);
			smoke2.current.position.y = t * 3.2;
			const mat = smoke2.current.material;
			mat.opacity = Math.max(0, .28 - t * .16);
		}
		if (light.current) light.current.intensity = Math.max(0, (28 + fx.power * .32) * (1 - t * 1.15));
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			fx.x,
			fx.y,
			fx.z
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: core,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					16,
					16
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#fff7e0",
					transparent: true,
					opacity: 1,
					depthWrite: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: ball,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					22,
					22
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#ff5a18",
					transparent: true,
					opacity: .88,
					blending: 2,
					depthWrite: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: smoke,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					12,
					12
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#4a4038",
					transparent: true,
					opacity: .35,
					depthWrite: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: smoke2,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1.1,
					10,
					10
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#2a2622",
					transparent: true,
					opacity: .25,
					depthWrite: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
				ref: light,
				color: "#ffb36a",
				intensity: 28,
				distance: 48
			})
		]
	});
}
function ShockwaveViz({ fx }) {
	const ref = (0, import_react.useRef)(null);
	useFrame(() => {
		if (!ref.current) return;
		const s = .6 + fx.t * fx.radius * 2.8;
		ref.current.scale.set(s, s, 1);
		const mat = ref.current.material;
		mat.opacity = Math.max(0, .5 - fx.t * .52);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		ref,
		position: [
			fx.x,
			fx.y + .12,
			fx.z
		],
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
			.82,
			1,
			56
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: "#f2e6c8",
			transparent: true,
			opacity: .48,
			side: 2,
			depthWrite: false
		})]
	});
}
function makeDustGeo(count) {
	const geo = new BufferGeometry();
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
	geo.setAttribute("position", new BufferAttribute(pos, 3));
	geo.vel = vel;
	return geo;
}
function DustViz({ fx }) {
	const count = 140;
	const geo = (0, import_react.useMemo)(() => makeDustGeo(count), []);
	const mat = (0, import_react.useMemo)(() => new PointsMaterial({
		color: "#c4b49a",
		size: .48,
		transparent: true,
		opacity: .78,
		depthWrite: false
	}), []);
	const emberGeo = (0, import_react.useMemo)(() => makeDustGeo(40), []);
	const emberMat = (0, import_react.useMemo)(() => new PointsMaterial({
		color: "#ff7a32",
		size: .22,
		transparent: true,
		opacity: .9,
		blending: 2,
		depthWrite: false
	}), []);
	const started = (0, import_react.useRef)(false);
	const t0 = (0, import_react.useRef)(0);
	useFrame((_, dt) => {
		if (!started.current) {
			started.current = true;
			t0.current = 0;
		}
		t0.current += dt;
		const step = (g, grav) => {
			const pos = g.getAttribute("position");
			const vel = g.vel;
			const arr = pos.array;
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
		mat.opacity = Math.max(0, .8 - t0.current * .38);
		emberMat.opacity = Math.max(0, .95 - t0.current * .7);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			fx.x,
			fx.y + .4,
			fx.z
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("points", {
			geometry: geo,
			material: mat
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("points", {
			geometry: emberGeo,
			material: emberMat
		})]
	});
}
function FxLayer() {
	const tick = (0, import_react.useRef)(0);
	const [, setN] = (0, import_react.useState)(0);
	useFrame((_, dt) => {
		sim.tickFx(dt);
		tick.current += dt;
		if (tick.current > 1 / 30) {
			tick.current = 0;
			setN((n) => n + 1);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		sim.explosions.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExplosionViz, { fx: e }, e.id)),
		sim.shockwaves.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShockwaveViz, { fx: e }, e.id)),
		sim.dust.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DustViz, { fx: e }, e.id))
	] });
}
function FlashLight() {
	const ref = (0, import_react.useRef)(null);
	useFrame(() => {
		if (ref.current) ref.current.intensity = sim.flash * 70;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
		ref,
		position: [
			0,
			14,
			0
		],
		color: "#ffe6c4",
		intensity: 0,
		distance: 90
	});
}
function ToolGhost() {
	const tool = useLab((s) => s.tool);
	const hover = useLab((s) => s.hoverGround);
	const explosion = useLab((s) => s.explosion);
	if (!hover || tool !== "explode" && tool !== "meteor" && tool !== "place" && tool !== "move") return null;
	const y = tool === "explode" ? explosion.height : .2;
	const r = tool === "place" || tool === "move" ? 1.2 : tool === "meteor" ? 1.6 : explosion.radius;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			hover.x,
			y,
			hover.z
		],
		rotation: tool === "explode" ? [
			0,
			0,
			0
		] : [
			-Math.PI / 2,
			0,
			0
		],
		children: [tool === "explode" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			r,
			20,
			16
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [r, 32] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: tool === "meteor" ? "#ff6a2a" : tool === "place" || tool === "move" ? "#6ec8c0" : "#e8a070",
			transparent: true,
			opacity: .14,
			depthWrite: false
		})]
	});
}
function Sun() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
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
		l.shadow.bias = -35e-5;
		l.shadow.normalBias = .035;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
		ref,
		position: [
			36,
			42,
			18
		],
		intensity: 1.85,
		color: "#ffd8b0"
	});
}
function TimeStepper() {
	const { step } = useRapier();
	const fpsAcc = (0, import_react.useRef)(0);
	const fpsFrames = (0, import_react.useRef)(0);
	useBeforePhysicsStep(() => {
		sim.applyWindAndRumble();
	});
	useFrame((_, dt) => {
		const st = useLab.getState();
		const d = Math.min(dt, .1);
		fpsAcc.current += d;
		fpsFrames.current += 1;
		if (fpsAcc.current >= .4) {
			useLab.getState().setFps(Math.round(fpsFrames.current / fpsAcc.current));
			useLab.getState().setObjects(sim.bodies.size);
			fpsAcc.current = 0;
			fpsFrames.current = 0;
		}
		if (!st.paused && st.timeScale !== 1) step(Math.min(d * st.timeScale, .2));
		if (sim.debrisQueue.length) {
			const req = sim.debrisQueue.splice(0, 12);
			useLab.getState().pushDebris(req.map((r) => ({
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
				mass: 12,
				material: r.material,
				resistance: 8,
				color: r.color,
				vx: r.vx,
				vy: r.vy,
				vz: r.vz
			})));
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
function applyRecorded(type, payload) {
	if (type === "explosion") {
		sim.explode(Number(payload.x), Number(payload.height ?? 2), Number(payload.z), Number(payload.power), Number(payload.radius));
		playBoom(Number(payload.power));
	}
	if (type === "earthquake") sim.earthquake(Number(payload.intensity));
	if (type === "meteor") sim.spawnMeteor(Number(payload.x), Number(payload.z), Number(payload.power));
	if (type === "wind") sim.startWind(Number(payload.strength));
	if (type === "collapse") {
		const t = String(payload.target);
		if (t === "all") sim.collapseAll();
		else if (t === "bridge") sim.collapseBuilding("bridge");
		else sim.collapseBuilding(t);
	}
	if (type === "shockwave") sim.shockwave(Number(payload.x), Number(payload.z), Number(payload.power));
}
function World() {
	const extras = useLab((s) => s.extras);
	const debris = useLab((s) => s.debris);
	const meteors = useLab((s) => s.meteors);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", {
			color: "#c9d6e4",
			groundColor: "#3a3228",
			intensity: .55
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .18 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ground, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skyline, {}),
		BUILDINGS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingStack, {
			id: b.id,
			name: b.name,
			x: b.x,
			z: b.z,
			floors: b.floors,
			w: b.w,
			d: b.d,
			color: b.color,
			material: b.material,
			resistance: b.resistance,
			glass: "glass" in b && Boolean(b.glass)
		}, b.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bridge, {}),
		VEHICLES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VehicleBody, { ...v }, v.id)),
		LAMPS.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LampPost, {
			id: `lamp-${i}`,
			x: l.x,
			z: l.z
		}, `lamp-${i}`)),
		CRATES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrateStack, {
			id: c.id,
			x: c.x,
			z: c.z,
			count: c.stacked
		}, c.id)),
		BARRIERS.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Piece, {
			id: `bar-${i}`,
			name: "Barrera",
			kind: "prop",
			position: [
				b.x,
				.45,
				b.z
			],
			rotation: [
				0,
				b.rotY,
				0
			],
			size: [
				2.1,
				.9,
				.42
			],
			color: "#c9b48a",
			material: "hormigón",
			mass: 46,
			resistance: 40
		}, `bar-${i}`)),
		extras.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExtraItem, { item: e }, e.id)),
		debris.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebrisPiece, { item: e }, e.id)),
		meteors.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeteorBody, { ...m }, m.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FxLayer, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlashLight, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolGhost, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraSystem, {})
	] });
}
function SceneTint() {
	const { scene, gl } = useThree();
	(0, import_react.useEffect)(() => {
		scene.background = new Color("#10141a");
		scene.fog = new Fog("#10141a", 55, 160);
		gl.toneMapping = 4;
		gl.toneMappingExposure = 1.12;
		gl.shadowMap.enabled = true;
		gl.shadowMap.type = 1;
	}, [scene, gl]);
	return null;
}
function Scene() {
	const worldKey = useLab((s) => s.worldKey);
	const paused = useLab((s) => s.paused);
	const timeScale = useLab((s) => s.timeScale);
	const quality = useLab((s) => s.quality);
	const cameraMode = useLab((s) => s.cameraMode);
	const orbitEnabled = useLab((s) => s.orbitEnabled);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		className: "absolute inset-0 h-full w-full touch-none",
		shadows: true,
		dpr: quality === "alta" ? [1, 1.5] : [1, 1.1],
		camera: {
			position: [
				48,
				26,
				48
			],
			fov: 48,
			near: .1,
			far: 260
		},
		gl: {
			antialias: true,
			powerPreference: "high-performance"
		},
		onCreated: () => useLab.getState().setSceneReady(true),
		onPointerMissed: () => {
			if (useLab.getState().tool === "select") useLab.getState().select(null);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneTint, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Physics, {
					paused: paused || timeScale !== 1,
					timeStep: 1 / 60,
					gravity: [
						0,
						-9.81,
						0
					],
					interpolate: true,
					colliders: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeStepper, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(World, {})]
				}, worldKey)
			}),
			cameraMode === "orbit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
				makeDefault: true,
				enabled: orbitEnabled,
				enableDamping: true,
				dampingFactor: .08,
				maxPolarAngle: Math.PI / 2 - .04,
				minDistance: 8,
				maxDistance: 110,
				target: [
					2,
					4,
					0
				]
			}) : null
		]
	});
}
//#endregion
export { Scene as default };

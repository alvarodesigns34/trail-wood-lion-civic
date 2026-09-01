import { i as __toESM } from "../_runtime.mjs";
import { E as require_react, T as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as parseCommand } from "./parse-command-BDktVIdo.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { C as Car, D as Box, E as BrickWall, S as ChevronLeft, T as Building2, _ as Crosshair, a as Trash2, b as CircleHelp, c as RotateCcw, d as Pause, f as Orbit, g as Eye, h as Focus, l as Play, m as Menu, n as X, o as Spline, p as Mountain, r as Wind, s as Sparkles, t as Zap, u as PersonStanding, v as Copy, w as Camera, x as ChevronRight, y as Clapperboard } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-SzspqvEV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FLOOR_H = 2.75;
var BUILDINGS = [
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
		resistance: 62
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
		resistance: 64
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
		glass: true
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
		isBlue: true
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
		resistance: 60
	}
];
var VEHICLES = [
	{
		id: "car-1",
		kind: "car",
		x: -11.4,
		z: -10,
		rotY: 0,
		color: "#c45c4a"
	},
	{
		id: "car-2",
		kind: "car",
		x: -11.4,
		z: 8,
		rotY: Math.PI,
		color: "#d8d2c6"
	},
	{
		id: "van-1",
		kind: "van",
		x: -11.6,
		z: 18,
		rotY: 0,
		color: "#4a5a4e"
	},
	{
		id: "car-3",
		kind: "car",
		x: 11.4,
		z: -8,
		rotY: Math.PI,
		color: "#3d6ea8"
	},
	{
		id: "truck-1",
		kind: "truck",
		x: 11.8,
		z: 10,
		rotY: 0,
		color: "#c9a227"
	},
	{
		id: "car-4",
		kind: "car",
		x: 11.4,
		z: 20,
		rotY: Math.PI,
		color: "#2f3338"
	}
];
var CRATES = [
	{
		id: "crate-a",
		x: -14,
		z: -4,
		stacked: 3
	},
	{
		id: "crate-b",
		x: 14,
		z: 8,
		stacked: 2
	},
	{
		id: "crate-c",
		x: -16,
		z: 22,
		stacked: 4
	}
];
var LAMPS = [
	{
		x: -13.5,
		z: -12
	},
	{
		x: -13.5,
		z: 8
	},
	{
		x: 13.5,
		z: -12
	},
	{
		x: 13.5,
		z: 8
	}
];
var BARRIERS = [
	{
		x: -8.6,
		z: -6,
		rotY: Math.PI / 2
	},
	{
		x: -8.6,
		z: 6,
		rotY: Math.PI / 2
	},
	{
		x: 8.6,
		z: -6,
		rotY: Math.PI / 2
	},
	{
		x: 8.6,
		z: 6,
		rotY: Math.PI / 2
	}
];
var CATALOG = [
	{
		id: "columna",
		name: "Columna de hormigón",
		group: "construccion",
		kind: "box",
		w: 1.1,
		h: 4,
		d: 1.1,
		mass: 220,
		material: "hormigón",
		resistance: 78,
		color: "#8a8378"
	},
	{
		id: "muro",
		name: "Muro",
		group: "construccion",
		kind: "box",
		w: 6,
		h: 3.2,
		d: .55,
		mass: 280,
		material: "hormigón",
		resistance: 58,
		color: "#7d776e"
	},
	{
		id: "losa",
		name: "Losa",
		group: "construccion",
		kind: "box",
		w: 6,
		h: .5,
		d: 6,
		mass: 320,
		material: "hormigón",
		resistance: 64,
		color: "#8f897e"
	},
	{
		id: "viga",
		name: "Viga de acero",
		group: "construccion",
		kind: "box",
		w: 8,
		h: .45,
		d: .45,
		mass: 160,
		material: "acero",
		resistance: 82,
		color: "#6a7078"
	},
	{
		id: "bloque",
		name: "Bloque",
		group: "construccion",
		kind: "box",
		w: 2,
		h: 2,
		d: 2,
		mass: 180,
		material: "hormigón",
		resistance: 66,
		color: "#857f74"
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
		color: "#8a8378"
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
		color: "#7a746a"
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
		color: "#2f3640"
	},
	{
		id: "puente-mod",
		name: "Módulo de puente",
		group: "estructuras",
		kind: "bridge-seg",
		w: 4,
		h: .65,
		d: 5.4,
		mass: 360,
		material: "hormigón",
		resistance: 74,
		color: "#7c7a74"
	},
	{
		id: "antena",
		name: "Torre de antena",
		group: "estructuras",
		kind: "antenna",
		w: 1.2,
		h: 16,
		d: 1.2,
		mass: 90,
		material: "acero",
		resistance: 40,
		color: "#9aa3ad"
	},
	{
		id: "coche",
		name: "Coche",
		group: "vehiculos",
		kind: "car",
		w: 2,
		h: 1.4,
		d: 4.2,
		mass: 90,
		material: "metal",
		resistance: 35,
		color: "#c45c4a"
	},
	{
		id: "furgoneta",
		name: "Furgoneta",
		group: "vehiculos",
		kind: "van",
		w: 2.2,
		h: 2.2,
		d: 5.2,
		mass: 140,
		material: "metal",
		resistance: 40,
		color: "#4a5a4e"
	},
	{
		id: "camion",
		name: "Camión",
		group: "vehiculos",
		kind: "truck",
		w: 2.6,
		h: 2.6,
		d: 7.4,
		mass: 280,
		material: "metal",
		resistance: 48,
		color: "#c9a227"
	},
	{
		id: "contenedor",
		name: "Contenedor",
		group: "objetos",
		kind: "box",
		w: 6,
		h: 2.6,
		d: 2.5,
		mass: 420,
		material: "acero",
		resistance: 76,
		color: "#3a6e8a"
	},
	{
		id: "barrera",
		name: "Barrera",
		group: "objetos",
		kind: "box",
		w: 2.1,
		h: .9,
		d: .42,
		mass: 48,
		material: "hormigón",
		resistance: 42,
		color: "#c9b48a"
	},
	{
		id: "farola",
		name: "Farola",
		group: "objetos",
		kind: "lamp",
		w: .28,
		h: 5.5,
		d: .28,
		mass: 28,
		material: "acero",
		resistance: 22,
		color: "#3a3e44"
	},
	{
		id: "caja",
		name: "Caja",
		group: "objetos",
		kind: "box",
		w: 1.2,
		h: 1.2,
		d: 1.2,
		mass: 32,
		material: "madera",
		resistance: 22,
		color: "#8a6a3c"
	},
	{
		id: "cisterna",
		name: "Cisterna",
		group: "objetos",
		kind: "tank",
		w: 2.2,
		h: 2.2,
		d: 4.4,
		mass: 260,
		material: "acero",
		resistance: 60,
		color: "#6a7470"
	},
	{
		id: "rampa",
		name: "Rampa",
		group: "terreno",
		kind: "ramp",
		w: 6,
		h: 2.4,
		d: 8,
		mass: 500,
		material: "hormigón",
		resistance: 90,
		color: "#6e6a64"
	},
	{
		id: "plataforma",
		name: "Plataforma",
		group: "terreno",
		kind: "box",
		w: 8,
		h: .6,
		d: 8,
		mass: 640,
		material: "hormigón",
		resistance: 92,
		color: "#7a766e"
	},
	{
		id: "muro-contencion",
		name: "Muro de contención",
		group: "terreno",
		kind: "box",
		w: 8,
		h: 3.2,
		d: 1.1,
		mass: 700,
		material: "hormigón",
		resistance: 88,
		color: "#6c6860"
	}
];
var CHALLENGES = [
	{
		id: "libre",
		title: "Modo libre",
		brief: "Sin objetivos. Experimenta con la ciudad a tu ritmo."
	},
	{
		id: "precision",
		title: "Precisión estructural",
		brief: "Destruye el edificio central sin derribar el edificio azul."
	},
	{
		id: "cadena",
		title: "Colapso en cadena",
		brief: "Provoca un colapso en cadena de al menos 8 piezas en menos de 4 segundos."
	},
	{
		id: "puntuacion",
		title: "Puntuación máxima",
		brief: "Consigue la máxima puntuación de destrucción en una sola simulación."
	},
	{
		id: "puente",
		title: "Cirugía de puente",
		brief: "Haz caer el puente utilizando la menor fuerza posible (potencia ≤ 40)."
	}
];
function catalogById(id) {
	return CATALOG.find((c) => c.id === id);
}
function materialLabel(mat) {
	return mat.charAt(0).toUpperCase() + mat.slice(1);
}
var fxId = 1;
var debrisSeq = 1;
var Simulation = class {
	bodies = /* @__PURE__ */ new Map();
	trauma = 0;
	flash = 0;
	simTime = 0;
	wind = {
		x: 0,
		z: 0,
		until: 0
	};
	rumble = 0;
	rumbleIntensity = 0;
	explosions = [];
	shockwaves = [];
	dust = [];
	debrisQueue = [];
	meteorQueue = [];
	chainWindow = 0;
	chainCount = 0;
	fps = 60;
	scoreListeners = /* @__PURE__ */ new Set();
	fxListeners = /* @__PURE__ */ new Set();
	onScore(fn) {
		this.scoreListeners.add(fn);
		return () => this.scoreListeners.delete(fn);
	}
	onFx(fn) {
		this.fxListeners.add(fn);
		return () => this.fxListeners.delete(fn);
	}
	emitFx() {
		this.fxListeners.forEach((fn) => fn());
	}
	emitScore(evt) {
		this.scoreListeners.forEach((fn) => fn(evt));
	}
	reset() {
		this.bodies.clear();
		this.trauma = 0;
		this.flash = 0;
		this.simTime = 0;
		this.wind = {
			x: 0,
			z: 0,
			until: 0
		};
		this.rumble = 0;
		this.rumbleIntensity = 0;
		this.explosions = [];
		this.shockwaves = [];
		this.dust = [];
		this.debrisQueue = [];
		this.meteorQueue = [];
		this.chainWindow = 0;
		this.chainCount = 0;
	}
	register(partial) {
		const health = partial.health ?? 100;
		this.bodies.set(partial.id, {
			...partial,
			health,
			maxHealth: health,
			body: null,
			object: null,
			awakened: false,
			destroyed: false,
			pendingImpulse: null,
			pendingTorque: null,
			awakenReact: null,
			hideReact: null,
			collapseDelay: 0
		});
	}
	attach(id, body, object, awakenReact, hideReact) {
		const sb = this.bodies.get(id);
		if (!sb) return;
		sb.body = body;
		sb.object = object;
		sb.awakenReact = awakenReact;
		if (hideReact) sb.hideReact = hideReact;
	}
	unregister(id) {
		this.bodies.delete(id);
	}
	get(id) {
		return this.bodies.get(id);
	}
	awaken(sb) {
		if (sb.destroyed) return;
		if (sb.awakened) {
			this.applyPending(sb);
			return;
		}
		sb.awakened = true;
		this.noteChain();
		sb.awakenReact?.();
	}
	noteChain() {
		if (this.chainWindow <= 0) this.chainCount = 0;
		this.chainWindow = 4;
		this.chainCount += 1;
	}
	explode(x, y, z, power, radius) {
		this.trauma = Math.min(1, this.trauma + .28 + power / 500);
		this.flash = Math.min(1, .35 + power / 280);
		this.explosions.push({
			id: fxId++,
			x,
			y,
			z,
			power,
			radius,
			t: 0
		});
		this.shockwaves.push({
			id: fxId++,
			x,
			y,
			z,
			radius,
			t: 0
		});
		this.dust.push({
			id: fxId++,
			x,
			y,
			z,
			power,
			t: 0
		});
		this.emitFx();
		let hit = 0;
		let destroyed = 0;
		let damageAcc = 0;
		for (const sb of this.bodies.values()) {
			if (!sb.body || sb.destroyed) continue;
			const p = sb.body.translation();
			const dx = p.x - x;
			const dy = p.y - y;
			const dz = p.z - z;
			const dist = Math.hypot(dx, dy, dz);
			if (dist > radius || dist < 1e-4) continue;
			const falloff = 1 - dist / radius;
			const intensity = power * falloff * falloff;
			const dmg = intensity * (.55 + (1 - sb.resistance / 100) * .9);
			sb.health = Math.max(0, sb.health - dmg);
			damageAcc += dmg;
			hit += 1;
			if (intensity >= 12 + sb.resistance * .45 || sb.health < sb.maxHealth * .88) {
				const inv = 1 / dist;
				const mass = Math.max(8, sb.mass);
				const mag = intensity * .18 * Math.sqrt(mass);
				sb.pendingImpulse = {
					x: dx * inv * mag,
					y: dy * inv * mag + mag * .42,
					z: dz * inv * mag
				};
				sb.pendingTorque = {
					x: (Math.random() - .5) * mag * .18,
					y: (Math.random() - .5) * mag * .18,
					z: (Math.random() - .5) * mag * .18
				};
				this.awaken(sb);
			}
			if (sb.health <= 0) {
				this.fragment(sb);
				destroyed += 1;
			}
		}
		this.scheduleUnsupported();
		this.emitScore({
			damage: damageAcc,
			destroyed: 0,
			chain: this.chainCount,
			kind: "explosion"
		});
		return {
			hit,
			destroyed,
			chain: this.chainCount
		};
	}
	applyPending(sb) {
		const rb = sb.body;
		if (!rb || !sb.awakened) return;
		try {
			rb.setBodyType(0, true);
			rb.wakeUp();
			if (sb.pendingImpulse) {
				rb.applyImpulse(sb.pendingImpulse, true);
				sb.pendingImpulse = null;
			}
			if (sb.pendingTorque) {
				rb.applyTorqueImpulse(sb.pendingTorque, true);
				sb.pendingTorque = null;
			}
		} catch {}
	}
	fragment(sb) {
		if (sb.destroyed) return;
		sb.destroyed = true;
		sb.hideReact?.();
		const rb = sb.body;
		if (rb && sb.kind !== "debris") {
			const p = rb.translation();
			const v = rb.linvel();
			const [w, h, d] = sb.size;
			const pieces = w * h * d > 8 ? 5 : 3;
			for (let i = 0; i < pieces; i++) {
				const s = .32 + Math.random() * .22;
				this.debrisQueue.push({
					id: `debris-${debrisSeq++}`,
					x: p.x + (Math.random() - .5) * w * .4,
					y: p.y + (Math.random() - .5) * h * .3,
					z: p.z + (Math.random() - .5) * d * .4,
					vx: v.x + (Math.random() - .5) * 6,
					vy: v.y + 2 + Math.random() * 4,
					vz: v.z + (Math.random() - .5) * 6,
					w: Math.max(.35, w * s),
					h: Math.max(.28, h * s),
					d: Math.max(.35, d * s),
					color: sb.color,
					material: sb.material
				});
			}
			this.emitFx();
		}
		this.emitScore({
			damage: 20,
			destroyed: 1,
			chain: this.chainCount,
			buildingId: sb.buildingId,
			kind: sb.kind
		});
	}
	earthquake(intensity) {
		this.rumble = 3.2;
		this.rumbleIntensity = intensity;
		this.trauma = Math.min(1, this.trauma + .25 + intensity * .2);
		this.emitFx();
		for (const sb of this.bodies.values()) {
			if (!sb.body || sb.destroyed) continue;
			if (sb.kind === "terrain") continue;
			if (sb.body.translation().y > 14) continue;
			const chance = intensity * (1.1 - sb.resistance / 140);
			if (Math.random() < chance * .55 || intensity > .75) {
				const mass = Math.max(8, sb.mass);
				const mag = intensity * mass * 1.8;
				sb.pendingImpulse = {
					x: (Math.random() - .5) * mag * 2.2,
					y: intensity * mass * .55,
					z: (Math.random() - .5) * mag * 2.2
				};
				this.awaken(sb);
			}
		}
		this.scheduleUnsupported();
		this.emitScore({
			damage: intensity * 40,
			destroyed: 0,
			chain: this.chainCount,
			kind: "earthquake"
		});
	}
	shockwave(x, z, power) {
		this.explode(x, 1.2, z, power * .75, 10 + power * .18);
	}
	startWind(strength, dirX = 1, dirZ = .15) {
		const len = Math.hypot(dirX, dirZ) || 1;
		this.wind = {
			x: dirX / len * strength * 18,
			z: dirZ / len * strength * 18,
			until: this.simTime + 4.5
		};
		for (const sb of this.bodies.values()) {
			if (sb.kind === "terrain" || sb.destroyed) continue;
			if (sb.resistance < 50 || strength > .7) this.awaken(sb);
		}
	}
	collapseBuilding(buildingId) {
		[...this.bodies.values()].filter((b) => b.buildingId === buildingId && !b.destroyed).sort((a, b) => (a.floorIndex ?? 0) - (b.floorIndex ?? 0)).forEach((sb, i) => {
			sb.collapseDelay = .05 + i * .07;
		});
	}
	collapseAll() {
		new Set([...this.bodies.values()].map((b) => b.buildingId).filter(Boolean)).forEach((id) => this.collapseBuilding(id));
	}
	spawnMeteor(x, z, power) {
		this.meteorQueue.push({
			id: `meteor-${debrisSeq++}`,
			x,
			z,
			power
		});
		this.emitFx();
	}
	scheduleUnsupported() {
		const byBuilding = /* @__PURE__ */ new Map();
		for (const sb of this.bodies.values()) {
			if (!sb.buildingId || sb.destroyed) continue;
			const list = byBuilding.get(sb.buildingId) ?? [];
			list.push(sb);
			byBuilding.set(sb.buildingId, list);
		}
		for (const list of byBuilding.values()) {
			list.sort((a, b) => (a.floorIndex ?? 0) - (b.floorIndex ?? 0));
			let lost = false;
			for (const sb of list) {
				if (lost && !sb.awakened) sb.collapseDelay = .08 + (sb.floorIndex ?? 0) * .05;
				if (sb.awakened || sb.destroyed || sb.health < sb.maxHealth * .4) lost = true;
			}
		}
	}
	tickFx(dt) {
		this.simTime += dt;
		this.trauma = Math.max(0, this.trauma - dt * 1.15);
		this.flash = Math.max(0, this.flash - dt * 2.4);
		this.chainWindow = Math.max(0, this.chainWindow - dt);
		if (this.chainWindow <= 0) this.chainCount = 0;
		this.rumble = Math.max(0, this.rumble - dt);
		for (const sb of this.bodies.values()) {
			if (sb.collapseDelay > 0) {
				sb.collapseDelay -= dt;
				if (sb.collapseDelay <= 0) {
					const mass = Math.max(8, sb.mass);
					sb.pendingImpulse = {
						x: (Math.random() - .5) * mass * .4,
						y: -mass * .2,
						z: (Math.random() - .5) * mass * .4
					};
					this.awaken(sb);
				}
			}
			if (sb.awakened && sb.body && !sb.destroyed) {
				if (sb.body.translation().y < -12) this.fragment(sb);
			}
		}
		this.explosions = this.explosions.filter((e) => {
			e.t += dt;
			return e.t < 1.6;
		});
		this.shockwaves = this.shockwaves.filter((e) => {
			e.t += dt;
			return e.t < 1.1;
		});
		this.dust = this.dust.filter((e) => {
			e.t += dt;
			return e.t < 2.4;
		});
	}
	applyWindAndRumble() {
		const rumbling = this.rumble > 0;
		const windy = this.simTime < this.wind.until;
		if (!rumbling && !windy) return;
		for (const sb of this.bodies.values()) {
			const rb = sb.body;
			if (!rb || sb.destroyed || !sb.awakened) continue;
			const mass = Math.max(4, sb.mass);
			if (windy) rb.addForce({
				x: this.wind.x * mass * .35,
				y: 0,
				z: this.wind.z * mass * .35
			}, true);
			if (rumbling) {
				const k = this.rumbleIntensity * mass * 2.4;
				rb.applyImpulse({
					x: (Math.random() - .5) * k,
					y: Math.random() * k * .12,
					z: (Math.random() - .5) * k
				}, true);
			}
		}
	}
	placeAt(id, x, z) {
		const sb = this.bodies.get(id);
		if (!sb?.body || sb.destroyed) return;
		const y = Math.max(sb.size[1] / 2 + .05, sb.body.translation().y);
		sb.body.setTranslation({
			x,
			y,
			z
		}, true);
		sb.body.setLinvel({
			x: 0,
			y: 0,
			z: 0
		}, true);
		sb.body.setAngvel({
			x: 0,
			y: 0,
			z: 0
		}, true);
	}
	rotateY(id, dyaw) {
		const sb = this.bodies.get(id);
		if (!sb?.body || sb.destroyed) return;
		const r = sb.body.rotation();
		const half = dyaw / 2;
		const sy = Math.sin(half);
		const cy = Math.cos(half);
		sb.body.setRotation({
			x: cy * r.x + sy * r.z,
			y: cy * r.y + sy * r.w,
			z: cy * r.z - sy * r.x,
			w: cy * r.w - sy * r.y
		}, true);
	}
	liveState(id) {
		const sb = this.bodies.get(id);
		if (!sb) return null;
		const p = sb.body?.translation();
		const r = sb.body?.rotation();
		const v = sb.body?.linvel();
		const speed = v ? Math.hypot(v.x, v.y, v.z) : 0;
		let estado = "Estable";
		if (sb.destroyed || p && p.y < -4) estado = "Destruido";
		else if (sb.awakened && speed > 1.5) estado = "En colapso";
		else if (sb.awakened) estado = "Inestable";
		else if (sb.health < sb.maxHealth * .45) estado = "Fisurado grave";
		else if (sb.health < sb.maxHealth * .8) estado = "Fisurado";
		return {
			...sb,
			px: p?.x ?? 0,
			py: p?.y ?? 0,
			pz: p?.z ?? 0,
			rx: r?.x ?? 0,
			ry: r?.y ?? 0,
			rz: r?.z ?? 0,
			rw: r?.w ?? 1,
			speed,
			estado
		};
	}
	buildingDestroyed(buildingId) {
		const pieces = [...this.bodies.values()].filter((b) => b.buildingId === buildingId);
		if (!pieces.length) return false;
		return pieces.filter((b) => {
			if (b.destroyed) return true;
			const p = b.body?.translation();
			return b.awakened && p && (p.y < 1.2 || Math.abs(p.x) + Math.abs(p.z) > 80);
		}).length / pieces.length > .55;
	}
	bridgeDown() {
		const segs = [...this.bodies.values()].filter((b) => b.kind === "bridge");
		if (!segs.length) return false;
		return segs.filter((s) => s.awakened || s.destroyed).length >= segs.length * .5;
	}
};
var sim = new Simulation();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
function formatEs(n, digits = 0) {
	return n.toLocaleString("es-ES", {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	});
}
var TIME_SCALES = [
	.25,
	.5,
	1,
	2,
	5,
	10
];
function loadBest() {
	if (typeof localStorage === "undefined") return 0;
	const n = Number(localStorage.getItem("destruct-lab-best") ?? 0);
	return Number.isFinite(n) ? n : 0;
}
function simLabel(paused, scale) {
	if (paused) return "Pausada";
	if (scale < 1) return `Cámara lenta ${scale.toString().replace(".", ",")}×`;
	if (scale > 1) return `Acelerada ${scale.toString().replace(".", ",")}×`;
	return "En curso";
}
var useLab = create((set, get) => ({
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
	explosion: {
		power: 70,
		radius: 16,
		height: 2.4,
		x: 0,
		z: 0
	},
	marker: {
		x: 0,
		y: 2.4,
		z: 0
	},
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
	replay: {
		available: false,
		recording: [],
		playing: false,
		cursor: 0
	},
	lastMessage: "Listo para experimentar.",
	aiBusy: false,
	aiLog: [],
	shakeEnabled: true,
	quality: "alta",
	sceneReady: false,
	hoverGround: null,
	start: () => set({ started: true }),
	setPaused: (v) => set({
		paused: v,
		simLabel: simLabel(v, get().timeScale)
	}),
	togglePaused: () => {
		const paused = !get().paused;
		set({
			paused,
			simLabel: simLabel(paused, get().timeScale)
		});
	},
	setTimeScale: (v) => set({
		timeScale: v,
		paused: false,
		simLabel: simLabel(false, v)
	}),
	setTool: (t) => set({
		tool: t,
		leftTab: t === "place" ? get().leftTab : get().leftTab
	}),
	setCameraMode: (m) => set({ cameraMode: m }),
	setOrbitEnabled: (v) => set({ orbitEnabled: v }),
	select: (id) => set({
		selectedId: id,
		rightOpen: id ? true : get().rightOpen
	}),
	setCatalog: (id) => set({
		catalogId: id,
		tool: id ? "place" : get().tool
	}),
	setLeftTab: (t) => set({
		leftTab: t,
		leftOpen: true
	}),
	setLeftOpen: (v) => set({ leftOpen: v }),
	setRightOpen: (v) => set({ rightOpen: v }),
	setAiOpen: (v) => set({ aiOpen: v }),
	setHelpOpen: (v) => set({ helpOpen: v }),
	setExplosion: (p) => set({ explosion: {
		...get().explosion,
		...p
	} }),
	setMarker: (m) => set({ marker: m }),
	setTransformMode: (m) => set({ transformMode: m }),
	setChallenge: (id) => set({
		challenge: id,
		challengeStatus: id === "libre" ? "idle" : "progress",
		lastMessage: id === "libre" ? "Modo libre." : "Reto activado. Observa el panel de puntuación."
	}),
	setFps: (n) => set({ fps: n }),
	setObjects: (n) => set({ objects: n }),
	setSceneReady: (v) => set({ sceneReady: v }),
	setHoverGround: (p) => set({ hoverGround: p }),
	setShakeEnabled: (v) => set({ shakeEnabled: v }),
	setQuality: (q) => set({ quality: q }),
	addScore: ({ damage, destroyed, chain, buildingId }) => {
		const add = Math.round(damage * .35 + destroyed * 48 + Math.max(0, chain - 1) * 12);
		const score = get().score + add;
		const bestChain = Math.max(get().bestChain, chain);
		const bestScore = Math.max(get().bestScore, score);
		if (bestScore > get().bestScore && typeof localStorage !== "undefined") localStorage.setItem("destruct-lab-best", String(bestScore));
		let challengeStatus = get().challengeStatus;
		const ch = get().challenge;
		if (ch === "precision" && challengeStatus === "progress") {
			if (sim.buildingDestroyed("east-blue")) challengeStatus = "fail";
			else if (sim.buildingDestroyed("east-center")) challengeStatus = "win";
		}
		if (ch === "cadena" && chain >= 8) challengeStatus = "win";
		if (ch === "puente" && sim.bridgeDown()) {
			const last = get().replay.recording[get().replay.recording.length - 1];
			challengeStatus = (typeof last?.payload.power === "number" ? last.payload.power : 99) <= 40 ? "win" : "fail";
		}
		if (ch === "puntuacion" && score >= 2500) challengeStatus = "win";
		set({
			score,
			damage: get().damage + damage,
			destroyed: get().destroyed + destroyed,
			chain,
			bestChain,
			bestScore,
			challengeStatus
		});
	},
	spawnExtra: (item) => set({ extras: [...get().extras, item] }),
	spawnFromCatalog: (catalogId, x, y, z) => {
		const cat = catalogById(catalogId);
		if (!cat) return;
		const item = {
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
			buildingId: cat.kind === "building" ? uid("b") : void 0
		};
		set({
			extras: [...get().extras, item],
			lastMessage: `Colocado: ${cat.name}`
		});
		get().record({
			t: sim.simTime,
			type: "spawn",
			payload: {
				catalogId,
				x,
				y,
				z
			}
		});
	},
	pushDebris: (items) => {
		set({ debris: [...get().debris, ...items].slice(-90) });
	},
	pushMeteor: (m) => set({ meteors: [...get().meteors, m] }),
	removeMeteor: (id) => set({ meteors: get().meteors.filter((m) => m.id !== id) }),
	removeExtra: (id) => {
		sim.unregister(id);
		set({
			extras: get().extras.filter((e) => e.id !== id),
			selectedId: get().selectedId === id ? null : get().selectedId
		});
	},
	record: (a) => {
		if (get().replay.playing) return;
		set({ replay: {
			available: true,
			recording: [...get().replay.recording, a],
			playing: false,
			cursor: 0
		} });
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
			marker: {
				x: 0,
				y: get().explosion.height,
				z: 0
			},
			replay: get().replay.playing ? get().replay : {
				available: get().replay.available,
				recording: [],
				playing: false,
				cursor: 0
			}
		});
	},
	startReplay: () => {
		const rec = get().replay.recording;
		if (!rec.length) return;
		set({
			replay: {
				available: true,
				recording: rec,
				playing: true,
				cursor: 0
			},
			timeScale: .5,
			paused: false,
			simLabel: simLabel(false, .5),
			lastMessage: "Repetición en cámara lenta."
		});
		get().resetWorld();
		set({ replay: {
			available: true,
			recording: rec,
			playing: true,
			cursor: 0
		} });
	},
	stopReplay: () => set({
		replay: {
			...get().replay,
			playing: false
		},
		lastMessage: "Repetición finalizada."
	}),
	consumeReplayAt: (t) => {
		const { replay } = get();
		if (!replay.playing) return [];
		const due = [];
		let cursor = replay.cursor;
		while (cursor < replay.recording.length && replay.recording[cursor].t <= t + .02) {
			due.push(replay.recording[cursor]);
			cursor += 1;
		}
		if (cursor !== replay.cursor) set({ replay: {
			...replay,
			cursor
		} });
		if (cursor >= replay.recording.length && t > (replay.recording.at(-1)?.t ?? 0) + 4) get().stopReplay();
		return due;
	},
	setMessage: (msg) => set({ lastMessage: msg }),
	pushAi: (role, text) => set({ aiLog: [...get().aiLog, {
		role,
		text
	}].slice(-12) }),
	setAiBusy: (v) => set({ aiBusy: v })
}));
var ctx = null;
function unlockAudio() {
	if (typeof window === "undefined") return;
	if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
	if (ctx.state === "suspended") ctx.resume();
}
function noiseBuffer(duration) {
	if (!ctx) return null;
	const rate = ctx.sampleRate;
	const len = Math.floor(rate * duration);
	const buffer = ctx.createBuffer(1, len, rate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
	return buffer;
}
function playBoom(power) {
	if (!ctx) return;
	const t = ctx.currentTime;
	const gain = ctx.createGain();
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.setValueAtTime(180 + power * 2, t);
	const src = ctx.createBufferSource();
	const buf = noiseBuffer(.9);
	if (!buf) return;
	src.buffer = buf;
	src.connect(filter);
	filter.connect(gain);
	gain.connect(ctx.destination);
	const amp = Math.min(.55, .12 + power / 400);
	gain.gain.setValueAtTime(amp, t);
	gain.gain.exponentialRampToValueAtTime(.001, t + .8);
	const osc = ctx.createOscillator();
	const og = ctx.createGain();
	osc.type = "sine";
	osc.frequency.setValueAtTime(48 + power * .15, t);
	osc.frequency.exponentialRampToValueAtTime(28, t + .5);
	og.gain.setValueAtTime(amp * .7, t);
	og.gain.exponentialRampToValueAtTime(.001, t + .55);
	osc.connect(og);
	og.connect(ctx.destination);
	osc.start(t);
	osc.stop(t + .6);
	src.start(t);
	src.stop(t + .9);
}
function playRumble(intensity) {
	if (!ctx) return;
	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	const g = ctx.createGain();
	osc.type = "sawtooth";
	osc.frequency.value = 22 + intensity * 8;
	g.gain.setValueAtTime(Math.min(.18, .04 + intensity * .08), t);
	g.gain.exponentialRampToValueAtTime(.001, t + 1.6);
	osc.connect(g);
	g.connect(ctx.destination);
	osc.start(t);
	osc.stop(t + 1.7);
}
function playWhoosh() {
	if (!ctx) return;
	const t = ctx.currentTime;
	const src = ctx.createBufferSource();
	const buf = noiseBuffer(.5);
	if (!buf) return;
	src.buffer = buf;
	const filter = ctx.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.setValueAtTime(400, t);
	filter.frequency.exponentialRampToValueAtTime(1400, t + .4);
	const g = ctx.createGain();
	g.gain.setValueAtTime(.12, t);
	g.gain.exponentialRampToValueAtTime(.001, t + .45);
	src.connect(filter);
	filter.connect(g);
	g.connect(ctx.destination);
	src.start(t);
	src.stop(t + .5);
}
function playClick() {
	if (!ctx) return;
	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	const g = ctx.createGain();
	osc.type = "square";
	osc.frequency.value = 720;
	g.gain.setValueAtTime(.04, t);
	g.gain.exponentialRampToValueAtTime(.001, t + .06);
	osc.connect(g);
	g.connect(ctx.destination);
	osc.start(t);
	osc.stop(t + .07);
}
var keys = /* @__PURE__ */ new Set();
var injected = /* @__PURE__ */ new Set();
function isTypingTarget(target) {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}
function onDown(e) {
	if (isTypingTarget(e.target)) return;
	keys.add(e.code);
}
function onUp(e) {
	keys.delete(e.code);
}
function onBlur() {
	keys.clear();
}
var bound = false;
function bindInput() {
	if (bound || typeof window === "undefined") return () => {};
	bound = true;
	window.addEventListener("keydown", onDown);
	window.addEventListener("keyup", onUp);
	window.addEventListener("blur", onBlur);
	document.addEventListener("visibilitychange", onBlur);
	return () => {
		bound = false;
		window.removeEventListener("keydown", onDown);
		window.removeEventListener("keyup", onUp);
		window.removeEventListener("blur", onBlur);
		document.removeEventListener("visibilitychange", onBlur);
		keys.clear();
	};
}
function held(code) {
	return keys.has(code) || injected.has(code);
}
function setInjectedKeys(codes) {
	injected.clear();
	for (const c of codes) injected.add(c);
}
function isTyping(target) {
	return isTypingTarget(target);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var runExperiment = createServerFn({ method: "POST" }).validator((input) => ({ prompt: String(input?.prompt ?? "").slice(0, 500) })).handler(createSsrRpc("e44d30b97a798ed3ce10209ff61283265bb45682bdc89116105f630ab75f3e5f"));
var Scene = (0, import_react.lazy)(() => import("./Scene-C9MZP33_.mjs"));
function applyAction(a) {
	const lab = useLab.getState();
	switch (a.type) {
		case "explosion": {
			const power = a.power ?? lab.explosion.power;
			const radius = a.radius ?? lab.explosion.radius;
			const height = a.height ?? lab.explosion.height;
			const x = a.x ?? 0;
			const z = a.z ?? 0;
			lab.setExplosion({
				power,
				radius,
				height,
				x,
				z
			});
			lab.setMarker({
				x,
				y: height,
				z
			});
			sim.explode(x, height, z, power, radius);
			playBoom(power);
			lab.record({
				t: sim.simTime,
				type: "explosion",
				payload: {
					x,
					z,
					power,
					radius,
					height
				}
			});
			break;
		}
		case "earthquake": {
			const intensity = a.intensity ?? .75;
			sim.earthquake(intensity);
			playRumble(intensity);
			lab.record({
				t: sim.simTime,
				type: "earthquake",
				payload: { intensity }
			});
			break;
		}
		case "meteor": {
			const x = a.x ?? 0;
			const z = a.z ?? 0;
			const power = a.power ?? 80;
			sim.spawnMeteor(x, z, power);
			playWhoosh();
			lab.record({
				t: sim.simTime,
				type: "meteor",
				payload: {
					x,
					z,
					power
				}
			});
			break;
		}
		case "wind": {
			const strength = a.strength ?? .7;
			sim.startWind(strength);
			lab.record({
				t: sim.simTime,
				type: "wind",
				payload: { strength }
			});
			break;
		}
		case "collapse": {
			const target = a.target ?? "all";
			if (target === "all") sim.collapseAll();
			else if (target === "bridge") sim.collapseBuilding("bridge");
			else sim.collapseBuilding(target);
			lab.record({
				t: sim.simTime,
				type: "collapse",
				payload: { target }
			});
			break;
		}
		case "shockwave":
			sim.shockwave(a.x ?? 0, a.z ?? 0, a.power ?? 70);
			playBoom(a.power ?? 70);
			lab.record({
				t: sim.simTime,
				type: "shockwave",
				payload: {
					x: a.x ?? 0,
					z: a.z ?? 0,
					power: a.power ?? 70
				}
			});
			break;
		case "spawn":
			if (a.catalog) lab.spawnFromCatalog(a.catalog, a.x ?? 0, 0, a.z ?? 0);
			break;
		case "timescale":
			if (a.value === 0) lab.setPaused(true);
			else lab.setTimeScale(a.value ?? 1);
			break;
		case "reset":
			lab.resetWorld();
			break;
		case "camera": if (a.mode) lab.setCameraMode(a.mode);
	}
}
function detonateAt(x, z) {
	const lab = useLab.getState();
	const { power, radius, height } = lab.explosion;
	const px = x ?? lab.marker?.x ?? lab.explosion.x;
	const pz = z ?? lab.marker?.z ?? lab.explosion.z;
	lab.setMarker({
		x: px,
		y: height,
		z: pz
	});
	lab.setExplosion({
		x: px,
		z: pz
	});
	sim.explode(px, height, pz, power, radius);
	playBoom(power);
	lab.record({
		t: sim.simTime,
		type: "explosion",
		payload: {
			x: px,
			z: pz,
			power,
			radius,
			height
		}
	});
	lab.setMessage(`Explosión detonada · potencia ${formatEs(power)}`);
}
function LabApp() {
	const started = useLab((s) => s.started);
	const sceneReady = useLab((s) => s.sceneReady);
	(0, import_react.useEffect)(() => bindInput(), []);
	(0, import_react.useEffect)(() => {
		const unsub = sim.onScore((evt) => {
			useLab.getState().addScore(evt);
		});
		return () => {
			unsub();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		window.__lab = {
			detonate: detonateAt,
			pause: () => useLab.getState().setPaused(true),
			play: () => useLab.getState().setPaused(false),
			reset: () => useLab.getState().resetWorld(),
			getScore: () => useLab.getState().score,
			getBodyCount: () => sim.bodies.size,
			earthquake: (intensity = .8) => applyAction({
				type: "earthquake",
				intensity
			})
		};
		return () => {
			window.__lab = void 0;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (isTyping(e.target)) return;
			const lab = useLab.getState();
			if (e.code === "Space") {
				e.preventDefault();
				lab.togglePaused();
			}
			if (e.code === "Digit1") lab.setTimeScale(.25);
			if (e.code === "Digit2") lab.setTimeScale(.5);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			started && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingOverlay, {}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {})
			}),
			!started && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartScreen, {}),
			started && !sceneReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingOverlay, {}),
			started && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeftPanel, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightPanel, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiDrawer, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpOverlay, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChallengeBanner, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileChrome, {})
			] })
		]
	});
}
function StartScreen() {
	const start = useLab((s) => s.start);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-30 flex flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-60",
				style: { background: "radial-gradient(1200px 500px at 70% 20%, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 60%), linear-gradient(180deg, #0c0e12 0%, #070809 70%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-30",
				style: {
					backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
					backgroundSize: "48px 48px",
					maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] tracking-[0.42em] text-accent",
						children: "SIMULACIÓN ESTRUCTURAL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-sans text-5xl font-semibold tracking-[-0.04em] text-fg md:text-7xl",
						children: "DESTRUCT LAB"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted md:text-lg",
						children: "Laboratorio cinemático de destrucción. Construye una ciudad, aplica fuerzas y observa cómo el hormigón, el acero y el vidrio pierden estabilidad."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-10 min-h-12 rounded-lg bg-fg px-8 text-sm font-medium tracking-wide text-bg transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]",
						onClick: () => {
							unlockAudio();
							playClick();
							start();
						},
						children: "Entrar al laboratorio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-md text-xs leading-relaxed text-subtle",
						children: "Clic en el suelo para detonar. Pausa con espacio. El panel izquierdo coloca estructuras y dispara eventos."
					})
				]
			})
		]
	});
}
function LoadingOverlay() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-bg/70",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs tracking-[0.28em] text-muted",
			children: "INICIALIZANDO FÍSICA…"
		})
	});
}
function TopBar() {
	const fps = useLab((s) => s.fps);
	const objects = useLab((s) => s.objects);
	const simLabel = useLab((s) => s.simLabel);
	const score = useLab((s) => s.score);
	const setAiOpen = useLab((s) => s.setAiOpen);
	const setHelpOpen = useLab((s) => s.setHelpOpen);
	const setLeftOpen = useLab((s) => s.setLeftOpen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 md:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 items-center justify-center rounded-md border border-border bg-surface text-fg md:hidden",
					onClick: () => setLeftOpen(true),
					"aria-label": "Abrir herramientas",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-surface px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] tracking-[0.32em] text-accent",
						children: "DESTRUCT LAB"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted",
						children: "Laboratorio de destrucción"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto hidden items-center gap-2 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						chip: "FPS",
						value: String(fps)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						chip: "Objetos",
						value: String(objects)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						chip: "Estado",
						value: simLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						chip: "Puntuación",
						value: formatEs(score)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: () => setAiOpen(true),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }),
					children: "Experimento con IA"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-fg",
					onClick: () => setHelpOpen(true),
					"aria-label": "Ayuda",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-4" })
				})]
			})
		]
	});
}
function Stat({ chip, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface px-2.5 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[9px] uppercase tracking-[0.18em] text-subtle",
			children: chip
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs tabular-nums text-fg",
			children: value
		})]
	});
}
function GhostBtn({ children, onClick, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-fg hover:border-accent/40",
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children
		})]
	});
}
var TABS = [
	{
		id: "construccion",
		label: "Construcción",
		icon: BrickWall
	},
	{
		id: "estructuras",
		label: "Estructuras",
		icon: Building2
	},
	{
		id: "vehiculos",
		label: "Vehículos",
		icon: Car
	},
	{
		id: "objetos",
		label: "Objetos",
		icon: Box
	},
	{
		id: "terreno",
		label: "Terreno",
		icon: Mountain
	},
	{
		id: "eventos",
		label: "Eventos",
		icon: Zap
	}
];
function LeftPanel() {
	const tab = useLab((s) => s.leftTab);
	const open = useLab((s) => s.leftOpen);
	const setLeftTab = useLab((s) => s.setLeftTab);
	const setLeftOpen = useLab((s) => s.setLeftOpen);
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "absolute top-20 left-3 z-20 hidden size-10 items-center justify-center rounded-md border border-border bg-surface md:flex",
		onClick: () => setLeftOpen(true),
		"aria-label": "Mostrar panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("absolute top-20 bottom-20 left-0 z-20 flex w-[min(100%,320px)] flex-col border-r border-border bg-surface md:top-20 md:bottom-20 md:left-3 md:w-[300px] md:rounded-lg md:border", "max-md:top-0 max-md:bottom-0"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] tracking-[0.22em] text-subtle",
					children: "HERRAMIENTAS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-8 items-center justify-center rounded-sm text-muted hover:text-fg",
					onClick: () => setLeftOpen(false),
					"aria-label": "Cerrar panel",
					children: typeof window !== "undefined" && window.innerWidth < 768 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto border-b border-border p-2",
				children: TABS.map((t) => {
					const Icon = t.icon;
					const active = tab === t.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: t.label,
						onClick: () => setLeftTab(t.id),
						className: cn("flex size-10 shrink-0 items-center justify-center rounded-md border", active ? "border-accent/40 bg-surface-3 text-accent" : "border-transparent text-muted hover:bg-surface-2 hover:text-fg"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
					}, t.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lab-scroll min-h-0 flex-1 overflow-y-auto p-3",
				children: tab === "eventos" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventsPanel, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogPanel, { group: tab })
			})
		]
	});
}
function CatalogPanel({ group }) {
	const items = CATALOG.filter((c) => c.group === group);
	const catalogId = useLab((s) => s.catalogId);
	const setCatalog = useLab((s) => s.setCatalog);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: "Selecciona un elemento y haz clic en el suelo para colocarlo."
		}), items.map((item) => {
			const active = catalogId === item.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => {
					playClick();
					setCatalog(active ? null : item.id);
					if (!active) useLab.getState().setTool("place");
				},
				className: cn("flex flex-col items-start rounded-md border px-3 py-2.5 text-left", active ? "border-accent/50 bg-surface-3" : "border-border bg-surface-2 hover:border-subtle"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-fg",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-0.5 font-mono text-[10px] text-subtle",
					children: [item.material ? materialLabel(item.material) : "Estructura", item.w ? ` · ${item.w}×${item.h}×${item.d}` : ""]
				})]
			}, item.id);
		})]
	});
}
function EventsPanel() {
	const explosion = useLab((s) => s.explosion);
	const setExplosion = useLab((s) => s.setExplosion);
	const setTool = useLab((s) => s.setTool);
	const tool = useLab((s) => s.tool);
	const cameraMode = useLab((s) => s.cameraMode);
	const setCameraMode = useLab((s) => s.setCameraMode);
	const replay = useLab((s) => s.replay);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Explosión",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs text-muted",
						children: "Ajusta la carga y haz clic en el mundo para detonar."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Potencia",
						value: explosion.power,
						min: 10,
						max: 160,
						onChange: (v) => setExplosion({ power: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Radio de efecto",
						value: explosion.radius,
						min: 4,
						max: 36,
						onChange: (v) => setExplosion({ radius: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Altura",
						value: explosion.height,
						min: 0,
						max: 24,
						step: .5,
						onChange: (v) => setExplosion({ height: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Posición X",
							value: explosion.x,
							onChange: (v) => setExplosion({ x: v })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Posición Z",
							value: explosion.z,
							onChange: (v) => setExplosion({ z: v })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setTool("explode");
							playClick();
						},
						className: cn("mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-medium", tool === "explode" ? "bg-danger text-fg" : "bg-danger/80 text-fg hover:bg-danger"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-4" }), tool === "explode" ? "Clic para detonar" : "Armar explosión"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => detonateAt(explosion.x, explosion.z),
						className: "flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface-2 text-sm text-fg hover:bg-surface-3",
						children: "Detonar en la posición"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Otros eventos",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spline, { className: "size-4" }),
						label: "Terremoto",
						onClick: () => applyAction({
							type: "earthquake",
							intensity: .82
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }),
						label: "Impacto de meteorito",
						onClick: () => {
							setTool("meteor");
							useLab.getState().setMessage("Clic en el suelo para lanzar el meteorito.");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wind, { className: "size-4" }),
						label: "Onda expansiva",
						onClick: () => applyAction({
							type: "shockwave",
							power: 80,
							x: 0,
							z: 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-4" }),
						label: "Colapso estructural",
						onClick: () => applyAction({
							type: "collapse",
							target: "east-center"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wind, { className: "size-4" }),
						label: "Viento fuerte",
						onClick: () => applyAction({
							type: "wind",
							strength: .85
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Cámara",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-1.5",
					children: [
						[
							"orbit",
							"Órbita",
							Orbit
						],
						[
							"free",
							"Libre",
							Camera
						],
						[
							"cinematic",
							"Cinemática",
							Clapperboard
						],
						[
							"follow",
							"Seguimiento",
							Focus
						],
						[
							"fps",
							"Primera persona",
							PersonStanding
						]
					].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setCameraMode(id),
						className: cn("flex min-h-10 items-center gap-2 rounded-md border px-2 text-left text-xs", cameraMode === id ? "border-accent/40 bg-surface-3 text-fg" : "border-border text-muted hover:text-fg"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 shrink-0" }), label]
					}, id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[11px] leading-relaxed text-subtle",
					children: "Libre: WASD + clic derecho para mirar. Primera persona: clic en el lienzo y WASD."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Repetición",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: !replay.available || replay.recording.length === 0,
					onClick: () => useLab.getState().startReplay(),
					className: "flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface-2 text-sm disabled:opacity-40",
					children: "Repetir simulación"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[11px] text-subtle",
					children: "Tras un evento mayor puedes repetirlo en cámara lenta y cambiar el ángulo."
				})]
			})
		]
	});
}
function EventBtn({ icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => {
			playClick();
			onClick();
		},
		className: "mb-1.5 flex min-h-11 w-full items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm text-fg hover:bg-surface-3",
		children: [icon, label]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mb-2 font-mono text-[10px] tracking-[0.2em] text-subtle uppercase",
		children: title
	}), children] });
}
function Slider({ label, value, min, max, step = 1, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mb-2 block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mb-1 flex justify-between font-mono text-[10px] tracking-wider text-muted uppercase",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular-nums text-fg",
				children: formatEs(value, step < 1 ? 1 : 0)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min,
			max,
			step,
			value,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "w-full"
		})]
	});
}
function NumField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[10px] text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "number",
			value: Number.isFinite(value) ? value : 0,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "min-h-10 rounded-md border border-border bg-bg px-2 font-mono text-sm text-fg outline-none focus:border-accent"
		})]
	});
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
	const [tick, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setTick((n) => n + 1), 200);
		return () => window.clearInterval(id);
	}, []);
	const live = selectedId ? sim.liveState(selectedId) : null;
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "absolute top-20 right-3 z-20 hidden size-10 items-center justify-center rounded-md border border-border bg-surface md:flex",
		onClick: () => setRightOpen(true),
		"aria-label": "Mostrar inspector",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "absolute top-20 right-0 bottom-20 z-20 hidden w-[280px] flex-col border-l border-border bg-surface md:right-3 md:flex md:rounded-lg md:border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-border px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] tracking-[0.22em] text-subtle",
				children: "INSPECTOR"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex size-8 items-center justify-center text-muted hover:text-fg",
				onClick: () => setRightOpen(false),
				"aria-label": "Cerrar inspector",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lab-scroll min-h-0 flex-1 overflow-y-auto p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Objeto seleccionado",
					children: !live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Nada seleccionado. Cambia a la herramienta seleccionar y haz clic en una pieza."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Nombre",
								v: live.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Material",
								v: materialLabel(live.material)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Masa",
								v: `${formatEs(live.mass)} kg`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Tamaño",
								v: `${live.size[0].toFixed(1)} × ${live.size[1].toFixed(1)} × ${live.size[2].toFixed(1)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Resistencia",
								v: `${formatEs(live.resistance)} %`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Posición",
								v: `${live.px.toFixed(1)}, ${live.py.toFixed(1)}, ${live.pz.toFixed(1)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Estado estructural",
								v: live.estado
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 overflow-hidden rounded-full bg-surface-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-accent",
									style: { width: `${Math.max(0, live.health / live.maxHealth * 100)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[10px] text-subtle",
								children: [
									"Integridad ",
									formatEs(live.health / live.maxHealth * 100),
									" %"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 grid grid-cols-2 gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "flex min-h-10 items-center justify-center gap-1 rounded-md border border-border text-xs",
										onClick: () => {
											useLab.getState().setTool("move");
											useLab.getState().setMessage("Clic en el suelo para reposicionar.");
										},
										children: "Mover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "flex min-h-10 items-center justify-center gap-1 rounded-md border border-border text-xs",
										onClick: () => sim.rotateY(live.id, Math.PI / 12),
										children: "Rotar +15°"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex min-h-10 items-center justify-center gap-1 rounded-md border border-border text-xs",
										onClick: () => {
											const sb = sim.get(live.id);
											if (!sb) return;
											sim.awaken(sb);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }), " Liberar"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex min-h-10 items-center justify-center gap-1 rounded-md border border-border text-xs",
										onClick: () => {
											const sb = sim.get(live.id);
											if (!sb?.body) return;
											const p = sb.body.translation();
											const cat = catalogById("bloque");
											if (!cat) return;
											useLab.getState().spawnFromCatalog(cat.id, p.x + 2.2, 0, p.z);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), " Duplicar"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "col-span-2 flex min-h-10 items-center justify-center gap-1 rounded-md border border-danger/40 text-xs text-danger",
										onClick: () => {
											const sb = sim.get(live.id);
											if (sb) sim.fragment(sb);
											useLab.getState().select(null);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Eliminar"]
									})
								]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Retos",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-1.5",
							children: CHALLENGES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setChallenge(c.id),
								className: cn("rounded-md border px-2.5 py-2 text-left", challenge === c.id ? "border-accent/40 bg-surface-3" : "border-border hover:bg-surface-2"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium text-fg",
									children: c.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-[11px] leading-snug text-muted",
									children: c.brief
								})]
							}, c.id))
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Marcador",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Puntuación",
								v: formatEs(score)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Daño causado",
								v: formatEs(damage)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Objetos destruidos",
								v: formatEs(destroyed)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Cadena de destrucción",
								v: formatEs(chain)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Mejor puntuación",
								v: formatEs(bestScore)
							})
						]
					})
				})
			]
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[11px] tabular-nums text-fg",
			children: v
		})]
	});
}
function BottomBar() {
	const paused = useLab((s) => s.paused);
	const timeScale = useLab((s) => s.timeScale);
	const lastMessage = useLab((s) => s.lastMessage);
	const tool = useLab((s) => s.tool);
	const setTool = useLab((s) => s.setTool);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "absolute inset-x-0 bottom-0 z-20 border-t border-border bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2 px-3 py-2 md:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => useLab.getState().togglePaused(),
					className: "flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md bg-fg px-4 text-sm font-medium text-bg",
					children: [paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: paused ? "Reproducir" : "Pausar"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => useLab.getState().resetWorld(),
					className: "flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Reiniciar"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden h-6 w-px bg-border sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden font-mono text-[10px] tracking-[0.16em] text-subtle uppercase sm:block",
					children: "Velocidad de simulación"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: TIME_SCALES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => useLab.getState().setTimeScale(s),
						className: cn("min-h-9 min-w-10 rounded-md px-2 font-mono text-xs tabular-nums", timeScale === s && !paused ? "bg-surface-3 text-accent" : "text-muted hover:text-fg"),
						children: [s.toString().replace(".", ","), "×"]
					}, s))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ml-auto hidden items-center gap-1 md:flex",
					children: [
						["select", "Seleccionar"],
						["move", "Mover"],
						["place", "Colocar"],
						["explode", "Explotar"],
						["meteor", "Meteorito"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTool(id),
						className: cn("min-h-9 rounded-md px-2.5 text-xs", tool === id ? "bg-surface-3 text-fg" : "text-muted hover:text-fg"),
						children: label
					}, id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border px-3 py-1.5 md:px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate font-mono text-[11px] text-muted",
				children: lastMessage
			})
		})]
	});
}
function AiDrawer() {
	const open = useLab((s) => s.aiOpen);
	const busy = useLab((s) => s.aiBusy);
	const log = useLab((s) => s.aiLog);
	const [text, setText] = (0, import_react.useState)("");
	const listRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
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
		} catch {}
		lab.pushAi("lab", result.message);
		lab.setMessage(result.message);
		for (const a of result.actions) applyAction(a);
		lab.setAiBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-40 flex items-end justify-center bg-bg/50 p-3 md:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex max-h-[min(640px,86dvh)] w-full max-w-lg flex-col rounded-xl border border-border bg-surface",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] tracking-[0.22em] text-accent",
						children: "EXPERIMENTO CON IA"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Describe el ensayo en español"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-9 items-center justify-center rounded-md text-muted hover:text-fg",
						onClick: () => useLab.getState().setAiOpen(false),
						"aria-label": "Cerrar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: listRef,
					className: "lab-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3",
					children: [log.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted",
						children: "Ejemplo: «Construye un puente de 200 metros y provoca un terremoto fuerte.»"
					}), log.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("rounded-md px-3 py-2 text-sm", m.role === "user" ? "bg-surface-3 text-fg" : "bg-bg text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 font-mono text-[10px] tracking-wider text-subtle uppercase",
							children: m.role === "user" ? "Tú" : "Laboratorio"
						}), m.text]
					}, `${m.role}-${i}`))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2 border-t border-border p-3",
					onSubmit: (e) => {
						e.preventDefault();
						submit();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: text,
						onChange: (e) => setText(e.target.value),
						placeholder: "Escribe el experimento…",
						className: "min-h-11 flex-1 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy,
						className: "min-h-11 rounded-md bg-fg px-4 text-sm font-medium text-bg disabled:opacity-50",
						children: busy ? "…" : "Ejecutar"
					})]
				})
			]
		})
	});
}
function HelpOverlay() {
	const open = useLab((s) => s.helpOpen);
	const shake = useLab((s) => s.shakeEnabled);
	const quality = useLab((s) => s.quality);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-40 flex items-center justify-center bg-bg/50 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[86dvh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-medium",
						children: "Controles"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useLab.getState().setHelpOpen(false),
						className: "flex size-9 items-center justify-center text-muted",
						"aria-label": "Cerrar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Clic en el suelo — detonar (herramienta explosión)" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Espacio — pausar / reanudar" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1–6 — velocidad de simulación" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Órbita — arrastrar para orbitar, rueda para zoom, clic derecho para pan" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Cámara libre — WASD, Q/E altura, clic derecho mira" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Primera persona — clic para capturar el puntero, WASD para moverte" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Seleccionar + Mover — clic en pieza, luego clic en el suelo" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "H — esta ayuda · I — experimento con IA" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-2 border-t border-border pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex min-h-11 items-center justify-between rounded-md border border-border px-3 text-sm",
						onClick: () => useLab.getState().setShakeEnabled(!shake),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sacudida de cámara" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-accent",
							children: shake ? "Sí" : "No"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex min-h-11 items-center justify-between rounded-md border border-border px-3 text-sm",
						onClick: () => useLab.getState().setQuality(quality === "alta" ? "media" : "alta"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Calidad gráfica" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-accent",
							children: quality === "alta" ? "Alta" : "Media"
						})]
					})]
				})
			]
		})
	});
}
function ChallengeBanner() {
	const status = useLab((s) => s.challengeStatus);
	const challenge = useLab((s) => s.challenge);
	const def = (0, import_react.useMemo)(() => CHALLENGES.find((c) => c.id === challenge), [challenge]);
	if (challenge === "libre" || status === "idle" || !def) return null;
	const win = status === "win";
	const fail = status === "fail";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute top-20 left-1/2 z-20 hidden w-[min(420px,calc(100%-360px))] -translate-x-1/2 md:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("rounded-md border bg-surface/95 px-3 py-2 text-center", win ? "border-ok/40" : fail ? "border-danger/40" : "border-border"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] tracking-[0.18em] text-subtle uppercase",
				children: win ? "Reto superado" : fail ? "Reto fallido" : "Reto activo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: def.brief
			})]
		})
	});
}
function MobileChrome() {
	const fps = useLab((s) => s.fps);
	const score = useLab((s) => s.score);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute top-16 right-3 z-20 flex flex-col items-end gap-1 md:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10px] tabular-nums text-muted",
			children: [
				fps,
				" FPS · ",
				formatEs(score),
				" pts"
			]
		})
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => SplitComponent });
var SplitComponent = LabApp;
//#endregion
export { useLab as a, BUILDINGS as c, LAMPS as d, VEHICLES as f, playBoom as i, CRATES as l, held as n, sim as o, setInjectedKeys as r, BARRIERS as s, routes_exports as t, FLOOR_H as u };

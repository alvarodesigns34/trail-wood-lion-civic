import { i as __toESM } from "../_runtime.mjs";
import { E as require_react, T as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as parseCommand } from "./parse-command-CuRKwh1c.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { C as Car, D as Box, E as BrickWall, S as ChevronLeft, T as Building2, _ as Crosshair, a as Trash2, b as CircleHelp, c as RotateCcw, d as Pause, f as Orbit, g as Eye, h as Focus, l as Play, m as Menu, n as X, o as Spline, p as Mountain, r as Wind, s as Sparkles, t as Zap, u as PersonStanding, v as Copy, w as Camera, x as ChevronRight, y as Clapperboard } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CJrUI0DA.js
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
var MATERIALS = {
	hormigon: {
		id: "hormigon",
		label: "Hormigón",
		density: 2300,
		strength: 95,
		toughness: 200,
		restitution: .02,
		friction: .86,
		brittle: .62,
		dust: "#b9b2a4"
	},
	"hormigon-armado": {
		id: "hormigon-armado",
		label: "Hormigón armado",
		density: 2500,
		strength: 175,
		toughness: 350,
		restitution: .02,
		friction: .88,
		brittle: .42,
		dust: "#b3aca0"
	},
	ladrillo: {
		id: "ladrillo",
		label: "Ladrillo",
		density: 1800,
		strength: 32,
		toughness: 60,
		restitution: .03,
		friction: .9,
		brittle: .82,
		dust: "#c09a80"
	},
	acero: {
		id: "acero",
		label: "Acero",
		density: 2200,
		strength: 260,
		toughness: 600,
		restitution: .1,
		friction: .52,
		brittle: .08,
		dust: "#98a0a8"
	},
	metal: {
		id: "metal",
		label: "Metal",
		density: 340,
		strength: 40,
		toughness: 170,
		restitution: .08,
		friction: .58,
		brittle: .1,
		dust: "#9aa2aa"
	},
	madera: {
		id: "madera",
		label: "Madera",
		density: 450,
		strength: 26,
		toughness: 66,
		restitution: .15,
		friction: .7,
		brittle: .45,
		dust: "#a8814e"
	},
	vidrio: {
		id: "vidrio",
		label: "Vidrio",
		density: 2500,
		strength: 6,
		toughness: 3,
		restitution: .02,
		friction: .36,
		brittle: .97,
		dust: "#bcd2da"
	},
	roca: {
		id: "roca",
		label: "Roca",
		density: 2700,
		strength: 210,
		toughness: 150,
		restitution: .05,
		friction: .9,
		brittle: .55,
		dust: "#8d8378"
	},
	asfalto: {
		id: "asfalto",
		label: "Asfalto",
		density: 2300,
		strength: 150,
		toughness: 180,
		restitution: .02,
		friction: .95,
		brittle: .4,
		dust: "#5a5a5c"
	}
};
var ALIASES = {
	hormigón: "hormigon",
	"hormigón armado": "hormigon-armado",
	hormigonarmado: "hormigon-armado",
	concreto: "hormigon",
	cristal: "vidrio",
	piedra: "roca",
	acero_estructural: "acero"
};
function normalise(name) {
	return name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function materialOf(name) {
	if (!name) return MATERIALS.hormigon;
	const raw = name.trim().toLowerCase();
	const direct = MATERIALS[raw] ?? MATERIALS[ALIASES[raw] ?? ""];
	if (direct) return direct;
	const key = normalise(name);
	return MATERIALS[key] ?? MATERIALS[ALIASES[key] ?? ""] ?? MATERIALS.hormigon;
}
/**
* Fracción de la caja envolvente realmente ocupada por materia.
* Una planta de edificio es casi toda aire (forjado + pilares + tabiques);
* un bloque de hormigón es macizo.
*/
var OCCUPANCY = {
	floor: .13,
	column: .8,
	bridge: .85,
	prop: .7,
	vehicle: 1,
	debris: .8,
	meteor: 1,
	terrain: 1,
	core: .45
};
function occupancyFor(kind) {
	return OCCUPANCY[kind] ?? .7;
}
/** Densidad efectiva final (kg/m³) que se pasa al collider de Rapier. */
function densityFor(kind, material, hollow) {
	return materialOf(material).density * occupancyFor(kind) * (hollow ?? 1);
}
function massFor(kind, material, size, hollow) {
	const volume = Math.max(1e-4, size[0] * size[1] * size[2]);
	return densityFor(kind, material, hollow) * volume;
}
/**
* Resistencia efectiva a la sobrepresión (kPa).
*
* El valor del material es el de la materia maciza; una planta entera es un
* montaje con fachada, tabiques y huecos, y cede mucho antes que un bloque del
* mismo material. La calidad constructiva (`resistance`, 0-100) modula el
* resultado: 50 es la referencia neutra.
*
* Con esta corrección las cifras caen donde deben según las tablas reales de
* daño por onda expansiva: una estructura de acero acusa daños graves en torno
* a 110 kPa y un edificio de hormigón corriente sobre 45 kPa.
*/
function strengthOf(material, resistance, kind) {
	const assembly = kind ? Math.pow(occupancyFor(kind), .45) : 1;
	return materialOf(material).strength * (.45 + Math.max(0, resistance) / 90) * assembly;
}
/**
* Tenacidad efectiva al impacto (J/kg).
*
* El valor del material corresponde a la materia maciza. Una planta de edificio
* es un montaje hueco: aguanta mucho menos por kilo que un bloque del mismo
* material, y por eso un forjado que cae una planta queda destrozado mientras
* que una barrera de hormigón que cae tres metros sólo se agrieta.
*
* Referencias usadas para calibrar:
*  - barrera de hormigón cayendo 3 m  → ~20 % de daño
*  - coche cayendo 5 m                → ~35 %
*  - forjado cayendo una planta       → ~55 %
*  - caja de madera cayendo 4 m       → se rompe
*/
function toughnessOf(material, resistance, kind) {
	const assembly = kind ? occupancyFor(kind) : 1;
	return materialOf(material).toughness * (.5 + Math.max(0, resistance) / 100) * assembly;
}
/** Etiqueta en español del estado de integridad de una pieza. */
function integrityLabel(integrity) {
	if (integrity >= .92) return "Intacta";
	if (integrity >= .7) return "Fisurada";
	if (integrity >= .45) return "Dañada";
	if (integrity >= .2) return "Comprometida";
	return "Crítica";
}
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
	},
	{
		id: "west-far-n",
		name: "Nave oeste norte",
		x: -40,
		z: -28,
		floors: 3,
		w: 9,
		d: 7.4,
		color: "#6f6a62",
		material: "ladrillo",
		resistance: 42
	},
	{
		id: "west-far-s",
		name: "Bloque oeste lejano",
		x: -40,
		z: 22,
		floors: 5,
		w: 7.6,
		d: 7,
		color: "#7f7869",
		material: "hormigón",
		resistance: 56
	},
	{
		id: "east-far-n",
		name: "Almacén este",
		x: 40,
		z: -30,
		floors: 2,
		w: 10,
		d: 8,
		color: "#5f6a70",
		material: "acero",
		resistance: 50
	},
	{
		id: "east-far-s",
		name: "Torre este lejana",
		x: 40,
		z: 26,
		floors: 6,
		w: 7,
		d: 7,
		color: "#4a5560",
		material: "hormigón",
		resistance: 58
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
		brief: "Haz caer el puente con la carga más pequeña posible (≤ 10 kg de TNT)."
	}
];
/**
* Masa real (kg) de una pieza del catálogo, deducida de su geometría y su
* material igual que en el resto del mundo. Así lo que dice la interfaz y lo
* que siente la simulación son la misma cosa.
*/
function catalogMass(item) {
	if (item.kind === "building") {
		const h = FLOOR_H * .97;
		return massFor("floor", item.material, [
			item.w ?? 6,
			h,
			item.d ?? 6
		]) * (item.floors ?? 4);
	}
	if (item.kind === "car") return 1400;
	if (item.kind === "van") return 2600;
	if (item.kind === "truck") return 8600;
	if (item.kind === "lamp") return massFor("prop", "acero", [
		.28,
		5.5,
		.28
	], .18);
	if (item.kind === "antenna") return massFor("column", "acero", [
		.7,
		2.6,
		.7
	], .12) * 6;
	return massFor(item.kind === "bridge-seg" ? "bridge" : item.kind === "ramp" ? "terrain" : "prop", item.material, [
		item.w ?? 2,
		item.h ?? 2,
		item.d ?? 2
	]);
}
function catalogById(id) {
	return CATALOG.find((c) => c.id === id);
}
function materialLabel(mat) {
	return mat.charAt(0).toUpperCase() + mat.slice(1);
}
var IMPULSE_K = 800;
var PRESSURE_A = 1750;
var PRESSURE_B = 195;
/** Radio del "bola de fuego": evita singularidades a distancia cero. */
function nearFieldRadius(charge) {
	return .55 * Math.cbrt(Math.max(.01, charge)) + .4;
}
/**
* @param charge   kg equivalentes de TNT
* @param distance distancia libre hasta la superficie de la pieza (m)
* @param cutoff   radio de efecto elegido por el usuario (m)
*/
function blastField(charge, distance, cutoff) {
	const w = Math.max(.01, charge);
	const d = Math.max(0, distance);
	if (d >= cutoff) return {
		overpressure: 0,
		impulse: 0
	};
	const r = d + nearFieldRadius(w);
	const edge = 1 - (d / cutoff) ** 2;
	const conf = edge * edge;
	return {
		overpressure: (PRESSURE_A * w / (r * r * r) + PRESSURE_B * Math.cbrt(w * w) / (r * r)) * conf,
		impulse: IMPULSE_K * w / (r * r) * conf
	};
}
/**
* Distancia a la que la sobrepresión cae por debajo de `limit` kPa (umbral de
* rotura de vidrio). Sirve para proponer un radio de efecto coherente.
*/
function naturalRadius(charge, limit = 5) {
	const w = Math.max(.01, charge);
	let lo = .1;
	let hi = 400;
	for (let i = 0; i < 40; i++) {
		const mid = (lo + hi) / 2;
		const r = mid + nearFieldRadius(w);
		if (PRESSURE_A * w / (r * r * r) + PRESSURE_B * Math.cbrt(w * w) / (r * r) > limit) lo = mid;
		else hi = mid;
	}
	return lo;
}
/**
* Radio (m, desde el foco) dentro del cual la sobrepresión basta para arruinar
* un material de resistencia `strength` kPa.
*
* Sirve para acotar lo que una carga puede destruir de una sola pieza: media
* docena de kilos de explosivo pegados a un forjado de cuarenta metros
* cuadrados abren un boquete, no se llevan la planta entera. Sin esta
* limitación cualquier carga en contacto destruía la pieza completa por grande
* que fuera, y una carga mínima podía tirar un edificio.
*/
function destructiveRadius(charge, strength) {
	const w = Math.max(.01, charge);
	const limit = Math.max(1, strength * 3);
	return Math.cbrt(PRESSURE_A * w / limit);
}
/** Rota `v` por el cuaternión `q`. Si `inverse`, aplica la rotación inversa. */
function rotateVec(v, q, inverse = false) {
	const qx = inverse ? -q.x : q.x;
	const qy = inverse ? -q.y : q.y;
	const qz = inverse ? -q.z : q.z;
	const tx = 2 * (qy * v.z - qz * v.y);
	const ty = 2 * (qz * v.x - qx * v.z);
	const tz = 2 * (qx * v.y - qy * v.x);
	return {
		x: v.x + q.w * tx + (qy * tz - qz * ty),
		y: v.y + q.w * ty + (qz * tx - qx * tz),
		z: v.z + q.w * tz + (qx * ty - qy * tx)
	};
}
var IDENTITY$1 = {
	x: 0,
	y: 0,
	z: 0,
	w: 1
};
/**
* Área proyectada (m²) de una caja orientada vista desde la dirección `dir`.
* Es lo que convierte el impulso específico en impulso real, y es la razón por
* la que una losa ancha recibe mucho más empuje que una columna estrecha.
*/
function projectedArea(size, dir, q = IDENTITY$1) {
	const l = rotateVec(dir, q, true);
	const [w, h, d] = size;
	return Math.abs(l.x) * h * d + Math.abs(l.y) * w * d + Math.abs(l.z) * w * h;
}
/** Distancia libre desde `p` hasta la superficie de una caja orientada. */
function distanceToBox(p, center, size, q = IDENTITY$1) {
	const rel = rotateVec({
		x: p.x - center.x,
		y: p.y - center.y,
		z: p.z - center.z
	}, q, true);
	const hx = size[0] / 2;
	const hy = size[1] / 2;
	const hz = size[2] / 2;
	const dx = Math.max(0, Math.abs(rel.x) - hx);
	const dy = Math.max(0, Math.abs(rel.y) - hy);
	const dz = Math.max(0, Math.abs(rel.z) - hz);
	return Math.hypot(dx, dy, dz);
}
/**
* ¿El segmento `from`→`to` atraviesa la caja? Devuelve el espesor recorrido
* dentro de ella (0 si no la corta). Método de las rebanadas, sin rotación:
* en esta ciudad casi todo está alineado con los ejes y el coste importa.
*/
function segmentThroughBox(from, to, box) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const dz = to.z - from.z;
	const len = Math.hypot(dx, dy, dz);
	if (len < 1e-6) return 0;
	const inv = 1 / len;
	const d = [
		dx * inv,
		dy * inv,
		dz * inv
	];
	const o = [
		from.x,
		from.y,
		from.z
	];
	const c = [
		box.center.x,
		box.center.y,
		box.center.z
	];
	const h = [
		box.size[0] / 2,
		box.size[1] / 2,
		box.size[2] / 2
	];
	let tmin = 0;
	let tmax = len;
	for (let i = 0; i < 3; i++) {
		const lo = c[i] - h[i];
		const hi = c[i] + h[i];
		if (Math.abs(d[i]) < 1e-9) {
			if (o[i] < lo || o[i] > hi) return 0;
			continue;
		}
		const inv2 = 1 / d[i];
		let t1 = (lo - o[i]) * inv2;
		let t2 = (hi - o[i]) * inv2;
		if (t1 > t2) {
			const tmp = t1;
			t1 = t2;
			t2 = tmp;
		}
		if (t1 > tmin) tmin = t1;
		if (t2 < tmax) tmax = t2;
		if (tmin > tmax) return 0;
	}
	return Math.max(0, tmax - tmin);
}
/** Punto de la superficie de la caja más cercano a `p` (en coordenadas mundo). */
function closestPointOnBox(p, center, size, q = {
	x: 0,
	y: 0,
	z: 0,
	w: 1
}) {
	const rel = rotateVec({
		x: p.x - center.x,
		y: p.y - center.y,
		z: p.z - center.z
	}, q, true);
	const hx = size[0] / 2;
	const hy = size[1] / 2;
	const hz = size[2] / 2;
	const world = rotateVec({
		x: Math.max(-hx, Math.min(hx, rel.x)),
		y: Math.max(-hy, Math.min(hy, rel.y)),
		z: Math.max(-hz, Math.min(hz, rel.z))
	}, q);
	return {
		x: center.x + world.x,
		y: center.y + world.y,
		z: center.z + world.z
	};
}
var G = 9.81;
/** Coeficiente de seguridad del diseño: cuánta carga extra aguanta de fábrica. */
var SAFETY = 2.8;
/** Capacidad mínima propia de una pieza, aunque no soporte nada encima. */
var SELF_CAPACITY = .5;
/** Umbral de integridad por debajo del cual una pieza ya no sostiene nada. */
var SUPPORT_MIN_INTEGRITY = .06;
/** Desplome lateral admisible respecto a la planta inferior, en fracción de ancho. */
var DRIFT_TOLERANCE = .42;
function detectKind(members) {
	if (members.length < 2) return "stack";
	const stacked = members.filter((m) => (m.floorIndex ?? -1) >= 0);
	if (stacked.length < 2) return "span";
	for (let i = 1; i < stacked.length; i++) if (stacked[i].home.y <= stacked[i - 1].home.y + .05) return "span";
	return members.length === stacked.length ? "stack" : "stack";
}
function prepare(g) {
	if (g.kind === "stack") {
		const floors = g.members.filter((m) => (m.floorIndex ?? -1) >= 0);
		let above = 0;
		for (let i = floors.length - 1; i >= 0; i--) {
			const f = floors[i];
			f.designLoad = above * G;
			f.supportCapacity = SAFETY * f.designLoad + SELF_CAPACITY * f.mass * G;
			above += f.mass;
		}
		for (const m of g.members) {
			if ((m.floorIndex ?? -1) >= 0) continue;
			m.designLoad = above * G;
			m.supportCapacity = SAFETY * m.designLoad + SELF_CAPACITY * m.mass * G;
		}
	} else for (const m of g.members) {
		m.designLoad = m.mass * G * 1.6;
		m.supportCapacity = SAFETY * m.designLoad;
	}
	g.prepared = true;
}
var StructureSolver = class {
	groups = /* @__PURE__ */ new Map();
	dirty = true;
	markDirty() {
		this.dirty = true;
	}
	clear() {
		this.groups.clear();
		this.dirty = true;
	}
	ensure(bodies) {
		if (!this.dirty) return;
		this.groups.clear();
		for (const sb of bodies) {
			if (!sb.buildingId) continue;
			let g = this.groups.get(sb.buildingId);
			if (!g) {
				g = {
					id: sb.buildingId,
					kind: "stack",
					members: [],
					prepared: false
				};
				this.groups.set(sb.buildingId, g);
			}
			g.members.push(sb);
		}
		for (const g of this.groups.values()) {
			g.members.sort((a, b) => (a.floorIndex ?? 0) - (b.floorIndex ?? 0));
			g.kind = detectKind(g.members);
			prepare(g);
		}
		this.dirty = false;
	}
	groupOf(id) {
		return this.groups.get(id);
	}
	/** Plantas todavía unidas de un edificio, de abajo arriba. */
	attachedFloors(buildingId) {
		const g = this.groups.get(buildingId);
		if (!g) return [];
		return g.members.filter((m) => m.attached && !m.destroyed);
	}
	/**
	* Un paso del solver. Devuelve las piezas que deben soltarse este paso,
	* ya marcadas con el retardo de propagación correspondiente.
	*/
	step(bodies, dt) {
		this.ensure(bodies);
		for (const g of this.groups.values()) {
			if (!g.prepared) prepare(g);
			if (g.kind === "stack") this.stepStack(g, dt);
			else this.stepSpan(g, dt);
		}
	}
	stepStack(g, dt) {
		const floors = g.members.filter((m) => (m.floorIndex ?? -1) >= 0);
		const props = g.members.filter((m) => (m.floorIndex ?? -1) < 0);
		let above = 0;
		for (let i = floors.length - 1; i >= 0; i--) {
			const f = floors[i];
			f.loadAbove = above * G;
			if (f.attached && !f.destroyed) above += f.mass;
		}
		for (const p of props) p.loadAbove = above * G;
		for (const f of g.members) {
			if (!f.attached || f.destroyed) {
				f.overloaded = false;
				continue;
			}
			const capacity = f.supportCapacity * Math.pow(Math.max(0, f.integrity), 1.5);
			const demand = f.loadAbove + f.lateralLoad * 2.5;
			if (capacity <= 1 || demand > capacity) {
				const over = capacity > 1 ? demand / capacity - 1 : 3;
				f.integrity = Math.max(0, f.integrity - dt * (.5 + 1.8 * Math.min(3, over)));
				f.overloaded = true;
			} else f.overloaded = false;
		}
		let lostAt = -1;
		let supportIntegrity = 1;
		for (let i = 0; i < floors.length; i++) {
			const f = floors[i];
			if (f.destroyed || !f.attached) {
				if (lostAt < 0) lostAt = i;
				continue;
			}
			const failed = f.integrity <= .05 || f.forcedFail;
			const unsupported = lostAt >= 0 || supportIntegrity < SUPPORT_MIN_INTEGRITY || i > 0 && this.drift(f, floors[i - 1]) > DRIFT_TOLERANCE;
			if (failed || unsupported) {
				if (lostAt < 0) lostAt = i;
				if (f.releaseIn < 0) {
					f.releaseIn = failed && !unsupported ? .02 : .06 + (i - lostAt) * .085;
					f.failReason = failed ? "fallo" : "sin apoyo";
				}
			}
			supportIntegrity = f.integrity;
		}
		for (const p of props) {
			if (p.destroyed || !p.attached) continue;
			if (p.integrity <= .05 || p.forcedFail) {
				if (p.releaseIn < 0) {
					p.releaseIn = .02;
					p.failReason = "fallo";
				}
			}
		}
	}
	drift(a, b) {
		const ax = rbOf(a)?.translation() ?? a.home;
		const bx = rbOf(b)?.translation() ?? b.home;
		const dx = ax.x - bx.x;
		const dz = ax.z - bx.z;
		const w = Math.max(.5, Math.min(a.size[0], a.size[2]));
		return Math.hypot(dx, dz) / w;
	}
	/**
	* Estructuras horizontales: lo que no está conectado a un apoyo anclado al
	* suelo se viene abajo. Un BFS por proximidad basta y es barato.
	*/
	stepSpan(g, dt) {
		const live = g.members.filter((m) => m.attached && !m.destroyed);
		for (const m of live) {
			const capacity = m.supportCapacity * Math.pow(Math.max(0, m.integrity), 1.5);
			const demand = m.mass * G + m.lateralLoad * 2.5;
			if (capacity <= 1 || demand > capacity) {
				const over = capacity > 1 ? demand / capacity - 1 : 3;
				m.integrity = Math.max(0, m.integrity - dt * (.5 + 1.8 * Math.min(3, over)));
				m.overloaded = true;
			} else m.overloaded = false;
		}
		const sound = live.filter((m) => m.integrity > SUPPORT_MIN_INTEGRITY && !m.forcedFail);
		const anchored = sound.filter((m) => m.home.y - m.size[1] / 2 <= .9);
		const reached = new Set(anchored);
		const queue = [...anchored];
		while (queue.length) {
			const cur = queue.pop();
			for (const other of sound) {
				if (reached.has(other)) continue;
				if (Math.hypot(cur.home.x - other.home.x, (cur.home.y - other.home.y) * .8, cur.home.z - other.home.z) <= (Math.max(cur.size[0], cur.size[2]) + Math.max(other.size[0], other.size[2])) * .62 + .5) {
					reached.add(other);
					queue.push(other);
				}
			}
		}
		for (const m of live) {
			const failed = m.integrity <= .05 || m.forcedFail;
			if (failed || !reached.has(m)) {
				if (m.releaseIn < 0) {
					m.releaseIn = failed ? .02 : .06 + Math.random() * .05;
					m.failReason = failed ? "fallo" : "sin apoyo";
				}
			}
		}
	}
};
/** Velocidad máxima que una sola onda expansiva puede imprimir (m/s). */
var MAX_BLAST_DV = 40;
/** Velocidad angular máxima tras una explosión (rad/s). */
var MAX_BLAST_SPIN = 9;
/** Empuje mínimo para que un objeto suelto llegue a moverse (m/s). */
var FREE_RELEASE_DV = .32;
/** Empuje mínimo para que una pieza estructural se desprenda de golpe (m/s). */
var STRUCT_RELEASE_DV = 1.15;
/** Salto de velocidad a partir del cual consideramos que hubo impacto (m/s). */
var IMPACT_MIN_DV = 2.2;
/**
* Velocidad vertical ascendente máxima de una pieza estructural fuera de una
* explosión. Un derrumbe puede lanzar cascotes, pero un forjado de treinta
* toneladas nunca sube: si el solver de contactos genera esa energía, es un
* artefacto numérico y se recorta.
*/
var MAX_STRUCTURAL_UP = 6;
/** Velocidad máxima absoluta de cualquier cuerpo (m/s). */
var MAX_SPEED = 60;
/** Ventana tras una explosión en la que sí se admiten velocidades altas. */
var BLAST_GRACE = .35;
/** Transmisión de la onda a través de una pieza intacta. */
var SHIELD_BASE = .3;
var IDENTITY = {
	x: 0,
	y: 0,
	z: 0,
	w: 1
};
var fxId = 1;
var debrisSeq = 1;
var tmpDir = {
	x: 0,
	y: 0,
	z: 0
};
/**
* Acceso seguro al cuerpo de Rapier. Cuando una pieza se retira, React
* desmonta su RigidBody y el puntero de WASM deja de ser válido; tocarlo
* revienta el paso de física entero.
*/
function rbOf(sb) {
	const rb = sb?.body;
	if (!rb || sb.destroyed) return null;
	try {
		return rb.isValid() ? rb : null;
	} catch {
		return null;
	}
}
/** Para las plantas de un edificio, el cristal es fachada: aguanta el esqueleto. */
function frameMaterial(kind, material) {
	if (kind !== "floor" && kind !== "column") return material;
	const m = materialOf(material).id;
	if (m === "vidrio") return "acero";
	if (m === "ladrillo") return "hormigon";
	return material;
}
var Simulation = class {
	bodies = /* @__PURE__ */ new Map();
	structure = new StructureSolver();
	simTime = 0;
	trauma = 0;
	flash = 0;
	fps = 60;
	/** Viento como campo de velocidad real (m/s), no como fuerza mágica. */
	wind = {
		vx: 0,
		vz: 0,
		until: 0,
		strength: 0
	};
	/** Terremoto: aceleración del terreno (m/s²) con envolvente temporal. */
	quake = {
		amplitude: 0,
		freq: 1.4,
		until: 0,
		start: 0,
		dirX: 1,
		dirZ: .35
	};
	rumble = 0;
	rumbleIntensity = 0;
	explosions = [];
	shockwaves = [];
	dust = [];
	debrisQueue = [];
	retireQueue = [];
	meteorQueue = [];
	debrisAlive = 0;
	chainWindow = 0;
	chainCount = 0;
	lastBlastAt = -99;
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
		this.structure.clear();
		this.simTime = 0;
		this.trauma = 0;
		this.flash = 0;
		this.wind = {
			vx: 0,
			vz: 0,
			until: 0,
			strength: 0
		};
		this.quake = {
			amplitude: 0,
			freq: 1.4,
			until: 0,
			start: 0,
			dirX: 1,
			dirZ: .35
		};
		this.rumble = 0;
		this.rumbleIntensity = 0;
		this.explosions = [];
		this.shockwaves = [];
		this.dust = [];
		this.debrisQueue = [];
		this.retireQueue = [];
		this.meteorQueue = [];
		this.debrisAlive = 0;
		this.chainWindow = 0;
		this.chainCount = 0;
		this.lastBlastAt = -99;
	}
	register(input) {
		const frame = frameMaterial(input.kind, input.material);
		const volume = Math.max(1e-4, input.size[0] * input.size[1] * input.size[2]);
		const mass = input.mass ?? massFor(input.kind, input.material, input.size, input.hollow);
		const body = {
			id: input.id,
			kind: input.kind,
			name: input.name,
			buildingId: input.buildingId,
			floorIndex: input.floorIndex,
			material: input.material,
			frame,
			color: input.color,
			size: input.size,
			volume,
			density: mass / volume,
			mass,
			resistance: input.resistance,
			strength: strengthOf(frame, input.resistance, input.kind),
			toughness: toughnessOf(frame, input.resistance, input.kind),
			brittle: materialOf(input.material).brittle,
			integrity: 1,
			damageTaken: 0,
			attached: input.kind !== "debris" && input.kind !== "meteor",
			awakened: input.kind === "debris" || input.kind === "meteor",
			destroyed: false,
			releaseIn: -1,
			failReason: "",
			forcedFail: false,
			overloaded: false,
			home: {
				x: input.position[0],
				y: input.position[1],
				z: input.position[2]
			},
			designLoad: 0,
			supportCapacity: 0,
			loadAbove: 0,
			lateralLoad: 0,
			damageDir: {
				x: 0,
				y: 0,
				z: 0
			},
			body: null,
			object: null,
			awakenReact: null,
			hideReact: null,
			pendingImpulse: null,
			pendingImpulsePoint: null,
			pendingTorque: null,
			pendingVelocity: null,
			pendingAngVel: null,
			prevVel: {
				x: 0,
				y: 0,
				z: 0
			},
			impactCooldown: 0,
			freeTime: 0,
			age: 0
		};
		this.bodies.set(input.id, body);
		if (input.kind === "debris") this.debrisAlive += 1;
		if (input.buildingId) this.structure.markDirty();
	}
	attach(id, body, object, awakenReact, hideReact) {
		const sb = this.bodies.get(id);
		if (!sb) return;
		sb.body = body;
		sb.object = object;
		sb.awakenReact = awakenReact;
		if (hideReact) sb.hideReact = hideReact;
	}
	/** Suelta la referencia al cuerpo de Rapier sin borrar la pieza. */
	detach(id) {
		const sb = this.bodies.get(id);
		if (!sb) return;
		sb.body = null;
		sb.object = null;
	}
	unregister(id) {
		const sb = this.bodies.get(id);
		if (sb) {
			if (sb.kind === "debris") this.debrisAlive = Math.max(0, this.debrisAlive - 1);
			if (sb.buildingId) this.structure.markDirty();
		}
		this.bodies.delete(id);
	}
	get(id) {
		return this.bodies.get(id);
	}
	/** Densidad efectiva que debe usar el collider de Rapier. */
	densityOf(kind, material, hollow, mass, size) {
		if (mass && size) return mass / Math.max(1e-4, size[0] * size[1] * size[2]);
		return densityFor(kind, material, hollow);
	}
	/**
	* Convierte una pieza en cuerpo dinámico. Deliberadamente NO aplica ningún
	* impulso: quien la suelta decide si además hay que empujarla. Por defecto,
	* lo único que actúa es la gravedad.
	*/
	release(sb, reason = "") {
		if (sb.destroyed) return;
		if (sb.awakened) {
			this.applyPending(sb);
			return;
		}
		sb.awakened = true;
		sb.attached = false;
		sb.releaseIn = -1;
		if (reason) sb.failReason = reason;
		if (sb.buildingId) this.structure.markDirty();
		this.noteChain();
		sb.awakenReact?.();
	}
	/** Alias histórico usado por la interfaz ("Liberar"). */
	awaken(sb) {
		this.release(sb, sb.failReason || "manual");
	}
	noteChain() {
		if (this.chainWindow <= 0) this.chainCount = 0;
		this.chainWindow = 4;
		this.chainCount += 1;
	}
	applyPending(sb) {
		const rb = rbOf(sb);
		if (!rb || !sb.awakened) return;
		try {
			if (rb.bodyType() !== 0) rb.setBodyType(0, true);
			rb.wakeUp();
			if (sb.pendingVelocity) {
				const v = rb.linvel();
				rb.setLinvel({
					x: v.x + sb.pendingVelocity.x,
					y: v.y + sb.pendingVelocity.y,
					z: v.z + sb.pendingVelocity.z
				}, true);
				sb.pendingVelocity = null;
			}
			if (sb.pendingAngVel) {
				const a = rb.angvel();
				rb.setAngvel({
					x: a.x + sb.pendingAngVel.x,
					y: a.y + sb.pendingAngVel.y,
					z: a.z + sb.pendingAngVel.z
				}, true);
				sb.pendingAngVel = null;
			}
			if (sb.pendingImpulse) {
				if (sb.pendingImpulsePoint) rb.applyImpulseAtPoint(sb.pendingImpulse, sb.pendingImpulsePoint, true);
				else rb.applyImpulse(sb.pendingImpulse, true);
				sb.pendingImpulse = null;
				sb.pendingImpulsePoint = null;
				this.clampSpin(rb);
			}
			if (sb.pendingTorque) {
				rb.applyTorqueImpulse(sb.pendingTorque, true);
				sb.pendingTorque = null;
				this.clampSpin(rb);
			}
		} catch {}
	}
	clampSpin(rb) {
		const a = rb.angvel();
		const s = Math.hypot(a.x, a.y, a.z);
		if (s > MAX_BLAST_SPIN) {
			const k = MAX_BLAST_SPIN / s;
			rb.setAngvel({
				x: a.x * k,
				y: a.y * k,
				z: a.z * k
			}, true);
		}
	}
	/**
	* Daño estructural puro. No mueve nada ni suelta nada: sólo reduce la
	* capacidad. Quién se cae y cuándo lo decide el solver estructural.
	*/
	damage(sb, amount, dir) {
		if (amount <= 0 || sb.destroyed) return 0;
		const before = sb.integrity;
		sb.integrity = Math.max(0, sb.integrity - amount);
		const applied = before - sb.integrity;
		sb.damageTaken += applied;
		if (dir) {
			sb.damageDir.x += dir.x * applied;
			sb.damageDir.y += dir.y * applied;
			sb.damageDir.z += dir.z * applied;
		}
		if (sb.integrity <= 0) {
			sb.forcedFail = true;
			if (!sb.attached) this.fragment(sb);
			else if (sb.releaseIn < 0) sb.releaseIn = .02;
		}
		return applied;
	}
	/**
	* @param charge carga en kg equivalentes de TNT
	* @param radius radio de efecto (m). Fuera de él la onda no existe.
	*/
	explode(x, y, z, charge, radius) {
		const w = Math.max(.05, charge);
		const r = Math.max(1.5, radius);
		this.lastBlastAt = this.simTime;
		const scale = Math.min(1, Math.cbrt(w) / 8);
		this.trauma = Math.min(1, this.trauma + .12 + scale * .7);
		this.flash = Math.min(1, .18 + scale * .85);
		this.explosions.push({
			id: fxId++,
			x,
			y,
			z,
			power: w,
			radius: r,
			t: 0
		});
		this.shockwaves.push({
			id: fxId++,
			x,
			y,
			z,
			radius: r,
			t: 0
		});
		this.dust.push({
			id: fxId++,
			x,
			y,
			z,
			power: w,
			color: "#c1b6a4",
			t: 0
		});
		this.emitFx();
		const origin = {
			x,
			y,
			z
		};
		const list = [...this.bodies.values()];
		let hit = 0;
		let destroyed = 0;
		let damageAcc = 0;
		for (const sb of list) {
			if (sb.destroyed || sb.kind === "terrain") continue;
			const rb0 = rbOf(sb);
			const p = rb0?.translation() ?? sb.home;
			const q = rb0?.rotation() ?? IDENTITY;
			const center = {
				x: p.x,
				y: p.y,
				z: p.z
			};
			const dist = distanceToBox(origin, center, sb.size, q);
			if (dist >= r) continue;
			const shield = this.occlusion(origin, center, sb, list, r);
			if (shield <= .015) continue;
			const field = blastField(w, dist, r);
			const overpressure = field.overpressure * shield;
			const specificImpulse = field.impulse * shield;
			if (overpressure <= .05 && specificImpulse <= .05) continue;
			let dx = center.x - x;
			let dy = center.y - y;
			let dz = center.z - z;
			let len = Math.hypot(dx, dy, dz);
			if (len < 1e-4) {
				const a = Math.random() * Math.PI * 2;
				dx = Math.cos(a);
				dy = .12;
				dz = Math.sin(a);
				len = Math.hypot(dx, dy, dz);
			}
			tmpDir.x = dx / len;
			tmpDir.y = dy / len;
			tmpDir.z = dz / len;
			let applied = 0;
			if (overpressure > sb.strength) {
				const frac = Math.min(1, Math.pow((overpressure - sb.strength) / (sb.strength * 3.2), .8));
				const rd = destructiveRadius(w, sb.strength);
				const coverage = Math.min(1, 4 / 3 * Math.PI * rd * rd * rd / sb.volume);
				applied = this.damage(sb, frac * coverage, tmpDir);
				damageAcc += applied * 100;
			}
			const impulse = specificImpulse * projectedArea(sb.size, tmpDir, q);
			const dv = Math.min(MAX_BLAST_DV, impulse / sb.mass);
			if (dv > .02) hit += 1;
			if (dv > .25) damageAcc += this.damage(sb, Math.min(.5, dv / 9), tmpDir) * 100;
			const structural = sb.attached && !!sb.buildingId;
			if (dv >= (structural ? STRUCT_RELEASE_DV : FREE_RELEASE_DV) || !sb.attached && sb.awakened && dv > .02) {
				const point = closestPointOnBox(origin, center, sb.size, q);
				const j = dv * sb.mass;
				sb.pendingImpulse = {
					x: tmpDir.x * j,
					y: tmpDir.y * j,
					z: tmpDir.z * j
				};
				sb.pendingImpulsePoint = point;
				if (structural) sb.forcedFail = true;
				this.release(sb, structural ? "onda expansiva" : "empuje");
			}
			if (sb.integrity <= 0 && !sb.destroyed && !sb.attached) destroyed += 1;
		}
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
	/**
	* Atenuación de la onda por lo que se interpone. Recorre las piezas que
	* cortan el segmento foco→objetivo; cada obstáculo intacto deja pasar poco,
	* y uno ya destrozado deja pasar casi todo. Por eso abrir un boquete en la
	* planta baja hace que la siguiente carga llegue mucho más adentro.
	*/
	occlusion(origin, target, self, list, radius) {
		let shield = 1;
		for (const other of list) {
			if (other === self || other.destroyed || !other.attached) continue;
			if (other.kind === "terrain" || other.kind === "debris") continue;
			const p = rbOf(other)?.translation() ?? other.home;
			const thickness = segmentThroughBox(origin, target, {
				center: {
					x: p.x,
					y: p.y,
					z: p.z
				},
				size: other.size
			});
			if (thickness <= .05) continue;
			const pass = SHIELD_BASE + .7 * (1 - Math.min(1, thickness / 2.2 * (.35 + other.integrity * .65)));
			shield *= pass;
			if (shield < .015) return 0;
		}
		return shield;
	}
	shockwave(x, z, charge) {
		this.explode(x, 1.1, z, charge, naturalRadius(charge) * 1.25);
	}
	suggestedRadius(charge) {
		return naturalRadius(charge);
	}
	/**
	* El terremoto no lanza nada hacia arriba: impone una aceleración del
	* terreno horizontal y oscilante. Las estructuras acusan el cortante en la
	* base (proporcional a la masa que llevan encima), y los cuerpos sueltos
	* reciben la fuerza de inercia correspondiente.
	*/
	earthquake(intensity) {
		const i = Math.max(0, Math.min(1.2, intensity));
		const a = Math.random() * Math.PI * 2;
		this.quake = {
			amplitude: i * 5.2,
			freq: 1.1 + i * .8,
			until: this.simTime + 3 + i * 4,
			start: this.simTime,
			dirX: Math.cos(a),
			dirZ: Math.sin(a)
		};
		this.rumble = this.quake.until - this.simTime;
		this.rumbleIntensity = i;
		this.trauma = Math.min(1, this.trauma + .2 + i * .35);
		this.emitFx();
		this.emitScore({
			damage: i * 20,
			destroyed: 0,
			chain: this.chainCount,
			kind: "earthquake"
		});
	}
	startWind(strength, dirX = 1, dirZ = .18) {
		const len = Math.hypot(dirX, dirZ) || 1;
		const speed = Math.max(0, Math.min(1.2, strength)) * 45;
		this.wind = {
			vx: dirX / len * speed,
			vz: dirZ / len * speed,
			until: this.simTime + 8,
			strength
		};
	}
	collapseBuilding(buildingId) {
		const pieces = [...this.bodies.values()].filter((b) => b.buildingId === buildingId && !b.destroyed && b.attached);
		if (!pieces.length) return;
		const base = pieces.reduce((min, p) => Math.min(min, p.floorIndex ?? 0), 99);
		for (const sb of pieces) if ((sb.floorIndex ?? 0) <= base) {
			sb.integrity = Math.min(sb.integrity, .02);
			sb.forcedFail = true;
		} else sb.integrity = Math.min(sb.integrity, .55);
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
	fragment(sb) {
		if (sb.destroyed) return;
		sb.destroyed = true;
		sb.integrity = 0;
		if (sb.buildingId) this.structure.markDirty();
		sb.hideReact?.();
		const rb = sb.body;
		if (rb && sb.kind !== "debris" && this.debrisAlive < 110) {
			const p = rb.translation();
			const v = rb.linvel();
			const [w, h, d] = sb.size;
			const count = Math.max(2, Math.min(7, Math.round(Math.cbrt(sb.volume) * 1.9 * (.55 + sb.brittle))));
			const pieceVolume = sb.volume * .5 / count;
			const side = Math.cbrt(pieceVolume);
			for (let i = 0; i < count; i++) {
				const jitter = .75 + Math.random() * .6;
				const ox = (Math.random() - .5) * w * .55;
				const oy = (Math.random() - .5) * h * .55;
				const oz = (Math.random() - .5) * d * .55;
				const spread = Math.hypot(ox, oy, oz) || 1;
				const burst = 1.1 + sb.brittle * 2.4;
				this.debrisQueue.push({
					id: `debris-${debrisSeq++}`,
					x: p.x + ox,
					y: p.y + oy,
					z: p.z + oz,
					vx: v.x + ox / spread * burst + (Math.random() - .5) * .8,
					vy: v.y + oy / spread * burst * .6,
					vz: v.z + oz / spread * burst + (Math.random() - .5) * .8,
					w: Math.max(.26, Math.min(w * .7, side * jitter)),
					h: Math.max(.24, Math.min(h * .7, side * jitter)),
					d: Math.max(.26, Math.min(d * .7, side * jitter)),
					color: sb.color,
					material: sb.material
				});
			}
			this.dust.push({
				id: fxId++,
				x: p.x,
				y: p.y,
				z: p.z,
				power: Math.min(60, sb.volume * .6),
				color: materialOf(sb.material).dust,
				t: 0
			});
			this.emitFx();
		}
		sb.body = null;
		sb.object = null;
		this.emitScore({
			damage: 12,
			destroyed: 1,
			chain: this.chainCount,
			buildingId: sb.buildingId,
			kind: sb.kind
		});
	}
	/** Se ejecuta antes de cada paso de Rapier, con el dt real del paso. */
	stepSim(dt) {
		if (dt <= 0) return;
		try {
			this.stepSimInner(dt);
		} catch (err) {
			if (typeof console !== "undefined") console.warn("[sim] paso interrumpido", err);
		}
	}
	stepSimInner(dt) {
		this.simTime += dt;
		this.trauma = Math.max(0, this.trauma - dt * 1.15);
		this.flash = Math.max(0, this.flash - dt * 2.6);
		this.chainWindow = Math.max(0, this.chainWindow - dt);
		if (this.chainWindow <= 0) this.chainCount = 0;
		this.rumble = Math.max(0, this.rumble - dt);
		this.applyEnvironment(dt);
		this.structure.step(this.bodies.values(), dt);
		this.processReleases(dt);
		this.tickFxTimers(dt);
	}
	applyEnvironment(dt) {
		const windy = this.simTime < this.wind.until;
		const quaking = this.simTime < this.quake.until;
		if (!windy && !quaking) return;
		let qa = 0;
		if (quaking) {
			const t = this.simTime - this.quake.start;
			const total = this.quake.until - this.quake.start;
			const env = Math.min(1, t / .4) * Math.max(0, 1 - t / total) ** .7;
			qa = this.quake.amplitude * env * Math.sin(t * this.quake.freq * Math.PI * 2);
		}
		for (const sb of this.bodies.values()) {
			const rb = rbOf(sb);
			if (!rb) continue;
			if (sb.attached) {
				let lateral = 0;
				if (quaking) {
					const massAbove = sb.loadAbove / G + sb.mass;
					lateral += Math.abs(qa) * massAbove * .55;
				}
				if (windy) {
					const speed = Math.hypot(this.wind.vx, this.wind.vz);
					const area = sb.size[1] * Math.max(sb.size[0], sb.size[2]);
					lateral += .6125 * 1.3 * area * speed * speed;
				}
				sb.lateralLoad = lateral;
				continue;
			}
			sb.lateralLoad = 0;
			if (!sb.awakened) continue;
			let fx = 0;
			let fz = 0;
			if (quaking) {
				fx += -qa * this.quake.dirX * sb.mass;
				fz += -qa * this.quake.dirZ * sb.mass;
			}
			if (windy) {
				const v = rb.linvel();
				const rx = this.wind.vx - v.x;
				const rz = this.wind.vz - v.z;
				const rel = Math.hypot(rx, rz);
				if (rel > .1) {
					const k = .704375 * (sb.size[1] * Math.max(sb.size[0], sb.size[2])) * rel;
					fx += k * rx;
					fz += k * rz;
				}
			}
			rb.resetForces(false);
			if (fx !== 0 || fz !== 0) rb.addForce({
				x: fx,
				y: 0,
				z: fz
			}, true);
		}
	}
	processReleases(dt) {
		for (const sb of this.bodies.values()) {
			sb.age += dt;
			if (sb.impactCooldown > 0) sb.impactCooldown -= dt;
			if (sb.awakened && !sb.destroyed) sb.freeTime += dt;
			if (sb.releaseIn >= 0 && sb.attached && !sb.destroyed) {
				sb.releaseIn -= dt;
				if (sb.releaseIn <= 0) {
					const dd = sb.damageDir;
					const len = Math.hypot(dd.x, dd.z);
					const ang = Math.random() * Math.PI * 2;
					const wobble = .25 + Math.random() * .45;
					let vx = Math.cos(ang) * wobble;
					let vz = Math.sin(ang) * wobble;
					if (len > .01) {
						const k = Math.min(.9, len * .6);
						vx += dd.x / len * k;
						vz += dd.z / len * k;
					}
					sb.pendingVelocity = {
						x: vx,
						y: 0,
						z: vz
					};
					const lean = Math.hypot(vx, vz);
					const spin = .18 + Math.random() * .4;
					if (lean > .001) sb.pendingAngVel = {
						x: vz / lean * spin,
						y: (Math.random() - .5) * .25,
						z: -(vx / lean) * spin
					};
					this.release(sb);
				}
			}
			if (sb.awakened && !sb.destroyed && sb.integrity <= 0 && sb.kind !== "debris") {
				if (sb.freeTime > .28) this.fragment(sb);
			}
			const rbOut = sb.awakened ? rbOf(sb) : null;
			if (rbOut) {
				if (rbOut.translation().y < -18) {
					if (sb.kind === "debris") this.retire(sb);
					else this.fragment(sb);
				}
			}
			if (sb.kind === "debris" && sb.age > 26 && rbOf(sb)?.isSleeping()) this.retire(sb);
		}
	}
	retire(sb) {
		if (sb.destroyed) return;
		sb.destroyed = true;
		this.retireQueue.push(sb.id);
		sb.hideReact?.();
		sb.body = null;
		sb.object = null;
	}
	/** Se ejecuta después de cada paso de Rapier: detecta impactos. */
	postStep(dt) {
		if (dt <= 0) return;
		try {
			this.postStepInner(dt);
		} catch (err) {
			if (typeof console !== "undefined") console.warn("[sim] postpaso interrumpido", err);
		}
	}
	postStepInner(dt) {
		const gdt = G * dt;
		const impacts = [];
		for (const sb of this.bodies.values()) {
			if (!sb.awakened) continue;
			const rb = rbOf(sb);
			if (!rb) continue;
			const v = rb.linvel();
			const dvx = v.x - sb.prevVel.x;
			const dvy = v.y - sb.prevVel.y + gdt;
			const dvz = v.z - sb.prevVel.z;
			sb.prevVel.x = v.x;
			sb.prevVel.y = v.y;
			sb.prevVel.z = v.z;
			this.clampVelocity(sb, rb, v);
			if (sb.impactCooldown > 0) continue;
			const dv = Math.hypot(dvx, dvy, dvz);
			if (dv >= IMPACT_MIN_DV) impacts.push({
				sb,
				dv
			});
		}
		for (const { sb, dv } of impacts) this.resolveImpact(sb, dv);
	}
	/**
	* El solver de contactos puede inventar energía cuando chocan cuerpos con
	* masas muy dispares o muy interpenetrados. Aquí se le pone freno: nada sube
	* como un cohete sin una explosión reciente detrás.
	*/
	clampVelocity(sb, rb, v) {
		const recentBlast = this.simTime - this.lastBlastAt < BLAST_GRACE;
		let vx = v.x;
		let vy = v.y;
		let vz = v.z;
		let touched = false;
		if ((sb.kind === "floor" || sb.kind === "bridge" || sb.kind === "column" || sb.kind === "core") && !recentBlast && vy > MAX_STRUCTURAL_UP) {
			vy = MAX_STRUCTURAL_UP;
			touched = true;
		}
		const speed = Math.hypot(vx, vy, vz);
		if (speed > MAX_SPEED) {
			const k = MAX_SPEED / speed;
			vx *= k;
			vy *= k;
			vz *= k;
			touched = true;
		}
		if (touched) {
			rb.setLinvel({
				x: vx,
				y: vy,
				z: vz
			}, false);
			sb.prevVel.x = vx;
			sb.prevVel.y = vy;
			sb.prevVel.z = vz;
		}
	}
	/**
	* Un impacto reparte energía: parte se la queda la pieza que golpea y parte
	* se transmite a lo que hay debajo. Así un forjado que cae daña al de abajo
	* y el colapso progresa en vez de detenerse.
	*/
	resolveImpact(sb, dv) {
		sb.impactCooldown = .1;
		const specific = .5 * dv * dv;
		const self = Math.min(.9, specific / Math.max(1, sb.toughness));
		if (self > .004) this.damage(sb, self);
		const energy = .5 * sb.mass * dv * dv;
		if (energy < 4e3) return;
		const p = rbOf(sb)?.translation();
		if (!p) return;
		const reach = Math.max(sb.size[0], sb.size[2]) * .75 + 1.6;
		const targets = [];
		for (const other of this.bodies.values()) {
			if (other === sb || other.destroyed) continue;
			if (other.kind === "terrain") continue;
			const q = rbOf(other)?.translation() ?? other.home;
			const dy = p.y - q.y;
			if (dy < -other.size[1] || dy > other.size[1] + reach) continue;
			if (Math.hypot(p.x - q.x, p.z - q.z) > reach + Math.max(other.size[0], other.size[2]) * .5) continue;
			targets.push(other);
			if (targets.length >= 5) break;
		}
		if (!targets.length) return;
		const share = energy * .5 / targets.length;
		for (const t of targets) {
			const dmg = Math.min(.8, share / Math.max(1, t.mass * t.toughness));
			if (dmg > .004) this.damage(t, dmg);
		}
		if (energy > 6e4) {
			this.trauma = Math.min(1, this.trauma + Math.min(.25, energy / 3e6));
			this.dust.push({
				id: fxId++,
				x: p.x,
				y: p.y - sb.size[1] * .5,
				z: p.z,
				power: Math.min(40, energy / 4e4),
				color: materialOf(sb.material).dust,
				t: 0
			});
			this.emitFx();
		}
	}
	tickFxTimers(dt) {
		if (this.explosions.length) this.explosions = this.explosions.filter((e) => {
			e.t += dt;
			return e.t < 1.8;
		});
		if (this.shockwaves.length) this.shockwaves = this.shockwaves.filter((e) => {
			e.t += dt;
			return e.t < 1.2;
		});
		if (this.dust.length) this.dust = this.dust.filter((e) => {
			e.t += dt;
			return e.t < 2.6;
		});
	}
	placeAt(id, x, z) {
		const sb = this.bodies.get(id);
		const rb = rbOf(sb);
		if (!sb || !rb) return;
		const y = Math.max(sb.size[1] / 2 + .05, rb.translation().y);
		rb.setTranslation({
			x,
			y,
			z
		}, true);
		rb.setLinvel({
			x: 0,
			y: 0,
			z: 0
		}, true);
		rb.setAngvel({
			x: 0,
			y: 0,
			z: 0
		}, true);
		sb.home = {
			x,
			y,
			z
		};
		if (sb.buildingId) this.structure.markDirty();
	}
	rotateY(id, dyaw) {
		const rb = rbOf(this.bodies.get(id));
		if (!rb) return;
		const r = rb.rotation();
		const half = dyaw / 2;
		const sy = Math.sin(half);
		const cy = Math.cos(half);
		rb.setRotation({
			x: cy * r.x + sy * r.z,
			y: cy * r.y + sy * r.w,
			z: cy * r.z - sy * r.x,
			w: cy * r.w - sy * r.y
		}, true);
	}
	liveState(id) {
		const sb = this.bodies.get(id);
		if (!sb) return null;
		const rb = rbOf(sb);
		const p = rb?.translation();
		const r = rb?.rotation();
		const v = rb?.linvel();
		const speed = v ? Math.hypot(v.x, v.y, v.z) : 0;
		let estado = "Estable";
		if (sb.destroyed || p && p.y < -4) estado = "Destruido";
		else if (sb.awakened && speed > 1.5) estado = "En colapso";
		else if (sb.awakened) estado = "Suelto";
		else if (sb.releaseIn >= 0) estado = "A punto de ceder";
		else if (sb.overloaded) estado = "Sobrecargado";
		else if (sb.integrity < .45) estado = "Inestable";
		else if (sb.integrity < .85) estado = "Dañado";
		const capacity = sb.supportCapacity * Math.pow(Math.max(0, sb.integrity), 1.5);
		const uso = capacity > 1 ? Math.min(999, sb.loadAbove / capacity * 100) : 0;
		return {
			...sb,
			px: p?.x ?? sb.home.x,
			py: p?.y ?? sb.home.y,
			pz: p?.z ?? sb.home.z,
			rx: r?.x ?? 0,
			ry: r?.y ?? 0,
			rz: r?.z ?? 0,
			rw: r?.w ?? 1,
			speed,
			estado,
			integridad: sb.integrity,
			integridadLabel: integrityLabel(sb.integrity),
			soporte: sb.attached,
			cargaSoportada: sb.loadAbove,
			capacidad: capacity,
			usoCapacidad: uso,
			health: sb.integrity * 100,
			maxHealth: 100
		};
	}
	buildingDestroyed(buildingId) {
		const pieces = [...this.bodies.values()].filter((b) => b.buildingId === buildingId);
		if (!pieces.length) return false;
		return pieces.filter((b) => {
			if (b.destroyed) return true;
			const p = rbOf(b)?.translation();
			return b.awakened && p && (p.y < 1.5 || Math.abs(p.x) + Math.abs(p.z) > 80);
		}).length / pieces.length > .55;
	}
	bridgeDown() {
		const segs = [...this.bodies.values()].filter((b) => b.kind === "bridge");
		if (!segs.length) return false;
		return segs.filter((s) => s.awakened || s.destroyed).length >= segs.length * .5;
	}
	/** Resumen para pruebas automáticas y diagnóstico. */
	probe() {
		let awake = 0;
		let destroyed = 0;
		let maxY = -Infinity;
		let maxSpeed = 0;
		let maxUpSpeed = 0;
		let below = 0;
		let flying = null;
		for (const sb of this.bodies.values()) {
			if (sb.destroyed) {
				destroyed += 1;
				continue;
			}
			if (sb.awakened) awake += 1;
			const rb = rbOf(sb);
			const p = rb?.translation();
			const v = rb?.linvel();
			if (p) {
				if (p.y > maxY) {
					maxY = p.y;
					flying = sb.name;
				}
				if (p.y < -2) below += 1;
			}
			if (v) {
				const s = Math.hypot(v.x, v.y, v.z);
				if (s > maxSpeed) maxSpeed = s;
				if (v.y > maxUpSpeed) maxUpSpeed = v.y;
			}
		}
		return {
			total: this.bodies.size,
			awake,
			destroyed,
			debris: this.debrisAlive,
			maxY: maxY === -Infinity ? 0 : maxY,
			maxSpeed,
			maxUpSpeed,
			below,
			highest: flying,
			simTime: this.simTime
		};
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
		power: 20,
		radius: Math.round(naturalRadius(20)),
		height: 1.4,
		x: 0,
		z: 0
	},
	radiusAuto: true,
	marker: {
		x: 0,
		y: 1.4,
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
	setExplosion: (p) => {
		const prev = get().explosion;
		const next = {
			...prev,
			...p
		};
		let radiusAuto = get().radiusAuto;
		if (p.radius !== void 0 && p.radius !== prev.radius) radiusAuto = false;
		else if (p.power !== void 0 && p.power !== prev.power && radiusAuto) next.radius = Math.round(naturalRadius(next.power) * 10) / 10;
		set({
			explosion: next,
			radiusAuto
		});
	},
	setRadiusAuto: (v) => {
		if (v) {
			const e = get().explosion;
			set({
				radiusAuto: true,
				explosion: {
					...e,
					radius: Math.round(naturalRadius(e.power) * 10) / 10
				}
			});
		} else set({ radiusAuto: false });
	},
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
			challengeStatus = (typeof last?.payload.power === "number" ? last.payload.power : 99) <= 10 ? "win" : "fail";
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
			mass: cat.mass ?? 0,
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
		set({ debris: [...get().debris, ...items].slice(-110) });
	},
	retireDebris: (ids) => {
		if (!ids.length) return;
		const drop = new Set(ids);
		ids.forEach((id) => sim.unregister(id));
		set({ debris: get().debris.filter((d) => !drop.has(d.id)) });
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
				x: get().explosion.x,
				y: get().explosion.height,
				z: get().explosion.z
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
		const raw = get().replay.recording;
		if (!raw.length) return;
		const t0 = raw[0].t;
		const rec = raw.map((a) => ({
			...a,
			t: a.t - t0 + .8
		}));
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
if (typeof window !== "undefined") window.__labStore = useLab;
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
/** `charge` en kg equivalentes de TNT. La sonoridad crece con la raíz cúbica. */
function playBoom(charge) {
	const power = Math.min(160, Math.cbrt(Math.max(.05, charge)) * 22);
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
var Scene = (0, import_react.lazy)(() => import("./Scene-DYNm2BxG.mjs"));
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
/** Masa legible: kilos hasta una tonelada, toneladas a partir de ahí. */
function formatMass(kg) {
	if (kg >= 1e3) return `${formatEs(Math.round(kg / 1e3 * 10) / 10)} t`;
	return `${formatEs(Math.round(kg))} kg`;
}
/**
* `y` sólo llega cuando se hace clic directamente sobre una pieza: en ese caso
* la carga estalla justo donde se ha señalado, lo que permite atacar una planta
* alta. Al hacer clic en el suelo se usa la altura del foco del panel.
*/
function detonateAt(x, z, y) {
	const lab = useLab.getState();
	const { power, radius } = lab.explosion;
	const height = y ?? lab.explosion.height;
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
	lab.setMessage(`Explosión detonada · carga ${formatEs(power)} kg TNT · radio ${formatEs(radius)} m`);
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
			}),
			probe: () => sim.probe(),
			setCharge: (power, radius) => {
				useLab.getState().setExplosion({ power });
				if (radius !== void 0) useLab.getState().setExplosion({ radius });
			},
			explodeAt: (x, y, z, power, radius) => {
				const r = radius ?? useLab.getState().explosion.radius;
				sim.explode(x, y, z, power, r);
				playBoom(power);
			},
			wind: (strength = .85) => applyAction({
				type: "wind",
				strength
			}),
			meteor: (x = 0, z = 0, power = 60) => applyAction({
				type: "meteor",
				x,
				z,
				power
			}),
			state: (id) => sim.liveState(id)
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
						children: "Clic en el suelo o sobre cualquier pieza para detonar ahí mismo. Pausa con espacio. El panel izquierdo coloca estructuras y dispara eventos."
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
					children: [
						item.material ? materialLabel(item.material) : "Estructura",
						item.w ? ` · ${item.w}×${item.h}×${item.d}` : "",
						` · ${formatMass(catalogMass(item))}`
					]
				})]
			}, item.id);
		})]
	});
}
/** Escala de referencia de cargas, para que la diferencia se note al momento. */
var CHARGE_PRESETS = [
	{
		id: "muy-debil",
		label: "Muy débil",
		short: "0,5 kg",
		kg: .5,
		hint: "Apenas mueve objetos pequeños. Rompe cristales cerca del foco."
	},
	{
		id: "debil",
		label: "Débil",
		short: "3 kg",
		kg: 3,
		hint: "Desplaza cajas y mobiliario. Abolla chapa. No toca la estructura."
	},
	{
		id: "media",
		label: "Media",
		short: "20 kg",
		kg: 20,
		hint: "Destroza objetos y agrieta el hormigón a corta distancia."
	},
	{
		id: "fuerte",
		label: "Fuerte",
		short: "120 kg",
		kg: 120,
		hint: "Vuelca vehículos y puede arruinar los apoyos de una planta."
	},
	{
		id: "extrema",
		label: "Extrema",
		short: "500 kg",
		kg: 500,
		hint: "Arrasa la planta baja y provoca el colapso de todo el edificio."
	}
];
function EventsPanel() {
	const explosion = useLab((s) => s.explosion);
	const radiusAuto = useLab((s) => s.radiusAuto);
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
						children: "La carga se mide en kilogramos equivalentes de TNT. La distancia, la masa y el material deciden el resultado."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 grid grid-cols-5 gap-1",
						children: CHARGE_PRESETS.map((preset) => {
							const active = Math.abs(explosion.power - preset.kg) < .01;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								title: preset.hint,
								onClick: () => {
									setExplosion({ power: preset.kg });
									playClick();
								},
								className: cn("flex min-h-11 flex-col items-center justify-center rounded-md border px-1 py-1 text-[10px] leading-tight", active ? "border-accent/60 bg-surface-3 text-fg" : "border-border bg-surface-2 text-muted hover:text-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: preset.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[9px] text-subtle",
									children: preset.short
								})]
							}, preset.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Carga (kg TNT)",
						value: explosion.power,
						min: .25,
						max: 500,
						step: .25,
						onChange: (v) => setExplosion({ power: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: `Radio de efecto (m)${radiusAuto ? " · automático" : ""}`,
						value: explosion.radius,
						min: 3,
						max: 90,
						step: .5,
						onChange: (v) => setExplosion({ radius: v })
					}),
					!radiusAuto ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => useLab.getState().setRadiusAuto(true),
						className: "mb-1 text-left text-[10px] text-accent hover:underline",
						children: [
							"Volver al radio automático (",
							formatEs(sim.suggestedRadius(explosion.power)),
							" m)"
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Altura del foco (m)",
						value: explosion.height,
						min: 0,
						max: 30,
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
							power: 60,
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
								v: formatMass(live.mass)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Tamaño",
								v: `${live.size[0].toFixed(1)} × ${live.size[1].toFixed(1)} × ${live.size[2].toFixed(1)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Resistencia",
								v: `${formatEs(Math.round(live.strength))} kPa`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Posición",
								v: `${live.px.toFixed(1)}, ${live.py.toFixed(1)}, ${live.pz.toFixed(1)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Estado",
								v: live.estado
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Soporte",
								v: live.soporte ? "Apoyada" : "Suelta"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 overflow-hidden rounded-full bg-surface-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("h-full transition-[width] duration-200", live.integridad > .6 ? "bg-accent" : live.integridad > .3 ? "bg-warn" : "bg-danger"),
									style: { width: `${Math.max(0, live.integridad * 100)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[10px] text-subtle",
								children: [
									"Integridad ",
									formatEs(Math.round(live.integridad * 100)),
									" % ·",
									" ",
									integrityLabel(live.integridad)
								]
							}),
							live.soporte && live.capacidad > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("h-full", live.usoCapacidad > 100 ? "bg-danger" : "bg-subtle"),
									style: { width: `${Math.min(100, live.usoCapacidad)}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[10px] text-subtle",
								children: [
									"Carga que soporta ",
									formatMass(live.cargaSoportada / 9.81),
									" ·",
									" ",
									formatEs(Math.round(live.usoCapacidad)),
									" % de su capacidad",
									live.overloaded ? " · sobrecargada" : ""
								]
							})] }) : null,
							!live.soporte && live.speed > .2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[10px] text-subtle",
								children: [
									"Velocidad ",
									formatEs(Math.round(live.speed * 10) / 10),
									" m/s"
								]
							}) : null,
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
export { useLab as a, BUILDINGS as c, LAMPS as d, VEHICLES as f, playBoom as i, CRATES as l, materialOf as m, held as n, sim as o, densityFor as p, setInjectedKeys as r, BARRIERS as s, routes_exports as t, FLOOR_H as u };

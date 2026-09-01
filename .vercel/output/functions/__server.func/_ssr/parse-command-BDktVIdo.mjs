//#region node_modules/.nitro/vite/services/ssr/assets/parse-command-BDktVIdo.js
function strip(s) {
	return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function num(text, fallback) {
	const m = text.match(/(\d+(?:[.,]\d+)?)/);
	if (!m) return fallback;
	return Number(m[1].replace(",", "."));
}
function strength(text, base) {
	if (/muy fuerte|extremo|enorme|brutal|maximo/.test(text)) return Math.min(1, base + .45);
	if (/fuerte|grande|intensa|potente/.test(text)) return Math.min(1, base + .28);
	if (/suave|leve|pequena|floja|minima/.test(text)) return Math.max(.15, base - .3);
	return base;
}
function parseCommand(prompt) {
	const p = strip(prompt.trim());
	const actions = [];
	if (!p) return {
		ok: false,
		message: "Escribe una instrucción, por ejemplo: «Provoca un terremoto fuerte».",
		actions: []
	};
	if (/reinicia|reset|desde cero|volver a empezar/.test(p)) actions.push({ type: "reset" });
	if (/pausa|pausar|detener/.test(p)) actions.push({
		type: "timescale",
		value: 0
	});
	if (/camara lenta|slow motion|0,\s*25|0\.25/.test(p)) actions.push({
		type: "timescale",
		value: .25
	});
	else if (/media velocidad|0,\s*5|0\.5/.test(p)) actions.push({
		type: "timescale",
		value: .5
	});
	else if (/acelera|rapido|10x|x10/.test(p)) actions.push({
		type: "timescale",
		value: 10
	});
	else if (/reanuda|continua|tiempo real|1x/.test(p)) actions.push({
		type: "timescale",
		value: 1
	});
	if (/orbita/.test(p)) actions.push({
		type: "camera",
		mode: "orbit"
	});
	if (/cinemat/.test(p)) actions.push({
		type: "camera",
		mode: "cinematic"
	});
	if (/primera persona|fps/.test(p)) actions.push({
		type: "camera",
		mode: "fps"
	});
	if (/libre/.test(p) && /camara/.test(p)) actions.push({
		type: "camera",
		mode: "free"
	});
	if (/seguimiento|seguir/.test(p)) actions.push({
		type: "camera",
		mode: "follow"
	});
	if (/puente/.test(p) && /constru|pon|crea|anade|coloca/.test(p)) {
		actions.push({
			type: "spawn",
			catalog: "puente-mod",
			x: 0,
			z: 0
		});
		if (num(p, 0) >= 50) {
			actions.push({
				type: "spawn",
				catalog: "puente-mod",
				x: 4,
				z: 0
			});
			actions.push({
				type: "spawn",
				catalog: "puente-mod",
				x: -4,
				z: 0
			});
		}
	} else if (/torre/.test(p) && /constru|pon|crea|anade|coloca/.test(p)) actions.push({
		type: "spawn",
		catalog: "torre",
		x: 0,
		z: 12
	});
	else if (/edificio/.test(p) && /constru|pon|crea|anade|coloca/.test(p)) actions.push({
		type: "spawn",
		catalog: "edificio-medio",
		x: 0,
		z: -12
	});
	if (/meteor/.test(p)) {
		const s = strength(p, .7);
		actions.push({
			type: "meteor",
			x: /central|centro/.test(p) ? 22 : /azul/.test(p) ? 22 : 0,
			z: /central|centro/.test(p) ? 2 : /azul/.test(p) ? -16 : 0,
			power: 40 + s * 80
		});
	}
	if (/terremoto|sismo|seismo/.test(p)) actions.push({
		type: "earthquake",
		intensity: strength(p, .7)
	});
	if (/viento|vendaval|huracan/.test(p)) actions.push({
		type: "wind",
		strength: strength(p, .65)
	});
	if (/onda expansiva|onda de choque/.test(p)) actions.push({
		type: "shockwave",
		power: 50 + strength(p, .6) * 80,
		x: 0,
		z: 0
	});
	if (/colapso|derrumbe|derrumba/.test(p)) {
		let target = "all";
		if (/azul/.test(p)) target = "east-blue";
		else if (/central|centro|torre/.test(p)) target = "east-center";
		else if (/puente/.test(p)) target = "bridge";
		actions.push({
			type: "collapse",
			target
		});
	}
	if (/explosion|explota|estalla|detona|bomba/.test(p)) {
		const s = strength(p, .65);
		let x = 0;
		let z = 0;
		if (/central|centro/.test(p)) {
			x = 22;
			z = 2;
		} else if (/azul/.test(p)) {
			x = 22;
			z = -16;
		} else if (/puente/.test(p)) {
			x = 0;
			z = 0;
		} else if (/oeste/.test(p)) {
			x = -22;
			z = 0;
		}
		actions.push({
			type: "explosion",
			power: 40 + s * 90,
			radius: 12 + s * 14,
			height: 2.5,
			x,
			z
		});
	}
	if (actions.length === 0) return {
		ok: false,
		message: "No he podido interpretar eso. Prueba con «terremoto fuerte», «explota la torre central» o «lanza un meteorito al puente».",
		actions: []
	};
	const bits = [];
	for (const a of actions) {
		if (a.type === "explosion") bits.push("he detonado una explosión");
		if (a.type === "earthquake") bits.push("he iniciado un terremoto");
		if (a.type === "meteor") bits.push("he lanzado un meteorito");
		if (a.type === "wind") bits.push("he activado viento fuerte");
		if (a.type === "collapse") bits.push("he forzado un colapso estructural");
		if (a.type === "shockwave") bits.push("he emitido una onda expansiva");
		if (a.type === "spawn") bits.push("he colocado una estructura");
		if (a.type === "reset") bits.push("he reiniciado el laboratorio");
		if (a.type === "timescale") bits.push("he ajustado el tiempo");
		if (a.type === "camera") bits.push("he cambiado la cámara");
	}
	return {
		ok: true,
		message: bits.length ? `De acuerdo: ${bits.join(" y ")}.` : "Instrucción aplicada.",
		actions
	};
}
//#endregion
export { parseCommand as t };

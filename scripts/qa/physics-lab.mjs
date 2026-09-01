/**
 * Banco de pruebas físicas de DESTRUCT LAB.
 *
 * Abre la app en Chromium, ejecuta escenarios reales contra `window.__lab` y
 * mide el resultado. No comprueba que compile: comprueba que la simulación se
 * comporta como debe (nada sale volando, la gravedad manda, la masa importa).
 *
 *   node scripts/qa/physics-lab.mjs [--url http://127.0.0.1:8080] [--shot nombre]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const url = argOf("--url") ?? "http://127.0.0.1:8080";
const shotDir = argOf("--shots") ?? "screenshots/qa";

function argOf(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

mkdirSync(shotDir, { recursive: true });

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "  OK  " : " FALLO"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const page = await (async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium",
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--no-sandbox",
    ],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  p.__browser = browser;
  p.on("pageerror", (e) => console.log("  [error de página]", e.message));
  p.on("console", (m) => {
    if (m.type() === "error") console.log("  [consola]", m.text().slice(0, 200));
  });
  return p;
})();

await page.goto(url, { waitUntil: "domcontentloaded" });
// Esperamos a que React hidrate: el botón existe en el HTML servido mucho
// antes de que tenga manejadores.
await page.waitForFunction(() => !!window.__labStore, null, { timeout: 90000 });
const startBtn = page.locator("button", { hasText: /entrar al laboratorio/i }).first();
await startBtn.waitFor({ state: "visible", timeout: 90000 });
await startBtn.click();
await page.waitForTimeout(600);
if (!(await page.evaluate(() => window.__labStore.getState().started))) {
  await page.evaluate(() => window.__labStore.getState().start());
}
await page.waitForFunction(() => !!window.__lab, null, { timeout: 90000 });
await page.waitForFunction(() => (window.__lab.probe().total ?? 0) > 30, null, { timeout: 120000 });
await page.waitForTimeout(2500);

/** Deja correr la simulación N segundos de reloj. */
const settle = (s) => page.waitForTimeout(s * 1000);
const probe = () => page.evaluate(() => window.__lab.probe());
const reset = async () => {
  await page.evaluate(() => window.__lab.reset());
  await page.waitForTimeout(2200);
};
const boom = (x, y, z, kg, r) =>
  page.evaluate(([x, y, z, kg, r]) => window.__lab.explodeAt(x, y, z, kg, r), [x, y, z, kg, r]);
const shot = (name) => page.screenshot({ path: `${shotDir}/${name}.png` });

await shot("00-ciudad");
const base = await probe();
console.log(`\nMundo inicial: ${base.total} cuerpos\n`);
check("La escena arranca con cuerpos registrados", base.total > 40, `${base.total} cuerpos`);

/* --------------------------------------------------------------- */
console.log("\n— 1. Escalado de la carga cerca de un edificio grande —");
/* Torre central en (22, 2). Detonamos a 5 m de su base. */
const ladder = [];
for (const kg of [0.5, 3, 20, 120, 500]) {
  await reset();
  await boom(14, 1.4, 2, kg, undefined);
  await settle(4);
  const p = await probe();
  ladder.push({ kg, ...p });
  await shot(`01-carga-${kg}`);
  console.log(
    `  ${String(kg).padStart(5)} kg → sueltos ${String(p.awake).padStart(3)}` +
      ` · destruidos ${String(p.destroyed).padStart(3)}` +
      ` · altura máx ${p.maxY.toFixed(1)} m · v máx ${p.maxSpeed.toFixed(1)} m/s` +
      ` · v vertical máx ${p.maxUpSpeed.toFixed(1)} m/s`,
  );
}
const [muyDebil, debil, media, fuerte, extrema] = ladder;
check(
  "Una carga muy débil no toca la estructura del edificio",
  muyDebil.awake <= 2 && muyDebil.destroyed <= 2,
  `${muyDebil.awake} sueltos / ${muyDebil.destroyed} destruidos`,
);
check(
  "La escala es monótona: más carga, más efecto",
  debil.awake + debil.destroyed >= muyDebil.awake + muyDebil.destroyed &&
    media.awake + media.destroyed >= debil.awake + debil.destroyed &&
    fuerte.awake + fuerte.destroyed >= media.awake + media.destroyed,
  ladder.map((l) => `${l.kg}kg:${l.awake + l.destroyed}`).join(" "),
);
check(
  "Una carga extrema sí causa daños graves",
  extrema.awake + extrema.destroyed >= 8,
  `${extrema.awake} sueltos / ${extrema.destroyed} destruidos`,
);
check(
  "Nada sale despedido hacia arriba de forma absurda",
  ladder.every((l) => l.maxUpSpeed < 22),
  `v vertical máx ${Math.max(...ladder.map((l) => l.maxUpSpeed)).toFixed(1)} m/s`,
);
check(
  "Ningún cuerpo se va a la estratosfera",
  ladder.every((l) => l.maxY < 60),
  `altura máx ${Math.max(...ladder.map((l) => l.maxY)).toFixed(1)} m`,
);
await shot("01-extrema");

/* --------------------------------------------------------------- */
console.log("\n— 2. La masa importa: mismo empuje, cuerpos distintos —");
await reset();
await page.evaluate(() => window.__lab.explodeAt(-14, 1.2, -4, 20, 24));
await settle(3);
const massTest = await page.evaluate(() => {
  const out = {};
  for (const id of ["crate-a-0", "car-1", "truck-1", "west-a-f0"]) {
    const s = window.__lab.state(id);
    if (s)
      out[id] = {
        v: Math.round(s.speed * 100) / 100,
        m: Math.round(s.mass),
        y: Math.round(s.py * 100) / 100,
      };
  }
  return out;
});
console.log("  ", JSON.stringify(massTest));

/* --------------------------------------------------------------- */
console.log("\n— 3. Explosión en la base contra explosión en altura —");
await reset();
await boom(18.5, 1.2, 2, 250, 26);
await settle(7);
const baseHit = await probe();
await reset();
await boom(18.5, 17, 2, 250, 26);
await settle(7);
const topHit = await probe();
console.log(
  `  base: ${baseHit.awake} sueltos / ${baseHit.destroyed} destruidos · ` +
    `alto: ${topHit.awake} sueltos / ${topHit.destroyed} destruidos`,
);
check(
  "Atacar la base es más destructivo que atacar la coronación",
  baseHit.awake + baseHit.destroyed > topHit.awake + topHit.destroyed,
  `base ${baseHit.awake + baseHit.destroyed} vs alto ${topHit.awake + topHit.destroyed}`,
);
await shot("03-colapso-base");
await reset();
await boom(18.5, 1.2, 2, 60, 26);
await settle(3.5);
await shot("03-colapso-progreso");
await settle(6);
await shot("03-colapso-fin");

/* --------------------------------------------------------------- */
console.log("\n— 4. Explosión lejana: no debe pasar nada —");
await reset();
await boom(0, 1.4, 42, 20, undefined);
await settle(3);
const far = await probe();
check(
  "Una explosión lejos de todo no destruye nada",
  far.destroyed === 0 && far.awake <= 1,
  `${far.awake}/${far.destroyed}`,
);

/* --------------------------------------------------------------- */
console.log("\n— 5. Terremotos —");
for (const i of [0.3, 0.85]) {
  await reset();
  await page.evaluate((v) => window.__lab.earthquake(v), i);
  await settle(9);
  const p = await probe();
  console.log(
    `  intensidad ${i} → sueltos ${p.awake} · destruidos ${p.destroyed} · v vert máx ${p.maxUpSpeed.toFixed(1)} · alt máx ${p.maxY.toFixed(1)}`,
  );
  check(
    `Terremoto ${i}: nada sale volando hacia arriba`,
    p.maxUpSpeed < 12 && p.maxY < 45,
    `vy ${p.maxUpSpeed.toFixed(1)} · y ${p.maxY.toFixed(1)}`,
  );
}
await shot("05-terremoto");

/* --------------------------------------------------------------- */
console.log("\n— 6. Viento fuerte —");
await reset();
await page.evaluate(() => window.__lab.wind(1));
await settle(9);
const wind = await probe();
console.log(
  `  sueltos ${wind.awake} · v máx ${wind.maxSpeed.toFixed(1)} · alt máx ${wind.maxY.toFixed(1)}`,
);
check(
  "El viento no lanza la ciudad por los aires",
  wind.maxSpeed < 60 && wind.maxY < 45,
  `v ${wind.maxSpeed.toFixed(1)}`,
);

/* --------------------------------------------------------------- */
console.log("\n— 7. Meteorito —");
await reset();
await page.evaluate(() => window.__lab.meteor(22, 2, 120));
await settle(8);
const met = await probe();
console.log(
  `  sueltos ${met.awake} · destruidos ${met.destroyed} · alt máx ${met.maxY.toFixed(1)}`,
);
check(
  "El impacto de meteorito produce destrucción",
  met.awake + met.destroyed > 2,
  `${met.awake}/${met.destroyed}`,
);
await shot("07-meteorito");

/* --------------------------------------------------------------- */
console.log("\n— 8. Reposo: todo acaba quieto y sobre el suelo —");
await reset();
await boom(18.5, 1.2, 2, 400, 30);
await settle(14);
const rest = await probe();
console.log(
  `  v máx tras 14 s: ${rest.maxSpeed.toFixed(2)} m/s · piezas bajo el suelo: ${rest.below} · escombros ${rest.debris}`,
);
check("La escena se estabiliza", rest.maxSpeed < 4.5, `v máx ${rest.maxSpeed.toFixed(2)} m/s`);
check("Nada atraviesa el suelo", rest.below === 0, `${rest.below} piezas por debajo`);
check("El número de escombros está acotado", rest.debris <= 120, `${rest.debris} escombros`);
await shot("08-reposo");

/* --------------------------------------------------------------- */
console.log("\n— 9. Rendimiento —");
const fps = await page.evaluate(async () => {
  let frames = 0;
  const t0 = performance.now();
  await new Promise((res) => {
    const tick = () => {
      frames++;
      if (performance.now() - t0 > 3000) res();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return Math.round((frames * 1000) / (performance.now() - t0));
});
console.log(`  ${fps} fps con la escena destruida (Chromium por software)`);

/* --------------------------------------------------------------- */
console.log("\n— 10. Reinicio —");
await reset();
const after = await probe();
check(
  "El reinicio devuelve el mundo a su estado inicial",
  after.awake === 0 && after.destroyed === 0 && after.total >= base.total - 2,
  `${after.total} cuerpos, ${after.awake} sueltos`,
);
await shot("10-reinicio");

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
await page.__browser.close();
process.exit(failed.length ? 1 : 0);

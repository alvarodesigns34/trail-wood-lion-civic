/**
 * Traza temporal de un colapso: mide, planta a planta, cuándo se suelta cada
 * una y a qué altura está. Sirve para comprobar que el derrumbe progresa en
 * vez de convertir todo el edificio en piezas sueltas a la vez.
 *
 *   node scripts/qa/collapse.mjs [--building east-center] [--kg 250]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const at = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const building = at("--building", "east-center");
const kg = Number(at("--kg", "250"));
const bx = Number(at("--x", "18.5"));
const bz = Number(at("--z", "2"));
const by = Number(at("--y", "1.2"));
const shots = at("--shots", "screenshots/qa");
mkdirSync(shots, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium",
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--no-sandbox",
  ],
});
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
page.on("pageerror", (e) => console.log("  [error]", e.message.slice(0, 160)));
await page.goto("http://127.0.0.1:8080", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => !!window.__labStore, null, { timeout: 90000 });
await page.evaluate(() => window.__labStore.getState().start());
await page.waitForFunction(() => (window.__lab?.probe().total ?? 0) > 30, null, {
  timeout: 120000,
});
await page.waitForTimeout(2500);

const sample = (id) =>
  page.evaluate((id) => {
    const out = [];
    for (let i = 0; i < 14; i++) {
      const s = window.__lab.state(`${id}-f${i}`);
      if (!s) break;
      out.push({
        i,
        y: Math.round(s.py * 100) / 100,
        integ: Math.round(s.integrity * 100),
        attached: s.attached,
        destroyed: s.destroyed,
        estado: s.estado,
      });
    }
    return out;
  }, id);

console.log(`\nEdificio ${building} · carga ${kg} kg TNT en (${bx}, ${by}, ${bz})\n`);
const before = await sample(building);
console.log("planta  y inicial  integridad");
before.forEach((f) =>
  console.log(`  ${String(f.i).padStart(2)}   ${String(f.y).padStart(7)}     ${f.integ}%`),
);

await page.evaluate(([x, y, z, kg]) => window.__lab.explodeAt(x, y, z, kg), [bx, by, bz, kg]);

console.log("\n  t(s)  plantas unidas   alturas (m)                              integridad base");
for (let t = 0; t <= 24; t++) {
  await page.waitForTimeout(250);
  const s = await sample(building);
  const attached = s.filter((f) => f.attached && !f.destroyed).length;
  const ys = s.map((f) => (f.destroyed ? " -- " : f.y.toFixed(1).padStart(5))).join("");
  console.log(
    `  ${(t * 0.25).toFixed(2).padStart(5)}      ${String(attached).padStart(2)}/${s.length}       ${ys}   ${s[0]?.integ ?? "-"}%`,
  );
  if (t === 4) await page.screenshot({ path: `${shots}/colapso-t1.png` });
  if (t === 12) await page.screenshot({ path: `${shots}/colapso-t3.png` });
}
await page.waitForTimeout(6000);
await page.screenshot({ path: `${shots}/colapso-final.png` });
const end = await page.evaluate(() => window.__lab.probe());
console.log(
  `\nFinal: ${end.awake} sueltos · ${end.destroyed} destruidos · v máx ${end.maxSpeed.toFixed(2)} m/s · escombros ${end.debris}`,
);
await browser.close();

import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import fs from "fs";
const dir = process.env.AD, FPS = 30;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto(`file://${dir}/ad.html`);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
for (const [name, fn, secs] of [["main", "render", 10], ["bumper", "renderBumper", 1]]) {
  fs.mkdirSync(`${dir}/frames-${name}`, { recursive: true });
  for (let i = 0; i < secs * FPS; i++) {
    await p.evaluate(([f, t]) => window[f](t), [fn, i / FPS]);
    await p.screenshot({ path: `${dir}/frames-${name}/${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 92 });
  }
}
console.log("fonts:", await p.evaluate(() => [...document.fonts].filter(f => f.status === "loaded").map(f => f.family + f.weight).join(",")));
console.log("errors", errs);
await b.close();

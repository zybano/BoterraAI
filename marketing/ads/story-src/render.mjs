import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import fs from "fs";
const dir = process.env.D, FPS = 30, mode = process.argv[2];
const TL = JSON.parse(fs.readFileSync(`${dir}/timeline.json`, "utf8"));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
await p.goto(`file://${dir}/story.html`);
await p.evaluate((tl) => { window.TL = tl; window.build(tl.texts); return document.fonts.ready; }, TL);
await p.waitForTimeout(800);
if (mode === "sample") {
  for (const t of process.argv.slice(3).map(Number)) { await p.evaluate(t => window.render(t), t); await p.screenshot({ path: `${dir}/sample-${t}.jpg`, type: "jpeg", quality: 85 }); }
} else {
  fs.mkdirSync(`${dir}/frames`, { recursive: true });
  for (let i = 0; i < TL.total * FPS; i++) {
    await p.evaluate(t => window.render(t), i / FPS);
    await p.screenshot({ path: `${dir}/frames/${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 92 });
  }
}
console.log("errors", errs);
await b.close();

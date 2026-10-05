import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import fs from "fs";
const files = process.argv.slice(2);
fs.mkdirSync("out/mockups", { recursive: true });
const b = await chromium.launch();
for (const f of files) {
  const p = await b.newPage({ viewport: { width: 2100, height: 1200 }, deviceScaleFactor: 1 });
  const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("requestfailed", r => errs.push("failed " + r.url()));
  await p.goto("file://" + process.cwd() + "/" + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  for (const el of await p.$$("[data-shot]")) {
    const name = await el.getAttribute("data-shot");
    await el.screenshot({ path: `out/mockups/${name}.png` });
    process.stdout.write(name + " ");
  }
  if (errs.length) console.log("\nERR", f, errs);
  await p.close();
}
await b.close(); console.log("\ndone");

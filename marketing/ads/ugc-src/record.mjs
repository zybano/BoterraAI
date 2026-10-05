import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
const BASE = "http://localhost:3200", OUT = process.env.OUT;
const b = await chromium.launch();
const vp = { width: 430, height: 932 };
import fs from "fs";
async function ctxFor(name, storageState) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true, storageState });
  const origNewPage = ctx.newPage.bind(ctx);
  ctx.newPage = async () => {
    const page = await origNewPage();
    const dir = `${OUT}/${name}`; fs.mkdirSync(dir, { recursive: true });
    const frames = []; let on = true; const t0 = Date.now();
    const loop = (async () => {
      while (on) {
        try {
          if (page.url() === "about:blank") { await new Promise(r => setTimeout(r, 30)); continue; }
          const buf = await page.screenshot({ type: "jpeg", quality: 90, timeout: 2000 });
          const file = `${dir}/${String(frames.length).padStart(5, "0")}.jpg`;
          fs.writeFileSync(file, buf); frames.push({ file, ts: (Date.now() - t0) / 1000 });
        } catch { await new Promise(r => setTimeout(r, 20)); }
      }
    })();
    const origClose = ctx.close.bind(ctx);
    ctx.close = async () => { on = false; await loop; fs.writeFileSync(`${dir}/frames.json`, JSON.stringify(frames)); return origClose(); };
    return page;
  };
  return ctx;
}
const pause = (p, ms) => p.waitForTimeout(ms);
async function typeSlow(p, sel, text, d = 45) { await p.click(sel); await p.type(sel, text, { delay: d }); }

// A: sign up + onboarding
let c = await ctxFor("A");
let p = await c.newPage();
await p.goto(`${BASE}/signup`); await pause(p, 600);
await typeSlow(p, "#name", "Ife Adeyemi", 35);
await typeSlow(p, "#email", "ife@ifestudio.co", 25);
await typeSlow(p, "#password", "supersecret1", 20);
await p.click("button[type=submit]"); await p.waitForURL("**/onboarding"); await pause(p, 700);
await typeSlow(p, "#businessName", "Ife Studio", 60);
await p.selectOption("#country", "Nigeria"); await pause(p, 400);
await p.click("text=E-commerce & D2C"); await pause(p, 700);
await p.click("text=Continue"); await pause(p, 500);
await p.selectOption("#teamSize", "Just me"); await p.selectOption("#monthlyRevenue", "$5k–$25k / month"); await pause(p, 300);
await typeSlow(p, "#description", "Handmade jewellery and accessories, sold online.", 25);
await p.click("text=Continue"); await pause(p, 500);
await p.click("label:has-text('Save my own time')"); await pause(p, 250);
await p.click("label:has-text('Grow revenue')"); await pause(p, 400);
await p.click("text=Launch my AI workforce");
await p.waitForURL("**/app?welcome=1"); await pause(p, 2500);
await p.mouse.wheel(0, 900); await pause(p, 1500);
const state = await c.storageState();
await c.close();

// B: add Tally to the team
c = await ctxFor("B", state); p = await c.newPage();
await p.goto(`${BASE}/app/agents`); await pause(p, 900);
const tally = p.locator("div.card", { hasText: "Invoicing & Collections" });
await tally.scrollIntoViewIfNeeded(); await pause(p, 900);
await tally.locator("button:has-text('Add to team')").click(); await pause(p, 1800);
await c.close();

// C: launch a mission
c = await ctxFor("C", state); p = await c.newPage();
await p.goto(`${BASE}/app`); await pause(p, 900);
await typeSlow(p, "input[name=goal]", "Chase my unpaid invoices and plan next week's posts", 40);
await pause(p, 400);
await p.click("text=Launch mission");
await p.waitForURL("**/app/missions/*"); await pause(p, 4500);
await p.mouse.wheel(0, 500); await pause(p, 2000);
await c.close();

// D: approvals
c = await ctxFor("D", state); p = await c.newPage();
await p.goto(`${BASE}/app/approvals`); await pause(p, 1200);
await p.locator("button:has-text('Approve')").first().click(); await pause(p, 1800);
await c.close();

// E: Monday briefing routine
c = await ctxFor("E", state); p = await c.newPage();
await p.goto(`${BASE}/app/routines`); await pause(p, 1000);
await p.locator("li", { hasText: "Monday executive briefing" }).locator("button:has-text('Run now')").click();
await p.waitForSelector("text=Latest report", { timeout: 20000 }); await pause(p, 600);
await p.locator("summary:has-text('Latest report')").first().click(); await pause(p, 2200);
await c.close();
await b.close();
console.log("done");

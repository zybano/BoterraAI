"""Builds the Boterra AI brand book page (book/index.html)."""
import json, html
from prompts import PROMPTS, PAL

pal = json.load(open("palette.json"))
E = html.escape

def sw(p):
    light = p["token"] in ("paper", "mist", "silver", "teal", "cyan", "warning")
    fg = "#0A1230" if light else "#FFFFFF"
    r, g, b = p["rgb"]; c, m, y, k = p["cmyk"]
    on = []
    if "onPaper" in p:
        on = [f'on Paper {p["onPaper"]}:1', f'on Navy {p["onNavy"]}:1']
    return f'''<figure class="sw"><div class="chip" style="background:{p["hex"]};color:{fg}"><span>{E(p["name"])}</span><span class="mono">{p["hex"]}</span></div>
      <figcaption><b>{E(p["role"])}</b><span class="mono">RGB {r} {g} {b}</span><span class="mono">CMYK {c} {m} {y} {k}</span>{"".join(f'<span class="mono dim">{x}</span>' for x in on)}</figcaption></figure>'''

def tile(src, bg, label, wide=False, h=None):
    return f'<figure class="tile{" wide" if wide else ""}"><div class="tbg" style="background:{bg}"><img src="{src}" alt="{E(label)}" style="{f"height:{h}px" if h else ""}"></div><figcaption>{E(label)}</figcaption></figure>'

LOGO_GRID = "".join([
    tile("logos/boterra-horizontal-gradient.svg", "#0A1230", "Primary horizontal · gradient on navy", True, 64),
    tile("logos/boterra-horizontal-color-light.svg", "#F7F9FC", "Primary horizontal · flat on paper", True, 64),
    tile("logos/boterra-vertical-gradient.svg", "#0A1230", "Vertical lockup · gradient", h=130),
    tile("logos/boterra-vertical-color-light.svg", "#F7F9FC", "Vertical lockup · flat", h=130),
    tile("logos/boterra-symbol-gradient.svg", "radial-gradient(circle at 30% 20%,#1A2A7A,#0A1230 70%)", "Symbol · Flow B (gradient)", h=120),
    tile("logos/boterra-symbol-color-light.svg", "#FFFFFF", "Symbol · flat", h=120),
    tile("logos/boterra-orbit-gradient.svg", "#0A1230", "Abstract symbol · Orbit", h=120),
    tile("logos/boterra-monogram-gradient.svg", "#0A1230", "Monogram · BA", h=100),
    tile("logos/boterra-app-icon.svg", "#151C36", "Icon-only · app (dark)", h=130),
    tile("logos/boterra-app-icon-light.svg", "#E7EBF3", "Icon-only · app (light)", h=130),
    tile("logos/favicon.svg", "#E7EBF3", "Favicon (16–48 px)", h=64),
    tile("logos/boterra-agent-avatar.svg", "#151C36", "AI agent avatar", h=120),
    tile("logos/boterra-horizontal-black.svg", "#FFFFFF", "One colour · black", True, 56),
    tile("logos/boterra-horizontal-white.svg", "#2B5CFF", "One colour · white (reversed)", True, 56),
    tile("logos/boterra-icon-3d.svg", "#05091A", "3D concept render · glass icon", h=220),
    tile("logos/boterra-monogram-color-light.svg", "#F7F9FC", "Monogram · flat", h=100),
])

MOCK = [
    ("Website", [("web-dark", "Homepage · dark mode (full page)", "Hero with the brand promise, an industry strip, six agent cards, a Map → Automate → Monitor process, pricing and a contact form."),
                 ("web-light", "Homepage · light mode (full page)", "Same layout on Paper, using Teal Ink and Violet Ink for accessible accents."),
                 ("web-dark-hero", "Hero · dark", "Headline with a gradient keyword and a live workflow card proving the promise in one glance."),
                 ("web-light-features", "Features · light", "Each agent card carries an AGT code, a mono micro-label that signals precision."),
                 ("web-dark-pricing", "Pricing · dark", "Four plans; Growth carries the aurora gradient border."),
                 ("web-light-cta", "Contact / CTA · light", "Lead form framed by orbit lines: 'Tell us the workflow you hate most.'")]),
    ("Product", [("product-dashboard", "AI agent dashboard", "KPIs, hours-saved chart, agent status, and a live activity log that doubles as the audit trail."),
                 ("product-builder", "Automation workflow builder", "Node canvas with trigger, agent and human-approval steps; inspector shows instructions, tools and approval rules."),
                 ("product-mobile", "Mobile app concept", "Home (needs-you queue), agent detail, and one-tap approval.")]),
    ("Pitch deck", [(f"deck-0{i}", t, d) for i, t, d in [
        (1, "Title", "Gradient keyword, node mesh and orbit lines."), (2, "Problem", "Three pains in glass cards."), (3, "Solution", "Light slide for rhythm; Map → Automate → Monitor."),
        (4, "Product", "Live dashboard as the hero image."), (5, "Market", "Sourced numbers only."), (6, "Pricing", "Same four plans as the website."), (7, "Contact", "Close on the promise and the domain.")]]),
    ("Social media", [("social-ig-stat", "Instagram · stat post", "Big gradient number + one-line proof."), ("social-ig-tip", "Instagram · tip post", "Industry-specific list on Paper."),
                      ("social-ig-launch", "Instagram · announcement", "3D-style app icon in orbit."), ("social-carousel-1", "Carousel · cover", "Hook in two lines."),
                      ("social-carousel-2", "Carousel · step", "Gradient icon tile + plain-language step."), ("social-carousel-4", "Carousel · CTA", "Domain + button."),
                      ("social-linkedin-banner", "LinkedIn banner 1584×396", "Text right-aligned to clear the profile photo."), ("social-x-header", "X / Twitter header 1500×500", "Logo, promise and agent avatar.")]),
    ("Marketing collateral", [("collateral-card-front", "Business card · front", "Gradient lockup over orbit lines."), ("collateral-card-back", "Business card · back", "Paper, aurora edge, contact rows with line icons."),
                              ("collateral-letterhead", "Letterhead (US Letter)", "Aurora rule at the top, symbol in the footer."), ("collateral-email-signature", "Email signature", "App icon, name, role, domain and tagline."),
                              ("collateral-brochure-cover", "Brochure cover", "Vertical-specific guide, e.g. clinics edition."), ("collateral-poster", "Poster 2:3", "'It never gets tired.' with the 3D icon."),
                              ("collateral-rollup-banner", "Roll-up banner 33×80 in", "Agents as a scannable list for events.")]),
]
def gallery():
    out = []
    for group, items in MOCK:
        cards = "".join(f'<figure class="mock"><img src="mockups/{n}.jpg" alt="{E(t)}" loading="lazy"><figcaption><b>{E(t)}</b><span>{E(d)}</span></figcaption></figure>' for n, t, d in items)
        out.append(f'<h3 class="sub">{E(group)}</h3><div class="mocks">{cards}</div>')
    return "".join(out)

def prompt_html():
    out = []
    for i, (tool, d) in enumerate(PROMPTS.items()):
        rows = "".join(f'<div class="prompt"><div class="ph"><b>{E(t)}</b><button type="button" class="copy" data-i="{i}-{j}">Copy</button></div><pre id="p{i}-{j}">{E(p)}</pre></div>' for j, (t, p) in enumerate(d["items"]))
        out.append(f'<details class="tool"{" open" if i == 0 else ""}><summary>{E(tool)} <span class="dim">· {len(d["items"])} prompts</span></summary><p class="note">{E(d["note"])}</p>{rows}</details>')
    return "".join(out)

TYPE_ROWS = [("Display XL", "Sora", "SemiBold 600", "96 / 1.02", "−3.5%", "Hero statements, posters"),
             ("Display", "Sora", "SemiBold 600", "72 / 1.05", "−3%", "Slide titles, section heroes"),
             ("H1", "Sora", "SemiBold 600", "56 / 1.08", "−2.5%", "Page titles"),
             ("H2", "Sora", "SemiBold 600", "40 / 1.12", "−2%", "Section headings"),
             ("H3", "Sora", "SemiBold 600", "28 / 1.2", "−1%", "Card titles"),
             ("Body L", "Manrope", "Regular 400", "19 / 1.6", "0", "Lead paragraphs"),
             ("Body", "Manrope", "Regular 400 / Medium 500", "16 / 1.6", "0", "UI and long-form text"),
             ("Small", "Manrope", "SemiBold 600", "14 / 1.5", "0", "Buttons, captions, table text"),
             ("Label", "JetBrains Mono", "Medium 500, UPPERCASE", "12 / 1.4", "+14%", "Eyebrows, agent codes, timestamps")]

page = f'''<title>Boterra AI Brand Identity</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: a dark-first brand book (deliberately single-theme — the brand's home is midnight navy). Sticky contents rail, one reading column, wide galleries. */
:root {{ --navy:#0A1230; --deep:#08102A; --graphite:#151C36; --charcoal:#2A3352; --fg:#E9EDF6; --muted:#9AA5BF; --line:rgba(185,193,211,.14);
  --blue:#2B5CFF; --violet:#7B5CFF; --teal:#14E0C0; --aurora:linear-gradient(135deg,#2B5CFF 0%,#7B5CFF 55%,#14E0C0 100%);
  --display:"Sora","Segoe UI",Arial,sans-serif; --body:"Manrope","Segoe UI",Arial,sans-serif; --mono:"JetBrains Mono",ui-monospace,Menlo,monospace; color-scheme:dark; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--navy); color:var(--fg); font:16px/1.65 var(--body); -webkit-font-smoothing:antialiased; }}
.wrap {{ max-width:1280px; margin:0 auto; padding-inline:24px; padding-block:0 96px; display:grid; grid-template-columns:200px minmax(0,1fr); gap:56px; }}
@media (max-width:960px) {{ .wrap {{ grid-template-columns:minmax(0,1fr); gap:0; }} .toc {{ display:none; }} }}
.toc {{ position:sticky; top:calc(env(safe-area-inset-top,0px) + 28px); align-self:start; display:flex; flex-direction:column; gap:2px; padding-top:40px; font-size:13.5px; }}
.toc a {{ color:var(--muted); text-decoration:none; padding:6px 10px; border-radius:8px; }}
.toc a:hover, .toc a:focus-visible {{ color:#fff; background:rgba(255,255,255,.06); outline:none; }}
.toc img {{ height:26px; margin:0 10px 18px; }}
main {{ min-width:0; display:flex; flex-direction:column; gap:96px; }}
.hero {{ position:relative; overflow:hidden; margin-top:24px; border-radius:28px; padding:72px 56px; background:radial-gradient(900px 600px at 85% 0%,rgba(123,92,255,.35),transparent 60%),radial-gradient(700px 500px at 0% 100%,rgba(43,92,255,.30),transparent 60%),var(--deep); border:1px solid var(--line); }}
.hero .mesh {{ position:absolute; right:-160px; top:-60px; width:900px; opacity:.5; pointer-events:none; }}
.hero > * {{ position:relative; }}
.eyebrow {{ font:500 12px/1.4 var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--teal); }}
h1, h2, h3 {{ font-family:var(--display); font-weight:600; color:#fff; margin:0; text-wrap:balance; }}
h1 {{ font-size:clamp(40px,6vw,76px); line-height:1.02; letter-spacing:-.035em; margin-top:18px; }}
h2 {{ font-size:clamp(30px,3.6vw,46px); line-height:1.08; letter-spacing:-.025em; }}
h3.sub {{ font-size:22px; letter-spacing:-.01em; margin-top:32px; }}
.grad {{ background:var(--aurora); -webkit-background-clip:text; background-clip:text; color:transparent; }}
p {{ margin:0; max-width:72ch; }} .lead {{ font-size:19px; color:var(--muted); margin-top:20px; }}
section {{ display:flex; flex-direction:column; gap:22px; scroll-margin-top:24px; }}
.secnum {{ font:500 13px var(--mono); color:var(--muted); letter-spacing:.1em; }}
.grid {{ display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }}
.panel {{ background:rgba(255,255,255,.035); border:1px solid var(--line); border-radius:18px; padding:22px; display:flex; flex-direction:column; gap:8px; min-width:0; }}
.panel h4 {{ margin:0; font:600 17px var(--display); color:#fff; }}
.panel p, .panel li {{ color:var(--muted); font-size:15px; }}
.panel ul {{ margin:0; padding-left:18px; display:flex; flex-direction:column; gap:4px; }}
.promise {{ font:600 clamp(22px,2.6vw,30px)/1.35 var(--display); letter-spacing:-.015em; padding:30px 32px; border-radius:20px; color:#fff; background:linear-gradient(var(--deep),var(--deep)) padding-box, var(--aurora) border-box; border:1.5px solid transparent; max-width:none; }}
.traits {{ display:flex; flex-wrap:wrap; gap:8px; }}
.trait {{ font:600 13px var(--body); padding:7px 14px; border-radius:999px; border:1px solid var(--line); color:#fff; }}
.tiles {{ display:grid; gap:14px; grid-template-columns:repeat(4,minmax(0,1fr)); }}
@media (max-width:900px) {{ .tiles {{ grid-template-columns:repeat(2,minmax(0,1fr)); }} }}
.tile {{ margin:0; display:flex; flex-direction:column; gap:8px; min-width:0; }} .tile.wide {{ grid-column:span 2; }}
.tbg {{ border-radius:16px; border:1px solid var(--line); min-height:190px; display:grid; place-items:center; padding:24px; overflow:hidden; }}
.tbg img {{ max-width:100%; height:auto; }}
.tile figcaption {{ font-size:13px; color:var(--muted); }}
.swatches {{ display:grid; gap:14px; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); }}
.sw {{ margin:0; border:1px solid var(--line); border-radius:16px; overflow:hidden; background:rgba(255,255,255,.03); }}
.chip {{ height:110px; padding:14px; display:flex; flex-direction:column; justify-content:space-between; font:600 15px var(--display); }}
.sw figcaption {{ padding:12px 14px; display:flex; flex-direction:column; gap:2px; font-size:13px; }}
.mono {{ font-family:var(--mono); font-size:12px; }} .dim {{ color:var(--muted); }}
.gradbar {{ height:120px; border-radius:18px; display:flex; align-items:flex-end; padding:16px 18px; font:500 12px var(--mono); color:#fff; }}
.table-scroll {{ overflow-x:auto; border:1px solid var(--line); border-radius:16px; }}
table {{ border-collapse:collapse; width:100%; min-width:720px; font-size:14px; }}
th, td {{ text-align:left; padding:12px 16px; border-bottom:1px solid var(--line); vertical-align:top; }}
th {{ font:500 11px var(--mono); letter-spacing:.12em; text-transform:uppercase; color:var(--muted); background:rgba(255,255,255,.03); }}
tr:last-child td {{ border-bottom:0; }}
.specimen {{ display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); }}
.spec {{ padding:26px; border-radius:18px; border:1px solid var(--line); background:rgba(255,255,255,.03); display:flex; flex-direction:column; gap:10px; min-width:0; }}
.spec .big {{ font-size:64px; line-height:1; color:#fff; }}
.mocks {{ display:grid; gap:18px; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); }}
.mock {{ margin:0; border:1px solid var(--line); border-radius:16px; overflow:hidden; background:var(--deep); display:flex; flex-direction:column; }}
.mock img {{ width:100%; display:block; max-height:520px; object-fit:cover; object-position:top; background:#05091A; }}
.mock figcaption {{ padding:14px 16px; display:flex; flex-direction:column; gap:3px; font-size:14px; color:var(--muted); }} .mock b {{ color:#fff; font-family:var(--display); font-weight:600; }}
.dodont {{ display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); }}
.do {{ border-left:3px solid var(--teal); }} .dont {{ border-left:3px solid #F0525A; }}
.tool {{ border:1px solid var(--line); border-radius:16px; background:rgba(255,255,255,.025); }}
.tool summary {{ cursor:pointer; padding:18px 20px; font:600 18px var(--display); color:#fff; }}
.tool .note {{ padding:0 20px 8px; color:var(--muted); font-size:14.5px; }}
.prompt {{ margin:10px 20px 18px; border:1px solid var(--line); border-radius:12px; overflow:hidden; }}
.ph {{ display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(255,255,255,.04); font-size:14px; }}
pre {{ margin:0; padding:14px; white-space:pre-wrap; word-break:break-word; font:12.5px/1.6 var(--mono); color:#C9D5FF; max-width:100%; }}
.copy {{ font:600 12px var(--body); color:#fff; background:var(--blue); border:0; border-radius:8px; padding:6px 12px; cursor:pointer; }}
.copy:focus-visible {{ outline:2px solid var(--teal); outline-offset:2px; }}
.tree {{ font:12.5px/1.7 var(--mono); color:#C9D5FF; padding:18px; border-radius:14px; border:1px solid var(--line); overflow-x:auto; margin:0; }}
.voice td:first-child {{ color:#fff; font-weight:600; white-space:nowrap; }}
</style>

<div class="wrap">
<nav class="toc" aria-label="Contents"><img src="logos/boterra-horizontal-gradient.svg" alt="Boterra AI">
  <a href="#strategy">1 · Strategy</a><a href="#logo">2 · Logo</a><a href="#color">3 · Colour</a><a href="#type">4 · Typography</a><a href="#style">5 · Visual style</a><a href="#voice">5b · Voice &amp; tone</a><a href="#mockups">6 · Mockups</a><a href="#prompts">7 · AI prompts</a><a href="#package">8 · Package</a></nav>
<main>
  <header class="hero"><img class="mesh" src="patterns/mesh-dark.svg" alt="">
    <img src="logos/boterra-horizontal-gradient.svg" alt="Boterra AI" style="height:40px">
    <p class="eyebrow" style="margin-top:40px">Brand identity system · v1.0 · October 2026</p>
    <h1>Workflows that<br><span class="grad">run themselves.</span></h1>
    <p class="lead">The complete visual identity for Boterra AI: strategy, logo system, colour, type, art direction, voice, mockups across web, product, deck, social and print, plus prompts for generating new on-brand imagery.</p></header>

  <section id="strategy" aria-labelledby="s1"><span class="secnum">01</span><h2 id="s1">Brand strategy summary</h2>
    <p class="promise">“We turn your most painful repetitive workflow into an AI-powered system that runs 24/7 and never gets tired.”</p>
    <div class="grid">
      <div class="panel"><h4>Positioning</h4><p>For owners of clinics, law firms, accounting practices, coaching businesses and agencies in Canada and the US, Boterra AI is the automation partner that turns one painful workflow at a time into a dependable AI system, with humans approving what matters.</p></div>
      <div class="panel"><h4>Audience</h4><ul><li>Owner-operators drowning in admin</li><li>Practice and office managers</li><li>Operations leads at 5–100 person firms</li><li>Mindset: pragmatic, time-poor, wary of hype</li></ul></div>
      <div class="panel"><h4>Brand pillars</h4><ul><li><b>Precision</b>: every step mapped, measured, logged</li><li><b>Relentless</b>: runs 24/7, never gets tired</li><li><b>Trusted</b>: approvals and audit trail built in</li><li><b>Clarity</b>: plain language, visible results</li></ul></div>
      <div class="panel"><h4>Name &amp; idea</h4><p>“Bot” + “terra”: agents working across the ground your business stands on. The identity shows <i>AI agents working behind the scenes</i>: a single continuous line (the workflow) that starts from a node (the agent) and never stops.</p></div>
    </div>
    <div class="panel"><h4>Personality</h4><div class="traits">{"".join(f'<span class="trait">{t}</span>' for t in ["Futuristic", "Precise", "Minimalist", "Trustworthy", "High-tech", "Elegant", "Fast-moving", "Premium but accessible"])}</div>
      <p style="margin-top:8px">Futuristic in craft, never in jargon. We look like a premium product and speak like a calm operations expert.</p></div>
    <div class="grid">
      <div class="panel"><h4>Primary tagline</h4><p style="color:#fff;font:600 20px var(--display)">Workflows that run themselves.</p><p>Alternates: “It never gets tired.” · “Your busiest workflow, now on autopilot.” · “Automate what slows you down.”</p></div>
      <div class="panel"><h4>Messaging hierarchy</h4><ul><li><b>Promise</b>: the 24/7 system</li><li><b>Proof</b>: hours saved, response time, zero missed enquiries</li><li><b>Trust</b>: approvals, audit trail, your data stays yours</li><li><b>Action</b>: “Tell us the workflow you hate most.”</li></ul></div>
      <div class="panel"><h4>Elevator pitch</h4><p>Boterra AI maps the workflow that eats your week, then deploys AI agents that run it end to end (intake, scheduling, billing, documents, follow-ups) around the clock, asking you before anything critical.</p></div>
    </div></section>

  <section id="logo" aria-labelledby="s2"><span class="secnum">02</span><h2 id="s2">Logo concepts</h2>
    <div class="grid">
      <div class="panel"><h4>1 · Symbol + wordmark (primary): “Flow B”</h4><p>A B drawn as one continuous rounded line of even weight. It starts at a teal node (the agent), climbs the precise straight stem, completes two bowls and returns with a small gap, a loop that never fully closes because the work never stops. Smooth curves + one sharp-edged stem = precision meets fluency. The wordmark is Sora SemiBold “Boterra” with “AI” in Sora Light, so the product reads first and the category second.</p></div>
      <div class="panel"><h4>2 · Abstract symbol: “Orbit”</h4><p>Three agents (nodes) travel a broken orbit around a diamond core: orchestration, 24/7 cycles, a world (“terra”) of work. Used for AI agent avatars, loaders, status states and pattern art, never as a replacement for the primary logo.</p></div>
      <div class="panel"><h4>3 · Monogram: “BA”</h4><p>The Flow B paired with a sharp chevron A whose crossbar is an agent node: rounded and angular in one mark. For merch, stamps, document watermarks and partner co-branding.</p></div>
      <div class="panel"><h4>4 · Icon-only + 5 · lockups</h4><p>App icon: the Flow B on a midnight tile with a blue glow. Favicon: heavier stroke, white line, teal node for 16 px clarity. Horizontal lockup for headers and documents; vertical lockup for square and stacked formats.</p></div>
    </div>
    <div class="tiles">{LOGO_GRID}</div>
    <div class="grid">
      <div class="panel"><h4>Clear space</h4><p>Keep empty space around every lockup equal to the height of the “B” bowl (≈ ¼ of symbol height) on all sides.</p></div>
      <div class="panel"><h4>Minimum size</h4><ul><li>Symbol: 16 px / 5 mm (favicon art below 24 px)</li><li>Horizontal lockup: 96 px / 25 mm wide</li><li>Vertical lockup: 64 px / 18 mm wide</li></ul></div>
      <div class="panel"><h4>Versions</h4><ul><li>Gradient: hero moments, dark surfaces</li><li>Flat navy/white: UI, documents, light surfaces</li><li>One-colour black/white: print, embossing, fax, engraving</li><li>3D glass: campaign art only</li></ul></div>
      <div class="panel"><h4>Never</h4><ul><li>Rotate, stretch or outline the symbol</li><li>Change the node colour to anything but teal/white/black</li><li>Put the gradient logo on busy photos</li><li>Add robots, faces or speech bubbles</li></ul></div>
    </div></section>

  <section id="color" aria-labelledby="s3"><span class="secnum">03</span><h2 id="s3">Colour palette</h2>
    <p class="lead" style="margin-top:0">Midnight Navy is home. Signal Blue drives action, Pulse Teal marks agents and success, Electric Violet adds the premium glow. Neutrals do the heavy lifting.</p>
    <div class="swatches">{"".join(sw(p) for p in pal)}</div>
    <div class="grid">
      <div class="gradbar" style="background:linear-gradient(135deg,#2B5CFF,#7B5CFF 55%,#14E0C0)">Aurora · 135° · #2B5CFF → #7B5CFF 55% → #14E0C0</div>
      <div class="gradbar" style="background:radial-gradient(120% 90% at 15% 0%,#1A2A7A,#0A1230 60%)">Nightfall · radial · #1A2A7A → #0A1230</div>
      <div class="gradbar" style="background:radial-gradient(70% 90% at 85% 10%,rgba(123,92,255,.55),transparent 60%),radial-gradient(60% 80% at 0% 100%,rgba(43,92,255,.5),transparent 60%),#0A1230">Hero bloom · violet + blue glows on navy</div>
    </div>
    <div class="grid">
      <div class="panel"><h4>Proportion</h4><p>60% Midnight Navy or Paper · 30% neutrals · 10% accents. Gradient on at most one element per view.</p></div>
      <div class="panel"><h4>Accessible pairs</h4><ul><li>White on Signal Blue: 5.15:1 (buttons)</li><li>Navy on Pulse Teal: 10.9:1</li><li>Teal Ink on Paper: 4.98:1 (text links)</li><li>Violet Ink on Paper: 5.8:1</li><li>Silver on Navy: 10.18:1 (secondary text)</li></ul></div>
      <div class="panel"><h4>Rules</h4><ul><li>Pulse Teal and Neon Cyan are for dark surfaces; on light use Teal Deep (graphics) or Teal Ink (text)</li><li>Electric Violet never carries body text</li><li>Semantic colours are for status only, always paired with a word</li></ul></div>
    </div></section>

  <section id="type" aria-labelledby="s4"><span class="secnum">04</span><h2 id="s4">Typography system</h2>
    <div class="specimen">
      <div class="spec"><span class="eyebrow">Primary · headings &amp; display</span><span class="big" style="font-family:var(--display);font-weight:600;letter-spacing:-.03em">Sora</span><p class="dim">Geometric, slightly futuristic, wide apertures. Weights: Light 300 (the “AI” in the wordmark), SemiBold 600 (all headings), Bold 700 (rare emphasis).</p></div>
      <div class="spec"><span class="eyebrow">Secondary · body &amp; UI</span><span class="big" style="font-family:var(--body);font-weight:600">Manrope</span><p class="dim">Modern grotesk with excellent small-size legibility. Regular 400 for reading, Medium 500 for UI, SemiBold 600 for buttons, Bold 700 for numbers in tables.</p></div>
      <div class="spec"><span class="eyebrow">Utility · labels &amp; data</span><span class="big" style="font-family:var(--mono);font-weight:500;font-size:52px">Mono</span><p class="dim">JetBrains Mono for eyebrows, agent codes (AGT-01), timestamps and metrics. It's the visible “machine precision” layer.</p></div>
    </div>
    <div class="table-scroll"><table><thead><tr><th>Style</th><th>Face</th><th>Weight</th><th>Size / line</th><th>Tracking</th><th>Use</th></tr></thead><tbody>
      {"".join(f"<tr><td>{a}</td><td>{b}</td><td>{c}</td><td class='mono'>{d}</td><td class='mono'>{e}</td><td>{f}</td></tr>" for a, b, c, d, e, f in TYPE_ROWS)}</tbody></table></div>
    <div class="grid">
      <div class="panel"><h4>Pairing rules</h4><ul><li>Sora for anything you'd read from across a room; Manrope for anything you read up close</li><li>Mono only in uppercase micro-labels or numbers, never paragraphs</li><li>Max two faces per layout plus mono labels</li></ul></div>
      <div class="panel"><h4>Spacing</h4><ul><li>Tighten display type (−2.5% to −4%); never track body text</li><li>Body measure 60–75 characters</li><li>4 px base grid: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128</li></ul></div>
      <div class="panel"><h4>Emphasis</h4><ul><li>Highlight one keyword per headline with the Aurora gradient</li><li>Use weight, not size jumps, for emphasis in body copy</li><li>Sentence case everywhere; uppercase only for mono labels</li></ul></div>
    </div></section>

  <section id="style" aria-labelledby="s5"><span class="secnum">05</span><h2 id="s5">Visual style &amp; art direction</h2>
    <div class="tiles">{tile("patterns/mesh-dark.svg", "#0A1230", "Agent mesh: nodes and links fading to calm", True)}{tile("patterns/orbits.svg", "#0A1230", "Orbit lines: orchestration and 24/7 cycles")}{tile("logos/boterra-icon-3d.svg", "#05091A", "3D glass: campaign renders")}</div>
    <div class="grid">
      <div class="panel"><h4>Image style</h4><ul><li>Deep navy fields with soft violet/blue light blooms</li><li>Fine node meshes and orbit lines, always fading into negative space</li><li>Smoked-glass 3D objects with neon gradient edges</li><li>Precision grid at 48 px, 6–7% opacity</li></ul></div>
      <div class="panel"><h4>Iconography</h4><ul><li>24 px grid, 1.75 px stroke, round caps and joins</li><li>Outline only; one teal “agent node” dot at top-right on hero icons</li><li>Icons sit in 52 px gradient-tinted tiles on cards</li></ul></div>
      <div class="panel"><h4>Illustration</h4><ul><li>Diagrammatic, not cartoon: flows, nodes, cards, connectors</li><li>Product UI is the illustration: show real workflows</li><li>No robots, androids, glowing brains or faces in screens</li></ul></div>
      <div class="panel"><h4>Photography</h4><ul><li>Real professionals (clinicians, lawyers, accountants, coaches) in calm, bright workplaces</li><li>Natural light, cool grade, navy/teal accents in wardrobe or decor</li><li>Candid moments of relief and focus, never staged “tech” poses</li></ul></div>
      <div class="panel"><h4>Motion</h4><ul><li>Signal flow: a line draws from the node through the B in 900 ms</li><li>UI easing: 120 / 240 / 480 ms, cubic-bezier(.2,.8,.2,1)</li><li>Node pulse for live agents (2 s, 15% scale); orbits rotate at 1 rev / 40 s</li><li>Respect reduced-motion: swap movement for fades</li></ul></div>
      <div class="panel"><h4>UI components</h4><ul><li>Glass cards: 4% white fill, 1 px hairline, 20 px radius</li><li>Primary button: Signal Blue, 14 px radius, blue glow shadow</li><li>Status pills with dot + word; mono timestamps in logs</li></ul></div>
    </div>
    <div class="dodont"><div class="panel do"><h4>Do</h4><ul><li>Lead with outcomes: hours saved, replies in seconds</li><li>Leave space; one idea per frame</li><li>Show the human approval step</li></ul></div><div class="panel dont"><h4>Don't</h4><ul><li>Rainbow gradients or more than one gradient per view</li><li>Stock robots, binary rain, circuit-board clichés</li><li>Dense dashboards with unreadable micro-text in marketing</li></ul></div></div></section>

  <section id="voice" aria-labelledby="s5b"><span class="secnum">05b</span><h2 id="s5b">Brand voice &amp; tone</h2>
    <p class="lead" style="margin-top:0">Calm operations expert. Confident, specific, warm. We sound like the most competent person in the room, never the loudest.</p>
    <div class="table-scroll"><table class="voice"><thead><tr><th>Principle</th><th>We say</th><th>We don't say</th></tr></thead><tbody>
      <tr><td>Specific over hype</td><td>“Replies to new enquiries in under a minute.”</td><td>“Revolutionary AI that transforms everything.”</td></tr>
      <tr><td>Outcomes over features</td><td>“Get your Friday afternoons back.”</td><td>“Leverage our multi-agent orchestration layer.”</td></tr>
      <tr><td>Control stays human</td><td>“Agents ask before anything critical.”</td><td>“Fully autonomous. Set it and forget it.”</td></tr>
      <tr><td>Plain language</td><td>“We map your workflow in 30 minutes.”</td><td>“Our discovery engagement synthesises process taxonomies.”</td></tr>
    </tbody></table></div>
    <div class="grid">
      <div class="panel"><h4>Tone by context</h4><ul><li><b>Website</b>: bold, benefit-led</li><li><b>Product UI</b>: brief, precise, reassuring</li><li><b>Sales</b>: consultative, numbers-first</li><li><b>Support</b>: warm, step-by-step</li><li><b>Social</b>: punchy, practical tips</li></ul></div>
      <div class="panel"><h4>Vocabulary</h4><ul><li>Use: workflow, agent, approve, hours saved, runs 24/7, audit trail</li><li>Avoid: disrupt, revolutionary, magic, robot, synergy, AI-powered everything</li><li>Name agents by job: Intake Agent, Billing Agent</li></ul></div>
      <div class="panel"><h4>Microcopy examples</h4><ul><li>Button: “Automate my first workflow”</li><li>Empty state: “No approvals waiting. Your agents have it handled.”</li><li>Error: “We couldn't reach your calendar. Reconnect it to resume bookings.”</li></ul></div>
    </div></section>

  <section id="mockups" aria-labelledby="s6"><span class="secnum">06</span><h2 id="s6">Mockups</h2>
    <p class="lead" style="margin-top:0">Every mockup is built from the same tokens, logo files and icon set, so they double as production starting points.</p>
    {gallery()}</section>

  <section id="prompts" aria-labelledby="s7"><span class="secnum">07</span><h2 id="s7">Image generation prompts</h2>
    <p class="lead" style="margin-top:0">Palette to cite in every prompt: <span class="mono">{E(PAL)}</span>. Use the mockups above as style references (Midjourney --sref, Ideogram image prompt) for consistency.</p>
    {prompt_html()}</section>

  <section id="package" aria-labelledby="s8"><span class="secnum">08</span><h2 id="s8">Final brand identity package</h2>
    <div class="grid">
      <div class="panel"><h4>Logo system</h4><p>41 outlined SVGs (primary, vertical, wordmark, symbol, orbit, monogram, app icons, favicon, agent avatar, 3D render) in gradient, flat, black and white, plus PNG exports, favicon.ico and app icon sizes.</p></div>
      <div class="panel"><h4>Design tokens</h4><p>tokens.json and tokens.css: 17 colours, 3 gradients, font stacks, type scale, spacing, radii, shadows and motion curves.</p></div>
      <div class="panel"><h4>Mockups</h4><p>36 high-res PNGs: website (dark + light, full pages and sections), dashboard, workflow builder, mobile, 7 pitch slides, 8 social templates, 7 collateral pieces.</p></div>
      <div class="panel"><h4>Art &amp; prompts</h4><p>Agent-mesh, orbit and grid patterns as SVG; 26 image-generation prompts for Midjourney, DALL·E, Ideogram and Stable Diffusion.</p></div>
    </div>
<pre class="tree">brand/
├── logos/svg/       41 outlined SVG logos
├── logos/png/       PNG exports + app icon sizes (16 → 1024)
├── logos/favicon.ico
├── mockups/         36 PNG mockups (web, product, deck, social, collateral)
├── patterns/        mesh, orbits, precision grid (SVG)
├── tokens.json · tokens.css
├── prompts.md       image generation prompt library
└── source/          generators to rebuild everything (Python + HTML)</pre>
    <div class="grid"><div class="panel"><h4>Next steps</h4><ul><li>Apply tokens and the Flow B favicon to the web app</li><li>Commission a type-licensed custom wordmark refinement</li><li>Shoot a photography set using the guidelines above</li><li>Produce the signal-flow logo animation</li></ul></div></div></section>
</main></div>
<script>
document.querySelectorAll(".copy").forEach(btn => btn.addEventListener("click", async () => {{
  const pre = document.getElementById("p" + btn.dataset.i);
  try {{ await navigator.clipboard.writeText(pre.textContent); btn.textContent = "Copied"; }}
  catch {{ const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Selected"; }}
  setTimeout(() => btn.textContent = "Copy", 1500);
}}));
</script>
'''
open("book/index.html", "w").write(page)
print("book written", len(page) // 1024, "KB")

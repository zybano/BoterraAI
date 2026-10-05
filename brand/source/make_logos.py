"""Generate the Boterra AI logo system as outlined SVGs + PNG/ICO exports."""
import io, os, json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import cairosvg
from PIL import Image

OUT = os.environ.get("OUT", "out")
os.makedirs(f"{OUT}/logos/svg", exist_ok=True)
os.makedirs(f"{OUT}/logos/png", exist_ok=True)

C = {
    "navy": "#0A1230", "blue": "#2B5CFF", "violet": "#7B5CFF", "teal": "#14E0C0", "tealDeep": "#0B8F7B",
    "cyan": "#3BD8FF", "paper": "#F7F9FC", "white": "#FFFFFF", "black": "#000000", "slate": "#5E6A85",
}

def font(path, wght=None):
    f = TTFont(path)
    if "fvar" in f and wght:
        from fontTools.varLib.instancer import instantiateVariableFont
        f = instantiateVariableFont(f, {"wght": wght})
    return f

def text_path(f, text, size, x=0, y=0, tracking=0):
    """Outline `text` with its baseline at y. Returns (svg path d, advance width)."""
    gs, cmap, hmtx = f.getGlyphSet(), f.getBestCmap(), f["hmtx"]
    upm = f["head"].unitsPerEm; s = size / upm
    kern = {}
    pen = SVGPathPen(gs)
    cx = x
    for ch in text:
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, cx, y))
        gs[g].draw(tp)
        cx += hmtx[g][0] * s + tracking
    return pen.getCommands(), cx - x - tracking

def bounds(f, text, size):
    gs, cmap = f.getGlyphSet(), f.getBestCmap()
    bp = BoundsPen(gs); s = size / f["head"].unitsPerEm
    # cap height from "B"
    gs[cmap[ord("B")]].draw(bp)
    return bp.bounds[3] * s

SORA600 = font("fonts/Sora-600.woff2", 600)
SORA300 = font("fonts/Sora-300.woff2", 300)

GRAD = '<linearGradient id="aurora" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2B5CFF"/><stop offset=".55" stop-color="#7B5CFF"/><stop offset="1" stop-color="#14E0C0"/></linearGradient>'

# ---------- symbols (64 x 64 grid) ----------
FLOW_D = "M17 52 V12 H31 A9.5 9.5 0 0 1 31 31 H17 M17 31 H34.5 A10.5 10.5 0 0 1 34.5 52 H29"
def flow(stroke, node, sw=6.5, nr=5.5):
    return (f'<path d="{FLOW_D}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle cx="17" cy="52" r="{nr}" fill="{node}"/>')

def orbit(stroke, n1, n2, n3, core):
    return (f'<g fill="none" stroke="{stroke}" stroke-width="5" stroke-linecap="round">'
            '<path d="M32 8 A24 24 0 0 1 52.8 44"/><path d="M48.6 49.6 A24 24 0 0 1 15.4 49.6"/><path d="M11.2 44 A24 24 0 0 1 27.2 8.5"/></g>'
            f'<circle cx="32" cy="8" r="4.2" fill="{n1}"/><circle cx="52.8" cy="44" r="4.2" fill="{n2}"/><circle cx="11.2" cy="44" r="4.2" fill="{n3}"/>'
            f'<rect x="26.5" y="26.5" width="11" height="11" rx="2" transform="rotate(45 32 32)" fill="{core}"/>')

def monogram(stroke, node):
    # B (flow style, no node) + A as a sharp chevron with an agent node for a crossbar, on a 96 x 64 grid
    return (f'<g fill="none" stroke="{stroke}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">'
            '<path d="M12 52 V12 H25 A9.5 9.5 0 0 1 25 31 H12 M12 31 H28.5 A10.5 10.5 0 0 1 28.5 52 H12"/>'
            '<path d="M50 52 L66.5 12 L83 52" stroke-linejoin="miter"/></g>'
            f'<circle cx="66.5" cy="39" r="5" fill="{node}"/>')

def svg(w, h, body, bg=None, defs=GRAD, rx=0):
    bgr = f'<rect width="{w}" height="{h}" rx="{rx}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{defs}</defs>{bgr}{body}</svg>'

VARIANTS = {  # name: (symbol stroke, node, word color, AI color)
    "gradient": ("url(#aurora)", C["teal"], C["white"], C["teal"]),
    "gradient-light": ("url(#aurora)", C["tealDeep"], C["navy"], C["tealDeep"]),
    "color-dark": (C["white"], C["teal"], C["white"], C["teal"]),
    "color-light": (C["navy"], C["tealDeep"], C["navy"], C["tealDeep"]),
    "black": (C["black"], C["black"], C["black"], C["black"]),
    "white": (C["white"], C["white"], C["white"], C["white"]),
}

def wordmark(word_color, ai_color, x, baseline, size):
    d1, w1 = text_path(SORA600, "Boterra", size, x, baseline, tracking=-size * 0.02)
    d2, w2 = text_path(SORA300, "AI", size, x + w1 + size * 0.26, baseline, tracking=size * 0.02)
    return f'<path d="{d1}" fill="{word_color}"/><path d="{d2}" fill="{ai_color}"/>', w1 + size * 0.26 + w2

files = {}
def save(name, content):
    p = f"{OUT}/logos/svg/{name}.svg"; open(p, "w").write(content); files[name] = p

for v, (st, nd, wc, ac) in VARIANTS.items():
    # symbol
    save(f"boterra-symbol-{v}", svg(64, 64, flow(st, nd)))
    # horizontal lockup — symbol sized from its true outline (x 11.5–48.25, y 8.75–57.5)
    size = 38; capH = bounds(SORA600, "B", size)
    k = 1.9 * capH / 48.75; symW = 36.75 * k; symH = 48.75 * k
    H = symH + 8; baseline = H / 2 + capH / 2
    sym = f'<g transform="translate({-11.5 * k + 2} {H / 2 - symH / 2 - 8.75 * k}) scale({k})">{flow(st, nd)}</g>'
    body, ww = wordmark(wc, ac, 2 + symW + symW * 0.42, baseline, size)
    W = 2 + symW + symW * 0.42 + ww + 4
    save(f"boterra-horizontal-{v}", svg(round(W, 1), round(H, 1), sym + body))
    # vertical lockup — symbol above, centred
    vs = 30; capV = bounds(SORA600, "B", vs); _, wv = wordmark(wc, ac, 0, 0, vs)
    kv = 2.4 * capV / 48.75; svW = 36.75 * kv; svH = 48.75 * kv
    VW = max(wv, svW) + 8; gap = capV * 0.9
    symv = f'<g transform="translate({VW / 2 - svW / 2 - 11.5 * kv} {4 - 8.75 * kv}) scale({kv})">{flow(st, nd)}</g>'
    body_v, _ = wordmark(wc, ac, (VW - wv) / 2, 4 + svH + gap + capV, vs)
    save(f"boterra-vertical-{v}", svg(round(VW, 1), round(4 + svH + gap + capV + 10, 1), symv + body_v))
    # wordmark only
    body_w, ww2 = wordmark(wc, ac, 2, 40, 40)
    save(f"boterra-wordmark-{v}", svg(int(ww2 + 6), 52, body_w))
    # orbit + monogram
    n1, n2, n3, core = ((C["teal"], C["violet"], C["blue"], wc) if v.startswith("gradient") else (nd, nd, nd, wc))
    save(f"boterra-orbit-{v}", svg(64, 64, orbit(st, n1, n2, n3, core)))
    save(f"boterra-monogram-{v}", svg(96, 64, monogram(st, nd)))

# App icon + favicon (icon-only)
save("boterra-app-icon", svg(1024, 1024,
    '<rect width="1024" height="1024" rx="230" fill="#0A1230"/>'
    '<rect width="1024" height="1024" rx="230" fill="url(#glow)"/>'
    f'<g transform="translate(192 192) scale(10)">{flow("url(#aurora)", C["teal"], sw=6.8)}</g>',
    defs=GRAD + '<radialGradient id="glow" cx="25%" cy="15%" r="90%"><stop offset="0" stop-color="#2B5CFF" stop-opacity=".45"/><stop offset="1" stop-color="#2B5CFF" stop-opacity="0"/></radialGradient>'))
save("boterra-app-icon-light", svg(1024, 1024,
    '<rect width="1024" height="1024" rx="230" fill="#F7F9FC"/>'
    f'<g transform="translate(192 192) scale(10)">{flow(C["navy"], C["tealDeep"], sw=6.8)}</g>'))
save("favicon", svg(64, 64, '<rect width="64" height="64" rx="14" fill="#0A1230"/>' + f'<g transform="translate(5 5) scale(.84)">{flow(C["white"], C["teal"], sw=8, nr=7)}</g>'))
# agent avatar (orbit in a circle) for AI agents
save("boterra-agent-avatar", svg(256, 256, '<circle cx="128" cy="128" r="128" fill="#0A1230"/>' + f'<g transform="translate(48 48) scale(2.5)">{orbit("url(#aurora)", C["teal"], C["violet"], C["blue"], C["white"])}</g>'))
# 3D-style glass render of the app icon
save("boterra-icon-3d", svg(1200, 1200,
    '<rect width="1200" height="1200" fill="url(#bg3)"/>'
    '<ellipse cx="600" cy="1010" rx="330" ry="46" fill="#000" opacity=".45" filter="url(#blur)"/>'
    '<g transform="translate(600 560) rotate(-8) skewX(-6) translate(-380 -380)">'
    '<rect x="18" y="30" width="760" height="760" rx="170" fill="#060B1F"/>'
    '<rect width="760" height="760" rx="170" fill="url(#face)"/>'
    '<rect width="760" height="760" rx="170" fill="none" stroke="url(#rim)" stroke-width="6"/>'
    '<path d="M60 170 Q60 60 170 60 H590 Q700 60 700 170" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="10" stroke-linecap="round"/>'
    f'<g transform="translate(140 140) scale(7.5)" filter="url(#neon)">{flow("url(#aurora)", C["teal"], sw=6.8)}</g></g>',
    defs=GRAD + '<linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121B45"/><stop offset="1" stop-color="#05091A"/></linearGradient>'
    '<linearGradient id="face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A2766"/><stop offset=".6" stop-color="#0C1438"/><stop offset="1" stop-color="#0A1230"/></linearGradient>'
    '<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FA0FF"/><stop offset=".5" stop-color="#7B5CFF" stop-opacity=".4"/><stop offset="1" stop-color="#14E0C0"/></linearGradient>'
    '<filter id="blur"><feGaussianBlur stdDeviation="22"/></filter>'
    '<filter id="neon" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'))

# ---------- PNG exports ----------
def png(name, width):
    cairosvg.svg2png(url=files[name], write_to=f"{OUT}/logos/png/{name}.png", output_width=width)
for name in files:
    if name.startswith(("boterra-symbol", "boterra-orbit", "boterra-agent")): png(name, 1024)
    elif name.startswith(("boterra-horizontal", "boterra-wordmark", "boterra-monogram")): png(name, 2400)
    elif name.startswith("boterra-vertical"): png(name, 1200)
    elif name.startswith(("boterra-app-icon", "boterra-icon-3d")): png(name, 1024)
    elif name == "favicon": png(name, 512)
# favicon.ico with 16/32/48
im = Image.open(f"{OUT}/logos/png/favicon.png").convert("RGBA")
im.save(f"{OUT}/logos/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
for s in (16, 32, 180, 192, 512):
    cairosvg.svg2png(url=files["favicon"] if s <= 48 else files["boterra-app-icon"], write_to=f"{OUT}/logos/png/icon-{s}.png", output_width=s)
print(len(files), "svgs")

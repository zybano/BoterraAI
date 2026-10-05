# Boterra AI brand identity package

Open `brand-book/index.html` in a browser for the full guidelines.

| Folder / file | Contents |
| --- | --- |
| `logos/svg/` | 41 outlined SVG logos. Lockups are horizontal, vertical, wordmark, Flow B symbol, Orbit symbol and BA monogram, each in `gradient`, `gradient-light`, `color-dark`, `color-light`, `black` and `white`. Also app icons, favicon, agent avatar and the 3D concept render |
| `logos/png/` | PNG exports (symbols 1024 px, lockups 2400 px) plus icon sizes 16–512 px |
| `logos/favicon.ico` | 16 / 32 / 48 px favicon |
| `mockups/` | 36 PNG mockups: website (dark and light), dashboard, workflow builder, mobile, 7 pitch slides, social templates and print collateral |
| `patterns/` | Agent mesh, orbit lines and precision grid (SVG) |
| `tokens.json`, `tokens.css` | Design tokens: colours, gradients, fonts, type scale, spacing, radii, shadows and motion |
| `palette.json` | Colours with HEX, RGB, CMYK and contrast ratios |
| `prompts.md` | Image-generation prompts for Midjourney, DALL·E, Ideogram and Stable Diffusion |
| `source/` | Generators used to build everything above |

## Core identity

| Element | Value |
| --- | --- |
| Primary colour | Midnight Navy `#0A1230` |
| Action colour | Signal Blue `#2B5CFF` |
| Accents | Pulse Teal `#14E0C0` and Electric Violet `#7B5CFF` |
| Aurora gradient | `#2B5CFF → #7B5CFF → #14E0C0`, at 135° |
| Typography | Sora for headings, Manrope for body text, JetBrains Mono for labels |
| Tagline | "Workflows that run themselves." |

## Regenerating

Copy `source/*` into a working folder and put the font files in `fonts/`. Install `fonttools`, `brotli`, `cairosvg` and `Pillow`, then run:

```bash
OUT=out python make_logos.py   # logos, PNG exports and favicon
python mockups.py              # writes the mockup HTML files
node shoot.mjs product.html web.html deck.html social.html collateral.html   # renders PNGs (needs Playwright)
python prompts.py && python make_book.py   # prompt library and brand book
```

`palette.json` and `out/tokens.*` are written by the palette step described in the brand book.

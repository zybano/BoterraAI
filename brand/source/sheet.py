import sys
from PIL import Image
out, width = sys.argv[1], int(sys.argv[2]); names = sys.argv[3:]
ims = [Image.open(f"out/mockups/{n}.png").convert("RGB") for n in names]
cols = min(len(ims), 3 if len(ims) > 4 else len(ims)); cw = width // cols
rows = []
for i in range(0, len(ims), cols):
    row = [im.resize((cw - 10, int(im.height * (cw - 10) / im.width))) for im in ims[i:i + cols]]
    rows.append(row)
H = sum(max(r.height for r in row) + 10 for row in rows)
sheet = Image.new("RGB", (width, H), "#6b7080"); y = 0
for row in rows:
    for j, im in enumerate(row): sheet.paste(im, (j * cw + 5, y + 5))
    y += max(r.height for r in row) + 10
sheet.save(out, quality=85)

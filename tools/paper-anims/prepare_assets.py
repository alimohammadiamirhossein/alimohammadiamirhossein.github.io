"""Download each paper's real results and cut them into the pieces the animation scenes use.

    python tools/paper-anims/prepare_assets.py

Sources are the public project pages / arXiv figures; downloads are cached in .cache/ and the
prepared files land in assets/ (both git-ignored; rerun this script to rebuild them).
"""
import io
import json
import pathlib
import urllib.request

from PIL import Image, ImageStat

HERE = pathlib.Path(__file__).resolve().parent
CACHE = HERE / ".cache"
ASSETS = HERE / "assets"


def fetch(url):
    """Download once into the cache and return the bytes."""
    dest = CACHE / url.split("://", 1)[1].replace("/", "_")
    if not dest.exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            dest.write_bytes(r.read())
    return dest.read_bytes()


def image(url):
    return Image.open(io.BytesIO(fetch(url)))


def save(im, rel, quality=88):
    out = ASSETS / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(out, "JPEG", quality=quality, optimize=True)


def sprite(gif, rel, cols, scale=1.0):
    """All frames of a GIF in one JPEG grid; returns the frame count and size for the scene."""
    n = gif.n_frames
    w, h = int(gif.width * scale), int(gif.height * scale)
    rows = -(-n // cols)
    sheet = Image.new("RGB", (cols * w, rows * h))
    for i in range(n):
        gif.seek(i)
        sheet.paste(gif.convert("RGB").resize((w, h), Image.LANCZOS), ((i % cols) * w, (i // cols) * h))
    save(sheet, rel, quality=85)
    return {"frames": n, "w": w, "h": h, "cols": cols, "ms": gif.info.get("duration", 100)}


def own_frame(cell):
    """Trim a grid cell to its own bordered image: walk out from the centre until a blank row/column."""
    g = cell.convert("L")
    w, h = g.size
    white = lambda box: ImageStat.Stat(g.crop(box).point(lambda v: 255 if v > 235 else 0)).mean[0] > 0.97 * 255
    blank_row = lambda y: white((0, y, w, y + 1))
    blank_col = lambda x: white((x, 0, x + 1, h))
    top, bottom, left, right = h // 2, h // 2, w // 2, w // 2
    while top > 0 and not blank_row(top - 1): top -= 1
    while bottom < h - 1 and not blank_row(bottom + 1): bottom += 1
    while left > 0 and not blank_col(left - 1): left -= 1
    while right < w - 1 and not blank_col(right + 1): right += 1
    return cell.crop((left, top, right + 1, bottom + 1))


meta = {}

# ── SIA: the dragon example (lava, open wings, gold) with every subset of its three edits ──
SIA = "https://selective-image-analogy.github.io/static/images/samples/s2/"
for name in ["a", "ap", "b"]:
    save(image(SIA + name + ".webp"), f"sia/{name}.jpg")
for bits in ["001", "010", "011", "100", "101", "110", "111"]:
    save(image(SIA + f"subsets/{bits}.webp"), f"sia/{bits}.jpg")

# ── Cora: Spider-Man → "a golden robot"; the α/β grid along the square the sliders trace ──
CORA = "https://cora-edit.github.io/resources/spiderman/"
save(image(CORA + "spiderman.jpg"), "cora/input.jpg")
vals = [f"{i / 30:.2f}" for i in range(30)]
needed = {(a, s) for a in vals for s in vals if a in ("0.00", "0.97") or s in ("0.00", "0.97")}
for a, s in sorted(needed):
    save(image(CORA + f"output_{a}_{s}.jpg").resize((384, 384), Image.LANCZOS), f"cora/out_{a}_{s}.jpg", quality=86)

# ── SMITE: one face video at three granularities (frame sprites) ────────────
SMITE = "https://segment-me-in-time.github.io/static/video/multi_granular/face1/"
for name in ["input", "div1", "div2", "div3"]:
    meta[f"smite_{name}"] = sprite(image(SMITE + name + ".gif"), f"smite/{name}.jpg", cols=12)

# ── HairPort: split result collages into face / hair reference / result ─────
HAIR = "https://deepmancer.github.io/HairPort/assets/images/transfer-collage/"
for i, name in enumerate(["sample_036_to_side5", "sample_065_to_side7", "sample_077_to_sample_089", "sample_125_to_sample_037"]):
    col = image(HAIR + name + ".webp").convert("RGB")      # 1500x1000: face | hair stacked left, result right
    save(col.crop((0, 0, 500, 500)).resize((360, 360), Image.LANCZOS), f"hairport/{i}_face.jpg")
    save(col.crop((0, 500, 500, 1000)).resize((360, 360), Image.LANCZOS), f"hairport/{i}_hair.jpg")
    save(col.crop((500, 0, 1500, 1000)).resize((540, 540), Image.LANCZOS), f"hairport/{i}_result.jpg")

# ── Griffin: layout, reference grid and output panels from the paper's teaser ─
teaser = image("https://arxiv.org/html/2509.23643v2/figs/teaser.png").convert("RGB")
GRIFFIN = {   # (layout box, reference-grid box, output box) in teaser pixels
    "hat":   ((4, 128, 529, 652), (619, 100, 1224, 703), (1308, 129, 1833, 653)),
    "glass": ((2123, 127, 2648, 652), (2739, 99, 3343, 705), (3427, 133, 3952, 657)),
    "hair":  ((4, 900, 529, 1424), (622, 867, 1224, 1471), (1308, 887, 1833, 1412)),
}
meta["griffin_refs"] = {}
for key, boxes in GRIFFIN.items():
    for part, box in zip(["layout", "refs", "output"], boxes):
        if part != "refs":   # step inside the figure's thin panel outline
            box = (box[0] + 6, box[1] + 6, box[2] - 6, box[3] - 6)
        save(teaser.crop(box), f"griffin/{key}_{part}.jpg", quality=90)
    # the reference grid is 2×2 with unused cells left blank: keep only the filled cells
    refs = teaser.crop(boxes[1])
    w, h = refs.size
    filled = []
    for cx, cy in [(0, 0), (1, 0), (0, 1), (1, 1)]:
        cell = refs.crop((cx * w // 2, cy * h // 2, (cx + 1) * w // 2, (cy + 1) * h // 2))
        inner = cell.crop((cell.width // 4, cell.height // 4, cell.width * 3 // 4, cell.height * 3 // 4)).convert("L")
        if ImageStat.Stat(inner).mean[0] < 240:
            save(own_frame(cell), f"griffin/{key}_ref{len(filled)}.jpg", quality=90)
            filled.append((cx, cy))
    meta["griffin_refs"][key] = len(filled)

# ── Pose forecasting: UnPOSed's README clips ("Input pose", then "Output pose and ground-truth") ─
POSE_IN = "https://user-images.githubusercontent.com/33596552/138102745-f6b5c7a0-ee14-40ef-907f-b3ebb98ae08f.gif"
POSE_OUT = "https://user-images.githubusercontent.com/33596552/138102754-5bef72df-ea48-4d17-a932-611293f0bc5a.gif"
meta["pose_in"] = sprite(image(POSE_IN), "pose/input.jpg", cols=10)
meta["pose_out"] = sprite(image(POSE_OUT), "pose/output.jpg", cols=10)

(ASSETS / "meta.json").write_text(json.dumps(meta, indent=2))
print("assets ready:", sum(1 for _ in ASSETS.rglob("*.jpg")), "images")

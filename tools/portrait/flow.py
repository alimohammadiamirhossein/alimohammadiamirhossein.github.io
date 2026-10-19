"""Displacement maps for the portrait's hover morph.

    python tools/portrait/flow.py        (needs opencv-python, pillow, numpy)

The two portraits (static/images/nodes/portrait.webp and portrait-smile.webp) are not pixel-aligned: the
smiling one's neck, collar and shoulders sit a few pixels to the right, so a plain crossfade shows doubled
outlines. Instead, static/js/portrait-morph.js warps each photo toward the other's shape while fading. This
script writes the two warps as SVG feDisplacementMap images (R = x, G = y, 0.5 = no motion, ±MAX px at 480 px):
  portrait-warp-neutral.png   applied to the neutral photo:  S(p) ≈ N(p + d(p))
  portrait-warp-smile.png     applied to the smiling photo:  N(p) ≈ S(p + d(p))
"""
import pathlib

import cv2
import numpy as np
from PIL import Image

NODES = pathlib.Path(__file__).resolve().parents[2] / "static" / "images" / "nodes"
MAX = 24.0      # px at 480; must match MAX in static/js/portrait-morph.js
RES = 240       # map size; the flow is smooth, so the browser's bilinear upscale is enough


def load(name):
    return np.asarray(Image.open(NODES / name).convert("RGBA")).astype(np.float32)


def grey(a):    # on mid-grey, so the silhouette edges count as features too
    rgb = a[..., :3] * (a[..., 3:] / 255) + 128 * (1 - a[..., 3:] / 255)
    return cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2GRAY)


def encode(flow, out):
    flow = cv2.GaussianBlur(flow, (0, 0), 3)
    flow = cv2.resize(flow, (RES, RES), interpolation=cv2.INTER_AREA)
    c = np.clip(0.5 + flow / (2 * MAX), 0, 1)
    rgb = np.dstack([c[..., 0], c[..., 1], np.full_like(c[..., 0], 0.5)])
    Image.fromarray((rgb * 255 + 0.5).astype(np.uint8)).save(NODES / out, optimize=True)


N, S = grey(load("portrait.webp")), grey(load("portrait-smile.webp"))
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
encode(dis.calc(S, N, None), "portrait-warp-neutral.png")
encode(dis.calc(N, S, None), "portrait-warp-smile.png")
print("wrote", NODES / "portrait-warp-neutral.png", "and", NODES / "portrait-warp-smile.png")

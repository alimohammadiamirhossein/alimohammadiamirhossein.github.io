// Tiny timeline toolkit for the paper animations.
// Each scene calls scene({ duration, setup, render }). render(t) must be a pure function of t
// (seconds), so render.py can step through exact frames; opened normally, the scene plays live.
const A = {
  clamp: (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x)),
  lerp: (a, b, k) => a + (b - a) * k,
  ease: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  // eased (or linear) progress of t through [t0, t1], clamped to 0..1
  span: (t, t0, t1, linear) => {
    const k = A.clamp((t - t0) / (t1 - t0));
    return linear ? k : A.ease(k);
  },
  // piecewise interpolation through keys [[t, ...values]], eased between keys
  keys(t, keys) {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, ...a] = keys[i - 1], [t1, ...b] = keys[i];
        const k = A.span(t, t0, t1);
        return a.map((v, j) => A.lerp(v, b[j], k));
      }
    }
    return keys[keys.length - 1].slice(1);
  },
  // "#rrggbb" blend → css rgb()
  mix(c1, c2, k) {
    const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    const a = p(c1), b = p(c2);
    return `rgb(${a.map((v, i) => Math.round(A.lerp(v, b[i], k))).join(",")})`;
  },
  load: src => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; }),
  // a 2d context sized for the device pixel ratio of a canvas laid out by CSS
  ctx(canvas) {
    const r = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * r);
    canvas.height = Math.round(canvas.clientHeight * r);
    const c = canvas.getContext("2d");
    c.setTransform(r, 0, 0, r, 0, 0);
    c.imageSmoothingQuality = "high";
    return c;
  },
  // draw (part of) an image so it covers the w×h box, like object-fit: cover
  cover(c, img, w, h, sx = 0, sy = 0, sw = img.width, sh = img.height, alpha = 1) {
    const s = Math.max(w / sw, h / sh), cw = w / s, ch = h / s;
    c.globalAlpha = alpha;
    c.drawImage(img, sx + (sw - cw) / 2, sy + (sh - ch) / 2, cw, ch, 0, 0, w, h);
    c.globalAlpha = 1;
  },
  // one frame of a sprite sheet written by prepare_assets.py
  frame(c, img, m, i, w, h, alpha = 1, crop = null) {
    i = ((i % m.frames) + m.frames) % m.frames;
    const sx = (i % m.cols) * m.w, sy = Math.floor(i / m.cols) * m.h;
    const [cx, cy, cw, ch] = crop || [0, 0, m.w, m.h];
    A.cover(c, img, w, h, sx + cx, sy + cy, cw, ch, alpha);
  },
};

function scene({ duration, setup, render }) {
  window.DURATION = duration;
  window.sceneReady = Promise.resolve(setup ? setup() : null)
    .then(() => document.fonts.ready)
    .then(() => { window.render = render; render(0); });
  if (!new URLSearchParams(location.search).has("render")) {
    window.sceneReady.then(() => {
      const t0 = performance.now();
      const tick = now => { render(((now - t0) / 1000) % duration); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }
}

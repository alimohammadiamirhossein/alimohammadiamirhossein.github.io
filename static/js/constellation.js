// Research constellation: a playable map of places, people and papers around the portrait.
// Nodes sit on springs: drag one and its sub-tree follows, let go and it springs home; clicking
// empty space sends a ripple. Hovering a node opens its card, and side-panel elements with a
// matching data-node attribute light up the node (and its path to the centre).
(function () {
  const IMG = "static/images/nodes/";

  const ICONS = {
    github: { box: 16, fill: true, d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" },
    linkedin: { box: 24, fill: true, d: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" },
    mail: { box: 24, fill: false, d: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" },
  };

  // angle: degrees, 0 = east, 90 = south. Children are placed relative to their parent.
  const NODES = [
    { id: "me", kind: "root", img: IMG + "portrait.webp", hoverImg: IMG + "portrait-smile.webp" },

    { id: "sfu", parent: "me", angle: 0, dist: 0.85, kind: "inst", img: IMG + "org-sfu.svg", label: "SFU",
      card: { k: "2023 – present", title: "Simon Fraser University", sub: "Ph.D. Candidate · GrUVi Lab · Vancouver, Canada",
        body: ["Ph.D. in Computing Science, advised by Prof. Ali Mahdavi-Amiri. Generative models for image editing, image composition, video segmentation, and reference-guided generation.",
               "TA for Visual Computing Lab I & II, Introduction to AI, and Cyber Security."],
        links: [["GrUVi Lab", "https://gruvi.cs.sfu.ca/"]] } },
    { id: "sia", parent: "sfu", angle: -90, dist: 1.25, kind: "paper", img: IMG + "paper-sia.webp", label: "SIA",
      card: { k: "SIGGRAPH Asia 2026", title: "SIA: Selective Image Analogy", sub: "Alimohammadi*, Izadpanah*, Kariminia, Chrysanthou, Mahdavi-Amiri",
        body: ["One before/after demonstration can carry several edits. SIA lets you choose, at inference time, which of them transfer to a new image."],
        links: [["Project page", "https://selective-image-analogy.github.io/"], ["Video", "https://www.youtube.com/watch?v=HU010YnVEwI"]] } },
    { id: "hairport", parent: "sfu", angle: -45, dist: 1.25, kind: "paper", img: IMG + "paper-hairport.webp", label: "HairPort",
      card: { k: "SIGGRAPH 2026", title: "HairPort", sub: "Hair import and transfer from single images",
        body: ["3D-aware hairstyle transfer that holds up under large pose and scale gaps: remove the hair, re-render the reference style from the target view, then synthesize."],
        links: [["Project page", "https://deepmancer.github.io/HairPort/"], ["arXiv", "https://arxiv.org/abs/2606.12562"], ["Code", "https://github.com/deepmancer/HairPort"]] } },
    { id: "cora", parent: "sfu", angle: 0, dist: 1.25, kind: "paper", img: IMG + "paper-cora.webp", label: "Cora",
      card: { k: "SIGGRAPH 2025", title: "Cora", sub: "Correspondence-aware image editing using few-step diffusion",
        body: ["Text-guided edits in four diffusion steps. Patch correspondences keep appearance intact through pose changes, insertions, and background swaps."],
        links: [["Project page", "https://cora-edit.github.io/"], ["arXiv", "https://arxiv.org/abs/2505.23907"], ["Code", "https://github.com/alimohammadiamirhossein/cora"]] } },
    { id: "griffin", parent: "sfu", angle: 45, dist: 1.25, kind: "paper", img: IMG + "paper-griffin.webp", label: "Griffin",
      card: { k: "Preprint · arXiv", title: "Griffin", sub: "Generative reference and layout guided image composition",
        body: ["Training-free composition from several reference images: one image per element, and a layout that says where each one goes."],
        links: [["arXiv", "https://arxiv.org/abs/2509.23643"]] } },
    { id: "smite", parent: "sfu", angle: 90, dist: 1.25, kind: "paper", img: IMG + "paper-smite.webp", label: "SMITE",
      card: { k: "ICLR 2025", title: "SMITE", sub: "Segment Me In TimE",
        body: ["Video segmentation at any granularity from one or a few reference images, using a pretrained diffusion model with tracking and temporal voting."],
        links: [["Project page", "https://segment-me-in-time.github.io/"], ["arXiv", "https://arxiv.org/abs/2410.18538"], ["Code", "https://github.com/alimohammadiamirhossein/smite"]] } },

    { id: "waabi", parent: "me", angle: -70, size: 0.92, kind: "inst", img: IMG + "waabi.svg", label: "Waabi",
      card: { k: "May – Aug 2026", title: "Waabi", sub: "Research Intern · Toronto, Canada",
        body: ["An action-conditioned world model for multi-view driving scenario generation, with metrics for realism, consistency, and action controllability."],
        links: [["Waabi", "https://waabi.ai/"]] } },

    { id: "vita", parent: "me", angle: -114, kind: "inst", img: IMG + "org-epfl.svg", label: "EPFL",
      card: { k: "Dec 2021 – Jul 2022", title: "VITA Lab, EPFL", sub: "Research Intern · Lausanne, Switzerland",
        body: ["3D human pose forecasting with uncertainty, with Prof. Alexandre Alahi and Dr. Saeed Saadatnejad."],
        links: [["VITA Lab", "https://www.epfl.ch/labs/vita/"]] } },
    { id: "pose", parent: "vita", angle: -112, kind: "paper", img: IMG + "paper-pose.svg", label: "UnPOSed",
      card: { k: "RA-L 2024", title: "Reliable Pose Forecasting", sub: "Toward Reliable Human Pose Forecasting with Uncertainty",
        body: ["Uncertainty-aware 3D human pose forecasting, plus UnPOSed, an open-source library for unified, fair evaluation."],
        links: [["arXiv", "https://arxiv.org/abs/2304.06707"], ["Code", "https://github.com/vita-epfl/unposed"], ["Demo", "https://vitademo.epfl.ch/prediction"]] } },

    { id: "cv", parent: "me", angle: -144, kind: "util", glyph: "CV", label: "CV", href: "static/CV.pdf",
      card: { k: "PDF", title: "Curriculum Vitae", body: ["Education, publications, projects, teaching, and awards in one page."],
        links: [["Open CV", "static/CV.pdf"]] } },

    { id: "salam", parent: "me", angle: 188, size: 0.68, dist: 0.88, kind: "inst", img: IMG + "org-salam.webp", label: "Salam",
      card: { k: "2015 – 2018", title: "Salam High School", sub: "Tehran, Iran",
        body: ["Later taught olympiad number theory, algebra, and combinatorics for 500+ hours (2017–2022); several students went on to win Iranian Mathematical Olympiad medals."] } },
    { id: "ysc", parent: "salam", angle: 150, size: 0.78, dist: 0.8, kind: "award", img: IMG + "award-olympiad.webp", label: "Math Olympiad",
      card: { k: "2017", title: "Iranian Mathematical Olympiad", sub: "Gold medal · 35th national olympiad",
        body: ["Gold medal, and membership in the Young Scholars Club."] } },
    { id: "imc", parent: "salam", angle: 200, size: 0.78, dist: 0.8, kind: "award", img: IMG + "award-imc.webp", label: "IMC",
      card: { k: "2015 · 2016", title: "International Mathematics Competition", sub: "Bronze · China 2015   Silver · Thailand 2016" } },

    { id: "sharif", parent: "me", angle: 140, size: 0.84, kind: "inst", img: IMG + "org-sharif.webp", label: "Sharif",
      card: { k: "2018 – 2023", title: "Sharif University of Technology", sub: "B.Sc. Computer Engineering · Tehran, Iran",
        body: ["Research intern (2022–23) with Dr. Ehsaneddin Asgari and Dr. Mohammadjavad Faraji.",
               "TA for Linear Algebra, Data Structures & Algorithms, Design of Algorithms, Computer Structure, and Computer Networks."] } },
    { id: "crypto", parent: "sharif", angle: 125, size: 0.88, dist: 0.9, kind: "paper", img: IMG + "paper-thesis.svg", label: "Thesis",
      card: { k: "Bachelor thesis · 2023", title: "CryptoPredictions", sub: "Open-source price-forecasting library",
        body: ["9 models, 10 metrics, 30+ indicators, 15+ supported cryptocurrencies, and 250+ GitHub stars."],
        links: [["Thesis", "static/Bachelor_Thesis.pdf"], ["Code", "https://github.com/alimohammadiamirhossein/CryptoPredictions"]] } },

    { id: "contact", parent: "me", angle: 80, kind: "util", glyph: "@", label: "Contact",
      card: { k: "Say hello", title: "Get in touch", sub: "alimohammadiamirhossein@gmail.com",
        links: [["Email", "mailto:alimohammadiamirhossein@gmail.com"], ["GitHub", "https://github.com/alimohammadiamirhossein"], ["LinkedIn", "https://www.linkedin.com/in/alimohammadi-amirhossein/"]] } },
    { id: "github", parent: "contact", angle: 38, kind: "util", icon: "github", label: "GitHub", href: "https://github.com/alimohammadiamirhossein" },
    { id: "linkedin", parent: "contact", angle: 78, kind: "util", icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/alimohammadi-amirhossein/" },
    { id: "email", parent: "contact", angle: 118, kind: "util", icon: "mail", label: "Email", href: "mailto:alimohammadiamirhossein@gmail.com" },
  ];

  const SVG_NS = "http://www.w3.org/2000/svg";
  const map = document.querySelector(".map");
  const svg = document.getElementById("constellation");
  const card = document.getElementById("node-card");
  if (!map || !svg || !card) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  NODES.forEach(n => {
    n.depth = n.parent ? byId[n.parent].depth + 1 : 0;
    n.phase = Math.random() * Math.PI * 2;
    n.speed = 0.35 + Math.random() * 0.3;
    n.vx = 0; n.vy = 0;
  });

  // Spring physics. Every node is pulled towards its "home" (an offset from its parent's *current*
  // position), so dragging a node drags its sub-tree along, and letting go springs it back.
  const PHYS = reduceMotion
    ? { k: 120, damp: 22, repel: 30 }   // critically damped: no wobble
    : { k: 70, damp: 7.5, repel: 30 };

  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  };

  // ── Build the SVG once; geometry is filled in by layout() ──
  const orbitLayer = el("g", {}, svg);
  const rippleLayer = el("g", {}, svg);
  const defs = el("defs", {}, svg);
  const edgeLayer = el("g", {}, svg);
  const nodeLayer = el("g", {}, svg);
  const orbits = [el("ellipse", { class: "orbit" }, orbitLayer), el("ellipse", { class: "orbit" }, orbitLayer)];

  NODES.forEach(n => {
    if (n.parent) {
      n.grad = el("linearGradient", { id: "grad-" + n.id, class: "grad", gradientUnits: "userSpaceOnUse" }, defs);
      el("stop", { class: "a", offset: "0" }, n.grad);
      el("stop", { class: "b", offset: "1" }, n.grad);
      n.edge = el("path", { class: "edge", fill: `url(#grad-${n.id})` }, edgeLayer);
      n.port = el("circle", { class: "port", r: 2.6 }, edgeLayer);
      if (!reduceMotion) n.comet = el("path", { class: "comet", pathLength: 100 }, edgeLayer);
    }
    const g = el("g", { class: `node ${n.kind}`, "data-id": n.id, tabindex: "0" }, nodeLayer);
    g.setAttribute("role", n.href ? "link" : "button");
    g.setAttribute("aria-label", n.kind === "root" ? "Amir Alimohammadi (drag to move the whole map)" : (n.card ? n.card.title : n.label));
    const disc = el("g", { class: "disc" }, g);
    n.halo = el("circle", { class: "halo" }, disc);
    n.face = el("circle", { class: "face" }, disc);
    if (n.img) {
      const clip = el("clipPath", { id: "clip-" + n.id }, disc);
      n.clip = el("circle", {}, clip);
      n.image = el("image", { href: n.img, "clip-path": `url(#clip-${n.id})`, preserveAspectRatio: "xMidYMid slice" }, disc);
      // a second picture that fades in on hover (the portrait smiles back)
      if (n.hoverImg) n.imageAlt = el("image", { class: "alt", href: n.hoverImg, "clip-path": `url(#clip-${n.id})`, preserveAspectRatio: "xMidYMid slice" }, disc);
    } else if (n.glyph) {
      n.text = el("text", { class: "glyph", "text-anchor": "middle", "dominant-baseline": "central" }, disc);
      n.text.textContent = n.glyph;
    } else if (n.icon) {
      const ic = ICONS[n.icon];
      n.iconG = el("g", {}, disc);
      el("path", { d: ic.d, class: ic.fill ? "glyph" : "glyph-stroke" }, n.iconG);
    }
    n.ring = el("circle", { class: "ring" }, disc);
    if (n.label) { n.labelEl = el("text", { class: "label" }, g); n.labelEl.textContent = n.label; }
    n.g = g;
  });

  // ── Layout: radial tree, stretched to the container's aspect ratio ──
  let W = 0, H = 0, booted = false;
  function layout() {
    W = map.clientWidth; H = map.clientHeight;
    if (!W || !H) return;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const u = Math.min(W, H);
    const sx = Math.min(Math.max(W / H, 1), 1.45), sy = Math.min(Math.max(H / W, 1), 1.3);
    const R1 = 0.27 * u, R2 = 0.175 * u;
    const radius = { root: 0.105 * u, inst: 0.058 * u, paper: 0.052 * u, award: 0.045 * u, util: 0.042 * u };
    const leafUtil = 0.034 * u;

    NODES.forEach(n => {
      if (!n.parent) { n.bx = W / 2; n.by = H / 2; }
      else {
        const p = byId[n.parent], a = n.angle * Math.PI / 180, d = (n.depth === 1 ? R1 : R2) * (n.dist || 1);
        n.bx = p.bx + Math.cos(a) * d * sx;
        n.by = p.by + Math.sin(a) * d * sy;
      }
      const small = u < 520;
      n.r = Math.max((n.depth === 2 && n.kind === "util" ? leafUtil : radius[n.kind]) * (n.size || 1), n.kind === "root" ? (small ? 36 : 44) : 13);
      // on phones the GitHub / LinkedIn / Email icons speak for themselves
      n.hideLabel = small && n.kind === "util" && n.depth === 2;
      if (n.labelEl) n.labelEl.style.display = n.hideLabel ? "none" : "";
    });

    // Pull everything towards the centre if a node or its label would leave the box (narrow screens).
    const pad = 8, hintPad = 30, drift = 8;
    let kx = 1, ky = 1;
    NODES.forEach(n => {
      if (!n.parent) return;
      const dx = n.bx - W / 2, dy = n.by - H / 2;
      const halfLabel = n.label && !n.hideLabel ? n.label.length * 3.7 + 4 : 0;
      const ex = Math.max(n.r, halfLabel) + drift;
      if (dx) kx = Math.min(kx, (W / 2 - pad - ex) / Math.abs(dx));
      if (dy < 0) ky = Math.min(ky, (H / 2 - pad - n.r - drift) / -dy);
      if (dy > 0) ky = Math.min(ky, (H / 2 - hintPad - n.r - (n.label ? 20 : 0) - drift) / dy);
    });
    // when the spacing had to shrink, shrink the discs with it so neighbours keep their breathing room
    const kr = Math.min(1, Math.max(Math.min(kx, ky), 0.72));
    NODES.forEach(n => {
      n.bx = W / 2 + (n.bx - W / 2) * kx; n.by = H / 2 + (n.by - H / 2) * ky;
      if (n.parent) { const p = byId[n.parent]; n.hx = n.bx - p.bx; n.hy = n.by - p.by; }
      n.r = Math.max(n.r * kr, n.kind === "root" ? 32 : 11);
      n.halo.setAttribute("r", n.r + 6);
      n.face.setAttribute("r", n.r);
      n.ring.setAttribute("r", n.r);
      if (n.clip) {
        n.clip.setAttribute("r", n.r);
        Object.entries({ x: -n.r, y: -n.r, width: 2 * n.r, height: 2 * n.r }).forEach(([k, v]) => {
          n.image.setAttribute(k, v);
          if (n.imageAlt) n.imageAlt.setAttribute(k, v);
        });
      }
      if (n.text) n.text.setAttribute("font-size", n.r * (n.glyph.length > 1 ? 0.95 : 1.15));
      if (n.iconG) {
        const ic = ICONS[n.icon], sc = n.r / ic.box;
        n.iconG.setAttribute("transform", `scale(${sc}) translate(${-ic.box / 2} ${-ic.box / 2})`);
      }
      if (n.labelEl) n.labelEl.setAttribute("y", n.r + 16);
    });

    const me = byId.me;
    orbits[0].setAttribute("cx", me.bx); orbits[0].setAttribute("cy", me.by);
    orbits[0].setAttribute("rx", R1 * sx * kx); orbits[0].setAttribute("ry", R1 * sy * ky);
    orbits[1].setAttribute("cx", me.bx); orbits[1].setAttribute("cy", me.by);
    orbits[1].setAttribute("rx", (R1 + R2 * 0.9) * sx * kx); orbits[1].setAttribute("ry", (R1 + R2 * 0.9) * sy * ky);

    if (!booted) {
      // first layout: everything starts stacked on the portrait and bursts out
      NODES.forEach(n => { n.x = reduceMotion ? n.bx : W / 2; n.y = reduceMotion ? n.by : H / 2; });
      booted = true;
    }
  }

  // ── Simulation ──
  let dragged = null;
  function step(dt, time) {
    NODES.forEach(n => {               // parents come before children in NODES
      if (n === dragged) return;
      let tx, ty;
      if (!n.parent) { tx = W / 2; ty = H / 2; }
      else {
        const p = byId[n.parent];
        const amp = reduceMotion ? 0 : 3 + n.depth;
        tx = p.x + n.hx + amp * Math.sin(time * n.speed + n.phase);
        ty = p.y + n.hy + amp * Math.cos(time * n.speed * 0.8 + n.phase);
      }
      n.ax = PHYS.k * (tx - n.x) - PHYS.damp * n.vx;
      n.ay = PHYS.k * (ty - n.y) - PHYS.damp * n.vy;
    });
    // soft collisions so flung nodes bump instead of overlapping
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const a = NODES[i], b = NODES[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = a.r + b.r + 10;
        if (d >= min) continue;
        const f = PHYS.repel * (min - d), ux = dx / d, uy = dy / d;
        if (a !== dragged) { a.ax -= ux * f; a.ay -= uy * f; }
        if (b !== dragged) { b.ax += ux * f; b.ay += uy * f; }
      }
    }
    // a soft wall keeps nodes (and their labels) inside the frame after bumps and ripples
    const wall = 10;
    NODES.forEach(n => {
      if (n === dragged) return;
      const left = n.x - n.r - wall, right = W - wall - (n.x + n.r), top = n.y - n.r - wall, bottom = H - 26 - (n.y + n.r);
      if (left < 0) n.ax -= PHYS.k * 3 * left;
      if (right < 0) n.ax += PHYS.k * 3 * right;
      if (top < 0) n.ay -= PHYS.k * 3 * top;
      if (bottom < 0) n.ay += PHYS.k * 3 * bottom;
    });
    NODES.forEach(n => {
      if (n === dragged) return;
      n.vx += n.ax * dt; n.vy += n.ay * dt;
      n.x += n.vx * dt; n.y += n.vy * dt;
    });
  }

  function draw() {
    NODES.forEach(n => n.g.setAttribute("transform", `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`));
    NODES.forEach(n => {
      if (!n.parent) return;
      const p = byId[n.parent];
      const dx = n.x - p.x, dy = n.y - p.y, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      // a straight, tapered stroke from the parent's rim to the child's rim
      const x1 = p.x + ux * (p.r + 1), y1 = p.y + uy * (p.r + 1), x2 = n.x - ux * n.r, y2 = n.y - uy * n.r;
      const w1 = (n.depth === 1 ? 2.6 : 1.9) / 2, w2 = 0.45, nx = -uy, ny = ux;
      const f = v => v.toFixed(1);
      n.edge.setAttribute("d", `M${f(x1 + nx * w1)},${f(y1 + ny * w1)} L${f(x2 + nx * w2)},${f(y2 + ny * w2)} ` +
                               `L${f(x2 - nx * w2)},${f(y2 - ny * w2)} L${f(x1 - nx * w1)},${f(y1 - ny * w1)} Z`);
      n.grad.setAttribute("x1", f(x1)); n.grad.setAttribute("y1", f(y1));
      n.grad.setAttribute("x2", f(x2)); n.grad.setAttribute("y2", f(y2));
      n.port.setAttribute("cx", f(x1)); n.port.setAttribute("cy", f(y1));
      if (n.comet) n.comet.setAttribute("d", `M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}`);
    });
    if (activeId && card.classList.contains("show")) placeCard(byId[activeId]);
  }

  let last = performance.now(), visible = true;
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    if (visible && W) {
      const sub = 3;
      for (let s = 0; s < sub; s++) step(dt / sub, now / 1000);
      draw();
    }
    requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(map);

  // ── Highlighting and cards ──
  let activeId = null, hideTimer = null, pinned = false;

  function light(id) {
    clearLight();
    if (!id || !byId[id]) return;
    svg.classList.add("dim");
    for (let n = byId[id]; n; n = byId[n.parent]) {
      n.g.classList.add("lit");
      if (n.edge) [n.edge, n.grad, n.port, n.comet].forEach(e => e && e.classList.add("lit"));
    }
    document.querySelectorAll(`[data-node="${id}"]`).forEach(e => e.classList.add("lit"));
  }
  function clearLight() {
    svg.classList.remove("dim");
    svg.querySelectorAll(".lit").forEach(e => e.classList.remove("lit"));
    document.querySelectorAll("[data-node].lit").forEach(e => e.classList.remove("lit"));
  }

  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  function showCard(n) {
    if (!n.card) { card.classList.remove("show"); return; }
    const c = n.card;
    card.innerHTML =
      `<div class="k mono">${esc(c.k)}</div><h4>${esc(c.title)}</h4>` +
      (c.sub ? `<p class="sub">${esc(c.sub)}</p>` : "") +
      (c.body || []).map(b => `<p class="body">${esc(b)}</p>`).join("") +
      (c.links ? `<div class="links">${c.links.map(([t, h]) =>
        `<a href="${esc(h)}"${/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : ""}>${esc(t)}</a>`).join("")}</div>` : "");
    card.classList.add("show");
    card.side = null;     // choose a side once per opening so the card doesn't jump while nodes drift
    placeCard(n);
  }
  // Open the card away from the centre so it never covers the highlighted path:
  // outer side first, then below / above, and only then towards the centre.
  function placeCard(n) {
    const cw = card.offsetWidth, ch = card.offsetHeight, pad = 8, gap = 16;
    const clampX = x => Math.min(Math.max(x, pad), W - cw - pad);
    const spots = {
      right: () => ({ left: n.x + n.r + gap, top: n.y - ch / 2 }),
      left:  () => ({ left: n.x - n.r - gap - cw, top: n.y - ch / 2 }),
      below: () => ({ left: clampX(n.x - cw / 2), top: n.y + n.r + 28 }),
      above: () => ({ left: clampX(n.x - cw / 2), top: n.y - n.r - gap - ch }),
    };
    const fits = s => s.left >= pad && s.left + cw <= W - pad && s.top >= pad && s.top + ch <= H - pad;
    if (!card.side) {
      const out = n.x >= W / 2 ? "right" : "left", inward = out === "right" ? "left" : "right";
      const vert = n.y >= H / 2 ? ["below", "above"] : ["above", "below"];
      // never open on the side the node's own edge leaves from
      const blocked = new Set();
      if (n.parent) {
        const p = byId[n.parent], dx = p.x - n.x, dy = p.y - n.y, d = Math.hypot(dx, dy) || 1;
        if (dy / d > 0.4) blocked.add("below"); if (dy / d < -0.4) blocked.add("above");
        if (dx / d > 0.4) blocked.add("right"); if (dx / d < -0.4) blocked.add("left");
      }
      // nothing fits cleanly (e.g. a node at the top centre): stay beside it, on the roomier side
      card.side = [out, ...vert, inward].find(k => !blocked.has(k) && fits(spots[k]())) || (n.x < W / 2 ? "right" : "left");
    }
    const s = spots[card.side]();
    card.style.left = clampX(s.left) + "px";
    card.style.top = Math.min(Math.max(s.top, pad), H - ch - pad) + "px";
  }

  function activate(id) {
    clearTimeout(hideTimer);
    activeId = id;
    light(id);
    showCard(byId[id]);
  }
  function deactivate(force) {
    if (pinned && !force) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { activeId = null; pinned = false; card.classList.remove("show"); clearLight(); }, force ? 0 : 280);
  }

  // ── Pointer: hover for cards, drag to play, click to open ──
  const toLocal = e => { const r = svg.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  let press = null;   // { n, start, grab, lastPos, lastT, moved }

  NODES.forEach(n => {
    n.g.addEventListener("pointerenter", e => { if (e.pointerType === "mouse" && !dragged && n.card) { pinned = false; activate(n.id); } });
    n.g.addEventListener("pointerleave", e => { if (e.pointerType === "mouse" && !dragged) deactivate(); });
    n.g.addEventListener("focus", () => { if (n.card) activate(n.id); });
    n.g.addEventListener("blur", () => deactivate());

    n.g.addEventListener("pointerdown", e => {
      if (e.button !== 0) return;
      e.preventDefault();
      n.g.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      press = { n, start: p, grab: { x: p.x - n.x, y: p.y - n.y }, lastPos: p, lastT: performance.now(), moved: false };
    });
    n.g.addEventListener("pointermove", e => {
      if (!press || press.n !== n) return;
      const p = toLocal(e);
      if (!press.moved && Math.hypot(p.x - press.start.x, p.y - press.start.y) > 4) {
        press.moved = true; dragged = n;
        nodeLayer.appendChild(n.g);    // draw the grabbed node on top
        svg.classList.add("dragging");
        deactivate(true);
      }
      if (!press.moved) return;
      const now = performance.now(), dt = Math.max((now - press.lastT) / 1000, 1 / 240);
      n.vx = (p.x - press.lastPos.x) / dt; n.vy = (p.y - press.lastPos.y) / dt;
      n.x = p.x - press.grab.x; n.y = p.y - press.grab.y;
      press.lastPos = p; press.lastT = now;
    });
    const release = e => {
      if (!press || press.n !== n) return;
      const wasDrag = press.moved;
      press = null; dragged = null;
      svg.classList.remove("dragging");
      if (wasDrag) {                                   // fling: keep the (capped) release velocity
        const v = Math.hypot(n.vx, n.vy), cap = 2400;
        if (v > cap) { n.vx *= cap / v; n.vy *= cap / v; }
        return;
      }
      if (e.type !== "pointerup") return;
      if (n.href) { window.open(n.href, /^https?:/.test(n.href) ? "_blank" : "_self"); return; }
      if (n.card) { pinned = true; activate(n.id); }
      else ripple(n.x, n.y, 1.2);     // the portrait: a tap sends a ripple
    };
    n.g.addEventListener("pointerup", release);
    n.g.addEventListener("pointercancel", release);

    n.g.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (n.href) window.open(n.href, /^https?:/.test(n.href) ? "_blank" : "_self");
        else if (n.card) { pinned = true; activate(n.id); }
        else ripple(n.x, n.y, 1.2);
      }
      if (e.key === "Escape") deactivate(true);
    });
  });

  // Click on empty space: close any card and send a ripple through the map.
  svg.addEventListener("click", e => {
    if (e.target.closest(".node")) return;
    deactivate(true);
    const p = toLocal(e);
    ripple(p.x, p.y, 1);
  });
  card.addEventListener("pointerenter", () => clearTimeout(hideTimer));
  card.addEventListener("pointerleave", () => deactivate());
  document.addEventListener("keydown", e => { if (e.key === "Escape") deactivate(true); });

  function ripple(x, y, strength) {
    if (!reduceMotion) {
      const ring = el("circle", { class: "ripple", cx: x, cy: y, r: Math.max(W, H) * 0.6 }, rippleLayer);
      setTimeout(() => ring.remove(), 1000);
    }
    NODES.forEach(n => {
      if (n === dragged) return;
      const dx = n.x - x, dy = n.y - y, d = Math.hypot(dx, dy) || 1;
      const push = 1100 * strength * Math.exp(-d / 220) * (reduceMotion ? 0.3 : 1);
      n.vx += (dx / d) * push; n.vy += (dy / d) * push;
    });
  }

  // Panels → map: hovering a paper or a timeline entry lights its node.
  document.querySelectorAll("[data-node]").forEach(e => {
    e.addEventListener("pointerenter", () => { if (!card.classList.contains("show")) light(e.dataset.node); });
    e.addEventListener("pointerleave", () => { if (!card.classList.contains("show")) clearLight(); });
  });

  // ── Start ──
  new ResizeObserver(layout).observe(map);
  layout();
  NODES.forEach((n, i) => {
    const delay = n.depth * 160 + i * 25;
    n.g.style.transitionDelay = delay + "ms";
    if (n.edge) [n.edge, n.port].forEach(e => (e.style.transitionDelay = delay + "ms"));
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    svg.classList.remove("booting");
    setTimeout(() => svg.querySelectorAll("[style]").forEach(e => (e.style.transitionDelay = "")), 1400);
  }));
  requestAnimationFrame(loop);

  // Every few seconds a faint signal runs outward along one edge.
  if (!reduceMotion) {
    const comets = NODES.filter(n => n.comet);
    setInterval(() => {
      if (!visible || document.hidden) return;
      const n = comets[Math.floor(Math.random() * comets.length)];
      if (n.comet.classList.contains("lit")) return;
      n.comet.classList.add("fire");
      n.comet.addEventListener("animationend", () => n.comet.classList.remove("fire"), { once: true });
    }, 1800);
  }
})();

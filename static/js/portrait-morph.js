// Portrait hover morph. The two photos' outlines don't quite line up (the smiling one's neck and shoulders
// sit a little to the right), so a plain crossfade shows doubled edges. Instead the neutral photo is warped
// toward the smiling one's shape while the smile fades in, itself warped from the neutral shape; every edge
// stays single and both ends are the untouched photos. The displacement maps come from tools/portrait/flow.py.
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var MAX = 24;                      // ±px at 480 px encoded in the maps (matches flow.py)
  var DURATION = 380;
  var MAPS = { neutral: "static/images/nodes/portrait-warp-neutral.png", smile: "static/images/nodes/portrait-warp-smile.png" };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var uid = 0, ready = false;

  // the maps are only needed on hover: fetch them after the page, and plain-fade until they're in
  function preload() {
    var left = 2;
    Object.keys(MAPS).forEach(function (k) {
      var im = new Image();
      im.onload = function () { if (--left === 0) ready = true; };
      im.src = MAPS[k];
    });
  }
  if (document.readyState === "complete") preload(); else addEventListener("load", preload);

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(2 - 2 * t, 2) / 2; };

  // neutral, smile: two <image> elements drawn over the same square. Returns { set(0|1), toggle() }.
  window.portraitMorph = function (neutral, smile) {
    var svg = neutral.ownerSVGElement;
    var defs = svg.querySelector("defs") || svg.insertBefore(el("defs", {}), svg.firstChild);
    var id = "portrait-morph-" + (++uid);
    function filter(name, map) {
      var f = el("filter", { id: id + name, filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse",
                             "color-interpolation-filters": "sRGB" }, defs);
      var img = el("feImage", { href: map, preserveAspectRatio: "none", result: "map" }, f);
      var d = el("feDisplacementMap", { "in": "SourceGraphic", in2: "map", xChannelSelector: "R", yChannelSelector: "G", scale: 0 }, f);
      return { f: f, img: img, d: d, url: "url(#" + id + name + ")" };
    }
    var fn = filter("n", MAPS.neutral), fs = filter("s", MAPS.smile);
    var a = 0, target = 0, last = null, raf = 0;

    function apply() {
      var e = ease(a);
      var x = +neutral.getAttribute("x") || 0, y = +neutral.getAttribute("y") || 0, w = +neutral.getAttribute("width") || 480;
      var warp = ready && e > 0 && e < 1;
      if (warp) {
        [fn, fs].forEach(function (F) {
          [F.f, F.img].forEach(function (n) { n.setAttribute("x", x); n.setAttribute("y", y); n.setAttribute("width", w); n.setAttribute("height", w); });
        });
        var k = 2 * MAX * w / 480;   // map value 0..1 → ±MAX px, in this image's own units
        fn.d.setAttribute("scale", e * k);
        fs.d.setAttribute("scale", (1 - e) * k);
        neutral.setAttribute("filter", fn.url);
        smile.setAttribute("filter", fs.url);
      } else {
        neutral.removeAttribute("filter");
        smile.removeAttribute("filter");
      }
      smile.style.opacity = e;
      neutral.style.visibility = e >= 1 ? "hidden" : "";   // fully smiling: the neutral one steps aside
    }
    function step(now) {
      if (last === null) last = now;   // time from the first frame, in the frame clock's own timebase
      a = Math.min(1, Math.max(0, a + (target > a ? 1 : -1) * (now - last) / DURATION));
      last = now;
      apply();
      raf = a === target ? 0 : requestAnimationFrame(step);
      if (!raf) last = null;
    }
    function set(t) {
      target = t ? 1 : 0;
      if (reduce) { a = target; apply(); return; }
      if (!raf) raf = requestAnimationFrame(step);
    }
    apply();
    return { set: set, toggle: function () { set(!target); return target; } };
  };
})();

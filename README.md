### Personal website

Source for [alimohammadiamirhossein.github.io](https://alimohammadiamirhossein.github.io/).

A static page with no build step:

- `index.html`: the About, Journey, and Publications panels.
- `static/js/constellation.js`: the interactive map in the middle. Each node (image, label, hover card,
  links) is one entry in the `NODES` list at the top; `angle` places it around its parent.
  Nodes sit on springs, so visitors can drag and fling them, and clicking empty space sends a ripple.
- `static/css/site.css`: styles; the colour palette is the block of variables at the top.
- Images: node pictures in `static/images/nodes/` (200 px squares), publication thumbnails in
  `static/images/pubs/` (720×360 WebP).

Any element with `data-node="<id>"` (a paper card, a timeline row) lights up that node on hover.

Preview locally with `python3 -m http.server` and open http://localhost:8000.

The earlier D3 "CV tree" version is still in `src/`, `dist/` and `_index.html` (build with `npm run build`), but `index.html` no longer loads it.

### Paper animations

Each publication thumbnail is a short looping video made from the paper's real results
(`static/videos/<paper>.mp4`, with a poster frame in `static/images/pubs/`).
The scenes are HTML pages in `tools/paper-anims/scenes/`, all on one grid (inputs top-left, a control
card bottom-left, the output large on the right; see the comment in `scenes/base.css`). Preview them all live at
`tools/paper-anims/index.html`, then rebuild with:

```
pip install playwright pillow numpy        # plus ffmpeg on PATH
python tools/paper-anims/prepare_assets.py # downloads the results and cuts them into pieces
python tools/paper-anims/render.py         # or: render.py sia cora   (just some scenes)
```

`render.py` also writes a 1320×660 MP4 and a GIF of each scene to `../paper-animations/`, for slides and social posts.

### Loading on slow connections

The page shows a light version first and upgrades itself: text appears at once (Geist loads without blocking,
over a same-width fallback); each thumbnail starts as a tiny inline blur, then its poster; the animations
(`<video data-src>`) are fetched whole by the script at the end of `index.html`, one at a time and on-screen
first, and fade in only when they can play without stopping. On slow connections only on-screen animations
are fetched; with Data Saver or reduced motion the posters stay. Analytics loads after the page.

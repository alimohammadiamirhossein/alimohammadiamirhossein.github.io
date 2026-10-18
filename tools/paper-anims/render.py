"""Render the paper animations to video.

    python tools/paper-anims/render.py [scene ...] [--share DIR]

Needs Playwright (with a Chromium) and ffmpeg. For each scene in scenes/, every frame is captured at
3× scale by calling the scene's render(t), then encoded to:
  static/videos/<scene>.mp4        960×480 loop for the website
  static/images/pubs/<scene>.webp  poster frame (also the thumbnail when video can't play)
  <share>/<scene>.mp4, .gif        1320×660 video and a 660×330 GIF for slides and social posts
"""
import argparse
import functools
import http.server
import pathlib
import shutil
import subprocess
import threading

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
FPS = 30
# a representative moment for each poster frame (seconds into the loop)
POSTER_T = {"sia": 3.4, "cora": 2.15, "smite": 4.6, "hairport": 2.5, "griffin": 6.0, "pose": 7.6}
# real-video scenes compress poorly: lighter GIFs and a little more MP4 compression for them
HEAVY = {"smite", "pose"}


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def serve():
    """Scenes fetch their assets, so they need http:// rather than file://."""
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(HERE)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{server.server_address[1]}"


def capture(page, base, name, frames_dir):
    page.goto(f"{base}/scenes/{name}.html?render=1")
    page.wait_for_function("window.sceneReady !== undefined")
    page.evaluate("window.sceneReady")
    duration = page.evaluate("window.DURATION")
    stage = page.locator(".stage")
    shutil.rmtree(frames_dir, ignore_errors=True)
    frames_dir.mkdir(parents=True)
    n = round(duration * FPS)
    for i in range(n):
        page.evaluate(f"window.render({i / FPS})")
        stage.screenshot(path=str(frames_dir / f"{i:04d}.png"), animations="disabled")
    page.evaluate(f"window.render({POSTER_T[name]})")
    stage.screenshot(path=str(frames_dir / "poster.png"), animations="disabled")
    return n


def encode(name, frames_dir, share):
    src = ["-framerate", str(FPS), "-i", str(frames_dir / "%04d.png")]
    x264 = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"]
    site = REPO / "static" / "videos" / f"{name}.mp4"
    site.parent.mkdir(parents=True, exist_ok=True)
    heavy = name in HEAVY
    ffmpeg(*src, "-vf", "scale=960:480:flags=lanczos", *x264, "-crf", "27" if heavy else "24", str(site))
    ffmpeg("-i", str(frames_dir / "poster.png"), "-vf", "scale=720:360:flags=lanczos", "-quality", "86",
           str(REPO / "static" / "images" / "pubs" / f"{name}.webp"))
    share.mkdir(parents=True, exist_ok=True)
    ffmpeg(*src, "-vf", "scale=1320:660:flags=lanczos", *x264, "-crf", "18", str(share / f"{name}.mp4"))
    fps, colors, dither = (10, 128, "bayer:bayer_scale=3") if heavy else (15, 200, "sierra2_4a")
    ffmpeg(*src, "-vf", f"fps={fps},scale=660:330:flags=lanczos,split[a][b];[a]palettegen=max_colors={colors}:stats_mode=diff[p];"
                        f"[b][p]paletteuse=dither={dither}:diff_mode=rectangle", str(share / f"{name}.gif"))
    return site


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scenes", nargs="*", default=list(POSTER_T))
    ap.add_argument("--share", default=str(REPO.parent / "paper-animations"))
    args = ap.parse_args()
    share = pathlib.Path(args.share)
    base = serve()
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox"], executable_path=_chromium(p))
        page = browser.new_page(viewport={"width": 520, "height": 300}, device_scale_factor=3)
        for name in args.scenes:
            frames_dir = HERE / "frames" / name
            n = capture(page, base, name, frames_dir)
            site = encode(name, frames_dir, share)
            print(f"{name:9s} {n} frames → {site.relative_to(REPO)} ({site.stat().st_size // 1024} KB), "
                  f"{share / (name + '.gif')} ({(share / (name + '.gif')).stat().st_size // 1024} KB)")
        browser.close()


def _chromium(p):
    """Use Playwright's bundled browser if it matches, else any Chromium Playwright downloaded earlier."""
    try:
        path = p.chromium.executable_path
        if pathlib.Path(path).exists():
            return path
    except Exception:
        pass
    found = sorted(pathlib.Path.home().glob(".cache/ms-playwright/chromium-*/*/chrome"))
    return str(found[-1]) if found else None


if __name__ == "__main__":
    main()

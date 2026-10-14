"""Capture README screenshots from a running TasteBridge server.
Usage: python3 scripts/screenshots.py http://localhost:3100 docs/screenshots [pages]
"""
import asyncio, os, sys, urllib.request
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
OUT = sys.argv[2] if len(sys.argv) > 2 else "docs/screenshots"
ONLY = sys.argv[3].split(",") if len(sys.argv) > 3 else None
os.makedirs(OUT, exist_ok=True)

def proxy():
    p = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    return {"server": p, "bypass": "localhost,127.0.0.1"} if p else None

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--ignore-certificate-errors"])
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1, ignore_https_errors=True)
        async def ext(route):
            url = route.request.url
            if "127.0.0.1" in url or "localhost" in url:
                return await route.continue_()
            try:
                data = await asyncio.to_thread(lambda: urllib.request.urlopen(url, timeout=20).read())
                ct = "image/png" if ".png" in url else None
                await route.fulfill(body=data, headers={"content-type": ct} if ct else {})
            except Exception:
                await route.abort()
        await ctx.route("**/*", ext)
        page = await ctx.new_page()
        async def shot(name, path, full=True, wait=1500, setup=None):
            if ONLY and name not in ONLY: return
            await page.goto(BASE + path, wait_until="networkidle", timeout=120000)
            if setup: await setup()
            h = await page.evaluate("document.body.scrollHeight")
            for y in range(0, h, 500):
                await page.evaluate(f"window.scrollTo(0,{y})"); await page.wait_for_timeout(120)
            await page.evaluate("window.scrollTo(0,0)")
            await page.wait_for_timeout(wait)
            await page.screenshot(path=f"{OUT}/{name}.png", full_page=full)
            print("saved", name)
        await shot("landing", "/", full=True)
        await shot("business", "/business")
        await shot("architecture", "/architecture", full=False)
        async def idx():
            await page.wait_for_selector("table", timeout=240000)
        await shot("opportunity-index", "/opportunity-index", setup=idx, wait=800)
        async def run():
            await page.get_by_role("button", name="Blue Bottle Coffee").click()
            await page.get_by_label("Phase-1 budget ceiling (optional)").fill("500000")
            await page.get_by_role("button", name="Run the agent committee").click()
            await page.wait_for_timeout(9000)
            await page.screenshot(path=f"{OUT}/analyze-live.png", full_page=False)
            print("saved analyze-live")
            await page.wait_for_selector("text=Download investor memo", timeout=300000)
        await shot("analyze-result", "/analyze", setup=run, wait=2500)
        if not ONLY or "analyze-result" in ONLY:
            await page.emulate_media(media="print")
            await page.pdf(path=f"{OUT}/investor-memo.pdf", format="A4", print_background=True)
            await page.emulate_media(media="screen")
            print("saved memo pdf")
            m = await ctx.new_page()
            await m.set_viewport_size({"width": 390, "height": 844})
            await m.goto(BASE + "/", wait_until="networkidle")
            await m.screenshot(path=f"{OUT}/mobile-landing.png", full_page=False)
            print("saved mobile")
        await b.close()

asyncio.run(main())

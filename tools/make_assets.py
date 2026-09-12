#!/usr/bin/env python3
"""Renders the site's image assets (link-preview card and icons) from HTML.

Run only when the design or wording changes; the PNGs are committed.
Requires Playwright and a Chromium binary:
    pip install playwright && playwright install chromium
    python3 tools/make_assets.py
"""

import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cv-site")

CHROME_CANDIDATES = [
    os.environ.get("CHROME_PATH", ""),
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
]

OG_CARD = """
<style>
  @page{margin:0}
  *{box-sizing:border-box}
  body{
    margin:0;width:1200px;height:630px;
    background:#FAF8F4;color:#2B2B2B;
    font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    display:flex;flex-direction:column;justify-content:space-between;
    padding:72px 80px;
    position:relative;
  }
  body::before{
    content:"";position:absolute;left:0;top:0;bottom:0;width:10px;background:#C9A227;
  }
  .mark{
    font-size:15px;font-weight:700;letter-spacing:.16em;color:#836911;
    border:1.5px solid #A58520;border-radius:3px;padding:6px 10px;
    display:inline-block;
  }
  h1{
    font-family:"Iowan Old Style",Palatino,Georgia,"Times New Roman",serif;
    font-size:92px;line-height:1;margin:34px 0 26px;letter-spacing:-.02em;font-weight:600;
  }
  p{
    font-family:"Iowan Old Style",Palatino,Georgia,"Times New Roman",serif;
    font-size:31px;line-height:1.4;color:#57534B;margin:0;max-width:23ch;
  }
  ul{
    display:flex;gap:40px;list-style:none;margin:0;padding:30px 0 0;
    border-top:1px solid #E2DCD0;
  }
  li{font-size:20px;color:#716B62;letter-spacing:.02em}
  li b{display:block;font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:#836911;margin-bottom:7px;font-weight:600}
</style>
<div>
  <span class="mark">TW</span>
  <h1>Thomas Willmott</h1>
  <p>Finance and mathematics, financial modelling, and things built end to end.</p>
</div>
<ul>
  <li><b>Reading</b>BSc Finance &amp; Mathematics, Royal Holloway</li>
  <li><b>Certified</b>FMVA at 93%</li>
  <li><b>Building</b>Clarifin</li>
</ul>
"""

ICON = """
<style>
  body{margin:0;width:%(s)dpx;height:%(s)dpx;background:#2B2B2B;
       display:flex;align-items:center;justify-content:center}
  span{
    font-family:"Iowan Old Style",Palatino,Georgia,"Times New Roman",serif;
    font-weight:600;color:#C9A227;font-size:%(f)dpx;letter-spacing:.01em;
  }
</style>
<span>TW</span>
"""


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Playwright is not installed: pip install playwright")

    exe = next((c for c in CHROME_CANDIDATES if c and os.path.exists(c)), None)

    with sync_playwright() as pw:
        kwargs = {"args": ["--no-sandbox"]}
        if exe:
            kwargs["executable_path"] = exe
        browser = pw.chromium.launch(**kwargs)

        page = browser.new_page(viewport={"width": 1200, "height": 630})
        page.set_content(OG_CARD)
        page.screenshot(path=os.path.join(ROOT, "og.png"))
        page.close()

        for name, size in [("icon-192.png", 192), ("icon-512.png", 512),
                           ("apple-touch-icon.png", 180)]:
            page = browser.new_page(viewport={"width": size, "height": size})
            page.set_content(ICON % {"s": size, "f": round(size * 0.46)})
            page.screenshot(path=os.path.join(ROOT, name))
            page.close()

        browser.close()

    for f in ["og.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png"]:
        path = os.path.join(ROOT, f)
        print("%-22s %6.1f KB" % (f, os.path.getsize(path) / 1024))


if __name__ == "__main__":
    main()

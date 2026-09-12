#!/usr/bin/env python3
"""Generates the static personal site in cv-site/.

The deployed output is plain HTML/CSS/JS and needs no build step. This
script exists only so the header, footer and metadata stay identical
across pages while authoring. Run: python3 tools/generate_site.py
"""

import os
import re
import textwrap

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cv-site")
SITE_URL = "https://thomaswillmott.co.uk"
EMAIL = "tjwillmott12@gmail.com"
LINKEDIN = "https://www.linkedin.com/in/thomas-willmott/"
GITHUB = "https://github.com/thetboss"
CLARIFIN = "https://clarifin.co.uk"

# --------------------------------------------------------------------------
# Stylesheet
# --------------------------------------------------------------------------

CSS = r"""
/* =========================================================================
   Thomas Willmott — personal site
   Palette: charcoal ink, warm paper, single muted-gold accent.
   ========================================================================= */

:root{
  color-scheme:light;
  --bg:#FAF8F4;
  --bg-2:#F2EEE5;
  --bg-3:#EAE5D9;
  --ink:#2B2B2B;
  --ink-2:#57534B;
  --ink-3:#716B62;          /* 4.56:1 on the card background */
  --rule:#E2DCD0;           /* decorative hairlines */
  --rule-strong:#CFC7B7;    /* decorative emphasis */
  --ui-border:#8F8880;      /* interactive controls: 3.02:1, meets WCAG 1.4.11 */
  --gold:#C9A227;           /* decorative accent */
  --gold-line:#A58520;      /* accent used to carry state: 3.04:1 */
  --gold-ink:#836911;       /* accent text: 4.54:1 */
  --gold-wash:rgba(201,162,39,.10);
  --focus:#2B2B2B;
  --shadow:0 1px 2px rgba(43,43,43,.04),0 8px 24px -12px rgba(43,43,43,.18);

  --serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,"Times New Roman",serif;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;

  --wide:70rem;
  --prose:44rem;
  --pad:clamp(1.15rem,4vw,2.5rem);
  --gap:clamp(2.75rem,7vw,4.5rem);
  --radius:3px;
}

:root[data-theme="dark"],
:root:not([data-theme="light"]) {}

@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    color-scheme:dark;
    --bg:#1A1A18;
    --bg-2:#222220;
    --bg-3:#2A2A27;
    --ink:#E9E6DF;
    --ink-2:#B5B0A5;
    --ink-3:#8D887F;
    --rule:#34332E;
    --rule-strong:#45443D;
    --ui-border:#726F66;
    --gold:#D8B646;
    --gold-line:#D8B646;
    --gold-ink:#E3C468;
    --gold-wash:rgba(216,182,70,.12);
    --focus:#E9E6DF;
    --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -12px rgba(0,0,0,.6);
  }
}

:root[data-theme="dark"]{
  color-scheme:dark;
  --bg:#1A1A18;
  --bg-2:#222220;
  --bg-3:#2A2A27;
  --ink:#E9E6DF;
  --ink-2:#B5B0A5;
  --ink-3:#8D887F;
  --rule:#34332E;
  --rule-strong:#45443D;
  --ui-border:#726F66;
  --gold:#D8B646;
  --gold-line:#D8B646;
  --gold-ink:#E3C468;
  --gold-wash:rgba(216,182,70,.12);
  --focus:#E9E6DF;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -12px rgba(0,0,0,.6);
}

*,*::before,*::after{box-sizing:border-box}

html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}

body{
  margin:0;
  background:var(--bg);
  color:var(--ink);
  font-family:var(--sans);
  font-size:clamp(1rem,.965rem + .17vw,1.0625rem);
  line-height:1.62;
  font-kerning:normal;
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
}

img{max-width:100%;height:auto}

a{color:inherit;text-decoration:none}

:focus-visible{
  outline:2px solid var(--focus);
  outline-offset:3px;
  border-radius:2px;
}
.card:focus-within{border-color:var(--ui-border)}

::selection{background:var(--gold-wash);color:var(--ink)}
:root{scrollbar-color:var(--ui-border) transparent}

/* Anchors must clear the sticky header */
[id]{scroll-margin-top:5.5rem}

.skip{
  position:absolute;left:.5rem;top:-4rem;z-index:200;
  background:var(--ink);color:var(--bg);
  padding:.6rem 1rem;border-radius:var(--radius);
  transition:top .15s ease;
}
.skip:focus{top:.5rem}

.visually-hidden{
  position:absolute;width:1px;height:1px;margin:-1px;padding:0;
  overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;
}

.wrap{max-width:var(--wide);margin:0 auto;padding-inline:var(--pad)}
.wrap-prose{max-width:var(--prose)}

/* ---------- Header ---------- */

.site-header{
  position:sticky;top:0;z-index:100;
  background:color-mix(in srgb,var(--bg) 88%,transparent);
  -webkit-backdrop-filter:saturate(180%) blur(10px);
  backdrop-filter:saturate(180%) blur(10px);
  border-bottom:1px solid var(--rule);
}
@supports not (backdrop-filter:blur(1px)){.site-header{background:var(--bg)}}

.header-inner{
  max-width:var(--wide);margin:0 auto;padding:0 var(--pad);
  height:3.75rem;
  display:flex;align-items:center;gap:1rem;
}

.brand{
  display:inline-flex;align-items:baseline;gap:.5rem;
  font-family:var(--serif);font-size:1.0625rem;font-weight:600;
  letter-spacing:-.01em;white-space:nowrap;
}
.brand .mark{
  font-family:var(--sans);font-size:.6875rem;font-weight:700;
  letter-spacing:.08em;
  color:var(--gold-ink);
  border:1px solid var(--gold-line);
  padding:.15rem .3rem;border-radius:2px;
}

.nav{margin-left:auto}
.nav ul{display:flex;align-items:center;gap:.15rem;list-style:none;margin:0;padding:0}
.nav a{
  display:block;padding:.45rem .7rem;border-radius:var(--radius);
  font-size:.9rem;color:var(--ink-2);
  position:relative;
  transition:color .15s ease,background-color .15s ease;
}
.nav a:hover{color:var(--ink);background:var(--bg-2)}
.nav a[aria-current="page"]{color:var(--ink);font-weight:500}
.nav a[aria-current="page"]::after{
  content:"";position:absolute;left:.7rem;right:.7rem;bottom:.15rem;
  height:2px;background:var(--gold);
}

.header-tools{display:flex;align-items:center;gap:.35rem}

.icon-btn{
  display:inline-flex;align-items:center;justify-content:center;
  width:2.25rem;height:2.25rem;
  background:none;border:1px solid transparent;border-radius:var(--radius);
  color:var(--ink-2);cursor:pointer;
  transition:color .15s ease,border-color .15s ease,background-color .15s ease;
}
.icon-btn:hover{color:var(--ink);border-color:var(--ui-border);background:var(--bg-2)}
.icon-btn svg{width:1.0625rem;height:1.0625rem;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}

.theme-toggle .icon-moon{display:none}
:root[data-theme="dark"] .theme-toggle .icon-moon{display:block}
:root[data-theme="dark"] .theme-toggle .icon-sun{display:none}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .theme-toggle .icon-moon{display:block}
  :root:not([data-theme="light"]) .theme-toggle .icon-sun{display:none}
}

.menu-btn{display:none}

@media (max-width:52em){
  .menu-btn{display:inline-flex}
  :root.js .nav{
    position:fixed;inset:3.75rem 0 auto 0;
    background:var(--bg);
    border-bottom:1px solid var(--rule);
    padding:.5rem var(--pad) 1.25rem;
    margin:0;
    transform:translateY(-8px);
    opacity:0;visibility:hidden;pointer-events:none;
    transition:opacity .18s ease,transform .18s ease,visibility .18s;
    box-shadow:var(--shadow);
  }
  :root.js .nav[data-open="true"]{opacity:1;visibility:visible;transform:none;pointer-events:auto}
  :root.js .nav ul{flex-direction:column;align-items:stretch;gap:0}
  :root.js .nav a{padding:.7rem .25rem;font-size:1rem;border-bottom:1px solid var(--rule)}
  :root.js .nav li:last-child a{border-bottom:0}
  :root.js .nav a[aria-current="page"]::after{left:.25rem;right:auto;width:1.25rem;bottom:.35rem}

  /* Without JavaScript there is nothing to open the drawer, so the nav stays inline. */
  :root:not(.js) .menu-btn{display:none}
  :root:not(.js) .header-inner{flex-wrap:wrap;height:auto;padding-block:.55rem}
  :root:not(.js) .nav{width:100%;margin-left:0;order:3}
  :root:not(.js) .nav ul{flex-wrap:wrap;gap:.1rem;margin-left:-.55rem}
  :root:not(.js) .nav a{padding:.35rem .55rem;font-size:.875rem}
}

/* ---------- Generic page furniture ---------- */

main{display:block}

.section{padding-block:var(--gap)}
.section+.section{border-top:1px solid var(--rule)}

.eyebrow{
  display:flex;align-items:center;gap:.6rem;
  font-size:.7rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
  color:var(--ink-3);
  margin:0 0 1.25rem;
}
.eyebrow::after{content:"";flex:1;height:1px;background:var(--rule)}
.eyebrow .num{color:var(--gold-ink);font-variant-numeric:tabular-nums}

h1,h2,h3,h4{font-family:var(--serif);font-weight:600;letter-spacing:-.012em;margin:0}
h1{font-size:clamp(2.1rem,1.5rem + 2.8vw,3.25rem);line-height:1.06}
h2{font-size:clamp(1.5rem,1.25rem + 1.1vw,2.05rem);line-height:1.18}
h3{font-size:1.1875rem;line-height:1.3}
h4{font-size:1.0625rem;line-height:1.35}

p{margin:0 0 1rem}
p:last-child{margin-bottom:0}

.lede{
  font-family:var(--serif);
  font-size:clamp(1.1rem,1.02rem + .45vw,1.35rem);
  line-height:1.5;color:var(--ink-2);
}
.muted{color:var(--ink-2)}
.small{font-size:.9rem}
.tiny{font-size:.8125rem;color:var(--ink-3)}

.link{
  border-bottom:1px solid var(--gold-line);padding-bottom:1px;
  transition:color .15s ease,border-color .15s ease;
}
.link:hover{color:var(--gold-ink);border-bottom-color:var(--gold-ink)}

.arrow::after{content:" \2192";display:inline-block;transition:transform .15s ease}
a:hover .arrow::after,a.arrow:hover::after{transform:translateX(3px)}

.btn{
  display:inline-flex;align-items:center;gap:.5rem;
  padding:.6rem 1.1rem;min-height:2.75rem;
  border:1px solid var(--ui-border);border-radius:var(--radius);
  background:var(--bg);color:var(--ink);
  font-family:var(--sans);font-size:.9rem;font-weight:500;
  cursor:pointer;
  transition:border-color .15s ease,background-color .15s ease,color .15s ease;
}
.btn:hover{border-color:var(--gold-line);background:var(--gold-wash)}
.btn-primary{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.btn-primary:hover{background:var(--gold-ink);border-color:var(--gold-ink);color:#fff}
.btn svg{width:1rem;height:1rem;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}

/* ---------- Hero (home) ---------- */

.hero{padding-block:clamp(3rem,9vw,6rem) calc(var(--gap) * .35)}
.hero h1{margin-bottom:1.25rem}
.hero .lede{max-width:32em;margin-bottom:1.75rem}
.hero-actions{display:flex;flex-wrap:wrap;gap:.65rem;margin-bottom:2.5rem}

@media (min-width:62em){
  .hero-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);column-gap:4rem;align-items:end}
  .hero-grid .facts{
    border-top:0;padding-top:0;margin-bottom:.35rem;
    grid-template-columns:1fr;gap:1.1rem;
    border-left:1px solid var(--rule);padding-left:2rem;
  }
}

.facts{
  list-style:none;margin:0;padding:1.5rem 0 0;
  border-top:1px solid var(--rule);
  display:grid;gap:1.25rem;
  grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));
}
.facts dt{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:.3rem}
.facts dd{margin:0;font-family:var(--serif);font-size:1.0625rem;line-height:1.35}
.facts .accent{color:var(--gold-ink)}

/* ---------- Grids & cards ---------- */

.grid{display:grid;gap:1.25rem}
.grid-2{grid-template-columns:1fr}
.grid-3{grid-template-columns:1fr}
@media (min-width:40em){.grid-2,.grid-3{grid-template-columns:repeat(2,1fr)}}
.grid-start{align-items:start}
@media (min-width:64em){.grid-3{grid-template-columns:repeat(3,1fr)}}

.card{
  position:relative;
  display:flex;flex-direction:column;
  background:var(--bg-2);
  border:1px solid var(--rule);
  border-radius:var(--radius);
  padding:1.35rem 1.4rem 1.4rem;
  transition:border-color .18s ease,transform .18s ease,box-shadow .18s ease;
}
.card:hover{border-color:var(--rule-strong)}
a.card:hover,.card-link:hover{border-color:var(--gold-line);transform:translateY(-2px);box-shadow:var(--shadow)}
.card h3{margin-bottom:.4rem}
.card p{font-size:.95rem;color:var(--ink-2)}
.card .foot{margin-top:auto;padding-top:1rem;font-size:.8125rem;color:var(--gold-ink)}

.tag{
  display:inline-block;
  font-size:.6875rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-3);
  border:1px solid var(--rule-strong);border-radius:2px;
  padding:.15rem .4rem;
}
.tag-accent{color:var(--gold-ink);border-color:var(--gold-line)}
.card>.tag{align-self:flex-start}

.chips{display:flex;flex-wrap:wrap;gap:.35rem;list-style:none;margin:0;padding:0}
.chips li{
  font-size:.78rem;color:var(--ink-2);
  background:var(--bg-3);border-radius:2px;padding:.15rem .5rem;
}

/* ---------- Bullets ---------- */

ul.plain{list-style:none;margin:0;padding:0}
ul.plain li{position:relative;padding-left:1.05rem;margin-top:.45rem;color:var(--ink-2);font-size:.95rem}
ul.plain li::before{content:"";position:absolute;left:0;top:.72em;width:.35rem;height:1px;background:var(--gold)}

/* ---------- Entry (CV-style rows) ---------- */

.entry{padding-block:1.4rem;border-top:1px solid var(--rule)}
.entry:first-of-type{border-top:0;padding-top:0}
.entry-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;column-gap:1rem}
.entry .when{font-size:.8125rem;color:var(--ink-3);font-variant-numeric:tabular-nums;white-space:nowrap}
.entry .where{font-size:.9375rem;color:var(--ink-2);margin:.15rem 0 0}
.entry p{margin:.5rem 0 0;font-size:.95rem;color:var(--ink-2)}

/* ---------- Controls (filter bars) ---------- */

.controls{
  display:flex;flex-wrap:wrap;gap:.75rem 1rem;align-items:center;
  padding:1rem 0;margin-bottom:1.5rem;
  border-block:1px solid var(--rule);
}
.search{
  position:relative;flex:1 1 14rem;min-width:0;
}
.search input{
  width:100%;
  font:inherit;font-size:.9rem;
  color:var(--ink);background:var(--bg);
  caret-color:var(--gold-ink);
  border:1px solid var(--ui-border);border-radius:var(--radius);
  padding:.65rem .75rem .65rem 2rem;
  min-height:2.75rem;
}
.search input:hover{border-color:var(--ink-3)}
.search kbd{
  position:absolute;right:.55rem;top:50%;transform:translateY(-50%);
  font-family:var(--mono);font-size:.7rem;color:var(--ink-3);
  border:1px solid var(--rule-strong);border-radius:3px;
  padding:.05rem .3rem;pointer-events:none;
}
.search input:focus~kbd,.search input:not(:placeholder-shown)~kbd{opacity:0}
.search input::placeholder{color:var(--ink-3)}
.search svg{
  position:absolute;left:.6rem;top:50%;transform:translateY(-50%);
  width:.95rem;height:.95rem;fill:none;stroke:var(--ink-3);stroke-width:1.7;
}
.filters{display:flex;flex-wrap:wrap;gap:.35rem}
.filter{
  font:inherit;font-size:.82rem;
  padding:.45rem .85rem;min-height:2.25rem;
  background:none;color:var(--ink-2);
  border:1px solid var(--ui-border);border-radius:99px;
  cursor:pointer;
  transition:color .15s ease,border-color .15s ease,background-color .15s ease;
}
.filter:hover{color:var(--ink);border-color:var(--ink-3)}
/* Pressed state is carried by weight and an inset rule as well as by colour. */
.filter[aria-pressed="true"]{
  color:var(--gold-ink);border-color:var(--gold-line);
  background:var(--gold-wash);font-weight:600;
  box-shadow:inset 0 -2px 0 var(--gold-line);
}
.result-count{font-size:.8125rem;color:var(--ink-3);margin-left:auto;font-variant-numeric:tabular-nums}
.empty-state{padding:3rem 0;text-align:center;color:var(--ink-3)}

/* ---------- Expandable detail panels ---------- */

.expando{margin-top:1rem;border-top:1px solid var(--rule);padding-top:.9rem}
.expando summary{
  display:flex;align-items:center;gap:.4rem;
  list-style:none;cursor:pointer;
  font-size:.8125rem;font-weight:500;letter-spacing:.02em;
  color:var(--gold-ink);
}
.expando summary::-webkit-details-marker{display:none}
.expando summary .chev{
  width:.7rem;height:.7rem;fill:none;stroke:currentColor;stroke-width:2;
  transition:transform .2s ease;
}
.expando[open] summary .chev{transform:rotate(90deg)}
.expando .detail-body{padding-top:.85rem}
.expando .detail-body p{font-size:.92rem}
.expando .detail-body h4{margin:1rem 0 .35rem;font-size:.95rem}
.expando .detail-body h4:first-child{margin-top:0}

/* ---------- Timeline ---------- */

.timeline{list-style:none;margin:0;padding:0;position:relative}
.timeline::before{
  content:"";position:absolute;left:.3125rem;top:.6rem;bottom:.6rem;
  width:1px;background:var(--rule);
}
.timeline li{position:relative;padding:0 0 1.5rem 2rem}
.timeline li:last-child{padding-bottom:0}
.tl-dot{
  position:absolute;left:0;top:.55rem;
  width:.6875rem;height:.6875rem;border-radius:50%;
  background:var(--bg);border:1.5px solid var(--ui-border);
  transition:background-color .2s ease,border-color .2s ease;
}
.timeline li[data-current="true"] .tl-dot{background:var(--gold);border-color:var(--gold-line)}
.tl-btn{
  display:block;width:100%;text-align:left;
  background:none;border:0;padding:0;margin:0;color:inherit;font:inherit;cursor:pointer;
}
.tl-year{
  display:block;
  font-family:var(--mono);font-size:.75rem;letter-spacing:.04em;
  color:var(--gold-ink);
}
.tl-title{display:block;font-family:var(--serif);font-size:1.125rem;font-weight:600;margin:.15rem 0 0;line-height:1.3}
.tl-where{display:block;font-size:.875rem;color:var(--ink-3);margin-top:.1rem}
.tl-btn:hover .tl-title{color:var(--gold-ink)}
.timeline li{padding-bottom:1.75rem}
.tl-body{
  overflow:hidden;
  max-height:0;
  transition:max-height .25s ease;
}
.tl-body p{padding-top:.6rem;font-size:.92rem;color:var(--ink-2);max-width:44em}
.timeline li[data-open="true"] .tl-body{max-height:22rem}
.timeline li[data-open="true"] .tl-dot{border-color:var(--gold)}

/* ---------- Placeholder marker ---------- */

.placeholder{border-style:dashed;border-color:var(--ui-border);background:transparent}
.placeholder-badge{
  display:inline-flex;align-items:center;gap:.35rem;
  font-size:.6875rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  color:var(--gold-ink);margin-bottom:.6rem;
}
.placeholder-badge::before{content:"";width:.4rem;height:.4rem;border-radius:50%;background:var(--gold)}

/* ---------- Contact ---------- */

.contact-row{display:flex;flex-wrap:wrap;gap:.65rem;align-items:center;margin-top:1.5rem}
.copy-btn .copied{display:none}
.copy-btn[data-copied="true"] .copied{display:inline}
.copy-btn[data-copied="true"] .idle{display:none}
.copy-btn[data-copied="true"]{color:var(--gold-ink);border-color:var(--gold)}

/* ---------- Footer ---------- */

.site-footer{
  border-top:1px solid var(--rule);
  padding-block:2.5rem 3rem;
  margin-top:var(--gap);
  font-size:.875rem;color:var(--ink-3);
}
.footer-inner{
  max-width:var(--wide);margin:0 auto;padding-inline:var(--pad);
  display:grid;gap:1.5rem;
}
@media (min-width:48em){.footer-inner{grid-template-columns:1.4fr 1fr 1fr}}
.site-footer h2{font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:.75rem}
.site-footer ul{list-style:none;margin:0;padding:0}
.site-footer li{margin-bottom:.35rem}
.site-footer a:hover{color:var(--ink)}
.footer-name{font-family:var(--serif);font-size:1.0625rem;color:var(--ink);margin-bottom:.35rem}

.to-top{
  position:fixed;right:1rem;bottom:1rem;z-index:90;
  width:2.75rem;height:2.75rem;
  background:var(--bg-2);border:1px solid var(--ui-border);border-radius:50%;
  color:var(--ink-2);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  opacity:0;visibility:hidden;transform:translateY(6px);
  transition:opacity .2s ease,transform .2s ease,visibility .2s;
}
.to-top[data-show="true"]{opacity:1;visibility:visible;transform:none}
.to-top:hover{border-color:var(--gold-line);color:var(--gold-ink)}
.to-top svg{width:1rem;height:1rem;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}

/* ---------- Motion ---------- */

:root.js .reveal{opacity:0;transform:translateY(14px)}
:root.js .reveal.is-visible{
  opacity:1;transform:none;
  transition:opacity .5s ease,transform .5s cubic-bezier(.2,.7,.3,1);
}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important}
  :root.js .reveal{opacity:1;transform:none}
}

@view-transition{navigation:auto}
"""

# --------------------------------------------------------------------------
# CV page styles + print stylesheet (cv.html must print as one clean A4 page)
# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
# Refinements: typography, high-contrast mode, touch targets, motion
# --------------------------------------------------------------------------

CSS += r"""
/* ---------- Typographic detail ---------- */

h1,h2,h3,h4{text-wrap:balance}
p,li,.lede{text-wrap:pretty}

h1{font-variant-numeric:oldstyle-nums}
.when,.tl-year,.result-count,.facts dd{font-variant-numeric:tabular-nums}

/* Hanging quotes and tighter serif rendering where it shows */
.lede{font-feature-settings:"kern" 1,"liga" 1}

/* ---------- Touch targets ---------- */

@media (pointer:coarse){
  .icon-btn{width:2.75rem;height:2.75rem}
  .nav a{padding-block:.85rem}
  .expando summary{padding-block:.35rem}
  .tl-btn{padding-block:.25rem}
}

/* ---------- Collapsed content must leave the accessibility tree ---------- */

.tl-body{visibility:hidden}
.timeline li[data-open="true"] .tl-body{visibility:visible}

/* ---------- Forced colours and high contrast ---------- */

@media (prefers-contrast:more){
  :root{
    --ink-2:var(--ink);
    --ink-3:var(--ink-2);
    --rule:var(--ui-border);
    --rule-strong:var(--ui-border);
  }
  .card,.btn,.filter,.search input{border-width:2px}
  .link{border-bottom-width:2px}
}

@media (forced-colors:active){
  .card,.btn,.filter,.search input,.tag{border:1px solid CanvasText}
  .filter[aria-pressed="true"]{box-shadow:none;outline:2px solid Highlight}
  .tl-dot{background:CanvasText}
  .eyebrow::after{background:CanvasText}
}

/* ---------- View transitions ---------- */

@media (prefers-reduced-motion:no-preference){
  ::view-transition-old(root){animation:vt-out .16s ease both}
  ::view-transition-new(root){animation:vt-in .22s ease both}
  @keyframes vt-out{to{opacity:0}}
  @keyframes vt-in{from{opacity:0}}
}

/* ---------- Empty state ---------- */

.empty-state{padding:3.5rem 0;text-align:center}
.empty-state p{color:var(--ink-2);margin-bottom:1rem}

/* ---------- Print: every page, not just the CV ---------- */

@media print{
  .controls,.filters,.search,.result-count,.hero-actions,.contact-row,
  .placeholder,.expando summary{display:none!important}
  .expando{border-top:0;padding-top:0}
  .expando .detail-body{padding-top:0}
  .card{break-inside:avoid;page-break-inside:avoid;border:0;border-left:1pt solid #8A6E12;padding:0 0 0 6pt;background:#fff}
  .grid{display:block}
  .grid>*+*{margin-top:8pt}
  .timeline li{break-inside:avoid}
  .tl-body{visibility:visible;max-height:none;overflow:visible}
  main a[href^="http"]:not([data-print])::after{content:" (" attr(href) ")";font-size:7pt;color:#555;word-break:break-all}
}
"""

CSS += r"""
/* ---------- CV document ---------- */

.cv-doc{max-width:52rem}
.cv-doc .cv-head{padding-bottom:1.25rem;border-bottom:1px solid var(--rule)}
.cv-doc .cv-contact{
  list-style:none;margin:1rem 0 0;padding:0;
  display:flex;flex-wrap:wrap;gap:.4rem 1.35rem;font-size:.9375rem;
}
.cv-section{padding-top:1.75rem;margin-top:1.75rem;border-top:1px solid var(--rule)}
.cv-section:first-of-type{border-top:0}
@media (min-width:52em){
  .cv-section{display:grid;grid-template-columns:9rem 1fr;column-gap:2.5rem}
  .cv-section>h2{grid-column:1}
  .cv-section>.cv-body{grid-column:2}
}
.cv-section>h2{
  font-family:var(--sans);font-size:.72rem;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);
  margin:.25rem 0 1rem;
}
.cv-body>*+*{margin-top:1.5rem}
.cv-body .entry{padding:0;border:0}
.cv-body .entry+.entry{margin-top:1.5rem}
.cv-skills{display:flex;flex-wrap:wrap;gap:.4rem .5rem;list-style:none;margin:0;padding:0}
.cv-skills li{font-size:.875rem;color:var(--ink-2);border:1px solid var(--rule);padding:.2rem .625rem;border-radius:2px}

/* ---------- Print: the CV page becomes one clean A4 page ---------- */

@media print{
  @page{size:A4 portrait;margin:11mm 13mm}

  :root{
    --bg:#fff;--bg-2:#fff;--bg-3:#fff;
    --ink:#000;--ink-2:#222;--ink-3:#444;
    --rule:#bbb;--rule-strong:#bbb;--ui-border:#888;
    --gold:#8A6E12;--gold-line:#8A6E12;--gold-ink:#000;--gold-wash:transparent;
  }

  body{background:#fff;color:#000;font-size:8.6pt;line-height:1.34}

  .site-header,.site-footer,.to-top,.skip,.no-print{display:none!important}

  main,.wrap,.section{padding:0!important;margin:0!important;max-width:none!important;border:0!important}

  a,.link{color:#000;border-bottom:0;text-decoration:none}

  .cv-doc{max-width:none}
  .cv-doc a::after{content:none!important}
  .cv-doc h1{font-size:19pt;margin-bottom:2pt}
  .cv-doc .lede{font-size:9.4pt;line-height:1.3;margin-bottom:2pt;max-width:none;color:#000}
  .cv-doc .cv-status{font-size:7.2pt;letter-spacing:.04em;margin-bottom:4pt}
  .cv-doc .cv-head{padding-bottom:4pt}
  .cv-doc .cv-contact{margin-top:4pt;gap:1pt 10pt;font-size:8.2pt}
  .cv-contact a[data-print]{font-size:0}
  .cv-contact a[data-print]::after{content:attr(data-print);font-size:8.2pt}

  .cv-section{
    margin-top:7pt;padding-top:6pt;
    display:grid;grid-template-columns:23mm 1fr;column-gap:5mm;
    break-inside:avoid;page-break-inside:avoid;
  }
  .cv-section>h2{font-size:7pt;letter-spacing:.1em;margin:1pt 0 0;color:#444}
  .cv-body>*+*{margin-top:6pt}
  .cv-body .entry+.entry{margin-top:6pt}

  .cv-doc h3{font-size:9.6pt}
  .cv-doc .where{font-size:8.2pt;margin-top:0}
  .cv-doc .when{font-size:7.6pt}
  .cv-doc .entry p{margin-top:2pt;font-size:8.3pt}
  .cv-doc ul.plain li{margin-top:1pt;font-size:8.3pt}
  .cv-doc ul.plain li::before{top:.62em}

  .cv-skills{gap:2pt 4pt}
  .cv-skills li{border:0;padding:0;font-size:8.3pt}
  .cv-skills li::after{content:" \00b7";color:#888}
  .cv-skills li:last-child::after{content:""}

  :root.js .reveal{opacity:1!important;transform:none!important}
}
"""

# --------------------------------------------------------------------------
# Behaviour. Everything here is progressive enhancement: the site is fully
# readable and navigable with JavaScript disabled.
# --------------------------------------------------------------------------

JS = r"""/* Thomas Willmott — site behaviour. No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (light / dark / follow system) ---------- */

  function initTheme() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    function current() {
      var stored = null;
      try { stored = localStorage.getItem('tw-theme'); } catch (e) {}
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function label() {
      btn.setAttribute('aria-label',
        current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }

    label();
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('tw-theme', next); } catch (e) {}
      label();
    });
  }

  /* ---------- Mobile navigation ---------- */

  function initNav() {
    var btn = document.querySelector('.menu-btn');
    var nav = document.querySelector('.nav');
    if (!btn || !nav) return;

    function setOpen(open) {
      nav.setAttribute('data-open', open ? 'true' : 'false');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    setOpen(false);
    btn.addEventListener('click', function () {
      setOpen(nav.getAttribute('data-open') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.getAttribute('data-open') !== 'true') return;
      if (!nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 52em)').addEventListener('change', function () {
      setOpen(false);
    });
  }

  /* ---------- Scroll reveal ---------- */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Filterable, searchable collections ----------
     Items carry data-tags. An optional wrapper marked data-filter-section
     hides itself when every item inside it is filtered out. Works for a flat
     grid of project cards and for skills grouped inside category cards. */

  function initFilters() {
    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
      var items = Array.prototype.slice.call(group.querySelectorAll('[data-tags]'));
      var sections = Array.prototype.slice.call(group.querySelectorAll('[data-filter-section]'));
      var buttons = Array.prototype.slice.call(group.querySelectorAll('.filter'));
      var input = group.querySelector('.search input');
      var count = group.querySelector('.result-count');
      var empty = group.querySelector('.empty-state');
      var clears = Array.prototype.slice.call(group.querySelectorAll('[data-clear]'));
      var clearChip = group.querySelector('.filter[data-clear]');
      var noun = group.getAttribute('data-noun') || 'item';
      var active = 'all';

      function apply(pushState) {
        var q = input ? input.value.trim().toLowerCase() : '';
        var shown = 0;

        items.forEach(function (item) {
          var tags = (item.getAttribute('data-tags') || '').toLowerCase();
          var text = (item.textContent || '').toLowerCase();
          var show = (active === 'all' || tags.split(/\s+/).indexOf(active) !== -1) &&
                     (!q || text.indexOf(q) !== -1);
          item.hidden = !show;
          if (show) shown++;
        });

        sections.forEach(function (section) {
          var any = section.querySelectorAll('[data-tags]:not([hidden])').length;
          section.hidden = any === 0;
        });

        if (count) count.textContent = shown + ' ' + noun + (shown === 1 ? '' : 's');
        if (empty) empty.hidden = shown !== 0;
        if (clearChip) clearChip.hidden = active === 'all' && !q;

        if (pushState) {
          var url = new URL(window.location.href);
          if (active === 'all') url.searchParams.delete('filter');
          else url.searchParams.set('filter', active);
          if (q) url.searchParams.set('q', q);
          else url.searchParams.delete('q');
          history.replaceState(null, '', url);
        }
      }

      function select(name, pushState) {
        active = name || 'all';
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed',
            b.getAttribute('data-filter') === active ? 'true' : 'false');
        });
        apply(pushState);
      }

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          select(btn.getAttribute('data-filter'), true);
        });
      });

      if (input) {
        var timer = null;
        input.addEventListener('input', function () {
          window.clearTimeout(timer);
          timer = window.setTimeout(function () { apply(true); }, 80);
        });
        input.addEventListener('keydown', function (e) {
          if (e.key !== 'Escape') return;
          input.value = '';
          apply(true);
        });
      }

      clears.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (input) input.value = '';
          select('all', true);
          if (input) input.focus();
        });
      });

      /* "/" focuses the search box, the way a search-first interface should. */
      if (input) {
        document.addEventListener('keydown', function (e) {
          if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
          var el = document.activeElement;
          var tag = el ? el.tagName : '';
          if (tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable)) return;
          e.preventDefault();
          input.focus();
          input.select();
        });
      }

      var params = new URL(window.location.href).searchParams;
      if (input && params.get('q')) input.value = params.get('q');
      var preset = params.get('filter');
      var presetBtn = preset
        ? group.querySelector('.filter[data-filter="' + preset.replace(/["\\]/g, '') + '"]')
        : null;
      select(presetBtn ? preset : 'all', false);
    });
  }

  /* ---------- Timeline ---------- */

  function initTimeline() {
    var items = document.querySelectorAll('.timeline li');
    items.forEach(function (li) {
      var btn = li.querySelector('.tl-btn');
      var body = li.querySelector('.tl-body');
      if (!btn || !body) return;
      var id = body.id;
      btn.setAttribute('aria-expanded', 'false');
      if (id) btn.setAttribute('aria-controls', id);

      btn.addEventListener('click', function () {
        var open = li.getAttribute('data-open') === 'true';
        items.forEach(function (other) {
          if (other !== li) other.setAttribute('data-open', 'false');
          var b = other.querySelector('.tl-btn');
          if (b && other !== li) b.setAttribute('aria-expanded', 'false');
        });
        li.setAttribute('data-open', open ? 'false' : 'true');
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });
  }

  /* ---------- Copy to clipboard ---------- */

  function initCopy() {
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-copy') || '';
        var done = function () {
          btn.setAttribute('data-copied', 'true');
          window.setTimeout(function () { btn.removeAttribute('data-copied'); }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done, function () {});
          return;
        }
        var ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      });
    });
  }

  /* ---------- Back to top ---------- */

  function initToTop() {
    var btn = document.querySelector('.to-top');
    if (!btn) return;
    var ticking = false;
    function update() {
      btn.setAttribute('data-show', window.scrollY > 700 ? 'true' : 'false');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ---------- Deep links: /projects.html#clarifin opens that card ---------- */

  function initDeepLink() {
    function openTarget() {
      var id = window.location.hash.slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      var details = el.querySelector('details');
      if (details) details.open = true;
      el.hidden = false;
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
    window.addEventListener('hashchange', openTarget);
    if (window.location.hash) window.setTimeout(openTarget, 60);
  }

  /* ---------- Prefetch a page on hover so navigation feels instant ---------- */

  function initPrefetch() {
    if (navigator.connection && (navigator.connection.saveData ||
        /2g/.test(navigator.connection.effectiveType || ''))) return;

    var done = {};
    function prefetch(href) {
      if (!href || done[href]) return;
      done[href] = true;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }

    function candidate(e) {
      var a = e.target.closest ? e.target.closest('a[href$=".html"]') : null;
      if (!a || a.origin !== window.location.origin) return;
      prefetch(a.href);
    }

    document.addEventListener('pointerenter', candidate, true);
    document.addEventListener('touchstart', candidate, { capture: true, passive: true });
    document.addEventListener('focusin', candidate);
  }

  /* ---------- Printing: expand every collapsed panel, then restore ---------- */

  function initPrintExpand() {
    var reopened = [];
    function expand() {
      reopened = [];
      document.querySelectorAll('details:not([open])').forEach(function (d) {
        d.open = true;
        reopened.push(d);
      });
    }
    function restore() {
      reopened.forEach(function (d) { d.open = false; });
      reopened = [];
    }
    window.addEventListener('beforeprint', expand);
    window.addEventListener('afterprint', restore);
    if (window.matchMedia) {
      var mq = window.matchMedia('print');
      var onChange = function (e) { if (e.matches) expand(); else restore(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
    }
    document.querySelectorAll('[data-print-page]').forEach(function (btn) {
      btn.addEventListener('click', function () { expand(); window.print(); });
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initTheme();
    initNav();
    initReveal();
    initFilters();
    initTimeline();
    initCopy();
    initToTop();
    initDeepLink();
    initPrefetch();
    initPrintExpand();
  });
})();
"""

# --------------------------------------------------------------------------
# Shared chrome
# --------------------------------------------------------------------------

NAV = [
    ("index.html", "Home"),
    ("about.html", "About"),
    ("projects.html", "Projects"),
    ("skills.html", "Skills"),
    ("interests.html", "Interests"),
    ("cv.html", "CV"),
]

# Runs before first paint so a stored dark preference never flashes white.
THEME_INIT = (
    "(function(){var r=document.documentElement;r.className+=' js';"
    "try{var t=localStorage.getItem('tw-theme');"
    "if(t==='dark'||t==='light')r.setAttribute('data-theme',t);}catch(e){}})();"
)

ICONS = {
    "sun": '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4"/></svg>',
    "moon": '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z"/></svg>',
    "menu": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    "search": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    "up": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    "chev": '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="m4 2 4 4-4 4"/></svg>',
    "copy": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    "print": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V4h10v5M7 19H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 15h10v6H7z"/></svg>',
    "download": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M8 11l4 4 4-4M5 19h14"/></svg>',
}

FAVICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
    "%3Crect width='64' height='64' fill='%232B2B2B'/%3E%3Ctext x='32' y='44' "
    "font-family='Georgia,serif' font-size='30' fill='%23C9A227' text-anchor='middle'%3ETW%3C/text%3E%3C/svg%3E"
)


def header(active):
    links = []
    for href, label in NAV:
        current = ' aria-current="page"' if href == active else ""
        links.append('          <li><a href="%s"%s>%s</a></li>' % (href, current, label))
    return """  <a class="skip" href="#main">Skip to content</a>

  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="index.html">
        <span class="mark">TW</span>
        <span>Thomas Willmott</span>
      </a>

      <nav class="nav" id="site-nav" aria-label="Primary">
        <ul>
%s
        </ul>
      </nav>

      <div class="header-tools">
        <button class="icon-btn theme-toggle" type="button" aria-label="Switch theme">%s%s</button>
        <button class="icon-btn menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">%s</button>
      </div>
    </div>
  </header>
""" % ("\n".join(links), ICONS["sun"], ICONS["moon"], ICONS["menu"])


FOOTER = """  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <p class="footer-name">Thomas Willmott</p>
        <p class="tiny">BSc Finance and Mathematics, Royal Holloway.<br>Graduating June 2027. Right to work in the UK.</p>
      </div>
      <div>
        <h2>Site</h2>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="projects.html">Projects</a></li>
          <li><a href="skills.html">Skills</a></li>
          <li><a href="interests.html">Interests</a></li>
          <li><a href="cv.html">CV</a></li>
        </ul>
      </div>
      <div>
        <h2>Elsewhere</h2>
        <ul>
          <li><a href="mailto:{email}">{email}</a></li>
          <li><a href="{linkedin}" rel="me noopener">LinkedIn</a></li>
          <li><a href="{github}" rel="me noopener">GitHub</a></li>
          <li><a href="{clarifin}" rel="noopener">Clarifin</a></li>
        </ul>
      </div>
    </div>
  </footer>

  <button class="to-top" type="button" aria-label="Back to top">{up}</button>
""".format(email=EMAIL, linkedin=LINKEDIN, github=GITHUB, clarifin=CLARIFIN, up=ICONS["up"])


PERSON_JSONLD = """{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": "Thomas Willmott",
    "givenName": "Thomas",
    "familyName": "Willmott",
    "email": "mailto:%(email)s",
    "url": "%(site)s/",
    "jobTitle": "Finance and Mathematics undergraduate",
    "description": "Final-year BSc Finance and Mathematics student at Royal Holloway, University of London. FMVA-certified financial modeller and founder of Clarifin.",
    "nationality": "GB",
    "knowsAbout": ["Financial modelling", "Discounted cash flow valuation", "Leveraged buyouts", "Financial econometrics", "Excel", "Python"],
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Royal Holloway, University of London",
      "url": "https://www.royalholloway.ac.uk/"
    },
    "hasCredential": [
      {"@type": "EducationalOccupationalCredential", "name": "Financial Modeling & Valuation Analyst (FMVA)", "credentialCategory": "certificate", "recognizedBy": {"@type": "Organization", "name": "Corporate Finance Institute"}},
      {"@type": "EducationalOccupationalCredential", "name": "Investment Banking & Private Equity Modeling Specialization", "credentialCategory": "certificate", "recognizedBy": {"@type": "Organization", "name": "Corporate Finance Institute"}}
    ],
    "worksFor": {"@type": "Organization", "name": "Clarifin", "url": "%(clarifin)s"},
    "sameAs": ["%(linkedin)s", "%(github)s", "%(clarifin)s"]
  }
}""" % {"email": EMAIL, "site": SITE_URL, "clarifin": CLARIFIN,
        "linkedin": LINKEDIN, "github": GITHUB}


def page(slug, title, description, body, active=None):
    """Assembles one complete HTML document."""
    active = active or slug
    canonical = SITE_URL + ("/" if slug == "index.html" else "/" + slug)
    jsonld = ("\n<script type=\"application/ld+json\">%s</script>" % PERSON_JSONLD
              if slug == "index.html" else "")
    return """<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<meta name="author" content="Thomas Willmott">
<link rel="canonical" href="{canonical}">

<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Thomas Willmott">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="theme-color" content="#FAF8F4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1A1A18" media="(prefers-color-scheme: dark)">

<meta property="og:image" content="{site}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Thomas Willmott — BSc Finance and Mathematics, Royal Holloway.">
<meta name="twitter:image" content="{site}/og.png">

<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="icon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="stylesheet" href="assets/site.css">
<script>{theme_init}</script>{jsonld}
</head>

<body>
{header}
  <main id="main">
{body}
  </main>

{footer}
  <script src="assets/site.js" defer></script>
</body>
</html>
""".format(
        title=title,
        description=description,
        canonical=canonical,
        og_type="profile" if slug == "index.html" else "website",
        site=SITE_URL,
        jsonld=jsonld,
        theme_init=THEME_INIT,
        header=header(active),
        body=body,
        footer=FOOTER,
    )


def eyebrow(num, text):
    return '<p class="eyebrow"><span class="num">%s</span> %s</p>' % (num, text)


def expando(label, inner):
    return """<details class="expando">
              <summary>{chev}<span>{label}</span></summary>
              <div class="detail-body">
{inner}
              </div>
            </details>""".format(chev=ICONS["chev"], label=label, inner=inner)

# --------------------------------------------------------------------------
# Home
# --------------------------------------------------------------------------

HOME = """    <section class="hero wrap">
      <div class="hero-grid">
      <div>
      <h1>Thomas Willmott</h1>
      <p class="lede">
        Final-year Finance and Mathematics undergraduate at Royal Holloway.
        I build financial models and small software products, run a business
        that sells the first of those, and have spent eleven years in the
        Army Cadet Force.
      </p>

      <div class="hero-actions">
        <a class="btn btn-primary" href="projects.html">See the work</a>
        <a class="btn" href="cv.html">Read the CV</a>
        <button class="btn copy-btn" type="button" data-copy="{email}">
          {copy}<span class="idle">Copy email</span><span class="copied">Copied</span>
        </button>
      </div>

      </div>

      <dl class="facts">
        <div>
          <dt>Reading</dt>
          <dd>BSc Finance &amp; Mathematics<br><span class="tiny">Royal Holloway, 2024&ndash;2027</span></dd>
        </div>
        <div>
          <dt>Certified</dt>
          <dd class="accent">FMVA at 93%<br><span class="tiny">Corporate Finance Institute</span></dd>
        </div>
        <div>
          <dt>Building</dt>
          <dd>Clarifin<br><span class="tiny">13 templates shipped</span></dd>
        </div>
        <div>
          <dt>Serving</dt>
          <dd>Army Cadet Force<br><span class="tiny">11 years, now Company Commander</span></dd>
        </div>
      </dl>
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow_now}
      <div class="grid grid-2">
        <div>
          <h2>What I&rsquo;m doing now</h2>
          <ul class="plain" style="margin-top:1rem">
            <li>Final year of a joint honours degree, with a dissertation and finals in 2027.</li>
            <li>Running Clarifin day to day &mdash; new templates, support, and the infrastructure behind it.</li>
            <li>Commanding a company in the Army Cadet Force as an adult volunteer.</li>
            <li>Publishing valuation and buyout work, and looking for a 2027 graduate seat in private equity or investment banking.</li>
          </ul>
        </div>
        <div>
          <h2>How I work</h2>
          <p class="muted" style="margin-top:1rem">
            I like problems where the answer has to survive contact with a
            spreadsheet. A model is only worth as much as the assumptions
            you can defend, so I build things end to end and keep the
            workings visible.
          </p>
          <p class="muted">
            The same instinct shows up outside finance: I would rather ship a
            small thing that works than plan a large thing that does not.
          </p>
        </div>
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow_work}
      <h2>Selected work</h2>
      <p class="muted" style="margin:.75rem 0 1.75rem;max-width:38em">
        A live business and two independent valuation builds. The
        <a class="link" href="projects.html">projects page</a> has the rest.
      </p>

      <div class="grid grid-3">
        <a class="card card-link" href="projects.html?filter=business">
          <span class="tag tag-accent">Business</span>
          <h3 style="margin-top:.7rem">Clarifin</h3>
          <p>A UK digital financial templates business, live since September 2026 with 13 templates shipped. Built and run solo.</p>
          <span class="foot arrow">Read more</span>
        </a>
        <a class="card card-link" href="projects.html?filter=research">
          <span class="tag tag-accent">Research</span>
          <h3 style="margin-top:.7rem">Hollywood Bowl LBO</h3>
          <p>A multi-week leveraged buyout build: operating model, KPI dashboard and returns analysis, published in full.</p>
          <span class="foot arrow">Read more</span>
        </a>
        <a class="card card-link" href="projects.html#microsoft-three-scenario-dcf">
          <span class="tag tag-accent">Research</span>
          <h3 style="margin-top:.7rem">Microsoft DCF</h3>
          <p>Bear, base and bull cases with sensitivity analysis, isolating how much of the value rests on the terminal assumption.</p>
          <span class="foot arrow">Read more</span>
        </a>
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow_contact}
      <div class="wrap-prose" style="padding:0">
        <h2>Get in touch</h2>
        <p class="muted" style="margin-top:.75rem">
          I am looking for a 2027 graduate role in UK lower mid-market
          private equity, with investment banking as a route in. If you are
          hiring, or you just want to argue about a discount rate, email is
          the fastest way to reach me.
        </p>
        <div class="contact-row">
          <a class="btn btn-primary" href="mailto:{email}">{email}</a>
          <button class="btn copy-btn" type="button" data-copy="{email}">
            {copy}<span class="idle">Copy</span><span class="copied">Copied</span>
          </button>
          <a class="btn" href="{linkedin}" rel="me noopener">LinkedIn</a>
        </div>
      </div>
    </section>
""".format(
    email=EMAIL,
    linkedin=LINKEDIN,
    copy=ICONS["copy"],
    eyebrow_now=eyebrow("01", "Currently"),
    eyebrow_work=eyebrow("02", "Selected work"),
    eyebrow_contact=eyebrow("03", "Contact"),
)

# --------------------------------------------------------------------------
# About
# --------------------------------------------------------------------------

TIMELINE = [
    # TODO: 2015 is derived from "eleven years continuous service" as of 2026.
    # Correct the year if you joined earlier or later.
    ("2015", "Joined the Army Cadet Force", "As a cadet",
     "The start of eleven years of continuous service, and the place I learned "
     "most of what I know about responsibility. I progressed through the ranks "
     "to Cadet Sergeant Major of a company of more than a hundred cadets.", False),
    ("2023", "Finance placement", "Neos Networks",
     "Completed the firm&rsquo;s internal financial modelling training and "
     "reviewed working models alongside a finance analyst. The first time I saw "
     "models being used to make real decisions rather than to pass an exam.", False),
    ("2024", "Started at Royal Holloway", "BSc Finance and Mathematics",
     "A joint honours degree chosen deliberately: the mathematics half keeps "
     "the finance half honest. Coursework spans financial econometrics, "
     "probability and statistics, micro and macroeconomics, and financial "
     "markets and institutions.", False),
    # TODO: confirm the year the FMVA was completed; it is grouped here for now.
    ("2026", "Financial modelling certifications", "Corporate Finance Institute",
     "Completed the FMVA at 93%, then the Investment Banking &amp; Private "
     "Equity Modeling Specialization in September 2026.", False),
    ("2026", "Launched Clarifin", "clarifin.co.uk",
     "A digital financial templates business, built and run solo: the models "
     "themselves, the storefront, the payment and delivery pipeline, and the "
     "support inbox. Thirteen templates shipped since launch.", True),
    ("2026", "Company Commander", "Army Cadet Force",
     "Now an Adult Volunteer Instructor and Company Commander, accountable for "
     "the training, welfare and safety of the company I once belonged to. "
     "Awarded the ACF Exemplary Service Award.", True),
    ("2027", "Graduating", "June 2027",
     "Looking for a graduate seat in UK lower mid-market private equity, with "
     "investment banking as a route in.", False),
]


def timeline_html():
    rows = []
    for i, (year, title, where, body, current) in enumerate(TIMELINE):
        rows.append("""        <li data-open="false" data-current="{cur}">
          <span class="tl-dot" aria-hidden="true"></span>
          <button class="tl-btn" type="button">
            <span class="tl-year">{year}</span>
            <span class="tl-title">{title}</span>
            <span class="tl-where">{where}</span>
          </button>
          <div class="tl-body" id="tl-{i}">
            <p>{body}</p>
          </div>
        </li>""".format(cur="true" if current else "false", year=year,
                        title=title, where=where, body=body, i=i))
    return "\n".join(rows)


ABOUT = """    <section class="section wrap">
      {eyebrow_intro}
      <div class="wrap-prose" style="padding:0">
        <h1 style="font-size:clamp(1.9rem,1.4rem + 2.2vw,2.75rem)">About me</h1>
        <p class="lede" style="margin:1.25rem 0">
          I study finance and mathematics, build things that use both, and
          spend a good part of my life training cadets.
        </p>
        <p class="muted">
          The degree was a deliberate pairing. Finance on its own teaches you
          the vocabulary; the mathematics half forces you to be honest about
          what a number actually rests on. That shows up in how I model:
          assumptions on the face of the sheet, sensitivities run before
          conclusions, and no output I cannot walk somebody through.
        </p>
        <p class="muted">
          Outside the degree I run Clarifin, a small business selling
          financial templates to people who need a working model but are not
          modellers. I built all of it myself &mdash; the spreadsheets, the
          site, the payment and delivery plumbing &mdash; which taught me more
          about operating a business than any module has.
        </p>
        <p class="muted">
          The constant across eleven years has been the Army Cadet Force. I
          joined as a cadet and now command a company as an adult volunteer.
          It is where I learned to plan properly, to brief clearly, and to
          make the call when a decision has a safety consequence attached.
        </p>
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow_timeline}
      <h2>The route so far</h2>
      <p class="muted small" style="margin:.6rem 0 1.75rem">Select any entry to expand it.</p>
      <ol class="timeline">
{timeline}
      </ol>
    </section>

    <section class="section wrap reveal">
      {eyebrow_edu}
      <h2>Education</h2>
      <div style="margin-top:1.5rem">
        <article class="entry">
          <div class="entry-head">
            <h3>BSc Finance and Mathematics</h3>
            <span class="when">2024&ndash;2027</span>
          </div>
          <p class="where">Royal Holloway, University of London</p>
          <p>
            Joint honours combining quantitative methods with applied finance.
            Relevant coursework: financial econometrics; probability and
            statistics; microeconomics; macroeconomics; financial markets and
            institutions.
          </p>
        </article>
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow_lead}
      <div class="grid grid-2">
        <div>
          <h2>Leadership</h2>
          <p class="muted" style="margin-top:1rem">
            Eleven years of continuous service in the Army Cadet Force, from
            cadet to Cadet Sergeant Major of a company of more than a hundred,
            and now Company Commander and Adult Volunteer Instructor. Awarded
            the ACF Exemplary Service Award.
          </p>
        </div>
        <div>
          <ul class="plain">
            <li>Accountable for the training, welfare and discipline of a 100+ cadet company and its adult instructor team.</li>
            <li>Plans and delivers structured training programmes, then assesses performance against national standards.</li>
            <li>Holds the safety-critical call on field exercises and live ranges, including risk assessment and abort decisions.</li>
            <li>Writes and briefs orders that people have to be able to follow under pressure.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow_exp}
      <h2>Work experience</h2>
      <div style="margin-top:1.5rem">
        <article class="entry">
          <div class="entry-head">
            <h3>Sales Supervisor</h3>
            <!-- TODO: add employment dates -->
            <span class="when"></span>
          </div>
          <p class="where">S&oslash;strene Grene</p>
          <p>
            Deputised as store manager with full responsibility for trading,
            staffing and cash. Sent to open new stores and train their teams
            from scratch.
          </p>
        </article>
        <article class="entry">
          <div class="entry-head">
            <h3>Finance Placement</h3>
            <span class="when">2023</span>
          </div>
          <p class="where">Neos Networks</p>
          <p>
            Completed the firm&rsquo;s internal financial modelling training
            and reviewed working models alongside a finance analyst.
          </p>
        </article>
        <article class="entry">
          <div class="entry-head">
            <h3>Delivery Driver</h3>
            <span class="when">Current</span>
          </div>
          <p class="where">Tesco</p>
          <p>Worked alongside full-time study and running Clarifin.</p>
        </article>
      </div>
    </section>
""".format(
    eyebrow_intro=eyebrow("01", "Introduction"),
    eyebrow_timeline=eyebrow("02", "Timeline"),
    eyebrow_edu=eyebrow("03", "Education"),
    eyebrow_lead=eyebrow("04", "Leadership"),
    eyebrow_exp=eyebrow("05", "Experience"),
    timeline=timeline_html(),
)

# --------------------------------------------------------------------------
# Projects
# --------------------------------------------------------------------------

PROJECTS = [
    {
        "tags": "business finance software",
        "cat": "Business",
        "title": "Clarifin",
        "when": "2026 &ndash; present",
        "summary": "A UK digital financial templates business: working Excel models sold to "
                   "people who need one but are not modellers. Live since September 2026 "
                   "with 13 templates shipped.",
        "stack": ["Excel", "Cloudflare Workers", "R2", "Stripe", "Resend"],
        "detail": """<h4>What it is</h4>
                <p>Clarifin sells ready-built financial models &mdash; three-statement,
                DCF and LBO templates, and smaller operational tools &mdash; to founders,
                analysts and small businesses who need a defensible model without
                building one from a blank sheet.</p>
                <h4>What I built</h4>
                <p>All of it. Every model in the catalogue is one I wrote and tested.
                The storefront runs on Cloudflare Workers with files served from R2,
                checkout through Stripe, and automated delivery by email through
                Resend. No third-party storefront platform sits in the middle.</p>
                <h4>What it taught me</h4>
                <p>Pricing is harder than modelling. So is writing instructions that a
                non-specialist can follow without a call.</p>""",
        "link": (CLARIFIN, "Visit clarifin.co.uk"),
    },
    {
        "tags": "research finance",
        "cat": "Research",
        "title": "Hollywood Bowl Group &mdash; LBO series",
        "when": "Multi-week series",
        "summary": "A full leveraged buyout build on a listed UK operator: operating model, "
                   "KPI dashboard and returns analysis, published week by week.",
        "stack": ["Excel", "LBO", "Operating model", "Returns analysis"],
        "detail": """<h4>The question</h4>
                <p>Whether centre-level cash generation at a UK ten-pin bowling
                operator supports a sponsor case, and what has to be true about
                footfall and spend per game for the returns to work.</p>
                <h4>The build</h4>
                <p>An operating model driven from centre count and unit economics
                rather than top-down growth rates, a KPI dashboard to keep the
                drivers visible, then a debt schedule and returns analysis with the
                entry and exit multiples flexed.</p>
                <h4>Why it was worth doing</h4>
                <p>Building it over several weeks in public meant every assumption
                had to be defensible to anyone reading along.</p>""",
        "link": (LINKEDIN + "recent-activity/all/", "Read the series on LinkedIn"),
    },
    {
        "tags": "research finance",
        "cat": "Research",
        "title": "Microsoft &mdash; three-scenario DCF",
        "when": "Independent research",
        "summary": "Bear, base and bull cases with sensitivity analysis on WACC and terminal "
                   "growth, isolating how much of the valuation rests on the terminal assumption.",
        "stack": ["Excel", "DCF", "Sensitivity analysis"],
        "detail": """<h4>The approach</h4>
                <p>Three explicitly separated scenarios rather than one forecast with
                a confidence interval bolted on, so the difference between cases is
                visible in the operating assumptions instead of buried in a growth rate.</p>
                <h4>The finding worth stating</h4>
                <p>A two-way sensitivity on WACC against terminal growth shows how
                much of the implied value is carried by the terminal period &mdash;
                the part of a DCF most likely to be quietly doing the work.</p>""",
        "link": (LINKEDIN + "recent-activity/all/", "Read the analysis on LinkedIn"),
    },
    {
        "tags": "software",
        "cat": "Software",
        "title": "This site",
        "when": "2026",
        "summary": "Six static pages with no framework, no build step and no third-party "
                   "scripts, deployed on Cloudflare Pages.",
        "stack": ["HTML", "CSS", "Vanilla JS", "Cloudflare Pages"],
        "detail": """<h4>Constraints</h4>
                <p>Hand-written HTML and CSS, one small script, no dependencies and
                no trackers. Everything interactive here &mdash; filtering, the
                timeline, the theme switch &mdash; degrades to plain readable content
                with JavaScript switched off.</p>
                <h4>Details</h4>
                <p>Dark mode follows the system setting unless you override it, the
                CV page prints to a single clean A4 page, and the whole site is a
                couple of cached files at the edge.</p>""",
        "link": ("https://github.com/thetboss/new-file-one-one-one", "Source on GitHub"),
    },
]


def slugify(text):
    text = re.sub(r"&[a-z]+;", " ", text)
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def projects_html():
    cards = []
    for i, p in enumerate(PROJECTS):
        stack = "".join("<li>%s</li>" % s for s in p["stack"])
        href, label = p["link"]
        cards.append("""        <article class="card" id="{slug}" data-tags="{tags}">
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:1rem">
            <span class="tag tag-accent">{cat}</span>
            <span class="tiny">{when}</span>
          </div>
          <h3 style="margin-top:.8rem">{title}</h3>
          <p style="margin-top:.5rem">{summary}</p>
          <ul class="chips" style="margin-top:.9rem">{stack}</ul>
{detail}
          <p class="foot"><a class="link arrow" href="{href}" rel="noopener">{label}</a></p>
        </article>""".format(
            slug=slugify(p["title"]), tags=p["tags"], cat=p["cat"], when=p["when"], title=p["title"],
            summary=p["summary"], stack=stack,
            detail=expando("Details", p["detail"]),
            href=href, label=label))
    return "\n".join(cards)


PROJECTS_PAGE = """    <section class="section wrap">
      {eyebrow}
      <h1 style="font-size:clamp(1.9rem,1.4rem + 2.2vw,2.75rem)">Projects</h1>
      <p class="lede" style="margin:1.25rem 0 0;max-width:36em">
        A live business, independent valuation work, and the things I have
        built to run it. Filter by type or search the text.
      </p>

      <div data-filter-group data-noun="project">
        <div class="controls">
          <div class="search">
            {search_icon}
            <input id="project-search" type="search" placeholder="Search projects, tools, methods&hellip;" aria-label="Search projects" autocomplete="off">
            <kbd aria-hidden="true">/</kbd>
          </div>
          <div class="filters" role="group" aria-label="Filter projects by type">
            <button class="filter" type="button" data-filter="all" aria-pressed="true">All</button>
            <button class="filter" type="button" data-filter="business" aria-pressed="false">Business</button>
            <button class="filter" type="button" data-filter="research" aria-pressed="false">Research</button>
            <button class="filter" type="button" data-filter="finance" aria-pressed="false">Finance</button>
            <button class="filter" type="button" data-filter="software" aria-pressed="false">Software</button>
          </div>
          <button class="filter" type="button" data-clear hidden>Clear</button>
          <p class="result-count" role="status" aria-live="polite"></p>
        </div>

        <h2 class="visually-hidden">All projects</h2>
        <div class="grid grid-2">
{cards}
        </div>
        <div class="empty-state" hidden>
          <p>Nothing matches that.</p>
          <button class="btn" type="button" data-clear>Clear search and filters</button>
        </div>
      </div>
    </section>
""".format(eyebrow=eyebrow("01", "Work"), search_icon=ICONS["search"], cards=projects_html())

# --------------------------------------------------------------------------
# Skills
# --------------------------------------------------------------------------

SKILL_GROUPS = [
    ("Finance and modelling", "finance", [
        ("Financial modelling", "Three-statement models built from drivers, not from last year plus a percentage."),
        ("DCF valuation", "Explicit forecast period, WACC build, and a terminal value I can defend separately."),
        ("LBO modelling", "Sources and uses, debt schedules with a cash sweep, and returns bridged to their drivers."),
        ("Trading and transaction comps", "Screening a peer set, then calendarising and cleaning it so the multiples mean something."),
        ("Sensitivity and scenario analysis", "Two-way tables and separated scenarios rather than a single point estimate."),
        ("Financial econometrics", "Regression and time-series work from the mathematics half of the degree."),
        ("Excel (advanced)", "Model structure and auditability first: index-match, dynamic arrays, data tables, no hard-coded plugs."),
    ]),
    ("Technical", "technical", [
        ("Python", "Pulling and cleaning data, and checking spreadsheet work against an independent implementation."),
        ("SQL (basics)", "Selecting, joining and aggregating well enough to get my own answers out of a database."),
        ("Cloudflare Workers", "The serverless layer running Clarifin: routing, auth for paid downloads, and webhooks."),
        ("Cloudflare R2 and Pages", "Object storage for deliverable files, and static hosting for the front end."),
        ("Stripe", "Checkout, webhooks and fulfilment for a live business taking real payments."),
        ("HTML, CSS and JavaScript", "Hand-written front ends, including this site. No framework."),
        ("Git", "Branching, review and deployment from a repository."),
    ]),
    ("Leadership and operations", "leadership", [
        ("Training delivery", "Planning and running structured programmes for a 100+ cadet company, then assessing against national standards."),
        ("Risk assessment", "Safety-critical decisions on field exercises and live ranges, including the call to stop."),
        ("Briefing and written orders", "Instructions that have to be followed correctly under pressure, first time."),
        ("Team management", "Leading adult instructors as Company Commander; deputising as store manager in retail."),
        ("Retail operations", "Trading, staffing and cash responsibility, and opening and training new store teams."),
    ]),
]


def skills_html():
    blocks = []
    for name, tag, items in SKILL_GROUPS:
        rows = []
        for label, use in items:
            rows.append("""            <li data-tags="{tag}">
              <h4>{label}</h4>
              <p class="tiny" style="margin-top:.15rem">{use}</p>
            </li>""".format(tag=tag, label=label, use=use))
        blocks.append("""        <section class="card" data-filter-section>
          <h3>{name}</h3>
          <ul class="plain" style="margin-top:.9rem;list-style:none">
{rows}
          </ul>
        </section>""".format(name=name, rows="\n".join(rows)))
    return "\n".join(blocks)


SKILLS_PAGE = """    <section class="section wrap">
      {eyebrow}
      <h1 style="font-size:clamp(1.9rem,1.4rem + 2.2vw,2.75rem)">Skills</h1>
      <p class="lede" style="margin:1.25rem 0 0;max-width:36em">
        What I can actually do, and what I use each thing for. No
        self-rated percentages &mdash; ask me to open a model instead.
      </p>

      <div data-filter-group data-noun="skill">
        <div class="controls">
          <div class="search">
            {search_icon}
            <input id="skill-search" type="search" placeholder="Search skills&hellip;" aria-label="Search skills" autocomplete="off">
            <kbd aria-hidden="true">/</kbd>
          </div>
          <div class="filters" role="group" aria-label="Filter skills by area">
            <button class="filter" type="button" data-filter="all" aria-pressed="true">All</button>
            <button class="filter" type="button" data-filter="finance" aria-pressed="false">Finance</button>
            <button class="filter" type="button" data-filter="technical" aria-pressed="false">Technical</button>
            <button class="filter" type="button" data-filter="leadership" aria-pressed="false">Leadership</button>
          </div>
          <button class="filter" type="button" data-clear hidden>Clear</button>
          <p class="result-count" role="status" aria-live="polite"></p>
        </div>

        <h2 class="visually-hidden">Skill areas</h2>
        <div class="grid grid-2 grid-start">
{cards}
        </div>
        <div class="empty-state" hidden>
          <p>Nothing matches that.</p>
          <button class="btn" type="button" data-clear>Clear search and filters</button>
        </div>
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow2}
      <div class="grid grid-2">
        <div>
          <h2>Credentials</h2>
          <p class="muted" style="margin-top:1rem">
            Certifications from the Corporate Finance Institute, taken to put
            structure behind self-taught modelling.
          </p>
        </div>
        <div>
          <article class="entry">
            <div class="entry-head">
              <h3>Financial Modeling &amp; Valuation Analyst (FMVA)</h3>
              <span class="when">Completed &mdash; 93%</span>
            </div>
            <p class="where">Corporate Finance Institute</p>
          </article>
          <article class="entry">
            <div class="entry-head">
              <h3>Investment Banking &amp; Private Equity Modeling Specialization</h3>
              <span class="when">Sept 2026</span>
            </div>
            <p class="where">Corporate Finance Institute</p>
          </article>
        </div>
      </div>
    </section>
""".format(eyebrow=eyebrow("01", "Capabilities"), eyebrow2=eyebrow("02", "Credentials"),
           search_icon=ICONS["search"], cards=skills_html())

# --------------------------------------------------------------------------
# Interests. Cards marked "placeholder" are scaffolding for Thomas to fill in.
# --------------------------------------------------------------------------

PLACEHOLDER_CARDS = [
    ("Sport and fitness", "Which sports, how often, and anything you compete in. Two sentences is plenty."),
    ("Reading", "What you actually read &mdash; a couple of named books or authors beats the word &ldquo;reading&rdquo;."),
    ("Music", "Instrument, listening, live gigs, whatever is true."),
    ("Travel and the outdoors", "Where you have been, or where the cadet work takes you."),
    ("Something unexpected", "The one an interviewer will remember. Keep it specific and keep it honest."),
]


def interests_html():
    cards = []
    for title, prompt in PLACEHOLDER_CARDS:
        cards.append("""        <article class="card placeholder">
          <p class="placeholder-badge">Placeholder</p>
          <h3>{title}</h3>
          <p>{prompt}</p>
        </article>""".format(title=title, prompt=prompt))
    return "\n".join(cards)


INTERESTS = """    <section class="section wrap">
      {eyebrow}
      <h1 style="font-size:clamp(1.9rem,1.4rem + 2.2vw,2.75rem)">Interests</h1>
      <p class="lede" style="margin:1.25rem 0 0;max-width:36em">
        The things I spend time on when nobody is marking them.
      </p>

      <!-- TODO: delete this notice once every placeholder card below is filled in. -->
      <div class="card placeholder no-print" style="margin-top:2rem">
        <p class="placeholder-badge">Unfinished</p>
        <p class="small">
          Cards marked <strong>placeholder</strong> are scaffolding. Replace the
          text with your own, then delete this notice and the
          <code>.placeholder</code> class on each card.
        </p>
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow2}
      <h2>What I actually do</h2>
      <p class="muted" style="margin:.75rem 0 1.75rem;max-width:38em">
        Three of these are real and written from life. The rest are waiting
        for you.
      </p>
      <div class="grid grid-3">
        <article class="card">
          <span class="tag tag-accent">Eleven years</span>
          <h3 style="margin-top:.7rem">The Army Cadet Force</h3>
          <p>
            It started as something to do on a Tuesday evening and turned into
            the through-line of my adolescence and adult life so far. I stayed
            because the responsibility is real: the training you plan is
            training somebody actually receives, and the safety call on a range
            is genuinely yours.
          </p>
        </article>
        <article class="card">
          <span class="tag tag-accent">Ongoing</span>
          <h3 style="margin-top:.7rem">Building things that work</h3>
          <p>
            I learn a stack by shipping something in it. That is how Clarifin
            ended up running on infrastructure I configured myself &mdash;
            Workers, object storage, payments and automated delivery &mdash;
            rather than on somebody else&rsquo;s storefront plugin, and how this
            site came to be written by hand rather than assembled from a theme.
          </p>
        </article>
        <article class="card">
          <span class="tag tag-accent">Ongoing</span>
          <h3 style="margin-top:.7rem">Taking companies apart</h3>
          <p>
            Reading filings and rebuilding a business in a spreadsheet is
            genuinely how I like to spend an evening. The Hollywood Bowl and
            Microsoft work started as curiosity rather than as coursework, and
            neither was set by anyone.
          </p>
        </article>
{cards}
      </div>
    </section>

    <section class="section wrap reveal">
      {eyebrow3}
      <div class="grid grid-2">
        <div>
          <h2>Currently</h2>
          <p class="muted" style="margin-top:1rem">
            A short, dated list is the easiest part of a personal site to keep
            alive, and the part people check twice. Keep it to three lines and
            update it when it stops being true.
          </p>
        </div>
        <article class="card placeholder">
          <p class="placeholder-badge">Placeholder</p>
          <ul class="plain">
            <li><strong>Reading:</strong> replace with what you are reading.</li>
            <li><strong>Listening to:</strong> replace with a podcast or album.</li>
            <li><strong>Working on:</strong> replace with the current Clarifin or cadet project.</li>
          </ul>
          <p class="tiny" style="margin-top:1rem">Last updated: add a date here.</p>
        </article>
      </div>
    </section>
""".format(eyebrow=eyebrow("01", "Outside work"), eyebrow2=eyebrow("02", "Interests"),
           eyebrow3=eyebrow("03", "Currently"), cards=interests_html())

# --------------------------------------------------------------------------
# CV (prints as one A4 page)
# --------------------------------------------------------------------------

CV = """    <section class="section wrap">
      <div class="cv-doc">
        <div class="no-print" style="display:flex;flex-wrap:wrap;gap:.65rem;margin-bottom:2rem">
          <a class="btn btn-primary" href="thomas-willmott-cv.pdf" download>{download}Download PDF</a>
          <button class="btn" type="button" data-print-page>{print_icon}Print this page</button>
        </div>

        <header class="cv-head">
          <h1>Thomas Willmott</h1>
          <p class="lede" style="margin:.75rem 0 0;max-width:34em">
            Final-year Finance and Mathematics undergraduate targeting UK lower
            mid-market private equity, with investment banking as a route in.
          </p>
          <p class="cv-status tiny" style="margin-top:.75rem;letter-spacing:.06em;text-transform:uppercase">
            Graduating June 2027 &middot; Right to work in the UK &middot; London
          </p>
          <ul class="cv-contact">
            <li><a class="link" href="mailto:{email}">{email}</a></li>
            <li><a class="link" href="{linkedin}" rel="me noopener" data-print="linkedin.com/in/thomas-willmott">LinkedIn</a></li>
            <li><a class="link" href="{github}" rel="me noopener" data-print="github.com/thetboss">GitHub</a></li>
          </ul>
        </header>

        <section class="cv-section">
          <h2>Education</h2>
          <div class="cv-body">
            <article class="entry">
              <div class="entry-head">
                <h3>BSc Finance and Mathematics</h3>
                <span class="when">2024&ndash;2027</span>
              </div>
              <p class="where">Royal Holloway, University of London</p>
              <p>Joint honours combining quantitative methods with applied finance.
              Relevant coursework: financial econometrics; probability and statistics;
              microeconomics; macroeconomics; financial markets and institutions.</p>
            </article>
          </div>
        </section>

        <section class="cv-section">
          <h2>Credentials</h2>
          <div class="cv-body">
            <article class="entry">
              <div class="entry-head">
                <h3>Financial Modeling &amp; Valuation Analyst (FMVA)</h3>
                <span class="when">Completed &mdash; 93%</span>
              </div>
              <p class="where">Corporate Finance Institute</p>
            </article>
            <article class="entry">
              <div class="entry-head">
                <h3>Investment Banking &amp; Private Equity Modeling Specialization</h3>
                <span class="when">Sept 2026</span>
              </div>
              <p class="where">Corporate Finance Institute</p>
            </article>
          </div>
        </section>

        <section class="cv-section">
          <h2>Founder</h2>
          <div class="cv-body">
            <article class="entry">
              <div class="entry-head">
                <h3><a class="link" href="{clarifin}" rel="noopener">Clarifin</a></h3>
                <span class="when">Sept 2026&ndash;present</span>
              </div>
              <p class="where">UK digital financial templates business &mdash; clarifin.co.uk</p>
              <p>Founded and run solo: product direction, Excel modelling and the full
              technical stack. Live since September 2026 with 13 templates shipped.</p>
              <ul class="plain">
                <li>Built every model in the catalogue &mdash; three-statement, DCF and LBO templates written for non-specialist operators.</li>
                <li>Runs on Cloudflare Workers and R2, with Stripe checkout and Resend for automated delivery; no third-party platform.</li>
                <li>Owns pricing, positioning and customer support end to end.</li>
              </ul>
            </article>
          </div>
        </section>

        <section class="cv-section">
          <h2>Research</h2>
          <div class="cv-body">
            <article class="entry">
              <div class="entry-head">
                <h3>Hollywood Bowl Group &mdash; LBO series</h3>
                <span class="when">Published on LinkedIn</span>
              </div>
              <p>Multi-week build: operating model, KPI dashboard and returns analysis
              testing whether centre-level cash generation supports a sponsor case.</p>
            </article>
            <article class="entry">
              <div class="entry-head">
                <h3>Microsoft &mdash; three-scenario DCF</h3>
                <span class="when">Published on LinkedIn</span>
              </div>
              <p>Bear, base and bull cases with sensitivity analysis on WACC and terminal
              growth, isolating how much of the value sits in the terminal assumption.</p>
            </article>
          </div>
        </section>

        <section class="cv-section">
          <h2>Leadership</h2>
          <div class="cv-body">
            <article class="entry">
              <div class="entry-head">
                <h3>Company Commander &amp; Adult Volunteer Instructor</h3>
                <span class="when">11 years continuous</span>
              </div>
              <p class="where">Army Cadet Force</p>
              <p>Progressed from cadet to Cadet Sergeant Major of a company of 100+ cadets,
              then commissioned responsibility as Company Commander. Awarded the ACF
              Exemplary Service Award.</p>
              <ul class="plain">
                <li>Accountable for the training, welfare and discipline of a 100+ cadet company and its adult instructor team.</li>
                <li>Plans and delivers structured training programmes, then assesses performance against national standards.</li>
                <li>Holds the safety-critical call on field exercises and live ranges, including risk assessment and abort decisions.</li>
              </ul>
            </article>
          </div>
        </section>

        <section class="cv-section">
          <h2>Experience</h2>
          <div class="cv-body">
            <article class="entry">
              <div class="entry-head">
                <h3>Sales Supervisor</h3>
                <!-- TODO: add employment dates -->
                <span class="when"></span>
              </div>
              <p class="where">S&oslash;strene Grene</p>
              <p>Deputised as store manager with full responsibility for trading, staffing
              and cash. Sent to open new stores and train their teams from scratch.</p>
            </article>
            <article class="entry">
              <div class="entry-head">
                <h3>Finance Placement</h3>
                <span class="when">2023</span>
              </div>
              <p class="where">Neos Networks</p>
              <p>Completed the firm&rsquo;s internal financial modelling training and
              reviewed working models alongside a finance analyst.</p>
            </article>
            <article class="entry">
              <div class="entry-head">
                <h3>Delivery Driver</h3>
                <span class="when">Current</span>
              </div>
              <p class="where">Tesco</p>
              <p>Worked alongside full-time study and running Clarifin.</p>
            </article>
          </div>
        </section>

        <section class="cv-section">
          <h2>Skills</h2>
          <div class="cv-body">
            <ul class="cv-skills">
              <li>Financial modelling</li>
              <li>Excel (advanced)</li>
              <li>DCF</li>
              <li>LBO</li>
              <li>Trading &amp; transaction comps</li>
              <li>Python</li>
              <li>SQL (basics)</li>
              <li>Cloudflare Workers</li>
            </ul>
          </div>
        </section>
      </div>
    </section>
""".format(email=EMAIL, linkedin=LINKEDIN, github=GITHUB, clarifin=CLARIFIN,
           download=ICONS["download"], print_icon=ICONS["print"])

NOT_FOUND = """    <section class="section wrap">
      <div class="wrap-prose" style="padding:0">
        <p class="eyebrow"><span class="num">404</span> Page not found</p>
        <h1 style="font-size:clamp(1.9rem,1.4rem + 2.2vw,2.75rem)">That page isn&rsquo;t here</h1>
        <p class="lede" style="margin:1.25rem 0">
          The link is either out of date or slightly wrong. Everything on the
          site is one hop away.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="index.html">Home</a>
          <a class="btn" href="projects.html">Projects</a>
          <a class="btn" href="cv.html">CV</a>
        </div>
      </div>
    </section>
"""


FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="TW">
  <rect width="64" height="64" rx="6" fill="#2B2B2B"/>
  <text x="32" y="43" font-family="Georgia, 'Times New Roman', serif" font-size="30"
        font-weight="600" fill="#C9A227" text-anchor="middle">TW</text>
</svg>
"""


MANIFEST = """{
  "name": "Thomas Willmott",
  "short_name": "T. Willmott",
  "description": "Personal site of Thomas Willmott: finance, modelling and things built.",
  "start_url": "/",
  "display": "minimal-ui",
  "background_color": "#FAF8F4",
  "theme_color": "#FAF8F4",
  "icons": [
    {"src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml"},
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}
  ]
}
"""


# --------------------------------------------------------------------------
# Write everything out
# --------------------------------------------------------------------------

PAGES = [
    ("index.html",
     "Thomas Willmott — Finance, Modelling and Building Things",
     "Thomas Willmott: BSc Finance and Mathematics at Royal Holloway, FMVA-certified "
     "modeller, founder of Clarifin, and eleven years in the Army Cadet Force.",
     HOME),
    ("about.html",
     "About — Thomas Willmott",
     "How a finance and mathematics degree, a solo business and eleven years in the "
     "Army Cadet Force fit together.",
     ABOUT),
    ("projects.html",
     "Projects — Thomas Willmott",
     "Independent valuation work and a live templates business: Clarifin, a "
     "multi-week Hollywood Bowl LBO series and a three-scenario Microsoft DCF.",
     PROJECTS_PAGE),
    ("skills.html",
     "Skills — Thomas Willmott",
     "Financial modelling, DCF and LBO work, Excel, Python, Cloudflare Workers, and "
     "leadership built in the Army Cadet Force.",
     SKILLS_PAGE),
    ("interests.html",
     "Interests — Thomas Willmott",
     "What Thomas Willmott does outside the degree: cadets, building software, and "
     "taking companies apart in a spreadsheet.",
     INTERESTS),
    ("cv.html",
     "CV — Thomas Willmott",
     "One-page CV for Thomas Willmott: BSc Finance and Mathematics, FMVA at 93%, "
     "founder of Clarifin, Army Cadet Force Company Commander.",
     CV),
]


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as fh:
        fh.write(content)
    return len(content.encode("utf-8"))


def main():
    import hashlib
    import base64

    total = 0
    emitted = []
    for slug, title, description, body in PAGES:
        html = page(slug, title, description, body)
        emitted.append(html)
        total += write(slug, html)

    not_found = page("404.html", "Page not found — Thomas Willmott",
                     "That page does not exist on Thomas Willmott's site. Links back to the "
                     "home page, projects and CV.",
                     NOT_FOUND, active="")
    emitted.append(not_found)
    total += write("404.html", not_found)

    total += write("assets/site.css", CSS.strip() + "\n")
    total += write("assets/site.js", JS)
    write("favicon.svg", FAVICON_SVG)
    write("site.webmanifest", MANIFEST)

    # Hash every inline script the pages actually contain, so the CSP needs no
    # 'unsafe-inline' for scripts.
    inline = set()
    for html in emitted:
        for match in re.findall(r"<script[^>]*>(.+?)</script>", html, re.S):
            inline.add(match)
    hashes = " ".join(
        "'sha256-" + base64.b64encode(hashlib.sha256(x.encode("utf-8")).digest()).decode("ascii") + "'"
        for x in sorted(inline)
    )

    write("_headers", """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()
  Content-Security-Policy: default-src 'none'; script-src 'self' {h}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'

/assets/*
  Cache-Control: public, max-age=86400

/*.png
  Cache-Control: public, max-age=86400

/favicon.svg
  Cache-Control: public, max-age=86400

/thomas-willmott-cv.pdf
  Cache-Control: public, max-age=3600
  Content-Disposition: attachment; filename="Thomas-Willmott-CV.pdf"
""".format(h=hashes))

    write("robots.txt", "User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % SITE_URL)

    urls = []
    for slug, _, _, _ in PAGES:
        loc = SITE_URL + ("/" if slug == "index.html" else "/" + slug)
        priority = "1.0" if slug == "index.html" else "0.8"
        urls.append("  <url>\n    <loc>%s</loc>\n    <changefreq>monthly</changefreq>"
                    "\n    <priority>%s</priority>\n  </url>" % (loc, priority))
    write("sitemap.xml",
          '<?xml version="1.0" encoding="UTF-8"?>\n'
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + "\n".join(urls) + "\n</urlset>\n")

    print("wrote %d pages + 404 + assets (%.1f KB of HTML/CSS/JS)" % (len(PAGES), total / 1024))


if __name__ == "__main__":
    main()

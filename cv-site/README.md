# Thomas Willmott — personal site

Seven static pages (six plus a 404), built with hand-written HTML, CSS and
one small JavaScript file. No framework, no build step to deploy, no
third-party requests, no trackers. Everything interactive is progressive
enhancement: with JavaScript disabled the site is still complete, readable
and navigable.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home: positioning, current status, selected work, contact. |
| `about.html` | Narrative, an expandable timeline, education, leadership, work history. |
| `projects.html` | Filterable, searchable project grid with expandable detail panels. |
| `skills.html` | Individually filterable skills with what each is used for, plus credentials. |
| `interests.html` | Life outside the degree. **Contains placeholder cards you must fill in.** |
| `cv.html` | The one-page CV. Prints to a single clean A4 page. |
| `404.html` | Served automatically by Cloudflare Pages for unknown URLs. |
| `assets/site.css` | The whole design system: dark mode, high-contrast mode, print. |
| `assets/site.js` | ~12KB of vanilla JS. Everything below degrades without it. |
| `og.png` | 1200x630 link-preview card for LinkedIn, Slack and search results. |
| `favicon.svg`, `icon-*.png`, `apple-touch-icon.png` | Icons. |
| `site.webmanifest` | Name, colours and icons for installed/pinned use. |
| `thomas-willmott-cv.pdf` | **Placeholder.** Replace with the real PDF, keeping the filename. |
| `_headers` | Security headers and caching for Cloudflare Pages. |

## Editing

Two scripts live in the repository root, outside the deployed folder:

```sh
python3 tools/generate_site.py   # rewrites every page, the CSS, the JS and _headers
python3 tools/make_assets.py     # re-renders og.png and the icons (needs Playwright)
```

`generate_site.py` exists so the header, footer, metadata and content
security policy cannot drift apart across seven pages. It is an authoring
convenience only — the deployed site is the plain HTML in this folder.
Edit the generator and re-run it, or edit the HTML directly and delete the
generator so the two cannot disagree.

The content security policy in `_headers` contains SHA-256 hashes of the
inline scripts. The generator recomputes them on every run, so if you edit
an inline script by hand you must re-run it or the scripts will be blocked.

## Before you deploy — edit these

1. **Placeholder interest cards.** `interests.html` has five cards and a
   "Currently" panel marked `placeholder`, plus a visible "Unfinished"
   notice. Write real content, remove the `placeholder` class, and delete
   the notice.
2. **LinkedIn URL.** Guessed as `linkedin.com/in/thomas-willmott`. It
   appears in the footer, the CV page, the structured data and the two
   research project links, which point at your activity feed rather than at
   the specific posts.
3. **GitHub URL.** Set to `github.com/thetboss`. The three software
   projects link to this repository.
4. **Email.** `tjwillmott12@gmail.com`, in the header actions, contact
   section, footer, CV and structured data.
5. **Two dates I could not verify.** The cadet start year on the timeline
   is derived from "eleven years continuous", and the FMVA is grouped under
   2026. Both are marked TODO in the generator. The Søstrene Grene
   employment dates are blank, also TODO.
6. **Claims to check before an interview.** The Swift and React Native
   entries under "Also worked with", and the two HealthTracker projects,
   describe code in this repository. Remove anything you would not want to
   be questioned on.
7. **Domain.** Replace `https://thomaswillmott.co.uk` in
   `tools/generate_site.py` (`SITE_URL`) and re-run it. It feeds the
   canonical tags, the Open Graph URLs, the structured data, `robots.txt`
   and `sitemap.xml`. **The link-preview image is referenced absolutely,
   so previews stay blank until this matches your real domain.**
8. **PDF.** Open `cv.html`, print to PDF, and overwrite
   `thomas-willmott-cv.pdf`. The print stylesheet produces exactly one A4
   page at 11mm/13mm margins.

## Deploy to Cloudflare Pages

### Option A — Git integration (recommended)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and pick this repository.
2. Configure the build:
   - **Production branch**: your default branch
   - **Framework preset**: None
   - **Build command**: leave empty
   - **Build output directory**: `cv-site`
3. **Save and Deploy.** Live at `<project>.pages.dev` in under a minute,
   and every push to the production branch redeploys.

The output directory matters: this repository also holds unrelated
projects, so pointing Pages at the repository root would publish them too.

### Option B — Direct upload with Wrangler

```sh
npm install -g wrangler
wrangler login
wrangler pages deploy cv-site --project-name thomas-willmott
```

### Custom domain

Pages project → **Custom domains** → **Set up a domain**. If the domain is
already on Cloudflare nameservers the record is created for you; otherwise
add the `CNAME` it shows you at your registrar. HTTPS and HTTP/3 are on by
default.

### Clean URLs

Pages serves `/about` as well as `/about.html`. Internal links use the
`.html` form deliberately, so the site also works from disk or a plain
local server.

## Local preview

```sh
cd cv-site && python3 -m http.server 8000
```

## What the JavaScript does

Every item degrades gracefully, and all motion respects
`prefers-reduced-motion`:

- **Theme switch** — light, dark, or follow the system. Stored in
  `localStorage` and applied before first paint, so no wrong-theme flash.
- **Filtering and search** — projects by category, skills individually,
  with empty groups collapsing and the result count announced to screen
  readers. State is written to the URL, so `projects.html?filter=research`
  and `?q=lbo` are shareable and restore on load.
- **Keyboard** — `/` focuses the search box, `Escape` clears it or closes
  the mobile drawer.
- **Deep links** — `projects.html#clarifin` opens that card's detail panel,
  scrolls to it and moves focus there.
- **Expandable panels** — built on `<details>`, so they work with no JS,
  and every one is opened automatically before printing.
- **Timeline** — one entry open at a time, keyboard operable, with
  `aria-expanded` kept in sync and collapsed text removed from the
  accessibility tree.
- **Prefetch on hover** — the next page is fetched when you hover or focus
  a link, skipped on save-data and 2G connections.
- **Copy-to-clipboard** email buttons with a non-clipboard fallback.
- **Scroll reveals**, skipped entirely under reduced motion.
- **Mobile drawer navigation**, falling back to an inline wrapped nav when
  JavaScript is unavailable.

## Accessibility

- Every text node on every page meets **WCAG AA contrast in both themes**,
  verified by compositing the actual rendered colours rather than by eye.
- Interactive borders meet the 3:1 non-text requirement, and the active
  filter is marked by weight and an inset rule as well as by colour.
- Heading order runs h1 → h2 → h3 → h4 with no level skipped, one h1 per
  page, and landmark elements throughout.
- Focus is always visible, touch targets are at least 44px on coarse
  pointers, and there is a working skip link.
- `prefers-contrast: more` and `forced-colors: active` are both handled.

## Checks that were run

- All seven pages: no unclosed tags, no duplicate IDs, no missing local
  references, no console errors, no failed requests.
- No horizontal overflow at 390px, 900px, 1280px or 1440px.
- Contrast audit across 7 pages × 2 themes: zero failures.
- Keyboard: tab order, Enter on filters and panels, skip link, timeline.
- With JavaScript disabled: no hidden content on any page, panels still
  expand, mobile navigation still works.
- `cv.html` prints to exactly one A4 page with link URLs expanded.

## Performance

One HTML document plus two cached shared files. `site.css` is 24KB and
`site.js` 12KB uncompressed, both served Brotli-compressed from the edge
and cached across every page. No webfonts, no images on any content page,
no third-party requests. Type is set in native stacks: an old-style serif
for headings, the system UI sans for body text.

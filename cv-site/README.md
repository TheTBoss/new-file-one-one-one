# Thomas Willmott — personal site

Six static pages. No framework, no build step to deploy, no third-party
scripts, no trackers. Everything interactive degrades gracefully: with
JavaScript disabled the site is still fully readable and navigable.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: positioning, current status, selected work, contact. |
| `about.html` | Narrative, an expandable timeline, education, leadership, work history. |
| `projects.html` | Filterable and searchable project grid with expandable detail panels. |
| `skills.html` | Skills grouped by area with what each one is used for, plus credentials. |
| `interests.html` | Life outside the degree. **Contains placeholder cards you must fill in.** |
| `cv.html` | The one-page CV. Prints to a single clean A4 page. |
| `assets/site.css` | The whole design system, including dark mode and the print stylesheet. |
| `assets/site.js` | ~8KB of vanilla JS: theme, nav, filtering, timeline, copy, reveals. |
| `thomas-willmott-cv.pdf` | **Placeholder.** Replace with the real PDF, keeping the filename. |
| `_headers` | Security headers and caching for Cloudflare Pages. |

## Editing

`tools/generate_site.py` (in the repository root, not in this folder)
generates every page from one source so the header, footer and metadata
cannot drift apart. It is an authoring convenience only — the deployed
site is the plain HTML in this folder and needs no build step.

```sh
python3 tools/generate_site.py     # rewrites cv-site/
```

Edit the generator and re-run it, or edit the HTML directly if you would
rather not keep the script. If you edit the HTML directly, delete the
generator so the two do not disagree.

## Before you deploy — edit these

1. **Placeholder interest cards.** `interests.html` has five cards and a
   "Currently" panel marked `placeholder`, plus a visible "Unfinished"
   notice. Write real content, remove the `placeholder` class, and delete
   the notice. Leaving them live looks worse than having no page.
2. **LinkedIn URL.** Guessed as `linkedin.com/in/thomas-willmott`. It
   appears in the footer, the CV page, and the two research project links,
   which currently point at your activity feed rather than at the specific
   posts. The `data-print` attribute on the CV contact link is what shows
   on the printed page.
3. **GitHub URL.** Set to `github.com/thetboss`. The three software
   projects link to this repository; point them at dedicated repositories
   if you split them out.
4. **Email.** `tjwillmott12@gmail.com`, used in the header actions, the
   contact section, the footer and the CV.
5. **Two dates I could not verify.** The Army Cadet Force start year on
   the timeline is derived from "eleven years continuous" and the FMVA is
   grouped under 2026; both are marked with TODO comments in the
   generator. The Søstrene Grene employment dates are blank, also marked
   TODO.
6. **Claims to check before an interview.** The Swift and React Native
   entries under "Also worked with" on the skills page, and the two
   HealthTracker projects, describe code in this repository. Remove
   anything you would not want to be questioned on.
7. **Domain.** Replace `https://thomaswillmott.co.uk` in
   `tools/generate_site.py` (`SITE_URL`), then re-run it. It feeds the
   canonical tags, Open Graph URLs, `robots.txt` and `sitemap.xml`.
8. **PDF.** Open `cv.html`, print to PDF, and overwrite
   `thomas-willmott-cv.pdf`. The print stylesheet is tuned to produce
   exactly one A4 page at 11mm/13mm margins.
9. **Link previews.** There is no `og:image`, so LinkedIn and Slack render
   a text-only card. To add one, drop a 1200x630 PNG at `/og.png` and add
   `<meta property="og:image" content="https://your-domain/og.png">` to
   the `page()` template in the generator.

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
`.html` form deliberately so the site also works when opened from disk or
from a plain local server.

## Local preview

```sh
cd cv-site && python3 -m http.server 8000
```

## Interactive behaviour

All of it is progressive enhancement, and all of it respects
`prefers-reduced-motion`:

- **Theme switch** in the header: light, dark, or follow the system. The
  choice is stored in `localStorage` and applied before first paint, so
  there is no flash of the wrong theme.
- **Project and skill filtering** by category plus live text search, with
  the result count announced to screen readers. The active filter is
  written to the URL, so `projects.html?filter=research` is shareable.
- **Expandable detail panels** built on `<details>`, so they open and
  close without JavaScript.
- **Timeline** on the About page: one entry open at a time, keyboard
  operable, with `aria-expanded` kept in sync.
- **Copy-to-clipboard** email buttons with a non-clipboard fallback.
- **Scroll reveals**, skipped entirely under reduced-motion.
- **Mobile drawer navigation**, which falls back to an inline wrapped nav
  when JavaScript is unavailable.

## Checks that were run

- Every page parses with no unclosed tags, no duplicate IDs, and a
  heading order of h1 → h2 → h3 → h4 with no levels skipped.
- No horizontal overflow at 390px, 820px, 1280px or 1440px.
- No console errors or failed requests on any page.
- Filtering, search, URL deep-linking, the timeline, the theme switch and
  persistence across pages, the copy buttons, and the mobile drawer were
  all exercised in a real browser.
- With JavaScript disabled: all project cards visible, detail panels
  still expandable, navigation still usable on mobile.
- `cv.html` prints to exactly one A4 page with link URLs expanded.

## Performance

Around 100KB total across six pages, of which the shared CSS and JS
(28KB uncompressed) are cached after the first page. No webfonts, no
images, no third-party requests. Type is set in native stacks: an
old-style serif for headings, the system UI sans for body text.

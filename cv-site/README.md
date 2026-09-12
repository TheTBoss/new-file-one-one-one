# Thomas Willmott — CV site

A single static page. No framework, no build step, no external requests:
the CSS is inline and the favicon is an inline SVG data URI, so the whole
page is one HTTP request.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The entire site — markup, inline CSS, print stylesheet, dark mode, meta and Open Graph tags. |
| `thomas-willmott-cv.pdf` | **Placeholder.** Replace with the real PDF, keeping the filename. |
| `_headers` | Cloudflare Pages security and caching headers. |
| `robots.txt`, `sitemap.xml` | Indexing. Update the domain in both. |

## Before you deploy — edit these

1. **LinkedIn URL** — `index.html`, the contact list and both research
   cards currently point at `linkedin.com/in/thomas-willmott`. Swap in
   your real vanity URL, and point each research card at the specific
   post rather than at your activity feed. The `data-print` attribute on
   the contact link is what shows on the printed CV, so update that too.
2. **GitHub URL** — set to `github.com/thetboss`. Change or delete the
   list item if you would rather not link it.
3. **Email** — set to `tjwillmott12@gmail.com` in three places: the
   contact link, the footer, and the placeholder PDF.
4. **Søstrene Grene dates** — the `<span class="when">` for that role is
   deliberately empty, marked with a TODO comment. A blank date on a CV
   reads as an omission, so fill it in.
5. **Domain** — replace `https://thomaswillmott.co.uk/` in the canonical
   tag, the Open Graph URL, `robots.txt` and `sitemap.xml`.
6. **PDF** — open the site, print to PDF, and overwrite
   `thomas-willmott-cv.pdf` with the result. The print stylesheet is
   tuned to produce exactly one A4 page at 11mm/13mm margins.
7. **Link preview image (optional)** — there is no `og:image`, so
   LinkedIn and Slack will render a text-only preview card. If you want a
   thumbnail, add a 1200x630 PNG at `/og.png` and this tag to `<head>`:
   `<meta property="og:image" content="https://your-domain/og.png">`.

## Deploy to Cloudflare Pages

### Option A — Git integration (recommended)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and pick this repository.
2. Configure the build:
   - **Production branch**: your default branch
   - **Framework preset**: None
   - **Build command**: leave empty
   - **Build output directory**: `cv-site`
3. **Save and Deploy.** The site is live at
   `<project>.pages.dev` in under a minute, and every push to the
   production branch redeploys it.

The build output directory matters: this repository also holds unrelated
projects, so pointing Pages at the repo root would publish them too.

### Option B — Direct upload with Wrangler

```sh
npm install -g wrangler
wrangler login
wrangler pages deploy cv-site --project-name thomas-willmott
```

### Custom domain

Pages project → **Custom domains** → **Set up a domain**. If the domain's
nameservers are already on Cloudflare the record is created for you;
otherwise add the `CNAME` Cloudflare shows you at your registrar. HTTPS
and HTTP/3 are on by default, so no certificate work is needed.

## Performance

Roughly 18KB of HTML, uncompressed, and nothing else on the critical
path — no webfonts, no scripts, no images. Cloudflare serves it Brotli
compressed from the edge, so it paints in one round trip on 4G. Fonts are
native stacks: an old-style serif for headings with a Georgia fallback,
and the system UI sans for body text.

## Checks that were run

- Markup parses with no unclosed tags; heading order is h1 → h2 → h3
  throughout, and every `aria-labelledby` resolves.
- No horizontal overflow at 390px, 820px, 1280px or 1440px.
- Dark mode verified via `prefers-color-scheme`.
- Print output renders as exactly one A4 page with link URLs expanded.

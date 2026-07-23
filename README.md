# ✍️ Ascend Studio

A one-page site that turns an idea into a **publish-ready newsletter** for
[Ascend](https://jugaldb.substack.com), Jugal Bhatt's weekly Substack for students and
early-career professionals navigating global education, careers, and US visas.

Pick a suggested idea (or type your own), read the full edition in Jugal's voice, copy it
straight into Substack, and download the hand-drawn illustrations that go with it.

**Live:** https://muskiagarwal.github.io/ascend-studio/ · No login, no sign-up, one page.

Built from the `jugal-newsletter-writer` skill: the 3-line opener ritual, receipt-driven
hooks, "Do this today" beats, real links beside every named tool, functional emojis, and
not a single em dash.

---

## Quick start

```bash
npm install
npm run dev      # local dev server
```

```bash
npm run build    # static site -> ./dist
npm run preview  # preview the production build (port 4173)
```

---

## How the writing works

There are two modes, and the same style guide drives both.

### Running it yourself — writes any topic on the page

```bash
cp .env.example .env       # then paste your key into .env
npm run dev
```

Type any topic and the full edition streams onto the page in about half a minute.
The key is read by the dev server ([`server/generate.js`](server/generate.js)) and
handed to Claude from Node, so it never leaves your machine. `.env` is gitignored.

This also works against the production build via `npm run preview`.

### The public site — pre-written, no key involved

A static host can't call the API (a key in a static site is readable by every
visitor, and Anthropic blocks browser calls for that reason), so for the deployed
copy the editions are written **ahead of time by GitHub Actions** and shipped as
plain text.

| Idea type | What happens |
| --- | --- |
| Hand-written editions | Open instantly. Typed blocks in [`src/data/articles.js`](src/data/articles.js), with real illustrations inline. |
| Workflow-written editions | Open instantly. Plain text in `src/data/generated/<idea-id>.txt`, inlined at build time by [`src/data/generated.js`](src/data/generated.js). |
| A topic with no edition yet | On the public site, opens in the visitor's own Claude with the style guide prefilled. Locally, it just gets written. |

A card turns green **Ready** the moment an edition exists for it — no code change
needed. Verify no key ever ships: `grep -c anthropic dist/assets/index-*.js` must
print `0`.

> To make the **public** URL write on demand too, the site needs a host that runs
> server code (Cloudflare Pages, Netlify, Render, or any small Node box).
> [`server/generate.js`](server/generate.js) is the handler to port over; the key
> goes in that host's environment variables, never in the repo.

### One-time setup

In the repo: **Settings → Secrets and variables → Actions → New repository secret**

- **Name:** `ANTHROPIC_API_KEY`
- **Value:** a key from [console.anthropic.com](https://console.anthropic.com)

That's the only place the key lives. It is available to the workflow and to nothing
else. Set a spend limit on it as a backstop.

### Writing editions

[`.github/workflows/publish.yml`](.github/workflows/publish.yml) writes any missing
editions, commits them, builds, and publishes to `gh-pages`.

- **Automatic:** every push to `main`.
- **Manual:** Actions tab → *Write editions and publish* → **Run workflow**, with
  optional `force` (rewrite everything) and `only` (comma-separated idea ids).

Writing is **incremental** — an idea that already has a `.txt` is skipped, so an
ordinary push costs nothing. Only genuinely new ideas hit the API.

To add a topic, append an entry to `IDEAS` in
[`src/data/articles.js`](src/data/articles.js) (an `id`, `title`, `who`, `archetype`,
and a `brief` describing the angle) and push. The workflow writes it on the next run.

Locally, if you have a key exported:

```bash
node scripts/write-editions.mjs              # only what's missing
node scripts/write-editions.mjs --force      # rewrite everything
node scripts/write-editions.mjs --only=i-opt # just one
```

Model settings are at the top of
[`scripts/write-editions.mjs`](scripts/write-editions.mjs) (`claude-opus-4-8`,
adaptive thinking, `effort: 'high'` — it runs at build time, so it buys the quality).
Each run lints its own output for em dashes, markdown tokens, a missing opener
ritual, and short drafts, and prints a warning rather than failing the publish.

### Editing or adding an edition

Everything lives in [`src/data/articles.js`](src/data/articles.js).

`ARTICLES` holds the full editions as typed blocks, so one source renders **both** the
on-page article and the paste-ready plain text:

| Block | Renders as |
| --- | --- |
| `opener` | The italic 3-line ritual |
| `p` / `lead` | Paragraph / the stand-alone must-not-miss line |
| `h3` | Section header |
| `beat` | The recurring "Do this today:" line |
| `img` | Framed illustration, and `[IMAGE: file.png]` in the plain text |
| `list` / `quote` | Bullets / a copy-paste template |
| `subscribe` / `closer` / `disclaimer` | The standard furniture |

Inline links use `[[Label|https://url]]`, which becomes a real link on the page and
`Label (https://url)` in the copied text. See [`src/lib/newsletter.js`](src/lib/newsletter.js).

`IDEAS` holds the idea cards. Give one an `articleId` to make it a green **Ready** card;
give it a `brief` instead and it becomes a Claude-bridge idea.

---

## 🎨 Regenerating the illustrations

The 12 PNGs are Excalidraw-style sketches (rough double strokes, Virgil handwriting, white
background, one orange accent):

```bash
npm run images
```

That runs [`images-src/make_images.py`](images-src/make_images.py), which composes the SVGs
with `excali.py`, then [`scripts/render.mjs`](scripts/render.mjs), which renders them to
`public/illustrations/` at 2x via `@resvg/resvg-js`.

> No `rsvg-convert` / librsvg needed. The hand-drawn wobble is baked into the path
> geometry, not an SVG filter, so any renderer works.

**Always look at every PNG before shipping.** Overlapping labels and text clipped at the
canvas edge are the two defects that actually happen.

---

## 🚀 Deploy

Publishing is part of [the workflow](.github/workflows/publish.yml) — push to `main`
and it builds and force-pushes `dist/` to the `gh-pages` branch (with `.nojekyll`),
which GitHub Pages serves at the live URL above. Nothing to run by hand.

To publish manually instead:

```bash
npm run build     # static output in ./dist, relative asset paths
```

`dist/` works on any static host (GitHub Pages project subpaths, Netlify, Cloudflare
Pages) with no extra config.

> ⚠️ The Virgil font must stay in `src/fonts/`. If it only lives in `public/`, Vite
> leaves the `@font-face` URL unresolved and the handwriting font 404s **in the
> production build only**, silently falling back to Comic Sans.

**Never commit the API key**, and never paste it into a chat or an issue. It belongs
in the repository secret and nowhere else.

---

## A note on the drafts

These are first drafts written to Jugal's style guide, meant for a final human edit before
they go out. Every statistic in them comes from Jugal's own documented experience rather
than invented numbers, because a made-up figure in his voice damages him personally.

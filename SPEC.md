# waynesimmonsjr.com Rebuild Spec

Handoff context for Claude Code. Claude does the building. Wayne reviews, supplies real content, and approves merges.

## 0. Status (updated 2026-10-23)

Phases 0, 1, and 2 are live on waynesimmonsjr.com (Astro, deployed by GitHub Actions; the old Jekyll site is kept at the `jekyll-final` tag).

- Phase 0 quick fixes: PR #2
- Phase 1 Astro rebuild: PR #3
- Phase 2 plus extras (NYC skyline in the hero, generative lofi music, Last.fm "last played" player, project map, Pages CMS): PR #4
- Audio fixes (instant start, music keeps playing across pages via client-side navigation) and Last.fm turned on: PR #5
- Content pass (About page, first post, this spec): PR #6

Sections 1 to 8 below are the original brief, edited where decisions changed. How to edit content: `EDITING.md`.

## 1. Original state (before the rebuild)

- Personal portfolio for Wayne Simmons, senior CS major at Queens College (CUNY), graduating May 2027. Career target: ML engineering. Long-term mission: data/AI for child protection and anti-trafficking.
- Built on a purchased Jekyll theme (Gerous), hosted on GitHub Pages, custom domain via GoDaddy DNS.
- GitHub: github.com/WayneS0628
- Current nav: Home, Projects, Posts, About Me, Contact. LinkedIn and GitHub links in the header.
- Current accent: #d14984 (pink). Grays: #1a1b1e, #34363a, #9a9a9a.

### Known problems to fix
- Generic hero: "I am a dedicated computer science student passionate about machine learning."
- 3 of 4 Selected Work items are Titanic projects (titanic-eda, survive-the-titanic, titanic-dtvsnn). Keep at most one.
- A test post is live on the homepage ("This is a test post"). Delete it.
- "Recent Work / What's new?" section renders empty.
- "Let's сonnect!" contains a Cyrillic "с". Replace with ASCII.
- Meta title is just "Wayne". Meta description is generic.
- Homepage "fun zone" / "ML engineer in the making" copy undercuts him. Move personality to About.

### Must not break
- **waynesimmonsjr.com/cleantube** is a separate repo (WayneS0628/cleantube) served as a GitHub Pages project site under the custom domain. The rebuild must not shadow or break that path. Do not create a /cleantube route in this site.
- Keep the CNAME file and custom domain working.
- Existing project URLs (e.g. /project/spotify-tracks-explorer) should redirect to their new locations.

## 2. Brand

**Concept: "Signal over noise."** Ties together ML (finding signal in data), CleanTube (cutting algorithmic noise), his focus ethic, guitar/audio, and quiet attention.

- Hero headline: **Signal over noise.**
- Subline: "I'm Wayne, an ML engineer in Queens building AI that finds what matters in messy data, and someday protects the people it's about."
- Header status chip: green dot + "Open to 2027 ML internships"
- Dictionary section (homepage):
  > **signal** /ˈsɪɡ.nəl/ *noun*. The part of the data that's actually true.
  > *For me:* what's left when you cut everything that isn't.
- About page: origin story (born in Brooklyn, Trinidadian and Guyanese heritage, 4 years at Apple Retail, RA at Summit Apartments, Break Through Tech AI 2026–27 cohort) plus personal goals (motorcycle, travel to Ethiopia, collect art, learn a backflip, guitar, gym, gaming).
- Meta title: "Wayne Simmons, ML Engineer"

### Copy rules
- **No em dashes anywhere in site copy.** Use commas, colons, periods, or parentheses.
- Conversational, direct, not corporate.
- **Never invent metrics, stats, or results.** Use clearly marked placeholders (`TODO: Wayne`) and list them for Wayne to fill.
- Never list a glucose spectroscopy project. He did not build it.
- No project pages for the bigram language model or the MarianMT fine-tune (Wayne's call, 2026-10-23). The bigram line on his resume is fine as is; don't flag it.

## 3. Visual system

### Palette (default dark: "Lava on graphite")
| Token | Value |
|---|---|
| bg | #0E0F11 |
| surface | #17181B |
| border | #26282C |
| text | #EDEAE4 |
| muted | #8A8A8A |
| accent | #FF4D1F (lava) |
| accent-2 | #FF8A3D (ember) |
| ok | green for status chip |

### Light mode ("Editorial")
bg #F2EFEA, text #111111, accent #FF4D1F. Toggle in header, respect `prefers-color-scheme`.

### Type
- Display/body: Geist (fallback Space Grotesk).
- UI labels, metadata, nav: Geist Mono (fallback JetBrains Mono).
- Bracket-style mono UI labels throughout: `[01] Work`, `[scroll]`, `[X] Close`, `[audio: off]`.

### References Wayne loved (for feel, not copying)
- huyml.co: audio On/Off toggle, live local clock, click-to-copy email, project metadata.
- giga.ai: very short headline, demo-forward hero, proof as numbers.
- pragenhatlen.com: bracketed mono UI chrome, dictionary-definition section, loader, drag interactions.
- polpharmabiologics.com: bold claim headline, stats strip, pipeline table with status per item.
- raomuhammadhamza.tech: training-run loading screen (do our own version, not a copy).

## 4. Information architecture

Nav: `[01] Work` `[02] About` `[03] Writing` `[04] Contact` + persistent **Resume** button.

Homepage order:
1. Loader (first visit only, skippable)
2. Hero + status chip
3. Stats strip (real numbers only, from Wayne)
4. 3–4 flagship model cards
5. Project map (latent space)
6. Dictionary section
7. Contact (click-to-copy email, LinkedIn, GitHub, live NYC clock)

## 5. Signature features

1. **Model-card project pages.** Each project shows Task, Data, Model, Key Metric, Stack, Status (Shipped / Training / Planned), links (GitHub, demo, write-up). Work index can show as a pipeline-style table with status column.
2. **Training-run loader.** `wayne.fit()` with a loss value ticking down and a step counter, resolving into a waveform that becomes the hero. First visit only (sessionStorage, wrapped in try/catch), skippable, under 2.5s, disabled under `prefers-reduced-motion`.
3. **Audio.** Off by default. Header toggle `[audio: off/on]`. Subtle UI ticks on hover/click, plus a generative lofi loop synthesized in the browser (shipped instead of a guitar recording; a recording can still replace it via `ambient` in `src/site.ts`). Remember choice per visitor. Music must keep playing across page changes.
4. **⌘K command palette.** Jump to projects, About, Resume, copy email, toggle theme, toggle audio.
5. **Project map as latent space.** Projects plotted as points in 2D (precompute embeddings of project descriptions at build time, reduce with UMAP or PCA, ship static JSON). Hover previews, click opens. Must have a plain list fallback.
6. **Small polish.** Live NYC clock, click-to-copy email with "Copied" state, status chip.
7. **NYC skyline** in the hero under the signal line (generated at build time; lit windows at night, daytime look in light mode).
8. **Spotify "last played" player** fed by Last.fm (user `waynes0628`): shows now playing plus the track before it, or the last played track when nothing is on.

### Non-negotiables
- Fast: good Lighthouse scores, lazy-load heavy pieces, optimized images.
- Accessible: keyboard nav, focus states, contrast, reduced-motion support, alt text.
- Works at phone width with no horizontal scroll.
- Flat fallback if WebGL/canvas is unavailable.

## 6. Stack and editability

- **Astro**, static output, deployed to GitHub Pages via GitHub Actions. Keep custom domain.
- Interactive pieces as Astro islands. Keep dependencies lean.
- **Content layer Wayne owns:** Astro content collections.
  - Projects: `src/content/projects/<slug>/index.md` + images in the same folder.
  - Writing: `src/content/writing/<slug>/index.md`.
  - Frontmatter schema (validated with zod):
    ```yaml
    title:
    summary:
    task:
    data:
    model:
    metric:        # real value only
    stack: []
    status:        # shipped | training | planned
    featured:      # true/false
    cover:         # ./cover.jpg
    github:
    demo:
    date:
    ```
- **Optional web editor:** set up a git-based CMS (Pages CMS or Decap, verify current options) so Wayne can edit Markdown and upload photos through a form without touching code.
- Write a short `EDITING.md`: how to add a project, add a photo, publish.

## 7. Content to migrate / add

Keep or add (verify details with Wayne):
- **CUAD contract triage** (Break Through Tech AI Studio group project for Accenture): contract clause detection and risk triage pipeline on the CUAD dataset. Cleared to be public. Strong flagship candidate; credit it as a team project and spell out Wayne's own contribution.
- What 114,000 Songs Sound Like (Spotify tracks explorer)
- One Titanic project (pick the strongest, likely Decision Tree vs Neural Network)
- CleanTube (link out to /cleantube, do not rebuild it)
- Streamlit chatbot on the Anthropic API (summaries, document Q&A, RAG version)
- Upcoming flagship projects from the Nov–Dec 2026 sprint (including an agentic AI project) as `status: training` cards when ready

Delete: test post, empty Recent Work section, duplicate Titanic cards.

## 8. Phases

- **Phase 0 (quick fixes, can go on current site first):** delete test post, fix Cyrillic "с", cut Titanic duplicates, new headline and meta title.
- **Phase 1 (rebuild):** Astro scaffold, design tokens, layout, nav, hero, loader, model cards, work index, About, Writing, Contact, ⌘K, audio toggle with UI ticks, redirects, deploy workflow, EDITING.md.
- **Phase 2:** project map, CMS, ambient music (shipped as a generative lofi loop).

## 9. Workflow rules

- Work on a branch, open a PR. Never push to main without Wayne's approval.
- Run the site locally and check it visually before asking for review.
- After each phase, give Wayne a short list: what changed, what needs his review, and every `TODO: Wayne` placeholder.
- Keep the old Jekyll site recoverable (tag or branch) until the new one is live and approved.

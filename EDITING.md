# Editing the site

Everything you'd normally change is plain Markdown or one settings file. You don't need to touch components.

## Run it locally

```bash
npm install      # first time only
npm run dev      # http://localhost:4321, reloads as you edit
```

## Add a project

1. Make a folder: `src/content/projects/<slug>/`. The folder name becomes the URL (`/work/<slug>/`), so use lowercase words and dashes.
2. Put an `index.md` in it, starting with this block (the "frontmatter"):

   ```yaml
   ---
   title: My Project
   summary: One sentence on what it is and why it matters.
   task: What the model does (e.g. Binary classification)
   data: What it was trained on
   model: What you used
   metric: 0.91 F1 on held-out test   # real values only; leave the line out if there isn't one
   stack: [Python, PyTorch]
   status: shipped                     # shipped | training | planned
   featured: true                      # true = shows on the homepage (newest 4 are shown)
   cover: ./cover.jpg                  # optional image in the same folder
   coverAlt: What the cover image shows
   github: https://github.com/WayneS0628/my-project
   demo: https://my-demo.streamlit.app/
   team: Team of 4, Break Through Tech AI   # optional; for group projects
   date: 2026-11-15
   draft: false                        # true = hidden from the site
   ---
   ```

3. Write the rest of the page below that block in normal Markdown.

If you get a field wrong (e.g. `status: done`), the build stops and tells you which file and field.

## Add a photo

Drop the image in the same folder as the `index.md`, then reference it with a relative path:

```markdown
![What the chart shows](./my-chart.png)
```

Always write real alt text (the part in brackets). Images get resized and compressed automatically, so the originals can be big.

## Add a post

Same as a project, in `src/content/writing/<slug>/index.md`, with a shorter header:

```yaml
---
title: Post title
summary: One-sentence teaser.
date: 2026-11-20
---
```

## Change contact info, the status chip, or stats

Edit `src/site.ts`. It holds your email, resume path, the "Open to..." status text, links, and the stats strip numbers.

Your resume goes at `public/resume.pdf`.

## Copy rules (enforced)

- **No em dashes.** The build fails if one shows up and tells you the file and line.
- **No made-up numbers.** Use `TODO: Wayne` as a placeholder instead. Placeholders render in an obvious orange box. Run `npm run todos` to list every one left.

## Publish

1. Commit to a branch and open a pull request.
2. Merge it into `main`.
3. GitHub Actions builds and deploys automatically. It takes about a minute; watch it in the repo's **Actions** tab.

## Don't

- Don't create anything at `/cleantube`. That URL belongs to the separate CleanTube repo.
- Don't delete `public/CNAME`. It's what keeps waynesimmonsjr.com pointing here.
- Don't delete `public/assets/ra/Summit5K.jpg`. Your emails link to it.

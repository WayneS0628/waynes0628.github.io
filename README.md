# waynesimmonsjr.com

My personal portfolio site, built with the [Gerous](https://jekyllthemes.io/theme/gerous-modern-portfolio-jekyll-theme) Jekyll theme by [Artem Sheludko](https://jekyllthemes.io/developers/artem-sheludko). Live at [waynesimmonsjr.com](https://waynesimmonsjr.com).

---

## About

This repo powers my personal portfolio where I showcase my projects, writing, and background as a CS student and aspiring ML engineer. The site is hosted for free via GitHub Pages and uses a custom domain.

The theme is fully interchangeable — if you want to swap it out, just replace the `_layouts/`, `_includes/`, `_sass/`, and `js/` folders with another Jekyll theme and your content (posts, projects, pages) carries over untouched since it lives in `_posts/`, `_projects/`, and `_pages/`.

---

## Theme

**Gerous** — Modern Portfolio Jekyll Theme  
- [Live theme demo](https://gerous.netlify.app/)  
- [Get the theme](https://jekyllthemes.io/theme/gerous-modern-portfolio-jekyll-theme)  
- Created by [Artem Sheludko](https://jekyllthemes.io/developers/artem-sheludko)

Notable features: dark/light mode, featured project slider, blog, testimonials, FAQ, Disqus comments, Google Analytics, Formspree contact form, and MailChimp newsletter support.

---

## Running locally

Requires Ruby 3.0+ and Bundler.

```bash
bundle install
bundle exec jekyll serve
```

Site runs at `http://localhost:4000`.

---

## Structure

| Path | What it is |
|---|---|
| `_config.yml` | Build settings |
| `_data/settings.yml` | All site content and toggles |
| `_posts/` | Blog posts |
| `_projects/` | Portfolio projects |
| `_pages/` | Static pages (About, Contact, etc.) |
| `_sass/0-settings/color-scheme.scss` | Colors |
| `images/` | All images |

---

## License

Theme licensed under MIT by Artem Sheludko. All site content © Wayne Simmons Jr.

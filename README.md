# warhawkadi.github.io

Personal portfolio for **Aditya Rai** — B.Tech CSE @ IIIT-Delhi.
Live at **<https://warhawkadi.github.io/>**

Hand-written HTML, CSS and vanilla JavaScript. No frameworks, no build step, no
bundler — clone it and open `index.html`.

---

## Features

**Look & motion**

- **Light / dark theme** — follows the OS, remembers a manual choice in
  `localStorage`, applied before first paint so there's no flash. Press `T` to
  toggle.
- Per-letter hero entrance, rotating typewriter tagline, animated stat counters,
  a seamless tech marquee, drifting gradient orbs and a film-grain overlay.
- 3D tilt and a cursor-tracking spotlight on cards, magnetic buttons, and a
  trailing cursor ring — all pointer-gated (see below).
- Scroll progress bar, sticky nav, scroll-spy active section, reveal-on-scroll.

**Behaviour**

- Filterable projects (All / AI & ML / Backend / Systems / Product) that
  re-cascade the surviving cards.
- Full-screen mobile drawer with staggered items, focus trap, `Escape` to close,
  and an iOS-safe scroll lock.
- Copy-email button with an `execCommand` fallback, and a contact form that
  posts via `fetch` with inline status plus a honeypot field.

**Quality**

- **Zero external assets** beyond Google Fonts. Icons are an inline SVG sprite —
  no icon CDN, nothing to 404.
- **Accessible** — semantic landmarks, skip link, labelled controls, visible
  focus rings, 44px touch targets, and WCAG AA contrast verified in *both*
  themes (including gradient-filled text and button fills).
- **Progressive enhancement** — reveal animations are gated behind a `.js` class
  on `<html>`, so with JavaScript disabled all content is simply visible, and
  the OS colour preference still applies. The form falls back to a native POST.
- **Motion & pointer aware** — `prefers-reduced-motion` drops every animation;
  `@media (hover: hover)` keeps hover states and tilt off touch screens, where
  `:hover` sticks after a tap.
- **Responsive** 320px and up, with a print stylesheet.
- **SEO** — description, canonical, Open Graph / Twitter cards, `Person` JSON-LD.

## File structure

| File         | Purpose                                                     |
| ------------ | ----------------------------------------------------------- |
| `index.html` | All markup, the SVG icon sprite, and the anti-flash theme script. |
| `style.css`  | Design tokens, themes, layout and components. Sectioned with a table of contents at the top. |
| `script.js`  | Theme toggle, mobile nav, scroll-spy, scroll progress, reveal-on-scroll, typewriter, cursor, copy-email, contact form. Each feature is an isolated IIFE that no-ops if its elements are missing. |
| `favicon.png`| Tab icon.                                                   |

## Local development

```bash
git clone https://github.com/WarHawkADI/warhawkadi.github.io.git
cd warhawkadi.github.io
```

Open `index.html` directly, or serve it to get correct relative-path behaviour:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

Pushing to `main` deploys automatically via GitHub Pages.

## Customising

**Colours** — every colour is a custom property in the `:root` block at the top
of `style.css`. Change `--brand` and `--brand-2`; the light theme overrides live
in `:root[data-theme="light"]`.

**Profile photo** — the hero shows an `AR` monogram by default. Drop an image at
`assets/profile.jpg` and it replaces the monogram automatically (the `<img>`
removes itself if the file is missing).

**Contact form** — posts to [Formspree](https://formspree.io). Swap the form's
`action` for your own endpoint. A `_gotcha` honeypot field filters bots.

**Résumé link** — appears in the nav and the footer; update both.

## Contact

- Email — <aditya23047@iiitd.ac.in>
- LinkedIn — [aditya-rai-885666167](https://www.linkedin.com/in/aditya-rai-885666167)
- GitHub — [@WarHawkADI](https://github.com/WarHawkADI)

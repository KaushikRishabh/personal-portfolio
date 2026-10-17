# Rishabh Kaushik’s portfolio

A statically exported Next.js portfolio hosted for free on GitHub Pages.

## Development

Use Node.js 24 (Node.js 22 or later is required).

```sh
npm ci
npm run dev
```

## Production checks

```sh
npm run lint
NEXT_PUBLIC_BASE_PATH=/personal-portfolio npm run build
npm run typecheck
NEXT_PUBLIC_BASE_PATH=/personal-portfolio npm run test:export
```

The build creates `out/`. All images and the resume use the configured base path.
For a root-domain host, omit `NEXT_PUBLIC_BASE_PATH` when building.

## GitHub Pages

In repository **Settings → Pages**, set **Source** to **GitHub Actions** once.
The workflow in `.github/workflows/deploy-pages.yml` checks and publishes every
push to `main`, and can also be run manually from the Actions tab.

Public address: https://kaushikrishabh.github.io/personal-portfolio/

No API keys, Firebase, email provider, server process, or paid hosting are needed.
The contact link opens the visitor’s email app. The old server-dependent email
form and visitor counter are retained in Git history rather than exposed as
non-working controls. The resume is `public/CV.pdf`.

## Observatory design and gravity lab

The homepage uses Framer Motion for section and filter transitions and a lightweight
canvas orbital experiment. The scene is original code-drawn pixel art; no external
asset or animation service is needed. Keyboard-accessible controls change the
simulation, pause it, and restore its initial conditions. Reduced-motion preferences
are respected. The gravity model uses scaled units and a fixed central mass, not a
real solar-system model. Public work samples remain linked to their source repositories.

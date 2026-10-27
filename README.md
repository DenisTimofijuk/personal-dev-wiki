# Personal Dev Wiki

Practical notes, troubleshooting guides, and technical references collected while working on development projects and a homelab.

**[Browse the published wiki](https://denistimofijuk.github.io/personal-dev-wiki/)**

## Documentation

- [HomeLab](https://denistimofijuk.github.io/personal-dev-wiki/HomeLab/) — TrueNAS, home automation, networking, and self-hosted services.
- [Programming](https://denistimofijuk.github.io/personal-dev-wiki/Programming/) — Node.js, monorepos, and debugging notes.
- [Systems](https://denistimofijuk.github.io/personal-dev-wiki/Systems/) — Linux, Fedora, DNS, and system administration.
- [Tools](https://denistimofijuk.github.io/personal-dev-wiki/Tools/) — Git, Docker, npm, and command-line references.

## Run locally

Requires Node.js 20 and npm (matching the GitHub Pages deployment workflow).

```bash
npm ci
npm run docs:dev
```

To build and preview the site:

```bash
npm run docs:build
npm run docs:preview
```

The production site is built into `.vitepress/dist`.

## Publishing

The site is generated with [VitePress](https://vitepress.dev/) and deployed to GitHub Pages from the `main` branch by [GitHub Actions](.github/workflows/deploy.yml).

The wiki homepage is [`index.md`](index.md). This `README.md` is intended for GitHub's repository overview and is excluded from VitePress page generation and sidebar navigation.

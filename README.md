# Personal Dev Wiki

Practical notes, troubleshooting guides, and technical references collected while working on development projects and a homelab.

**[Browse the published wiki](https://denistimofijuk.github.io/personal-dev-wiki/)**

## Documentation

- [HomeLab](https://denistimofijuk.github.io/personal-dev-wiki/HomeLab/) — TrueNAS, home automation, networking, and self-hosted services.
- [Programming](https://denistimofijuk.github.io/personal-dev-wiki/Programming/) — Node.js, monorepos, and debugging notes.
- [Systems](https://denistimofijuk.github.io/personal-dev-wiki/Systems/) — Linux, Fedora, DNS, and system administration.
- [Tools](https://denistimofijuk.github.io/personal-dev-wiki/Tools/) — Git, Docker, npm, and command-line references.

## Contributing and AI agents

This repository and the published wiki are **public**. Contributions should be safe for everyone to read and reuse.

- **Use a new branch and PR for every change.** Do not push directly to `main`; leave the PR for the repository owner's approval. Do not merge it without explicit permission.
- **Protect privacy before pushing.** Remove secrets, personal details, company/internal information, real network identifiers, and sensitive content from logs, screenshots, examples, filenames, and PR descriptions. Use synthetic values and documentation-only addresses.
- **Validate changes.** Run `npm test` (VitePress build and smoke tests) and review automated PR checks. Automated scans cannot certify that content contains no personal data.

**AI coding agents:** read [`AGENTS.md`](AGENTS.md) before working. GitHub Copilot also has [repository instructions](.github/copilot-instructions.md). The full workflow and privacy requirements are in `AGENTS.md`.

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

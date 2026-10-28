# Repository-wide GitHub Copilot Instructions

This repository and its GitHub Pages site are **public**. Read and follow [`AGENTS.md`](../AGENTS.md) before making changes; it is the authoritative contribution and privacy policy.

Critical rules:
- For every authorized modification, work on a fresh branch from `main`, push only that branch, and open a PR targeting `main` for the owner's approval. Never directly push to `main` or merge without explicit approval.
- Review **before pushing**: no secrets, personal information, real network addresses, identifying hostnames, user-specific paths, private logs, screenshots, metadata, or proprietary details. Use safe placeholders and generic examples. Public branch history is visible even before PR review.
- If supplied material cannot safely be generalized, do not publish it; request guidance.
- Keep VitePress documentation reusable and changes narrowly scoped. Run `npm ci` and `npm test`; report any validation not performed. Do not weaken tests to pass checks.
- When the user requests only an inspection or report, do not modify files.

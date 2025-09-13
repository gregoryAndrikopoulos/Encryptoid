# Encryptoid 🔐

A web application for encrypting and decrypting text files.
It is built with **React** and powered by **Vite** for fast development
and optimized builds.

---

## Workflow Status

[![Smoke Tests](https://github.com/gregoryAndrikopoulos/encryptoid/actions/workflows/smoke_test.yml/badge.svg)](https://github.com/gregoryAndrikopoulos/encryptoid/actions/workflows/smoke_test.yml)

---

## Tech Stack

- **React 19** — UI
- **Vite 7** — dev server & bundler
- **Vitest 3 + Testing Library** — unit/component tests
- **WebdriverIO 9 (DevTools)** + **Mocha** — smoke tests
- **ESLint** + **Prettier** — linting & formatting
- **GitHub Actions** — CI for Smoke
- **Node 24**, **pnpm 10** — runtime & package manager

### Runtime Versions

This repo pins tool versions via **asdf** in `.tool-versions`:

```txt
nodejs 24.7.0
pnpm 10.16.0
```

> If you use `asdf`, simply run:
>
> ```bash
> asdf install
> ```

---

## Requirements

- **Node.js** `>=24 <25`
- **pnpm** `>=10 <11`

---

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the dev server (default: <http://localhost:5173>):

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Preview the production build locally (default: <http://localhost:4173>):

```bash
pnpm preview
```

---

## Testing

### Unit / Component tests (Vitest + Testing Library)

- Location: `src/**/*.test.{js,jsx}` or under `src/**/tests/`
- JSDOM environment with `@testing-library/jest-dom` matchers.

Run once in CI mode:

```bash
pnpm test:unit
```

### Smoke tests (WebdriverIO + Mocha)

- Specs live under: `test/specs/`
- Page Objects under: `test/page-objects/`
- Config at: `test/wdio.conf.js`

The WDIO config auto-picks a **baseUrl**:

- `http://localhost:4173` if a `pnpm preview` server is already up, else
- `http://localhost:5173` for the dev server.

You can also override via env:

```bash
WDIO_BASEURL=http://localhost:4173 pnpm test:smoke
```

Typical local flows:

```bash
# 1) Run against the dev server (in another terminal)
pnpm dev
pnpm test:smoke

# 2) Run against a preview server
pnpm build
pnpm preview &
pnpm test:smoke
```

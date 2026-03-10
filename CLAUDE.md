# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BankTech Finder — an internal tool for identifying e-banking/digital banking providers used by US banks and credit unions. Users paste a bank's website URL, a backend API is called, and structured results are displayed. This is a **frontend-only** SPA; no backend code lives here.

## Tech Stack

- **Build:** Vite
- **UI:** React 18, React Router v6
- **Styling:** TailwindCSS + shadcn/ui
- **Async state:** TanStack Query v5 (useMutation for the lookup)
- **CSV parsing:** Papa Parse (for future bulk feature)
- **HTTP:** Native fetch (no axios)
- **Font:** DM Sans (Google Fonts)
- **Language:** JavaScript/JSX (not TypeScript)

## Common Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server
npm run build        # production build
npm run preview      # preview production build locally
npm run lint         # run ESLint (if configured)
```

## Architecture

Two-page SPA:
- **`/`** — Landing page with single-URL lookup form (active) and bulk CSV upload placeholder (disabled/coming soon)
- **`/result`** — Provider detection report, receives data via `navigate('/result', { state: { data } })`

Key data flow: `SingleLookupForm` → `useBankLookup` hook (TanStack Query mutation) → `POST /api/v1/lookup` → navigate to ResultPage with response in router state.

### API

- Endpoint: `POST {VITE_API_BASE_URL}/api/v1/lookup` with body `{ "url": "..." }`
- Base URL configured via `VITE_API_BASE_URL` env var (default: `http://localhost:8000`)
- Response fields: `bank_url`, `login_url`, `login_urls[]`, `provider`, `all_providers` (comma-separated string), `matched_patterns` (pipe-separated string needing client-side parsing)

### Provider Color Map

Provider badges use a fixed color mapping: Q2=purple, FIS=blue, Fiserv=orange, Jack Henry=green, NCR/NCR Voyix=red, Finastra=teal, Temenos=indigo, unknown=gray. See `ebanking-finder-prompt.md` for exact hex values.

## Build Specification

The file `ebanking-finder-prompt.md` is the authoritative specification for this project. It contains exact component layouts, parsing logic for `matched_patterns`, edge case handling, accessibility requirements, and design tokens. Always reference it for implementation details.

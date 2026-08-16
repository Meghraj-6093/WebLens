# WebLens

<p align="center">
  <strong>Precision technical diagnostics and website health auditing platform.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB.svg" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20+-green.svg" alt="Node.js" />
  <img src="https://img.shields.io/badge/Playwright-1.44-orange.svg" alt="Playwright" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" />
</p>

---

## Contents

- [Overview](#overview)
- [Why WebLens?](#why-weblens)
- [Key Features](#key-features)
- [Audit Engines](#audit-engines)
- [Deterministic Scoring](#deterministic-scoring)
- [Architecture](#architecture)
- [Security & SSRF Hardening](#security--ssrf-hardening)
- [Local-First Privacy Architecture](#local-first-privacy-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Development Commands](#development-commands)
- [Developer REST API](#developer-rest-api)
- [Automated Testing Suite](#automated-testing-suite)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**WebLens** is an open-source technical website intelligence and diagnostic platform. It turns any public URL into an actionable, prioritized health audit across **six essential web quality dimensions**:

1. **Performance** (Core Web Vitals: LCP, FCP, CLS, TTFB, resource weight)
2. **SEO** (Title structure, meta tags, Open Graph, canonicals, robots directives)
3. **Accessibility** (WCAG 2.1 compliance via `axe-core`, ARIA roles, color contrast, semantic hierarchy)
4. **Security** (TLS posture, CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, cookie attributes)
5. **Mobile Readiness** (Responsive viewport metadata, horizontal overflow, touch target spacing)
6. **Best Practices** (HTML5 standards, console diagnostics, doctype compliance, resource delivery)

WebLens couples real browser execution (**Playwright**) with a **Local-First client storage engine (IndexedDB)**, allowing developers, agencies, and site owners to audit, track regressions, and benchmark competitors with zero tracking cookies and zero mandatory accounts.

---

## Why WebLens?

Most website health tools suffer from fragmented workflows, opaque scoring, or invasive third-party telemetry:

* **Unified Observability:** Instead of juggling Google PageSpeed, Lighthouse, SEO checkers, and security header analyzers, WebLens executes all audits simultaneously in one automated pipeline.
* **Deterministic & Transparent Scoring:** Every point deduction is tied to specific rules, impact weights, and actionable code snippets.
* **SSRF-Hardened Scanner:** Built with multi-layer network validation blocking loopbacks (`127.0.0.1`, `::1`), private subnets (`RFC 1918`), and cloud metadata services (`169.254.169.254`, `100.100.100.200`, `fd00:ec2::...`).
* **Local-First Privacy:** All audit history, workspaces, competitor matrices, and custom client branding persist client-side in the browser's IndexedDB. Your scan history is never locked behind third-party database silos.
* **Apple Liquid Glass Interface:** A fluid design system featuring translucent glass refraction, dynamic GooeyNav active islands, and adaptive dark mode contrast.

---

## Key Features

### 🔍 Comprehensive Website Auditing
Enter any normalized URL to launch a 10-stage headless browser audit. View live progress through each analytical phase without fake loader delays.

### ⚡ Core Web Vitals & Resource Waterfall
Measures real lab metrics including Largest Contentful Paint (LCP), First Contentful Paint (FCP), Cumulative Layout Shift (CLS), and Time to First Byte (TTFB). Generates a complete resource waterfall broken down by scripts, stylesheets, documents, images, and fonts.

### ♿ WCAG Accessibility Verification
Executes standard `axe-core` rule engines against rendered DOM elements to catch missing form labels, invalid ARIA attributes, missing image alternative text, and contrast failures.

### 🛡️ Security Header & Posture Inspection
Validates defensive HTTP response headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) and flags insecure mixed-content or unencrypted protocols.

### 📈 Historical Regression & Compare Diffs
Compare two audit checkpoints side-by-side. View category score deltas, newly introduced regression issues, and resolved bugs.

### ⚔️ Multi-Domain Competitor Benchmark
Benchmark up to three direct competitor domains simultaneously across Core Web Vitals, SEO structure, and security postures.

### 🏢 Agency & White-Label Studio
Customize client audit reports with custom agency branding, primary theme colors, bespoke footer notices, and client domains.

### 🤖 AI Diagnostic Explainer & Remediation
Generate structured explanations for any issue, explaining *why* it matters, its operational impact, and copy-paste remediation code snippets.

---

## Audit Engines

WebLens organizes checks into six specialized scanning engines:

| Engine | Primary Evaluations |
| :--- | :--- |
| **Performance (25%)** | TTFB, First Contentful Paint, Largest Contentful Paint, Cumulative Layout Shift, resource sizes, compression (`gzip`/`brotli`), caching headers. |
| **SEO (20%)** | `<title>` length/presence, meta description, canonical URL, robots meta tags, heading hierarchy (`<h1>`-`<h6>`), Open Graph tags, Twitter/X cards. |
| **Accessibility (20%)** | `axe-core` WCAG 2.1 Level AA checks, image `alt` attributes, button accessible names, form `<label>` associations, landmark elements. |
| **Security (15%)** | HTTPS enforcement, TLS availability, `HSTS`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`. |
| **Mobile Readiness (10%)** | Viewport `<meta>` tag configuration, responsive layout scalability, horizontal content overflow, touch target dimensions. |
| **Best Practices (10%)** | HTML5 doctype declaration, charset encoding, deprecated browser APIs, broken resource links, console log diagnostics. |

---

## Deterministic Scoring

The overall health score (0–100) is calculated via a transparent weighted formula:

$$\text{Overall Score} = (0.25 \times \text{Perf}) + (0.20 \times \text{SEO}) + (0.20 \times \text{A11y}) + (0.15 \times \text{Sec}) + (0.10 \times \text{Mobile}) + (0.10 \times \text{BestPractices})$$

### Category Score Derivation
Each category begins at **100 points**. When an audit rule fails, points are deducted according to severity:

* **Critical Issue:** $-20$ points (or defined rule impact)
* **High Severity:** $-10$ points
* **Medium Severity:** $-5$ points
* **Low Severity:** $-2$ points

### Health Score Ratings
* **90–100:** `Excellent` (Green / Signal Accent)
* **75–89:** `Good` (Warm Highlight)
* **50–74:** `Needs Improvement` (Amber / Warning)
* **0–49:** `Poor` (Rose / Urgent Fix)

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           WEBLENS FRONTEND                              │
│  React 18 • TypeScript • Tailwind CSS • Apple Liquid Glass Navigation   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                 Local Workspace (IndexedDB)                     │   │
│   │  • Scans & Reports     • Project Workspaces   • Competitors     │   │
│   │  • Scheduled Monitors  • Agency Settings      • Activity Log    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        WEBLENS BACKEND API                              │
│  Express 4 • Concurrency Queue Semaphore • Security Headers • REST v1   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       WEBLENS SCANNER ENGINE                            │
│                                                                         │
│   ┌───────────────────────┐         ┌───────────────────────────────┐   │
│   │ SSRF & DNS Protection │         │ Playwright Headless Browser   │   │
│   │ • IPv4/IPv6 Unmapping │         │ • Core Web Vitals & Screenshots│  │
│   │ • Cloud Metadata Block│         │ • Network Resource Waterfall  │   │
│   │ • Restricted Ports    │         │ • axe-core WCAG Accessibility │   │
│   └───────────────────────┘         └───────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Multi-Engine Auditing (Perf, SEO, A11y, Security, Mobile, Best) │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                     │                                   │
│                                     ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Deterministic Scoring Calculator & Full JSON Report Generator   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Security & SSRF Hardening

Arbitrary website scanners face severe SSRF (Server-Side Request Forgery) risks. WebLens implements strict defensive guardrails in [`scanner/src/engine/ssrf.ts`](scanner/src/engine/ssrf.ts):

1. **Protocol Restriction:** Only `http:` and `https:` schemes are accepted (rejects `file:`, `javascript:`, `data:`, `gopher:`).
2. **Port Whitelisting:** Restricts outbound connections to standard web ports (`80`, `443`, `8080`, `8443`). Blocks internal database and administrative ports (e.g., `22`, `6379`, `5432`, `27017`).
3. **IPv4-Mapped IPv6 Unmapping:** Resolves and unmasks IPv6-mapped IPv4 representations (e.g., `[::ffff:127.0.0.1]` $\rightarrow$ `127.0.0.1`).
4. **Private & Loopback Range Blocking:** Rejects loopback (`127.0.0.0/8`, `::1`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and carrier-grade NATs (`100.64.0.0/10`).
5. **Cloud Metadata Protection:** Explicitly blocks cloud provider metadata IP endpoints across AWS, GCP, Azure, and Alibaba Cloud:
   * `169.254.169.254`
   * `100.100.100.200`
   * `[fd00:ec2::254]`
6. **Multi-IP DNS Inspection:** Performs full DNS queries via `dns.lookup({ all: true })` and inspects every resolved IP before initiating a connection.
7. **Production HTTP Headers:** All responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Strict-Transport-Security`.

---

## Local-First Privacy Architecture

WebLens stores your diagnostic workspaces directly in your browser using **IndexedDB** (`weblens_local_workspace`):

```text
weblens_local_workspace (IndexedDB)
├── scans          (Historical audit summaries, scores, and deltas)
├── reports        (Full JSON audit payloads and resource waterfalls)
├── projects       (Organized local workspace groupings)
├── monitors       (Scheduled monitoring frequencies and next check dates)
├── competitors    (Side-by-side benchmark comparison matrices)
├── agency         (White-label branding, colors, and client configurations)
├── activity       (Local event stream and audit logs)
└── settings       (Workstation preferences)
```

* **Zero Mandatory Logins:** Launch and audit websites immediately.
* **Full Data Export & Backup:** Export your entire local workspace to JSON or restore from a previous backup file at any time.

---

## Tech Stack

### Monorepo Workspaces
* **`@weblens/shared`** — Shared TypeScript interfaces, audit contracts, and scoring types.
* **`@weblens/database`** — SQLite repository pattern and schema migrations.
* **`@weblens/scanner`** — Headless browser orchestrator, SSRF engine, and scoring rules.
* **`@weblens/backend`** — Express REST API, security middleware, and background schedulers.
* **`@weblens/frontend`** — React 18 SPA, Vite build pipeline, and Liquid Glass design system.
* **`extension`** — Chrome/Chromium browser extension popup.

### Core Libraries
* **Frontend:** React 18, React Router 6, Tailwind CSS, Lucide React, Space Grotesk typography.
* **Backend:** Node.js, Express, `cors`, `dotenv`, `tsx`.
* **Scanner & Engine:** Playwright, `axe-core`, `cheerio`, `ipaddr.js`.
* **Database & Storage:** Native `node:sqlite` (backend), `IndexedDB` (frontend).

---

## Project Structure

```text
WebLens/
├── backend/                  # Express REST API Server
│   └── src/
│       ├── middleware/       # Auth & Security headers
│       ├── routes/           # REST endpoints (scans, reports, competitor, ai)
│       ├── services/         # Queue semaphore, scan service, monitor service
│       └── server.ts         # Express bootstrap & health endpoint
├── database/                 # Database Layer
│   └── src/
│       ├── db.ts             # SQLite connection management
│       ├── repository.ts     # Scan & User repository operations
│       └── schema.sql        # Table definitions & indexes
├── docs/                     # Documentation & PRD
│   └── PRD.md                # Complete Product Requirements Document
├── extension/                # Browser Extension
│   ├── manifest.json         # Extension manifest
│   ├── popup.html            # Extension popup HTML
│   └── popup.js              # Scan trigger script
├── frontend/                 # React 18 Client Application
│   └── src/
│       ├── components/       # UI, Liquid Glass navbar, report cards
│       ├── lib/              # IndexedDB client (db.ts) & API client (api.ts)
│       ├── pages/            # 10 core application routes
│       └── index.css         # Liquid Glass refraction & theme tokens
├── scanner/                  # Diagnostic Audit Engine
│   └── src/
│       ├── engine/           # SSRF validator, Playwright runner, HTTP probe
│       ├── scanners/         # 6 audit categories (perf, seo, a11y, sec, mobile, bp)
│       ├── scoring/          # Category & overall score calculator
│       └── orchestrator.ts   # 10-stage execution pipeline
├── shared/                   # Shared TypeScript Types & Contracts
│   └── src/types/            # Canonical interfaces
├── tests/                    # Automated Test Suites
│   ├── e2e.test.ts           # Full route navigation & IndexedDB persistence
│   ├── production-attack.test.ts # 21 SSRF, evasion, & concurrency checks
│   └── clean-inputs.test.ts  # Form initialization verification
├── .env.example              # Environment variable template
├── .gitignore                # Production artifact exclusions
├── package.json              # Monorepo root workspace manifest
└── tsconfig.base.json        # Base TypeScript compiler settings
```

---

## Getting Started

### Prerequisites
* **Node.js:** `v20.0.0` or higher
* **npm:** `v10.0.0` or higher
* **Playwright Browsers:** Chromium

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Meghraj-6093/WebLens.git
   cd WebLens
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browser binaries:**
   ```bash
   npx playwright install chromium
   ```

### Environment Variables

Copy the template configuration:
```bash
cp .env.example .env
```

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Runtime environment mode |
| `PORT` | `3001` | Backend API server port |
| `DATABASE_PATH` | `./weblens.db` | Local SQLite database filepath |
| `SCAN_CONCURRENCY_LIMIT` | `3` | Maximum concurrent headless browser workers |
| `SCAN_TIMEOUT_MS` | `30000` | Headless audit timeout in milliseconds |

### Running Locally

Start both the backend API (`http://localhost:3001`) and frontend application (`http://localhost:5173`) concurrently:

```bash
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## Development Commands

All commands can be executed from the repository root:

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Backend API (port 3001) and Frontend (port 5173) concurrently |
| `npm run build` | Compiles TypeScript and builds production bundles for all 5 workspaces |
| `npm run dev:backend` | Starts only the backend API server with watch mode (`tsx watch`) |
| `npm run dev:frontend`| Starts only the frontend Vite development server |
| `npm test` | Executes the complete Playwright E2E and Local-First persistence test suite |
| `npm run test:security` | Executes the 21-check SSRF, evasion, and concurrency attack suite |
| `npm run test:inputs` | Verifies clean empty initial states and placeholders across all forms |
| `npm start` | Runs the compiled backend production server (`node backend/dist/server.js`) |

---

## Developer REST API

WebLens provides a REST API for programmatic audits and integrations.

### 1. Health & Telemetry
```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptimeSeconds": 142,
  "system": {
    "nodeVersion": "v20.12.2",
    "memoryRssMb": 198.45,
    "memoryHeapUsedMb": 74.12
  },
  "workers": {
    "activeScans": 0,
    "queuedScans": 0,
    "maxConcurrency": 3
  },
  "database": {
    "status": "connected",
    "engine": "node:sqlite"
  }
}
```

### 2. Initiate Audit
```http
POST /api/scans
Content-Type: application/json

{
  "url": "https://example.com"
}
```
**Response:**
```json
{
  "scanId": "scan_c6d59b20_18f2",
  "status": "queued",
  "url": "https://example.com/",
  "domain": "example.com",
  "createdAt": "2026-08-16T16:00:00.000Z"
}
```

### 3. Retrieve Report Results
```http
GET /api/scans/scan_c6d59b20_18f2/results
```

---

## Automated Testing Suite

WebLens includes comprehensive automated regression suites:

```bash
# 1. Full E2E & Local-First Suite (7 routes, live scan, IndexedDB validation)
npm test

# 2. Production Security & Hostile SSRF Evasion Suite
npm run test:security

# 3. Form Input State & Placeholder Verification
npm run test:inputs
```

```text
Execution Summary:
  ✔ SSRF Hardening: IPv4-mapped IPv6 loopback blocked
  ✔ SSRF Hardening: Cloud metadata endpoints (169.254.169.254, 100.100.100.200) blocked
  ✔ SSRF Hardening: Restricted ports (22, 6379, 5432, 27017) blocked
  ✔ Concurrency Queue: Drained 6 concurrent scans with maxConcurrency=3
  ✔ Security Headers: nosniff, SAMEORIGIN, HSTS validated
  ✔ E2E: 7 application routes & IndexedDB auto-persistence verified
```

---

## Contributing

Contributions are welcome! To contribute:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch:** `git checkout -b feature/amazing-feature`
3. **Commit your Changes:** `git commit -m 'feat: add amazing feature'`
4. **Verify Quality & Tests:**
   ```bash
   npm run build
   npm run test:security
   npm test
   ```
5. **Push to your Branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**.

---

## License

Distributed under the **MIT License**. See [`package.json`](package.json) for details.

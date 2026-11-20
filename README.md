# 🏢 TerraLedger — Real Estate CRM, Inventory & Post-Sales ERP Suite

> **A modern, local-first & cloud-ready Progressive Web Application (PWA) designed for property developers, builders, channel partners, and modern homebuyers.**

![TerraLedger Banner](public/projects/meridian-heights.webp)

---

## 🌟 Overview

**TerraLedger** bridges the gap between high-velocity sales pipelines, live inventory stacking matrix, and post-sales milestone accounting. Built with **React 19, TypeScript, Vite, and Tailwind CSS**, TerraLedger features an elegant light-gradient UI, full offline PWA capabilities, and dual-mode data persistence (Offline `localStorage` + optional Supabase cloud syncing).

---

## ✨ Key Capabilities & Modules

### 1. 🏛️ Dynamic Projects & Catalogue Publisher
- **Add New Project**: Multi-step builder with property categorization (*Luxury Apartments, Gated Villas, Commercial Hubs, Plotted Developments, Penthouses*).
- **Interactive Geo-Location & Map Pin**: OpenStreetMap integration with live pinpointing and Google Maps connectivity.
- **Batch Inventory Generator**: Instant multi-tower, floor-by-floor unit configuration builder with tiered floor-rise pricing.
- **Visual Galleries & Document Vault**: Media upload, floor plan attachments, and RERA regulatory filings.
- **Draft vs. Publish Controls**: Keep projects in draft mode or publish instantly with unique slug routing.
- **Shareable Links & Printable PDF Catalogues**: Instant public web links for client distribution and one-click formatted PDF export.

### 2. 📊 Live Stacking Matrix & Inventory Grid
- Real-time unit availability visualization (*Available, Blocked, Booked, Sold*).
- One-click unit reservation, hold requests, and manager approval workflows.
- Stacking visualizer across towers, levels, carpet areas, and facing directions.

### 3. 👥 Multi-Role Perspective Switching
Switch roles instantly via the top navigation bar to test complete lifecycle flows:
- **Builder Admin / Sales**: Full portfolio overview, lead assignments, inventory controls, and discount approvals.
- **CRM & Accounts**: Milestone billing, demand letter generation with automated interest calculation, and compliance tracking.
- **Channel Partner (CP) Portal**: Broker client registration, deal tracking, and commission management.
- **Buyer Portal ("My Home")**: Customer post-sales dashboard, construction milestone tracker, and payment ledger receipts.

### 4. 📱 Progressive Web Application (PWA) Ready
- **Offline First**: Installable on Desktop (Chrome, Edge, Safari) and Mobile (iOS / Android).
- Custom Service Worker caching (`public/sw.js`) and high-res Web App Manifest.
- Automatic online/offline network detection with synced status pills.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 7.3.7
- **Styling**: Tailwind CSS with custom light-theme glassmorphism & gradients
- **Icons**: Lucide React
- **Persistence**: Dual-Engine (Local-first `localStorage` with seed fallback + Supabase client)
- **Deployment**: PWA / Static Hosting / Vercel / Netlify / Cloudflare Pages

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0 or later)
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/tech-dev-amit/terraledger.git

# Navigate to project directory
cd terraledger

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## ⚙️ Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with HMR |
| `npm run build` | Compiles TypeScript and creates optimized production bundle in `/dist` |
| `npm run preview` | Locally previews production build |
| `npm run typecheck` | Runs `tsc --noEmit` across all modules |

---

## 🌐 Supabase Integration (Optional)

TerraLedger runs 100% offline out-of-the-box with built-in mock real-estate data. If you want to connect to a live Supabase backend:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the schema migrations located in the Supabase console or migration files.

---

## 📄 License

MIT License © 2026 [tech-dev-amit](https://github.com/tech-dev-amit). All rights reserved.

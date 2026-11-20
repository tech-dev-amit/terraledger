# Project memory

## Product intent & audience

- TerraLedger: B2B SaaS real estate CRM, inventory, and post-sales ERP web app.
- Core modules: dashboards, live inventory grids, lead & booking management, channel partner portal, buyer portal, financial & compliance tracking.
- Audience: real-estate developers, sales teams, channel partners, and buyers.
- Role switcher exists in the shell, implying multi-role access within a single UI.

## Brand personality & voice

- Premium, elegant, minimalistic — "calm fintech" aesthetic.
- Professional and trustworthy; sophisticated but not flashy.
- Product name: TerraLedger.

## Visual design & UX direction

- **Typography:** Inter typeface; tighter headline spacing; uppercase micro-labels for KPIs; larger tabular figures for numbers.
- **Color & surfaces:** softer neutral background; lighter card borders; subtle layered shadows; blue brand accent for icons/manifest; live green pulse indicator for real-time status.
- **Sidebar:** dark pill for active nav item; refined spacing; app's own Lucide icon; polished pill badges; role switcher with pill styling.
- **Cards & inputs:** KPI cards with gentle hover lift; restyled inputs, drawers, badges, and tables.
- **Motion:** subtle fade-up animations; thin unobtrusive scrollbars.
- **Layout:** minimalistic, generous whitespace, production-quality polish.
- **PWA:** installable via manifest (name, colors, blue brand icons); service worker caches app shell/assets for offline; standalone display mode; theme color set; iPhone home-screen icon support.
- **Responsive:** mobile-friendly per PWA requirements.

## Decisions, constraints & rationale

- Stack: Vite + React + JSX, Tailwind CSS, Lucide React icons, React hooks — per template defaults.
- Path alias `@/` → `src/` for imports.
- PWA implemented at app-shell level; live data always fetched fresh when online (service worker only caches shell/assets, not dynamic data).
- Build, type-check, and lint all passing after restyle.
- No visual inspection was done in-environment; sidebar pills and KPI cards flagged for manual review.

## Open questions & assumptions

- Exact brand color palette (hex values) not yet confirmed — blue is referenced but shade unspecified.
- No backend/API integration details known; data layer and auth approach undetermined.
- Multi-role permissions and routing logic not yet documented.
- Accessibility requirements (ARIA, contrast targets, keyboard nav) not explicitly specified.
- Content/copy tone for dashboards, portals, and compliance views not yet defined.
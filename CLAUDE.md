# GPS Dozor - Fleet Management App (Vue)

## Environment Setup
- Always run `nvm use 22` before any node/npm commands
- Node.js 22, npm 10+

## Tech Stack
- **Framework**: Vue 3.5 + TypeScript (Composition API, `<script setup>`)
- **Build**: Vite 7
- **UI Library**: Ant Design Vue 4 (primary component library)
- **Styling**: Tailwind CSS 4 (utility supplement alongside antd)
- **State/Data**: TanStack Vue Query (server state), Vue refs/reactive (local)
- **Routing**: Vue Router 4
- **Maps**: vue3-google-map
- **Charts**: vue-echarts + echarts 6
- **i18n**: vue-i18n (default locale: cs, supported: cs, en)
- **API**: GPS Dozor REST API (Basic Auth over HTTPS)

## Project Structure
```
src/
├── api/          # API client and request functions
│   └── composables/  # Vue Query composables (useVehicles, useTrips, etc.)
├── components/   # Shared/reusable components
│   └── layout/   # App shell, sidebar (AppLayout.vue)
├── composables/  # Custom Vue composables
├── i18n/         # Localization (messages, locale context)
├── router/       # Router configuration
├── stores/       # Shared stores (provideChatStore, etc.)
├── theme/        # Color tokens and theming
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
└── views/        # Page-level components
    ├── ai/         # AI chat panel
    ├── dashboard/  # Fleet overview + live map
    ├── fleet/      # Trip logs, fleet analytics
    ├── health/     # Vehicle sensors, trip economics
    └── map/        # Live map with vehicle tracking
```

## Styling Priority (in order)
1. **Ant Design** — use AntD components and their props (`:body-style`, `:value-style`, `size`, etc.)
2. **Tailwind CSS** — for layout, spacing, and styling not covered by AntD
3. **Inline styles** — only as a last resort, with a documented reason (e.g. dynamic numeric values, AntD API limitation)

## Color System
Colors are centralized — never hardcode hex values in components.

- **Source of truth**: `src/theme/colors.ts` — named semantic tokens (brand, status, severity, accent, muted)
- **Tailwind tokens**: `src/index.css` `@theme` block — same values registered as custom colors, generates utility classes like `bg-brand-primary`, `text-status-active`, `border-severity-critical`
- **AntD theme**: `src/App.vue` `ConfigProvider` — imports from `colors.ts` for `colorPrimary` and component tokens
- **JS usage**: import from `@/theme/colors` when you need hex values in JS (e.g. echarts config, AntD `:value-style`)
- **Template usage**: use Tailwind semantic classes (`bg-status-active`, `text-severity-warning`, etc.)

When adding a new color:
1. Add to `src/theme/colors.ts`
2. Add matching `--color-*` entry in the `@theme` block in `src/index.css`
3. Use the Tailwind class in templates, import from `colors.ts` for JS values

## Skills (`.claude/skills/`)

Follow these skill guides for Vue best practices. Load the relevant skill file based on what you're working on:

| Working on...                | Skill file                                |
| ---------------------------- | ----------------------------------------- |
| `.vue` components            | `.claude/skills/components.md`            |
| Composables (`use*`)         | `.claude/skills/composables.md`           |
| Utility functions            | `.claude/skills/utils-client.md`          |
| Tests (`.spec.ts`)           | `.claude/skills/testing.md`               |
| New features / refactors     | `.claude/skills/feature-workflow/SKILL.md`|
| Before committing            | `.claude/skills/pre-commit-security/SKILL.md` |

### Key rules from skills
- **Components**: Use `<script setup>`, destructure props with defaults (Vue 3.5+), typed emits, `#slot` shorthand, split at 300+ lines
- **Composables**: Check VueUse first, prefix with `use`, return `readonly()` state, handle cleanup, no async composables
- **Utils**: Pure functions only — no refs, no side effects, no API calls
- **Feature workflow**: Plan → divide into testable blocks → get approval → build block-by-block → verify + commit each block → wait for user approval before next
- **Pre-commit**: Scan for secrets before every commit — API keys, credentials, `.env` files

## Conventions
- Use `@/` path alias for imports from `src/`
- Use Ant Design components for UI elements (tables, forms, cards, layout)
- Use Tailwind only for custom spacing, layout utilities, and gaps antd doesn't cover
- All API calls go through `src/api/client.ts`
- Use TanStack Vue Query composables for all server data fetching
- Keep view pages in their respective `views/<name>/` folder
- TypeScript strict mode is enabled
- Use Skeleton loading states, never Spin/spinners
- All user-facing strings must use vue-i18n `t()` function
- Translation keys go in `src/i18n/cs.json` (primary) and `src/i18n/en.json`

## Pre-commit Workflow
Before every commit, run the `/addy-code-reviewer` skill to review all staged changes. Do not commit until the review passes.

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Type-check + production build
- `npm run lint` — ESLint
- `npm run test` — Run unit/component tests (Vitest)
- `npm run test:e2e` — Run E2E tests (Playwright, requires Node 22+)
- `npm run preview` — Preview production build

## API
- Base URL: `https://a1.gpsguard.eu/api/v1`
- Auth: Basic auth (credentials in `.env`)
- Demo credentials available in `.env.example`

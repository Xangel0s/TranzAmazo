# TrazAmazon — Agent Workspace Guide & Standards

Welcome to the **TrazAmazon** project repository. This guide defines conventions, architecture, commands, and rules for AI agents and human developers contributing to this monorepo.

---

## 1. Project Overview
- **Project**: TrazAmazon (Impact Startup Competition 2027 | Desafío: Amazonía Viva)
- **Mission**: Offline-first agricultural traceability platform and B2B marketplace for the Amazon basin (cocoa, shade coffee, Brazil nuts, aguaje) empowering smallholder cooperatives with verified zero-deforestation credentials and experiential agrotourism routes.
- **Repository Type**: Monorepo managed with `pnpm` workspaces.

---

## 2. Monorepo Structure
```
TrazAmazon/
├── artifacts/
│   ├── trazamazon/         # Primary Frontend & PWA prototype (React, Vite, Tailwind CSS, Lucide, Framer Motion)
│   ├── api-server/         # Express API backend server
│   └── mockup-sandbox/     # Isolated UI prototyping canvas
├── lib/
│   ├── api-client-react/   # Generated React Query hooks (Orval)
│   ├── api-spec/           # OpenAPI contracts & codegen configurations
│   ├── api-zod/            # Zod validation schemas
│   └── db/                 # Drizzle ORM PostgreSQL schema & migrations
├── scripts/                # Development and automation helper scripts
├── ARCHITECTURE.md         # Master Architecture & Technical Specification
└── package.json            # Root monorepo configuration
```

---

## 3. Core Development Principles

### Code Principles
- **SOLID**: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- **DRY**: Eliminate duplicate logic by abstracting reusable hooks, utilities, and components.
- **KISS**: Keep It Simple, Avoid Over-engineering, favor clarity over premature optimization.
- **Self-Documenting Code**: Meaningful identifiers, clear prop types, and JSDoc annotations for non-trivial logic.

### Quality & Styling
- Clean TypeScript with strict typing.
- Semantic HTML and accessibility (WCAG AA standards, proper ARIA tags).
- Tailwind CSS with Amazon-inspired color palette (`#1B4332`, `#2D6A4F`, `#B07D3B`, `#FAF6F0`).
- Responsive design: Mobile-first with desktop frames for field application testing.

### Change Management & Safety
- Always confirm code modifications before applying changes.
- Show diffs/previews of proposed changes before implementation.
- Commit changes incrementally with conventional commit messages (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`).
- Never modify files in `/config/`, `/secrets/`, or `.env` directly.
- Whitelist safe commands (`ls`, `cat`, `git status`, `pnpm run ...`). Seek confirmation before running destructive actions.

---

## 4. Key Local Commands
- **Install dependencies**: `pnpm install`
- **Build Frontend App**: `$env:PORT="5173"; $env:BASE_PATH="/"; pnpm --filter @workspace/trazamazon run build`
- **Run Frontend Dev Server**: `$env:PORT="5173"; $env:BASE_PATH="/"; pnpm --filter @workspace/trazamazon run dev`
- **Typecheck across workspace**: `pnpm run typecheck`
- **Run API Server**: `pnpm --filter @workspace/api-server run dev`

---
*Created automatically in accordance with workspace governance rules.*

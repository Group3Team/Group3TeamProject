# CodePlatoon Constitution

<!-- Sync Impact Report -->
<!-- Version Change: 1.0.0 → 1.1.0 (MINOR - new principles added, architecture guidance expanded) -->
<!-- Modified Principles: None replaced; all v1.0.0 principles supplemented with new ones -->
<!-- Added Sections: I Architecture & Stack, II Backend Design Standards, III Frontend Architecture, IV Styling Standards, V Code Quality & Safety, VI Development Environment & DX, VII Project Constraints (Exclusions) -->
<!-- Templates Updated: ✅ plan-template.md (Constitution Check section aligns), ⚠ spec-template.md (no changes needed - generic), ⚠ tasks-template.md (no test-focused template updates required per project exclusions) -->
<!-- Follow-up TODOs: None -->

## Core Principles

### I. Architecture & Stack (NON-NEGOTIABLE)
Monorepo layout with `/backend` (Django Rest Framework) and `/frontend` (React + Vite + JavaScript); PostgreSQL database with PostGIS extension for geospatial data; API-first design where backend exposes complete REST APIs consumed by frontend via fetch or typed clients; Technology stack: Python/Django/DRF, React/Vite/JavaScript, PostgreSQL/PostGIS; GeoDjango spatial index required when using PointField models; No SSR/Next.js—client-side rendering only.

### II. Backend Design Standards
Use DRF ViewSets with clear layering (models → serializers → views → urls); Enable CORS for localhost:5173 and session authentication by default; Enable pagination and filtering on all list endpoints by default; Follow Django conventions for project structure—apps organized by domain, not by type; Database models must avoid unnecessary duplication—use OneToOne and GenericForeignKey relationships instead of separate tables.

### III. Frontend Architecture
Component hierarchy enforced: `primitives/` (Button, Input, Card, Modal) → `composites/` → `features/` → `pages/`; Extract shared logic into custom hooks; Use React Router for client-side routing with nested routes pattern; State management via React Context—prefer single source of truth for shared UI state; All API payloads must have explicit TypeScript or JSDoc interfaces.

### IV. Styling Standards
Single Tailwind configuration file defining spacing, colors, and typography as CSS custom properties (CSS variables); Extract design tokens into centralized stylesheet imports; Reuse utility classes exclusively—no inline styles, no ad-hoc class string construction in JSX; No heavy UI component libraries (MUI, Chakra UI, Ant Design); Leaflet maps used for location-based features.

### V. Code Quality & Safety
JavaScript strict mode enforced across entire frontend codebase; No `any` type usage—explicit interfaces required for all API payloads and component props; Naming conventions: PascalCase for components/classes, camelCase for functions/variables, UPPER_SNAKE_CASE for constants; Backend uses ruff + black for linting/formatting consistency.

### VI. Development Environment & DX
Backend runs on port 8000, frontend proxy at `/api` routes to backend (Vite dev server on port 3000); Linting and formatting: ruff/black (backend), eslint/prettier (frontend) configured in project root; Docker-based development with multi-stage builds; Nginx for production reverse proxy configuration.

### VII. Project Constraints (Exclusions - NON-NEGOTIABLE)
No test files, test frameworks, or testing infrastructure—tests are excluded from this project scope; No SSR/Next.js/Astro—pure client-side React rendering only; No heavy UI component libraries (MUI, Chakra UI, Ant Design); No legacy React patterns—functional components with hooks required; All generated code must reference this constitution file.

### VIII. Governance & Defaults
When design or implementation decisions are ambiguous, default to the most minimal, reusable solution that satisfies requirements; Never duplicate UI components or API endpoint patterns—compose from existing primitives or extend via inheritance/props; Complexity must be justified with explicit business rationale; If a proposed approach conflicts with these principles, flag it before proceeding and document the exception.

## Governance

Constitution supersedes all other practices within this project scope. Amendments require team consensus and must include migration plan if breaking changes are introduced. Versioning follows semantic versioning: MAJOR for backward-incompatible principle removals or redefinitions, MINOR for new principles/sections added or materially expanded guidance, PATCH for clarifications, wording improvements, and non-semantic refinements. Use this constitution as the primary reference for architectural decisions during code review.

**Version**: 1.1.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-05-07

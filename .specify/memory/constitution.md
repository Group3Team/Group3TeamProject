# CodePlatoon Constitution v1.0.0

<!-- Sync Impact Report -->
<!-- Version Change: 0.0.1 → 1.0.0 (Initial project-specific constitution) -->
<!-- Added Principles: Component Reusability, Minimal Architecture -->
<!-- Templates Updated: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md -->
<!-- Follow-up TODOs: None - all placeholders filled -->

## Core Principles

### I. Component Reusability (NON-NEGOTIABLE)
All UI components must be reusable across frontend features; Components should accept props for content/styling rather than hardcoded values; Shared component libraries MUST be extracted to dedicated packages when used in multiple places; Backend serializers and models should follow DRY principle—extract common fields/views into mixins or base classes.

### II. Minimal Architecture
Create as few components/modules as possible while maintaining clarity; Prefer composition over inheritance for reusability; Consolidate related functionality rather than splitting into micro-components; Database models must avoid unnecessary duplication—use OneToOne and GenericForeignKey when appropriate instead of separate tables.

### III. Shared Styling System (NON-NEGOTIABLE)
Establish a single design token system (colors, spacing, typography) used across all components; CSS/SCSS utilities should be centralized in one file or styled-components library; Avoid inline styles—use Tailwind utility classes or CSS-in-JS with theme support; Backend API responses must use consistent JSON structure for nested data.

### IV. Unified State Management
Single state source of truth for shared UI state (user preferences, cart, maps); Prefer React Context over multiple reducers when possible; API state synchronization should follow optimistic updates pattern; All mutations must be tracked through a single action dispatcher to prevent race conditions.

## Technology Stack & Constraints

The application uses Django Rest Framework with PostgreSQL backend and React/Vite frontend. Backend APIs must use RESTful conventions with JSON responses only (no XML or legacy formats). Frontend routing follows React Router nested routes pattern; Docker deployment required for all services; Stripe integration mandatory for payment flows; Leaflet maps for location-based features.

## Development Workflow & Quality Gates

All components MUST be tested against the shared component library before merging; Code reviews must verify reusability—reject PRs with hardcoded values or single-use components without refactoring justification; Performance budgets enforced: frontend bundle size < 200KB gzipped, API response time < 300ms for standard CRUD operations.

## Governance

Constitution supersedes all other practices within this project scope. Amendments require team consensus and must include migration plan if breaking changes introduced. Complexity requires explicit business justification—favor minimal solutions unless features demand otherwise. Use [CODEBASE_REVIEW.md](CODEBASE_REVIEW.md) for runtime development guidance and architectural decisions.

**Version**: 1.0.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-04-28

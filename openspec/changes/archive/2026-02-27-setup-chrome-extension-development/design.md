## Context

The project currently contains only baseline repository files and no extension runtime code. We need a repeatable starting point that contributors can run locally without designing folder conventions and build behavior from scratch each time.

Constraints:
- Target is Google Chrome with Manifest V3.
- Setup must remain lightweight and understandable for new contributors.
- Generated build output must be directly loadable via chrome://extensions in developer mode.

Stakeholders:
- Extension feature developers
- Reviewers validating extension behavior locally

## Goals / Non-Goals

**Goals:**
- Provide a minimal but functional MV3 extension baseline (popup, background, content script).
- Provide deterministic `dev`, `build`, and `package` workflows.
- Establish clear source/output structure and contributor documentation.

**Non-Goals:**
- Implement business features beyond a hello-level extension baseline.
- Support Firefox/Safari compatibility in this change.
- Introduce CI/CD release automation in the initial setup.

## Decisions

### 1) Build strategy
Chosen: Use a modern bundler-based workflow (Vite-based extension setup) for local development and production builds.

Option A: No bundler, plain static files.
- Pros: Minimal dependencies.
- Cons: Poor scalability for multiple entry points and shared code.
- Risks: Manual asset management and fragile growth path.

Option B: Bundler-based setup (chosen).
- Pros: Fast local iteration, structured multi-entry handling, easier future TypeScript adoption.
- Cons: Adds initial tooling complexity.
- Risks: Plugin/tooling compatibility issues with MV3 updates.

### 2) Runtime architecture baseline
Chosen: Include popup UI, background service worker, and content script as separate explicit entry points.

Option A: Popup + background only.
- Pros: Smaller initial surface.
- Cons: Content injection use cases require later structural changes.
- Risks: Follow-up changes become disruptive.

Option B: Include all three entry points from start (chosen).
- Pros: Covers common extension interaction patterns from day one.
- Cons: Slightly more scaffold code.
- Risks: Unused file overhead in early phase.

### 3) Project structure
Chosen: Keep extension sources grouped by runtime role and isolate generated artifacts under a dedicated output directory.

Option A: Flat source layout.
- Pros: Quick to create.
- Cons: Naming collisions and reduced discoverability as files grow.
- Risks: Maintenance cost increases quickly.

Option B: Role-based folders with explicit output boundary (chosen).
- Pros: Clear ownership and easier onboarding.
- Cons: Slightly more directories initially.
- Risks: Over-structuring if project remains tiny (acceptable trade-off).

## Risks / Trade-offs

- [Tooling lock-in] Bundler/plugin choices may influence future migration path -> Mitigation: keep commands and source layout conventional, document assumptions.
- [MV3 policy shifts] Browser policy updates can affect background/content behavior -> Mitigation: isolate manifest/runtime config and keep versions explicit.
- [Onboarding ambiguity] New contributors may still struggle with extension loading steps -> Mitigation: provide step-by-step local run and troubleshooting docs.

## Migration Plan

1. Add extension scaffold and local scripts behind non-breaking file additions.
2. Validate local install flow on Chrome developer mode using generated build output.
3. Merge after documentation is confirmed, with no impact on existing runtime code (none exists today).

Rollback strategy:
- Revert the change commit(s) to remove scaffold and restore repository to pre-extension baseline.

## Open Questions

- Should TypeScript be mandatory in initial setup or deferred until first feature implementation?
- Do we need environment-specific manifest overrides (dev/prod) in this first iteration?

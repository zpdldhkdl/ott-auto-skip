## Why

The repository currently has no executable Chrome extension baseline, which blocks feature development and testing. Setting up a standard Manifest V3 development foundation now reduces onboarding friction and prevents inconsistent ad-hoc setup later.

## What Changes

- Add a minimal Manifest V3 Chrome extension scaffold with a popup page, background service worker, and content script entry point.
- Introduce a local development workflow for installable build output, watch mode, and production packaging.
- Establish project conventions for directory layout, scripts, and environment assumptions for extension development.
- Add documentation for setup, local run flow, and common troubleshooting for first-time contributors.

## Capabilities

### New Capabilities
- `chrome-extension-scaffold`: Provides a working Manifest V3 extension baseline that can be loaded in Chrome immediately.
- `extension-development-workflow`: Provides deterministic local build/watch/package commands and contributor-facing setup guidance.

### Modified Capabilities
- None.

## Impact

- New extension source directories (manifest, popup, background, content script, shared assets).
- Build and packaging configuration, plus dependency/tooling additions in project config files.
- Developer documentation updates in README and/or dedicated setup docs.
- No external runtime API contract changes expected; this is a foundational internal setup change.

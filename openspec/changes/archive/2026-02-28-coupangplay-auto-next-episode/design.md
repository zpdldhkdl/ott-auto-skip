## Context

The extension currently runs a Netflix-focused automation loop and already has persisted toggles for master enable and next-episode auto click. Coupang Play is not covered by manifest matches or button-detection logic, so users must manually click "다음화 재생하기" after each episode.

Coupang Play's UI can be dynamic (class hashes and delayed rendering), so selector-only detection is brittle. The user-provided prototype demonstrates three complementary signals: container mutation, video ended event, and periodic polling fallback.

## Goals / Non-Goals

**Goals:**
- Add reliable Coupang Play next-episode automation using a resilient, multi-signal detection strategy.
- Reuse existing global settings gates (master + next episode) for consistent extension behavior.
- Avoid duplicate clicks and release observers/timers after successful action.
- Keep Netflix behavior unchanged.

**Non-Goals:**
- Introduce a dedicated Coupang Play toggle in popup UI for this change.
- Add Coupang Play intro/recap skip in this change.
- Support non-Korean button labels beyond current Coupang Play text target.

## Decisions

### Decision 1: Add host-aware platform logic in content script
- Choice: Branch behavior by hostname and route to platform-specific scanners.
- Rationale: Existing code is Netflix-centric. Host-aware routing allows adding Coupang logic without weakening Netflix selectors.
- Alternatives considered:
  - Single unified selector table for all platforms: rejected because Coupang needs event orchestration and visibility semantics not shared by Netflix.
  - Separate content script file per platform: rejected to minimize manifest/script complexity for this scope.

### Decision 2: Use text + stable container strategy for next button detection
- Choice: Prefer `.buttons-bottom button` with exact text match `다음화 재생하기`, then fallback to global button text scan.
- Rationale: Class hashes are unstable; text plus known structural anchor is more resilient.
- Alternatives considered:
  - Rely only on class selectors: rejected due DOM hash churn.
  - Rely only on global text scan: rejected because it increases false-positive risk.

### Decision 3: Use three detection signals with shared click guard
- Choice: Combine MutationObserver (container visibility changes), `video ended` callbacks (delayed retries), and periodic polling.
- Rationale: Any single signal can miss real-world timing edges; combined signals improve reliability.
- Alternatives considered:
  - Polling only: rejected due slower response and unnecessary overhead.
  - Observer only: rejected because container may not exist at observer start or visibility changes may be missed.

### Decision 4: Enforce safe-click constraints and lifecycle cleanup
- Choice: Click only when button exists, is enabled, and container is visible; lock with per-transition `clicked` state; cleanup observer/listeners/timers after click.
- Rationale: Prevents duplicate clicks and reduces long-lived DOM observers.
- Alternatives considered:
  - Keep observers running indefinitely: rejected due resource overhead and duplicate-trigger risk.

## Risks / Trade-offs

- [Korean label string changes in Coupang UI] -> Mitigation: keep detection layered (container-first + global fallback) and centralize target label constant for quick updates.
- [Visibility heuristic mismatch (`opacity`-based check may be incomplete)] -> Mitigation: include computed visibility checks and polling fallback before giving up.
- [Extra polling overhead] -> Mitigation: use low-frequency interval and terminate loop immediately after successful click.
- [Cross-platform regression risk in shared content script] -> Mitigation: isolate Coupang path behind hostname checks and preserve existing Netflix selectors/tests.

## Migration Plan

1. Extend `manifest.json` content-script match patterns to include Coupang Play domains.
2. Refactor `src/content/index.js` into host-aware execution paths:
   - retain existing Netflix scan path
   - add Coupang next-episode tracker with observer/ended/polling orchestration
3. Reuse existing setting gates (`autoSkipEnabled`, `skipNextEpisodeEnabled`) before any Coupang click.
4. Validate manually on both Netflix and Coupang Play playback pages.
5. Rollback plan: remove Coupang host matches and disable Coupang branch if unexpected side effects occur.

## Open Questions

- Should we add a dedicated Coupang Play ON/OFF toggle in popup in a follow-up change?
- Should we support additional label variants (for A/B tests or localization) beyond `다음화 재생하기`?

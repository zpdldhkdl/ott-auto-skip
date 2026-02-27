## Context

The project already includes a Manifest V3 extension scaffold (popup/background/content), but it does not yet implement user-facing skip automation. The first functional slice requires Netflix-specific skip click automation plus user controls and localized UI.

Constraints:
- Target Netflix domains only for this change.
- Preserve backward compatibility with default enabled behavior.
- Keep logic lightweight and safe for dynamic player DOM updates.

## Goals / Non-Goals

**Goals:**
- Auto-click intro/recap skip elements when configured toggles are enabled.
- Provide popup settings for master/intro/recap toggle control.
- Persist settings across sessions.
- Provide localized UI strings for `en`, `ko`, `ja`, `zh_CN`.

**Non-Goals:**
- Support other streaming platforms in this change.
- Add advanced skip heuristics beyond the two specified `data-uia` selectors.
- Add CI automation for browser E2E tests.

## Decisions

### 1) DOM detection strategy
Chosen: `MutationObserver` plus selector scan on each relevant mutation.

Option A: Polling timer.
- Pros: Easy implementation.
- Cons: Constant overhead even when no DOM updates happen.
- Risks: Unnecessary CPU usage during playback.

Option B: MutationObserver (chosen).
- Pros: Event-driven and lower idle overhead.
- Cons: Needs careful filtering to avoid repeated clicks.
- Risks: Burst updates in player DOM.

### 2) Settings model
Chosen: `chrome.storage.sync` with defaults (`master=true`, `intro=true`, `recap=true`).

Option A: In-memory settings.
- Pros: Simple.
- Cons: Lost on reload/restart.
- Risks: Inconsistent user experience.

Option B: chrome.storage.sync (chosen).
- Pros: Persistent and extension-native.
- Cons: Async reads/writes.
- Risks: Delayed initial settings load.

### 3) Localization strategy
Chosen: Chrome `_locales` + `chrome.i18n`.

Option A: Popup-local translation object.
- Pros: Fast to wire.
- Cons: Not extension-standard, harder manifest localization.
- Risks: Translation drift.

Option B: Chrome i18n (chosen).
- Pros: Standard behavior with locale fallback.
- Cons: Separate message files required.
- Risks: Missing key runtime fallback handling.

## Risks / Trade-offs

- [Netflix DOM changes] Selector keys may change → Mitigation: isolate selectors as constants and document update points.
- [Repeated click loops] Rapid mutation events may click too often → Mitigation: mark handled elements and guard by settings.
- [Settings race on startup] Early mutations before settings load → Mitigation: load defaults first, then hydrate async state.
- [Locale key gaps] Missing translation keys produce raw identifiers → Mitigation: centralize keys and keep English fallback complete.

## Migration Plan

1. Add localization files and popup text binding.
2. Add persisted settings model and popup toggles.
3. Add Netflix-only content script selector matching and click engine.
4. Update manifest and documentation.
5. Validate build and load-unpacked behavior.

Rollback strategy:
- Revert this change commit to restore scaffold-only behavior.

## Open Questions

- None for this increment.

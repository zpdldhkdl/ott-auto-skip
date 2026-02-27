## 1. Netflix Skip Engine

- [x] 1.1 Add selector constants and default setting model for master/intro/recap toggles.
- [x] 1.2 Implement content script observer that detects `player-skip-intro` and `player-skip-recap` elements.
- [x] 1.3 Implement guarded click execution that respects master and per-feature toggles.

## 2. Popup Controls and Persistence

- [x] 2.1 Add popup UI controls for master, intro, and recap toggle states.
- [x] 2.2 Wire popup events to `chrome.storage.sync` and load persisted values on open.
- [x] 2.3 Reflect master OFF state in UI and runtime behavior without deleting per-feature settings.

## 3. Localization

- [x] 3.1 Add `_locales/en/messages.json` fallback keys for all popup labels and status text.
- [x] 3.2 Add localized messages for Korean, Japanese, and Simplified Chinese.
- [x] 3.3 Bind popup label rendering through `chrome.i18n` keys.

## 4. Manifest and Docs

- [x] 4.1 Restrict content script match scope to Netflix domains and set default locale.
- [x] 4.2 Update README with new skip controls, locale support, and usage guidance.
- [x] 4.3 Build and package extension artifacts to confirm no manifest/runtime build regressions.

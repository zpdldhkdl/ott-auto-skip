## Why

The extension currently has only a baseline scaffold and cannot automatically skip intro or recap overlays in Netflix playback. We need this now to deliver the first real end-user behavior with user-controlled toggles and localized UI.

## What Changes

- Add Netflix-targeted auto-skip behavior for elements that match `data-uia="player-skip-intro"` and `data-uia="player-skip-recap"`.
- Add popup controls for `Master ON/OFF`, `Intro Skip`, and `Recap Skip`, with persisted settings.
- Add Chrome extension localization resources for English, Korean, Japanese, and Simplified Chinese.
- Restrict content script matching scope to Netflix domains to reduce unintended interactions.

## Capabilities

### New Capabilities
- `netflix-auto-skip-engine`: Detects and clicks Netflix intro/recap skip elements based on `data-uia` selectors and user settings.
- `skip-control-popup-settings`: Provides popup UI to toggle master/intro/recap behavior independently.
- `extension-localization`: Provides localized UI strings in `en`, `ko`, `ja`, and `zh_CN` via Chrome i18n.

### Modified Capabilities
- None.

## Impact

- Content script logic, popup UI logic, and manifest matching rules will be updated.
- New `_locales` message files will be added for four languages.
- README usage documentation will be updated for new controls and localization support.
- Existing baseline behavior remains backward-compatible by defaulting all skip settings to enabled.

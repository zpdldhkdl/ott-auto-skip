## Why

The extension currently automates Netflix skip actions, but Coupang Play users still need to click "다음화 재생하기" manually at every episode boundary. This change adds reliable Coupang Play next-episode automation now, using a resilient strategy that tolerates dynamic DOM and delayed button rendering.

## What Changes

- Add Coupang Play support for automatically clicking the "다음화 재생하기" button when it becomes actionable.
- Add host-aware detection logic that combines mutation observation, video `ended` signal, and periodic fallback scans.
- Add visibility and deduplication guards so clicks happen only when the button is interactable and only once per episode transition.
- Expand content script match scope to include Coupang Play playback pages while preserving existing Netflix behavior.

## Capabilities

### New Capabilities
- `coupangplay-next-episode-automation`: Detects and auto-clicks Coupang Play's next-episode action with multi-signal fallback and safe click guards.

### Modified Capabilities
- None.

## Impact

- Affected code: `src/content/index.js` (platform-specific detection/click pipeline), `src/manifest.json` (content script match patterns).
- No external dependencies or remote APIs.
- Existing Netflix intro/recap/next-episode behavior remains backward-compatible.

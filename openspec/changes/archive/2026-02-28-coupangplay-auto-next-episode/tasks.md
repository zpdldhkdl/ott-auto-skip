## 1. Manifest and Platform Routing

- [x] 1.1 Update `src/manifest.json` content script `matches` to include Coupang Play domains in addition to existing Netflix domains.
- [x] 1.2 Add hostname/platform routing in `src/content/index.js` so Netflix logic and Coupang Play logic execute in isolated paths.

## 2. Coupang Play Next Episode Automation

- [x] 2.1 Implement Coupang Play next-button discovery using `.buttons-bottom` first and global button text fallback for `다음화 재생하기`.
- [x] 2.2 Implement actionable-state checks (visible + enabled) and a one-click guard to prevent duplicate clicks per transition.
- [x] 2.3 Implement multi-signal trigger flow: container mutation observer, `video ended` delayed retries, and interval polling fallback.
- [x] 2.4 Add lifecycle cleanup to stop observer/event listeners/timers immediately after successful click.
- [x] 2.5 Gate all Coupang Play clicks with existing `autoSkipEnabled` and `skipNextEpisodeEnabled` settings.

## 3. Validation and Regression Checks

- [ ] 3.1 Validate on Coupang Play playback that the next episode button is auto-clicked at episode end.
- [ ] 3.2 Validate disabled cases: master OFF and next-episode OFF must block Coupang Play auto-click.
- [ ] 3.3 Re-validate Netflix intro/recap/next-episode behavior to ensure no regressions from host-aware refactor.

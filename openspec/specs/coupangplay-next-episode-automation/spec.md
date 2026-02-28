## ADDED Requirements

### Requirement: Coupang Play next episode button MUST be auto-clicked when actionable
The system MUST detect and click the Coupang Play "다음화 재생하기" button when it is present, enabled, and visible.

#### Scenario: Click next episode button when shown
- **WHEN** playback reaches episode end and a visible, enabled "다음화 재생하기" button appears
- **THEN** the extension clicks the button automatically

### Requirement: Detection MUST use multi-signal fallback
The system MUST combine DOM mutation observation, video `ended` signal retries, and periodic polling to avoid missing delayed button rendering.

#### Scenario: Mutation path catches visibility transition
- **WHEN** the next-episode container becomes visible through DOM attribute/style changes
- **THEN** the extension attempts the click immediately

#### Scenario: Ended-event path catches delayed rendering
- **WHEN** the video `ended` event fires before the next-episode button is rendered
- **THEN** the extension retries click attempts after short delays until the button becomes actionable

### Requirement: Automation MUST avoid duplicate or invalid clicks
The system SHALL click at most once per episode transition and MUST ignore hidden or disabled button states.

#### Scenario: Prevent duplicate click after success
- **WHEN** a successful click has already been executed for the current transition
- **THEN** additional observer/polling/event triggers do not click again and tracking is cleaned up

#### Scenario: Hidden or disabled button is ignored
- **WHEN** a matching button exists but is hidden or disabled
- **THEN** the extension does not click until the button becomes actionable

### Requirement: Coupang Play automation MUST respect existing skip settings
The system MUST gate Coupang Play next-episode automation behind existing master and next-episode settings.

#### Scenario: Master toggle off
- **WHEN** master auto-skip setting is OFF
- **THEN** Coupang Play next-episode button is not auto-clicked

#### Scenario: Next episode toggle off
- **WHEN** next-episode setting is OFF
- **THEN** Coupang Play next-episode button is not auto-clicked

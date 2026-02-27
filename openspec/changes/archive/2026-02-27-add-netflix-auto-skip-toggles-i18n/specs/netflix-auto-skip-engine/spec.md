## ADDED Requirements

### Requirement: Netflix intro and recap skip elements must be auto-clicked
The system MUST detect and click DOM elements matching `data-uia="player-skip-intro"` and `data-uia="player-skip-recap"` on Netflix pages when corresponding settings are enabled.

#### Scenario: Intro skip auto-click
- **WHEN** a Netflix page contains an element with `data-uia="player-skip-intro"` and intro skip is enabled
- **THEN** the extension clicks that element automatically

#### Scenario: Recap skip auto-click
- **WHEN** a Netflix page contains an element with `data-uia="player-skip-recap"` and recap skip is enabled
- **THEN** the extension clicks that element automatically

### Requirement: Master toggle must stop all automatic skip clicks
The system SHALL suppress all skip-click automation when the master toggle is disabled, regardless of individual intro/recap toggle states.

#### Scenario: Master OFF blocks all clicks
- **WHEN** master toggle is OFF and a matching intro or recap selector appears
- **THEN** the extension does not click either element

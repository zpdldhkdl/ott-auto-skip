## ADDED Requirements

### Requirement: Popup must provide three skip toggles
The system MUST expose controls for master ON/OFF, intro skip ON/OFF, and recap skip ON/OFF in the extension popup.

#### Scenario: User updates intro toggle
- **WHEN** the user turns intro skip OFF in popup
- **THEN** the new value is saved and subsequent intro elements are not auto-clicked

### Requirement: Toggle settings must persist
The system SHALL persist all toggle settings across popup reopen, tab reload, and browser restart.

#### Scenario: Persisted settings on reopen
- **WHEN** the user changes one or more toggles and reopens popup later
- **THEN** popup reflects the previously saved values

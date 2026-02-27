## ADDED Requirements

### Requirement: Popup labels must be localized in four languages
The system MUST provide popup UI messages in English, Korean, Japanese, and Simplified Chinese.

#### Scenario: Korean browser locale
- **WHEN** browser locale is Korean
- **THEN** popup title, toggle labels, and status text are rendered in Korean

#### Scenario: Japanese browser locale
- **WHEN** browser locale is Japanese
- **THEN** popup title, toggle labels, and status text are rendered in Japanese

#### Scenario: Simplified Chinese browser locale
- **WHEN** browser locale is Simplified Chinese
- **THEN** popup title, toggle labels, and status text are rendered in Simplified Chinese

### Requirement: Fallback behavior must remain usable
The system SHALL provide complete English messages as fallback when a specific locale entry is unavailable.

#### Scenario: Unsupported locale fallback
- **WHEN** browser locale is not one of `en`, `ko`, `ja`, `zh_CN`
- **THEN** popup UI text is shown in English fallback strings

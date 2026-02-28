# 🎬 OTT Auto Skip

> A Chrome extension that automatically clicks intro, recap, and next-episode buttons on your favorite OTT streaming platforms — so you can binge smarter, not harder.

---

## ✨ Overview

Tired of repeatedly clicking "Skip Intro", "Skip Recap", or "Next Episode" every single episode? **OTT Auto Skip** is a lightweight Chrome extension designed to detect and automatically dismiss those repetitive prompts on OTT (Over-The-Top) streaming services.

Whether you're binge-watching a K-drama marathon, catching up on the latest Netflix series, or powering through a Disney+ backlog, this extension has your back. It monitors the DOM for skip buttons and clicks them for you — instantly, quietly, and reliably.

## 🚀 Features

- **Netflix Intro Auto Skip** — Detects and clicks elements that match `data-uia="player-skip-intro"`.
- **Netflix Recap Auto Skip** — Detects and clicks elements that match `data-uia="player-skip-recap"`.
- **Netflix Next Episode Auto Click** — Detects and clicks elements that match `data-uia="next-episode-seamless-button"`.
- **Four Toggle Controls** — Popup provides `Master ON/OFF`, `Intro Skip`, `Recap Skip`, and `Next Episode Auto Click`.
- **Persistent Settings** — Toggle values are stored via extension storage and restored on reopen.
- **Localized UI** — Popup labels and status text are localized for English, Korean, Japanese, and Simplified Chinese.
- **Privacy First** — No external data collection or remote calls for skip behavior.

## 🎯 Supported Platforms

| Platform | Intro Skip | Recap Skip | Next Episode |
|----------|:----------:|:----------:|:------------:|
| Netflix | ✅ | ✅ | ✅ |
| Disney+ | ❌ | ❌ | ❌ |
| Wavve | ❌ | ❌ | ❌ |
| Tving | ❌ | ❌ | ❌ |
| Coupang Play | ❌ | ❌ | ✅ |

> 💡 More platforms will be added over time. Feel free to open an issue or PR to request support for a specific service!

## 📦 Installation

### From Chrome Web Store
1. Visit the Chrome Web Store listing: [OTT Auto Skip](https://chromewebstore.google.com/detail/ott-auto-skip/kmalngohphaicdghjkmamdeaknpecedk)
2. Click **"Add to Chrome"**.
3. Done! The extension will start working automatically.

### Local Development Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/zpdldhkdl/ott-auto-skip.git
   cd ott-auto-skip
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build extension assets:
   ```bash
   npm run build
   ```
4. Optional watch mode for iterative development:
   ```bash
   npm run dev
   ```
5. Optional package output for sharing/review:
   ```bash
   npm run package
   ```

### Icon Generation
Generate Chrome extension icon assets (`png`, 16/32/48/128) from `images/logo.svg`:
```bash
npm run icons
```

### Build and Release with Makefile
```bash
make build      # icons + extension build
make package    # icons + package to release/unpacked
make zip        # create release/ott-auto-skip-v<version>.zip
make release    # alias of zip with output message
```

### Load Unpacked (Chrome)
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select one of the following directories:
   - `dist/` (from `npm run build`)
   - `release/unpacked/` (from `npm run package`)
5. Verify extension install succeeds and popup opens from the toolbar icon.

## 🛠️ Current Behavior

- Content script runs only on Netflix domains.
- Matching intro/recap overlays and next-episode seamless buttons are auto-clicked when enabled.
- Popup toggles:
  - `Enable Auto Skip` (master)
  - `Skip Intro`
  - `Skip Recap`
  - `Auto Click Next Episode`
- Supported locales:
  - `en`
  - `ko`
  - `ja`
  - `zh_CN`

## 🧩 Project Structure

```
ott-auto-skip/
├── src/
│   ├── manifest.json
│   ├── shared/
│   │   └── settings.js
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.js
│   │   └── style.css
│   ├── background/
│   │   └── index.js
│   └── content/
│       └── index.js
├── scripts/
│   └── package-extension.mjs
├── _locales/
│   ├── en/messages.json
│   ├── ko/messages.json
│   ├── ja/messages.json
│   └── zh_CN/messages.json
├── vite.config.mjs
├── package.json
└── README.md
```

## 🧯 Troubleshooting

- **`npm install` fails with network errors**
  - Check proxy/firewall settings and verify access to `https://registry.npmjs.org`.
- **Chrome says manifest is invalid**
  - Re-run `npm run build` and confirm `dist/manifest.json` exists.
- **Popup does not open**
  - Verify the loaded directory is `dist/` or `release/unpacked/`, not repository root.
- **Content script does not appear on a page**
  - Reload the extension in `chrome://extensions/` and refresh the target tab.

---

<p align="center">
  Made with ❤️ for binge-watchers everywhere.
  <br>
  <strong>Stop clicking. Start watching.</strong>
</p>

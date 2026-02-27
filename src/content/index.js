const SETTING_KEYS = {
  MASTER: 'autoSkipEnabled',
  INTRO: 'skipIntroEnabled',
  RECAP: 'skipRecapEnabled',
  NEXT_EPISODE: 'skipNextEpisodeEnabled',
  NETFLIX_ENABLED: 'netflixEnabled',
};

const DEFAULT_SKIP_SETTINGS = Object.freeze({
  [SETTING_KEYS.MASTER]: true,
  [SETTING_KEYS.INTRO]: true,
  [SETTING_KEYS.RECAP]: true,
  [SETTING_KEYS.NEXT_EPISODE]: true,
  [SETTING_KEYS.NETFLIX_ENABLED]: true,
});

const CLICK_TARGETS = [
  {
    selector: '[data-uia="player-skip-intro"]',
    settingKey: SETTING_KEYS.INTRO,
  },
  {
    selector: '[data-uia="player-skip-recap"]',
    settingKey: SETTING_KEYS.RECAP,
  },
  {
    selector: '[data-uia="next-episode-seamless-button"]',
    settingKey: SETTING_KEYS.NEXT_EPISODE,
  },
];

const OBSERVED_ATTRIBUTES = ['class', 'style', 'hidden', 'aria-hidden', 'data-uia'];
const CLICK_RETRY_WINDOW_MS = 600;
const PERIODIC_SCAN_MS = 400;

const SETTINGS_KEYS = [
  SETTING_KEYS.MASTER,
  SETTING_KEYS.NETFLIX_ENABLED,
  SETTING_KEYS.INTRO,
  SETTING_KEYS.RECAP,
  SETTING_KEYS.NEXT_EPISODE,
];

let currentSettings = { ...DEFAULT_SKIP_SETTINGS };
const handledAtMap = new WeakMap();
let fullScanScheduled = false;

function toBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
}

function normalizeSettings(input) {
  return {
    [SETTING_KEYS.MASTER]: toBoolean(input?.[SETTING_KEYS.MASTER], DEFAULT_SKIP_SETTINGS[SETTING_KEYS.MASTER]),
    [SETTING_KEYS.INTRO]: toBoolean(input?.[SETTING_KEYS.INTRO], DEFAULT_SKIP_SETTINGS[SETTING_KEYS.INTRO]),
    [SETTING_KEYS.RECAP]: toBoolean(input?.[SETTING_KEYS.RECAP], DEFAULT_SKIP_SETTINGS[SETTING_KEYS.RECAP]),
    [SETTING_KEYS.NEXT_EPISODE]: toBoolean(
      input?.[SETTING_KEYS.NEXT_EPISODE],
      DEFAULT_SKIP_SETTINGS[SETTING_KEYS.NEXT_EPISODE],
    ),
    [SETTING_KEYS.NETFLIX_ENABLED]: toBoolean(
      input?.[SETTING_KEYS.NETFLIX_ENABLED],
      DEFAULT_SKIP_SETTINGS[SETTING_KEYS.NETFLIX_ENABLED],
    ),
  };
}

function getSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(DEFAULT_SKIP_SETTINGS, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(normalizeSettings(items));
    });
  });
}

function canClickFor(settingKey) {
  if (!currentSettings[SETTING_KEYS.MASTER]) {
    return false;
  }

  // If we are operating on Netflix, both Master and Netflix toggle must be enabled
  if (!currentSettings[SETTING_KEYS.NETFLIX_ENABLED]) {
    return false;
  }

  if (typeof settingKey !== 'string') {
    return true;
  }

  return currentSettings[settingKey];
}

function shouldSkipClick(element) {
  if (!element.isConnected) {
    return true;
  }

  if (element.getClientRects().length === 0) {
    return true;
  }

  const handledAt = handledAtMap.get(element);
  if (typeof handledAt === 'number' && Date.now() - handledAt < CLICK_RETRY_WINDOW_MS) {
    return true;
  }

  return false;
}

function clickIfNeeded(element, settingKey) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  if (!canClickFor(settingKey) || shouldSkipClick(element)) {
    return;
  }

  handledAtMap.set(element, Date.now());
  element.click();
}

function scanRoot(root) {
  CLICK_TARGETS.forEach(({ selector, settingKey }) => {
    if (!canClickFor(settingKey)) {
      return;
    }

    const elements = [];

    if (root instanceof Element && root.matches(selector)) {
      elements.push(root);
    }

    if ('querySelectorAll' in root) {
      root.querySelectorAll(selector).forEach((element) => {
        elements.push(element);
      });
    }

    elements.forEach((element) => {
      clickIfNeeded(element, settingKey);
    });
  });
}

function scanShadowRoots() {
  document.querySelectorAll('*').forEach((host) => {
    if (host.shadowRoot) {
      scanRoot(host.shadowRoot);
    }
  });
}

function scanDocument() {
  scanRoot(document);
  scanShadowRoots();
}

function scanNode(node) {
  if (!(node instanceof Element)) {
    return;
  }

  scanRoot(node);
  if (node.shadowRoot) {
    scanRoot(node.shadowRoot);
  }
}

function scheduleFullScan() {
  if (fullScanScheduled) {
    return;
  }

  fullScanScheduled = true;
  requestAnimationFrame(() => {
    fullScanScheduled = false;
    scanDocument();
  });
}

function handleStorageChanged(changes, areaName) {
  if (areaName !== 'sync') {
    return;
  }

  let hasRelevantChange = false;

  const nextSettings = { ...currentSettings };

  SETTINGS_KEYS.forEach((key) => {
    const changed = changes[key];
    if (!changed) {
      return;
    }

    hasRelevantChange = true;
    nextSettings[key] = changed.newValue;
  });

  if (hasRelevantChange) {
    currentSettings = normalizeSettings(nextSettings);
    scheduleFullScan();
  }
}

function handleMutations(mutations) {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes') {
      scanNode(mutation.target);
      return;
    }

    mutation.addedNodes.forEach((node) => {
      scanNode(node);
    });
  });

  scheduleFullScan();
}

function startObserver() {
  if (!document.documentElement) {
    return;
  }

  const observer = new MutationObserver(handleMutations);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: OBSERVED_ATTRIBUTES,
  });
}

async function initialize() {
  startObserver();
  scheduleFullScan();

  setInterval(() => {
    scanDocument();
  }, PERIODIC_SCAN_MS);

  try {
    currentSettings = await getSettings();
  } catch (error) {
    if (error instanceof Error) {
      console.warn('[ott-auto-skip] failed to load settings, fallback to defaults', error.message);
    }
  }

  chrome.storage.onChanged.addListener(handleStorageChanged);
  scheduleFullScan();
}

initialize().catch((error) => {
  if (error instanceof Error) {
    console.error('[ott-auto-skip] failed to initialize content script', error.message);
  }
});

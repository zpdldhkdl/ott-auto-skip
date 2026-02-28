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

const NETFLIX_CLICK_TARGETS = [
  {
    selector: '[data-uia="player-skip-intro"]',
    settingKey: SETTING_KEYS.INTRO,
  },
  {
    selector: '[data-uia="player-skip-recap"]',
    settingKey: SETTING_KEYS.RECAP,
  },
  {
    selector: '[data-uia^="next-episode-seamless-button"]',
    settingKey: SETTING_KEYS.NEXT_EPISODE,
  },
];

const NETFLIX_OBSERVED_ATTRIBUTES = ['class', 'style', 'hidden', 'aria-hidden', 'data-uia'];
const NETFLIX_CLICK_RETRY_WINDOW_MS = 600;
const NETFLIX_PERIODIC_SCAN_MS = 200;

const COUPANG_NEXT_BUTTON_TEXT = '다음화 재생하기';
const COUPANG_CONTAINER_SELECTOR = '.buttons-bottom';
const COUPANG_CONTAINER_OBSERVED_ATTRIBUTES = ['class', 'style', 'hidden', 'aria-hidden'];
const COUPANG_POLL_INTERVAL_MS = 1000;
const COUPANG_CLICK_RETRY_WINDOW_MS = 2000;
const COUPANG_RESTART_TRACKING_DELAY_MS = 4000;
const COUPANG_ENDED_RETRY_DELAYS_MS = [500, 1500, 3000];

const SETTINGS_KEYS = [
  SETTING_KEYS.MASTER,
  SETTING_KEYS.NETFLIX_ENABLED,
  SETTING_KEYS.INTRO,
  SETTING_KEYS.RECAP,
  SETTING_KEYS.NEXT_EPISODE,
];

let currentSettings = { ...DEFAULT_SKIP_SETTINGS };
const handledAtMap = new WeakMap();
let netflixObserver = null;
let netflixPollTimer = null;
let netflixFullScanScheduled = false;

const coupangState = {
  containerObserver: null,
  observedContainer: null,
  pollTimer: null,
  videoElement: null,
  videoEndedHandler: null,
  restartTimer: null,
  lastClickedAt: 0,
};

function isNetflixPage() {
  const { hostname } = window.location;
  return hostname === 'netflix.com' || hostname.endsWith('.netflix.com');
}

function isCoupangPlayPage() {
  const { hostname } = window.location;
  return hostname === 'coupangplay.com' || hostname.endsWith('.coupangplay.com');
}

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

function isMasterEnabled() {
  return Boolean(currentSettings[SETTING_KEYS.MASTER]);
}

function isNetflixEnabled() {
  return isMasterEnabled() && Boolean(currentSettings[SETTING_KEYS.NETFLIX_ENABLED]);
}

function canClickNetflix(settingKey) {
  if (!isNetflixEnabled()) {
    return false;
  }

  if (typeof settingKey !== 'string') {
    return true;
  }

  return Boolean(currentSettings[settingKey]);
}

function canClickCoupangNextEpisode() {
  return isMasterEnabled() && Boolean(currentSettings[SETTING_KEYS.NEXT_EPISODE]);
}

function wasHandledRecently(element, retryWindowMs) {
  const handledAt = handledAtMap.get(element);
  return typeof handledAt === 'number' && Date.now() - handledAt < retryWindowMs;
}

function shouldSkipNetflixClick(element) {
  if (!element.isConnected) {
    return true;
  }

  if (element.getClientRects().length === 0) {
    return true;
  }

  if (wasHandledRecently(element, NETFLIX_CLICK_RETRY_WINDOW_MS)) {
    return true;
  }

  return false;
}

function clickNetflixIfNeeded(element, settingKey) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (!canClickNetflix(settingKey) || shouldSkipNetflixClick(element)) {
    return false;
  }

  handledAtMap.set(element, Date.now());
  element.click();
  return true;
}

function scanNetflixRoot(root) {
  let clicked = false;

  NETFLIX_CLICK_TARGETS.forEach(({ selector, settingKey }) => {
    if (!canClickNetflix(settingKey)) {
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
      if (clickNetflixIfNeeded(element, settingKey)) {
        clicked = true;
      }
    });
  });

  return clicked;
}

function scanNetflixDocument() {
  scanNetflixRoot(document);
}

function scanNetflixNode(node) {
  if (!(node instanceof Element)) {
    return false;
  }

  return scanNetflixRoot(node);
}

function scheduleNetflixFullScan() {
  if (netflixFullScanScheduled) {
    return;
  }

  netflixFullScanScheduled = true;
  requestAnimationFrame(() => {
    netflixFullScanScheduled = false;
    scanNetflixDocument();
  });
}

function handleNetflixMutations(mutations) {
  let clicked = false;

  for (const mutation of mutations) {
    if (mutation.type === 'attributes') {
      clicked = scanNetflixNode(mutation.target) || clicked;
    } else {
      for (const node of mutation.addedNodes) {
        clicked = scanNetflixNode(node) || clicked;
      }
    }
  }

  if (!clicked) {
    scheduleNetflixFullScan();
  }
}

function startNetflixAutomation() {
  if (!document.documentElement) {
    return;
  }

  if (!netflixObserver) {
    netflixObserver = new MutationObserver(handleNetflixMutations);
    netflixObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: NETFLIX_OBSERVED_ATTRIBUTES,
    });
  }

  if (!netflixPollTimer) {
    netflixPollTimer = setInterval(() => {
      scanNetflixDocument();
    }, NETFLIX_PERIODIC_SCAN_MS);
  }

  scheduleNetflixFullScan();
}

function isElementVisible(element) {
  if (!(element instanceof Element) || !element.isConnected) {
    return false;
  }

  if (element.getClientRects().length === 0) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }

  return true;
}

function findCoupangNextButton() {
  const container = document.querySelector(COUPANG_CONTAINER_SELECTOR);
  if (container) {
    const button = Array.from(container.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === COUPANG_NEXT_BUTTON_TEXT,
    );

    if (button instanceof HTMLButtonElement) {
      return { button, container };
    }
  }

  const button = Array.from(document.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === COUPANG_NEXT_BUTTON_TEXT,
  );

  if (button instanceof HTMLButtonElement) {
    return {
      button,
      container: button.closest(COUPANG_CONTAINER_SELECTOR),
    };
  }

  return null;
}

function isCoupangButtonActionable(button, container) {
  if (!(button instanceof HTMLButtonElement)) {
    return false;
  }

  if (button.disabled) {
    return false;
  }

  if (!isElementVisible(button)) {
    return false;
  }

  if (container && !isElementVisible(container)) {
    return false;
  }

  return true;
}

function shouldSkipCoupangClick(button) {
  if (!button.isConnected) {
    return true;
  }

  if (wasHandledRecently(button, COUPANG_CLICK_RETRY_WINDOW_MS)) {
    return true;
  }

  if (Date.now() - coupangState.lastClickedAt < COUPANG_CLICK_RETRY_WINDOW_MS) {
    return true;
  }

  return false;
}

function removeCoupangVideoListener() {
  if (coupangState.videoElement && coupangState.videoEndedHandler) {
    coupangState.videoElement.removeEventListener('ended', coupangState.videoEndedHandler);
  }

  coupangState.videoElement = null;
  coupangState.videoEndedHandler = null;
}

function cleanupCoupangTracking() {
  if (coupangState.containerObserver) {
    coupangState.containerObserver.disconnect();
    coupangState.containerObserver = null;
    coupangState.observedContainer = null;
  }

  if (coupangState.pollTimer) {
    clearInterval(coupangState.pollTimer);
    coupangState.pollTimer = null;
  }

  removeCoupangVideoListener();
}

function scheduleCoupangTrackingRestart() {
  if (coupangState.restartTimer) {
    clearTimeout(coupangState.restartTimer);
  }

  coupangState.restartTimer = setTimeout(() => {
    coupangState.restartTimer = null;
    startCoupangAutomation();
  }, COUPANG_RESTART_TRACKING_DELAY_MS);
}

function tryClickCoupangNextButton() {
  if (!canClickCoupangNextEpisode()) {
    return false;
  }

  const found = findCoupangNextButton();
  if (!found) {
    return false;
  }

  const { button, container } = found;
  if (!isCoupangButtonActionable(button, container)) {
    return false;
  }

  if (shouldSkipCoupangClick(button)) {
    return false;
  }

  const clickedAt = Date.now();
  handledAtMap.set(button, clickedAt);
  coupangState.lastClickedAt = clickedAt;
  button.click();
  cleanupCoupangTracking();
  scheduleCoupangTrackingRestart();
  return true;
}

function ensureCoupangContainerObserver() {
  const container = document.querySelector(COUPANG_CONTAINER_SELECTOR);
  if (!(container instanceof Element)) {
    return;
  }

  if (coupangState.containerObserver && coupangState.observedContainer === container) {
    return;
  }

  if (coupangState.containerObserver) {
    coupangState.containerObserver.disconnect();
    coupangState.containerObserver = null;
    coupangState.observedContainer = null;
  }

  const observer = new MutationObserver(() => {
    tryClickCoupangNextButton();
  });

  observer.observe(container, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: COUPANG_CONTAINER_OBSERVED_ATTRIBUTES,
  });

  coupangState.containerObserver = observer;
  coupangState.observedContainer = container;
}

function ensureCoupangVideoListener() {
  const video = document.querySelector('video');
  if (!(video instanceof HTMLVideoElement)) {
    removeCoupangVideoListener();
    return;
  }

  if (coupangState.videoElement === video && coupangState.videoEndedHandler) {
    return;
  }

  removeCoupangVideoListener();

  const endedHandler = () => {
    COUPANG_ENDED_RETRY_DELAYS_MS.forEach((delayMs) => {
      setTimeout(() => {
        tryClickCoupangNextButton();
      }, delayMs);
    });
  };

  video.addEventListener('ended', endedHandler);
  coupangState.videoElement = video;
  coupangState.videoEndedHandler = endedHandler;
}

function startCoupangAutomation() {
  ensureCoupangContainerObserver();
  ensureCoupangVideoListener();

  if (!coupangState.pollTimer) {
    coupangState.pollTimer = setInterval(() => {
      ensureCoupangContainerObserver();
      ensureCoupangVideoListener();
      tryClickCoupangNextButton();
    }, COUPANG_POLL_INTERVAL_MS);
  }

  tryClickCoupangNextButton();
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

  if (!hasRelevantChange) {
    return;
  }

  currentSettings = normalizeSettings(nextSettings);

  if (isNetflixPage()) {
    scheduleNetflixFullScan();
    return;
  }

  if (isCoupangPlayPage()) {
    startCoupangAutomation();
  }
}

async function initialize() {
  try {
    currentSettings = await getSettings();
  } catch (error) {
    if (error instanceof Error) {
      console.warn('[ott-auto-skip] failed to load settings, fallback to defaults', error.message);
    }
  }

  chrome.storage.onChanged.addListener(handleStorageChanged);

  if (isNetflixPage()) {
    startNetflixAutomation();
    return;
  }

  if (isCoupangPlayPage()) {
    startCoupangAutomation();
  }
}

initialize().catch((error) => {
  if (error instanceof Error) {
    console.error('[ott-auto-skip] failed to initialize content script', error.message);
  }
});

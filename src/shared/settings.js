export const SETTING_KEYS = {
  MASTER: 'autoSkipEnabled',
  INTRO: 'skipIntroEnabled',
  RECAP: 'skipRecapEnabled',
  NEXT_EPISODE: 'skipNextEpisodeEnabled',
};

export const DEFAULT_SKIP_SETTINGS = Object.freeze({
  [SETTING_KEYS.MASTER]: true,
  [SETTING_KEYS.INTRO]: true,
  [SETTING_KEYS.RECAP]: true,
  [SETTING_KEYS.NEXT_EPISODE]: true,
});

function toBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
}

export function normalizeSettings(input) {
  return {
    [SETTING_KEYS.MASTER]: toBoolean(input?.[SETTING_KEYS.MASTER], DEFAULT_SKIP_SETTINGS[SETTING_KEYS.MASTER]),
    [SETTING_KEYS.INTRO]: toBoolean(input?.[SETTING_KEYS.INTRO], DEFAULT_SKIP_SETTINGS[SETTING_KEYS.INTRO]),
    [SETTING_KEYS.RECAP]: toBoolean(input?.[SETTING_KEYS.RECAP], DEFAULT_SKIP_SETTINGS[SETTING_KEYS.RECAP]),
    [SETTING_KEYS.NEXT_EPISODE]: toBoolean(
      input?.[SETTING_KEYS.NEXT_EPISODE],
      DEFAULT_SKIP_SETTINGS[SETTING_KEYS.NEXT_EPISODE],
    ),
  };
}

function getStorage(defaults) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(defaults, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(items);
    });
  });
}

export async function getSettings() {
  const stored = await getStorage(DEFAULT_SKIP_SETTINGS);
  return normalizeSettings(stored);
}

export function setSettings(settings) {
  return new Promise((resolve, reject) => {
    const nextSettings = normalizeSettings(settings);

    chrome.storage.sync.set(nextSettings, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve();
    });
  });
}

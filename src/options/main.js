import {
  DEFAULT_SKIP_SETTINGS,
  SETTING_KEYS,
  getSettings,
  normalizeSettings,
  setSettings,
} from '../shared/settings.js';

const FALLBACK_MESSAGES = {
  extName: 'OTT Auto Skip',
  extDescription: 'Auto skip intros, recaps, and go to next episodes automatically on OTT platforms.',
  toggleMaster: 'Enable Auto Skip',
  toggleIntro: 'Skip Intro',
  toggleRecap: 'Skip Recap',
  toggleNextEpisode: 'Auto Click Next Episode',
  statusEnabled: 'Auto skip is enabled.',
  statusDisabled: 'Auto skip is disabled.',
  statusError: 'Failed to load settings',
};

const statusElement = document.querySelector('#options-status');
const masterToggle = document.querySelector('#toggle-master');
const introToggle = document.querySelector('#toggle-intro');
const recapToggle = document.querySelector('#toggle-recap');
const nextEpisodeToggle = document.querySelector('#toggle-next-episode');

let currentSettings = { ...DEFAULT_SKIP_SETTINGS };

function getMessage(key) {
  const translated = chrome.i18n.getMessage(key);
  return translated || FALLBACK_MESSAGES[key] || key;
}

function applyTranslations() {
  const i18nNodes = document.querySelectorAll('[data-i18n]');
  i18nNodes.forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (!key) {
      return;
    }

    node.textContent = getMessage(key);
  });

  document.title = getMessage('extName') + ' - Options';
}

function updateStatus() {
  if (!(statusElement instanceof HTMLElement)) {
    return;
  }

  statusElement.textContent = currentSettings[SETTING_KEYS.MASTER]
    ? getMessage('statusEnabled')
    : getMessage('statusDisabled');
}

function syncToggleState() {
  if (!(masterToggle instanceof HTMLInputElement)) {
    return;
  }

  if (!(introToggle instanceof HTMLInputElement)) {
    return;
  }

  if (!(recapToggle instanceof HTMLInputElement)) {
    return;
  }

  if (!(nextEpisodeToggle instanceof HTMLInputElement)) {
    return;
  }

  masterToggle.checked = currentSettings[SETTING_KEYS.MASTER];
  introToggle.checked = currentSettings[SETTING_KEYS.INTRO];
  recapToggle.checked = currentSettings[SETTING_KEYS.RECAP];
  nextEpisodeToggle.checked = currentSettings[SETTING_KEYS.NEXT_EPISODE];

  const isMasterEnabled = currentSettings[SETTING_KEYS.MASTER];
  introToggle.disabled = !isMasterEnabled;
  recapToggle.disabled = !isMasterEnabled;
  nextEpisodeToggle.disabled = !isMasterEnabled;

  updateStatus();
}

async function saveSettings(partialSettings) {
  currentSettings = normalizeSettings({
    ...currentSettings,
    ...partialSettings,
  });

  await setSettings(currentSettings);
  syncToggleState();
}

function bindEvents() {
  if (
    !(masterToggle instanceof HTMLInputElement) ||
    !(introToggle instanceof HTMLInputElement) ||
    !(recapToggle instanceof HTMLInputElement) ||
    !(nextEpisodeToggle instanceof HTMLInputElement)
  ) {
    return;
  }

  masterToggle.addEventListener('change', () => {
    void saveSettings({
      [SETTING_KEYS.MASTER]: masterToggle.checked,
    });
  });

  introToggle.addEventListener('change', () => {
    void saveSettings({
      [SETTING_KEYS.INTRO]: introToggle.checked,
    });
  });

  recapToggle.addEventListener('change', () => {
    void saveSettings({
      [SETTING_KEYS.RECAP]: recapToggle.checked,
    });
  });

  nextEpisodeToggle.addEventListener('change', () => {
    void saveSettings({
      [SETTING_KEYS.NEXT_EPISODE]: nextEpisodeToggle.checked,
    });
  });
}

async function initializeOptions() {
  applyTranslations();
  currentSettings = await getSettings();
  syncToggleState();
  bindEvents();
}

initializeOptions().catch((error) => {
  if (!(statusElement instanceof HTMLElement)) {
    return;
  }

  if (error instanceof Error) {
    statusElement.textContent = `${getMessage('statusError')}: ${error.message}`;
  }
});

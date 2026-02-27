chrome.runtime.onInstalled.addListener(() => {
  console.info('[ott-auto-skip] background service worker installed');
});

chrome.runtime.onStartup.addListener(() => {
  console.info('[ott-auto-skip] background service worker started');
});

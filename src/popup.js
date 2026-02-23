// NOW FULLY WORKS ON BOTH BROWSERS
document.addEventListener("DOMContentLoaded", async () => {
  const soundToggle = document.getElementById("soundToggle");

  // determine browser and storage
  let storage;
  const isFirefox = typeof browser !== "undefined" && navigator.userAgent.includes("Firefox");
  if (isFirefox) {
    storage = browser.storage.local; // force local on firefox
  } else {
    storage = chrome.storage.sync;   // normal sync on chrome
  }

  const DEFAULT_SOUND = true;

  // read preferences
  const res = await storage.get(["soundEnabled"]);
  const prefs = {
    soundEnabled: res.soundEnabled !== undefined ? res.soundEnabled : DEFAULT_SOUND,
  };

  // apply preferences to UI
  soundToggle.checked = prefs.soundEnabled;

  // save toggle sound
  soundToggle.addEventListener("change", () => {
    storage.set({ soundEnabled: soundToggle.checked });
  });

});

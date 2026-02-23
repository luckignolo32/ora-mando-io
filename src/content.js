// polyfill for Firefox compatibility
const storage = (typeof browser !== "undefined") ? browser.storage : chrome.storage;

// pre-load sound file
const soundUrl = chrome.runtime.getURL("assets/ora_parlo_io.mp3");

// keywords for "Send" in various languages
const keywords = ["Invia","Send","傳送","发送","送信","보내기","Enviar","Senden","Envoyer","Отправить","إرسال","ส่ง","Skicka","Sendt", "Gửi", "Надіслати", "Odeslán", "Wyślij", "Gönder", "Lähetä"];

// default settings
let soundEnabled = true;

const isFirefox = typeof browser !== "undefined";

// load preferences without rewriting saved preferences 
const loadPrefs = async () => {
  if (!isFirefox) {
    // Chrome callback
    storage.sync.get(["soundEnabled"], (res) => {
      soundEnabled = res.soundEnabled !== undefined ? res.soundEnabled : true;
    });
  } else {
    // Firefox promise
    const res = await storage.sync.get(["soundEnabled"]);
    soundEnabled = res.soundEnabled !== undefined ? res.soundEnabled : true;
  }
};
loadPrefs();

// real-time updates
if (storage.onChanged) {
  storage.onChanged.addListener((changes) => {
    if (changes.soundEnabled) soundEnabled = changes.soundEnabled.newValue;
  });
}

function showEldenRingBanner() {
  const banner = document.createElement('div');
  banner.id = 'ora-parlo-io-banner';
  const imgPath = chrome.runtime.getURL(`assets/jok3r.png`);
  banner.innerHTML = `<img src="${imgPath}" alt="Email Sent">`;
  document.body.appendChild(banner);

  if (soundEnabled) {
    const audio = new Audio(soundUrl);
    audio.volume = 0.35;
    audio.play().catch(err => console.error("Errore nel suono:", err));
  }

  setTimeout(() => banner.classList.add('show'), 50);
  setTimeout(() => {
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 500);
  }, 3000);
}

// gmail observer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showEldenRingBanner };
} else {
  if (typeof window !== 'undefined' && 'MutationObserver' in window) {
    const gmailObserver = new MutationObserver(() => {
      document.querySelectorAll('div[role="button"], button[role="button"]').forEach(btn => {
        const label = btn.getAttribute("aria-label") || "";
        const tooltip = btn.getAttribute("data-tooltip") || "";
        const text = (btn.innerText || "").trim();

        const isSendBtn = keywords.some(k =>
          label.toLowerCase().startsWith(k.toLowerCase()) ||
          tooltip.toLowerCase().startsWith(k.toLowerCase()) ||
          text.toLowerCase().startsWith(k.toLowerCase())
        );

        if (isSendBtn && !btn.dataset.eldenRingAttached) {
          btn.addEventListener("click", () => {
            setTimeout(showEldenRingBanner, 500);
          });
          btn.dataset.eldenRingAttached = "true";
        }
      });
    });
    gmailObserver.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      setTimeout(showEldenRingBanner, 500);
    }
  });
}

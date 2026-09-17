// Audible booking alert (/public/NewBookingAlert.mp3).
// Browsers block audio before the first user interaction, so the element is
// warmed on pointerdown/keydown; play attempts before that fail silently.
// Throttled so dispatch storms (queue retries) can't overlap the sound.

const SOUND_URL = "/NewBookingAlert.mp3";
const THROTTLE_MS = 4000;

let audioEl = null;
let lastPlayAt = 0;

const warmAudio = () => {
  try {
    if (!audioEl && typeof window !== "undefined" && typeof Audio !== "undefined") {
      audioEl = new Audio(SOUND_URL);
      audioEl.preload = "auto";
      audioEl.load();
    }
  } catch {
    // audio unsupported — visual alerts still work
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", warmAudio, { passive: true });
  window.addEventListener("keydown", warmAudio);
}

export const playBookingAlert = () => {
  const now = Date.now();
  if (now - lastPlayAt < THROTTLE_MS) return;
  lastPlayAt = now;
  try {
    warmAudio();
    if (!audioEl) return;
    audioEl.currentTime = 0;
    const p = audioEl.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    // autoplay blocked or unsupported — visual alerts still work
  }
};

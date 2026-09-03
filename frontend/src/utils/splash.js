export const SPLASH_SEEN_KEY = "mjc_splash_seen";

export const hasSeenSplash = () => {
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

export const markSplashSeen = () => {
  try {
    sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — safe to ignore
  }
};

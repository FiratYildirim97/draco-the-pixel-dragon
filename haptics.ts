// Haptic Feedback Engine for Mobile Devices
export const Haptics = {
  enabled: true,

  // Check if vibration API is supported
  isSupported: () => typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator,

  // Light tap for standard UI buttons
  tap: () => {
    if (!Haptics.enabled || !Haptics.isSupported()) return;
    try {
      navigator.vibrate(12);
    } catch (_) {}
  },

  // Medium tap for important actions (cleaning, feeding)
  mediumTap: () => {
    if (!Haptics.enabled || !Haptics.isSupported()) return;
    try {
      navigator.vibrate(25);
    } catch (_) {}
  },

  // Soft purr / rhythm when petting or caressing the dragon
  purr: () => {
    if (!Haptics.enabled || !Haptics.isSupported()) return;
    try {
      navigator.vibrate([15, 30, 15, 30, 20]);
    } catch (_) {}
  },

  // Happy success vibration (purchasing, harvesting, winning)
  success: () => {
    if (!Haptics.enabled || !Haptics.isSupported()) return;
    try {
      navigator.vibrate([20, 50, 30, 50, 50]);
    } catch (_) {}
  },

  // Egg cracking / heartbeat vibration
  heartbeat: () => {
    if (!Haptics.enabled || !Haptics.isSupported()) return;
    try {
      navigator.vibrate([35, 100, 45]);
    } catch (_) {}
  },

  // Evolution fanfare vibration
  evolve: () => {
    if (!Haptics.enabled || !Haptics.isSupported()) return;
    try {
      navigator.vibrate([40, 60, 40, 60, 80, 80, 120]);
    } catch (_) {}
  },

  // Warning / critical status (starving, dirty)
  warning: () => {
    if (!Haptics.enabled || !Haptics.isSupported()) return;
    try {
      navigator.vibrate([70, 50, 70]);
    } catch (_) {}
  }
};

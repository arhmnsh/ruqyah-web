import { reactive } from 'vue';

// First-run sequence: How to recite -> Settings (so the reader picks their form/target/time once)
// -> the tap-hint overlay on the list. Opening either sheet later from its top-bar button is a plain
// manual open and skips the sequencing.
const HOWTO_SEEN_KEY = 'ruqyah-howto-seen-v1';
const SETTINGS_INTRO_SEEN_KEY = 'ruqyah-settings-intro-seen-v1';
const TAP_HINT_SEEN_KEY = 'ruqyah-taphint-seen-v1';

function seen(key) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markSeen(key) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // ignore storage failures
  }
}

export const onboarding = reactive({
  howToOpen: false,
  settingsOpen: false,
  tapHintOpen: false,
  // True only while the current settings-sheet open is the automatic first-run step, so closing it
  // can mark that step seen and hand off to the tap hint, without affecting a manual open later.
  settingsIsOnboarding: false,
});

export function isOnboardingComplete() {
  return seen(HOWTO_SEEN_KEY) && seen(SETTINGS_INTRO_SEEN_KEY) && seen(TAP_HINT_SEEN_KEY);
}

export function startOnboarding() {
  if (!seen(HOWTO_SEEN_KEY)) {
    onboarding.howToOpen = true;
  } else if (!seen(SETTINGS_INTRO_SEEN_KEY)) {
    onboarding.settingsIsOnboarding = true;
    onboarding.settingsOpen = true;
  } else if (!seen(TAP_HINT_SEEN_KEY)) {
    onboarding.tapHintOpen = true;
  }
}

export function openHowTo() {
  onboarding.howToOpen = true;
}

export function closeHowTo() {
  const firstRun = !seen(HOWTO_SEEN_KEY);
  markSeen(HOWTO_SEEN_KEY);
  onboarding.howToOpen = false;
  if (!firstRun) return;
  if (!seen(SETTINGS_INTRO_SEEN_KEY)) {
    onboarding.settingsIsOnboarding = true;
    onboarding.settingsOpen = true;
  } else if (!seen(TAP_HINT_SEEN_KEY)) {
    onboarding.tapHintOpen = true;
  }
}

export function openSettings() {
  onboarding.settingsIsOnboarding = false;
  onboarding.settingsOpen = true;
}

export function closeSettings() {
  const wasOnboarding = onboarding.settingsIsOnboarding;
  if (wasOnboarding) markSeen(SETTINGS_INTRO_SEEN_KEY);
  onboarding.settingsOpen = false;
  onboarding.settingsIsOnboarding = false;
  if (wasOnboarding && !seen(TAP_HINT_SEEN_KEY)) {
    onboarding.tapHintOpen = true;
  }
}

export function closeTapHint() {
  markSeen(TAP_HINT_SEEN_KEY);
  onboarding.tapHintOpen = false;
}

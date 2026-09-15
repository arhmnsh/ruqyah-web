<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const DISMISS_UNTIL_KEY = 'ruqyah-install-dismiss-until';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const BENEFITS_SEEN_KEY = 'ruqyah-howto-seen-v1';
const TAP_HINT_SEEN_KEY = 'ruqyah-taphint-seen-v1';
const ONBOARDING_DONE_AT_KEY = 'ruqyah-onboarding-done-at';
const ONBOARDING_PROMPT_DELAY_MS = 2 * 60 * 1000;

const canShow = ref(false);
const isInstalled = ref(false);
const isIos = ref(false);
const deferredInstallPrompt = ref(null);
const onboardingActive = ref(true);

function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(BENEFITS_SEEN_KEY) === '1' && localStorage.getItem(TAP_HINT_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function onboardingDelayPassed() {
  try {
    const raw = localStorage.getItem(ONBOARDING_DONE_AT_KEY);
    const doneAt = raw ? Number(raw) : 0;
    return Number.isFinite(doneAt) && doneAt > 0 && Date.now() - doneAt >= ONBOARDING_PROMPT_DELAY_MS;
  } catch {
    return false;
  }
}

function ensureOnboardingDoneAt() {
  try {
    const raw = localStorage.getItem(ONBOARDING_DONE_AT_KEY);
    if (raw) {
      return;
    }
    localStorage.setItem(ONBOARDING_DONE_AT_KEY, String(Date.now()));
  } catch {
    // ignore storage failures
  }
}

function detectIos() {
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function detectStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true
  );
}

function isDismissedRecently() {
  try {
    const raw = localStorage.getItem(DISMISS_UNTIL_KEY);
    const until = raw ? Number(raw) : 0;
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_UNTIL_KEY, String(Date.now() + DISMISS_COOLDOWN_MS));
  } catch {
    // ignore storage failures
  }
}

function refreshVisibility() {
  isInstalled.value = detectStandalone();
  if (!hasCompletedOnboarding() || onboardingActive.value || !onboardingDelayPassed()) {
    canShow.value = false;
    return;
  }
  if (isInstalled.value || isDismissedRecently()) {
    canShow.value = false;
    return;
  }
  const hasNativePrompt = !!deferredInstallPrompt.value;
  canShow.value = hasNativePrompt || isIos.value;
}

async function installApp() {
  const evt = deferredInstallPrompt.value;
  if (!evt) {
    return;
  }

  deferredInstallPrompt.value = null;
  await evt.prompt();
  const choice = await evt.userChoice;
  if (choice.outcome === 'accepted') {
    canShow.value = false;
  } else {
    markDismissed();
    canShow.value = false;
  }
}

function dismissPrompt() {
  markDismissed();
  canShow.value = false;
}

function onBeforeInstallPrompt(event) {
  event.preventDefault();
  deferredInstallPrompt.value = event;
  refreshVisibility();
}

function onAppInstalled() {
  isInstalled.value = true;
  canShow.value = false;
}

function onOnboardingState(event) {
  onboardingActive.value = !!event?.detail?.active;
  if (!onboardingActive.value && hasCompletedOnboarding()) {
    ensureOnboardingDoneAt();
  }
  refreshVisibility();
}

const promptTitle = computed(() =>
  isIos.value ? 'Add Ruqyah to Home Screen' : 'Install Ruqyah App',
);

const promptBody = computed(() =>
  isIos.value
    ? 'Open Share, then choose Add to Home Screen.'
    : 'Install for quicker access and app-like experience.',
);

onMounted(() => {
  isIos.value = detectIos();

  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  window.addEventListener('appinstalled', onAppInstalled);
  window.addEventListener('ruqyah:onboarding-state', onOnboardingState);

  onboardingActive.value = !hasCompletedOnboarding();
  if (!onboardingActive.value) {
    ensureOnboardingDoneAt();
  }

  setTimeout(() => {
    refreshVisibility();
  }, 2200);

  setTimeout(() => {
    refreshVisibility();
  }, ONBOARDING_PROMPT_DELAY_MS + 2400);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  window.removeEventListener('appinstalled', onAppInstalled);
  window.removeEventListener('ruqyah:onboarding-state', onOnboardingState);
});
</script>

<template>
  <transition name="install-prompt">
    <aside v-if="canShow" class="install-prompt" role="dialog" aria-live="polite">
      <div class="install-copy">
        <p class="install-title">{{ promptTitle }}</p>
        <p class="install-body">{{ promptBody }}</p>
      </div>
      <div class="install-actions">
        <button
          v-if="!isIos && deferredInstallPrompt"
          class="install-btn primary"
          type="button"
          @click="installApp"
        >
          Install
        </button>
        <button class="install-btn" type="button" @click="dismissPrompt">Not now</button>
      </div>
    </aside>
  </transition>
</template>

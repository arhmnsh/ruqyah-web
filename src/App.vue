<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import HowToSheet from './components/HowToSheet.vue';
import InstallPrompt from './components/InstallPrompt.vue';
import ModeToggle from './components/ModeToggle.vue';
import SettingsSheet from './components/SettingsSheet.vue';
import { closeHowTo, closeSettings, onboarding, openHowTo, openSettings, startOnboarding } from './data/onboardingStore';
import { locale, t } from './data/i18n';

const isHeaderHidden = ref(false);
const route = useRoute();
const routeTransition = ref('route-forward');
const howToButtonEl = ref(null);
const settingsButtonEl = ref(null);
let lastScrollY = 0;

function handleScroll() {
  const currentY = window.scrollY || 0;
  const delta = currentY - lastScrollY;
  if (currentY < 24) isHeaderHidden.value = false;
  else if (delta > 6) isHeaderHidden.value = true;
  else if (delta < -6) isHeaderHidden.value = false;
  lastScrollY = currentY;
}

watch(
  () => route.name,
  (next) => {
    routeTransition.value = next === 'ruqyah-details' ? 'route-forward' : 'route-back';
  },
  { immediate: true },
);

onMounted(() => {
  lastScrollY = window.scrollY || 0;
  window.addEventListener('scroll', handleScroll, { passive: true });
  startOnboarding();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="app-shell" :class="{ 'is-header-hidden': isHeaderHidden }">
    <header class="app-topbar">
      <div class="topbar-left">
        <h1 class="app-title notranslate" :lang="locale" translate="no">{{ t('appName') }}</h1>
      </div>
      <div class="topbar-right">
        <button
          ref="howToButtonEl"
          class="icon-btn guide-btn"
          type="button"
          :aria-label="t('howToRecite')"
          aria-haspopup="dialog"
          :aria-expanded="onboarding.howToOpen"
          @click="openHowTo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.6 9a2.5 2.5 0 1 1 4.4 1.6c-.9 1.1-2 1.5-2 3" />
            <path d="M12 17.1v.1" />
          </svg>
        </button>
        <button
          ref="settingsButtonEl"
          class="icon-btn"
          type="button"
          :aria-label="t('settings')"
          aria-haspopup="dialog"
          :aria-expanded="onboarding.settingsOpen"
          @click="openSettings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2.2" fill="var(--topbar-bg)" />
            <line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2.2" fill="var(--topbar-bg)" />
            <line x1="4" y1="17" x2="20" y2="17" /><circle cx="10" cy="17" r="2.2" fill="var(--topbar-bg)" />
          </svg>
        </button>
        <ModeToggle />
      </div>
    </header>
    <main>
      <RouterView v-slot="{ Component, route: activeRoute }">
        <Transition :name="routeTransition" mode="out-in">
          <component :is="Component" :key="activeRoute.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <HowToSheet :open="onboarding.howToOpen" :anchor-el="howToButtonEl" @close="closeHowTo" />
    <SettingsSheet :open="onboarding.settingsOpen" :anchor-el="settingsButtonEl" @close="closeSettings" />
    <InstallPrompt />
  </div>
</template>

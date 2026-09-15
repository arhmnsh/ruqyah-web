<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import HowToSheet from './components/HowToSheet.vue';
import InstallPrompt from './components/InstallPrompt.vue';
import ModeToggle from './components/ModeToggle.vue';
import SettingsSheet from './components/SettingsSheet.vue';
import { closeHowTo, closeSettings, onboarding, openHowTo, openSettings, startOnboarding } from './data/onboardingStore';

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
        <h1 class="app-title">Ruqyah</h1>
      </div>
      <div class="topbar-right">
        <button
          ref="howToButtonEl"
          class="icon-btn"
          type="button"
          aria-label="How to recite"
          aria-haspopup="dialog"
          :aria-expanded="onboarding.howToOpen"
          @click="openHowTo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 10.6v5.3" />
            <circle cx="12" cy="7.7" r="0.6" fill="currentColor" stroke="none" />
          </svg>
        </button>
        <button
          ref="settingsButtonEl"
          class="icon-btn"
          type="button"
          aria-label="Settings"
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

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import InstallPrompt from './components/InstallPrompt.vue';
import ModeToggle from './components/ModeToggle.vue';
import SettingsSheet from './components/SettingsSheet.vue';

const isHeaderHidden = ref(false);
const settingsOpen = ref(false);
const route = useRoute();
const routeTransition = ref('route-forward');
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
        <button class="icon-btn" type="button" aria-label="Settings" aria-haspopup="dialog" :aria-expanded="settingsOpen" @click="settingsOpen = true">
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
    <SettingsSheet :open="settingsOpen" @close="settingsOpen = false" />
    <InstallPrompt />
  </div>
</template>

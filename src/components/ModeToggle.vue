<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import {
  currentMode,
  EVENING_MODE,
  MORNING_MODE,
  setMode,
} from '../data/modeStore';
import { t } from '../data/i18n';

const isEvening = computed(() => currentMode.value === EVENING_MODE);

const toggleLabel = computed(() =>
  isEvening.value ? t('switchToMorning') : t('switchToEvening'),
);

const toastVisible = ref(false);
const toastText = ref('');
const showIntroMotion = ref(false);
let toastTimer = null;
let introTimer = null;

function showToast(message) {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastText.value = message;
  toastVisible.value = true;
  toastTimer = setTimeout(() => {
    toastVisible.value = false;
    toastTimer = null;
  }, 1700);
}

function toggleMode() {
  const nextMode = isEvening.value ? MORNING_MODE : EVENING_MODE;
  setMode(nextMode);
  showToast(nextMode === MORNING_MODE ? t('morningToast') : t('eveningToast'));
}

onBeforeUnmount(() => {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  if (introTimer) {
    clearTimeout(introTimer);
  }
});

onMounted(() => {
  showIntroMotion.value = true;
  introTimer = setTimeout(() => {
    showIntroMotion.value = false;
    introTimer = null;
  }, 1800);
});
</script>

<template>
  <div class="mode-fab-wrap">
    <button
      class="mode-fab"
      :class="{ evening: isEvening, intro: showIntroMotion }"
      type="button"
      :aria-label="toggleLabel"
      @click="toggleMode"
    >
      <svg class="mode-scene" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <line class="horizon" x1="10" y1="30" x2="38" y2="30" />
        <circle class="sun-core" cx="24" cy="27" r="6.5" />
        <g class="sun-rays">
          <line x1="24" y1="8" x2="24" y2="12" />
          <line x1="14.5" y1="12.5" x2="17.5" y2="15.5" />
          <line x1="33.5" y1="12.5" x2="30.5" y2="15.5" />
        </g>
      </svg>
    </button>

    <transition name="mode-toast">
      <div v-if="toastVisible" class="mode-toast" role="status" aria-live="polite">
        {{ toastText }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AudioPlayerBar from '../components/AudioPlayerBar.vue';
import ConfettiOverlay from '../components/ConfettiOverlay.vue';
import RuqyahListItem from '../components/RuqyahListItem.vue';
import { usePinchFontResize } from '../utils/pinchGesture.js';
import { audioRepetitionsPerTrackForItem, audioTracksForItem } from '../data/audioManifest.js';
import {
  activeAudioItemId,
  audioCurrentTarget,
  audioHasActiveItem,
  audioIsPlaying,
  audioProgress,
  audioState,
  audioStatus,
  nextAudio,
  pauseAudio,
  playPlaylist,
  playSingle,
  previousAudio,
  restartAudio,
  resumeAudio,
  setAudioSpeed,
  stopAudio,
  syncAudioRepetition,
} from '../data/audioStore.js';
import { locale, t } from '../data/i18n';
import { currentMode, MODE_COPY, MODE_THEME } from '../data/modeStore';
import { closeTapHint, onboarding } from '../data/onboardingStore';
import { itemsForForm, resolveItem, SECTIONS, toArabicDigits } from '../data/ruqyahData';
import { settings } from '../data/settingsStore';
import {
  getProgress,
  getReadCount,
  incrementReadCount,
  progressVersion,
  resetAllCounts,
} from '../data/progressStore';

const router = useRouter();
const showConfetti = ref(false);
const audioPanelOpen = ref(false);
let confettiTimer = null;
const LIST_SCROLL_KEY = 'ruqyah-list-scroll-y';

const LAST_INTERACTED_KEY = 'ruqyah-last-interacted-id';

function saveLastInteracted(id) {
  try {
    if (id === null) sessionStorage.removeItem(LAST_INTERACTED_KEY);
    else sessionStorage.setItem(LAST_INTERACTED_KEY, String(id));
  } catch {
    // ignore storage failures
  }
}

function loadLastInteracted() {
  try {
    const val = sessionStorage.getItem(LAST_INTERACTED_KEY);
    return val !== null && val !== '' ? Number(val) : null;
  } catch {
    return null;
  }
}

const lastInteractedItemId = ref(loadLastInteracted());

function setLastInteracted(id) {
  lastInteractedItemId.value = id;
  saveLastInteracted(id);
}

function getFirstIncompleteIndex() {
  const index = items.value.findIndex((item) => item.currentCount < item.count_display);
  return index >= 0 ? index : 0;
}

function saveListScroll() {
  try {
    sessionStorage.setItem(LIST_SCROLL_KEY, String(window.scrollY || 0));
  } catch {
    // ignore storage failures
  }
}

function restoreListScroll() {
  try {
    const raw = sessionStorage.getItem(LIST_SCROLL_KEY);
    if (!raw) return;
    const y = Number(raw);
    if (!Number.isFinite(y) || y <= 0) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'auto' });
    });
  } catch {
    // ignore storage failures
  }
}

const context = computed(() => ({ mode: currentMode.value, target: settings.target }));
const theme = computed(() => MODE_THEME[currentMode.value]);
const copy = computed(() => MODE_COPY[currentMode.value]);

const items = computed(() => {
  progressVersion.value;
  return itemsForForm(settings.form).map((item) => {
    const resolved = resolveItem(item, context.value);
    return {
      ...resolved,
      currentCount: getReadCount(item.id, currentMode.value),
      progress: getProgress(item.id, resolved.count_display, currentMode.value),
    };
  });
});

const audioItems = computed(() => items.value.map((item) => ({
  ...item,
  audioTracks: audioTracksForItem(item),
  audioRepetitions: audioRepetitionsPerTrackForItem(item),
})));
const activeAudioItem = computed(() => audioItems.value.find((item) => item.id === activeAudioItemId.value) || null);

// Rows interleaved with a header wherever the section changes.
const rows = computed(() => {
  const out = [];
  let section = null;
  items.value.forEach((item, index) => {
    if (item.section !== section) {
      section = item.section;
      out.push({ type: 'section', key: `section-${section}`, section: SECTIONS[section] });
    }
    out.push({ type: 'item', key: `item-${item.id}`, item, index });
  });
  return out;
});

const completedCount = computed(() => items.value.filter((item) => item.currentCount >= item.count_display).length);
const allCompleted = computed(() => items.value.length > 0 && completedCount.value === items.value.length);
const totalRecitations = computed(() => items.value.reduce(
  (total, item) => total + (Number(item.count_display) || 0),
  0,
));
const completedRecitations = computed(() => items.value.reduce(
  (total, item) => total + Math.min(Math.max(item.currentCount, 0), Number(item.count_display) || 0),
  0,
));
const overallProgress = computed(() => (
  totalRecitations.value
    ? (completedRecitations.value / totalRecitations.value) * 100
    : 0
));

watch(allCompleted, (next, prev) => {
  if (!prev && next) {
    showConfetti.value = true;
    if (confettiTimer) clearTimeout(confettiTimer);
    confettiTimer = setTimeout(() => {
      showConfetti.value = false;
      confettiTimer = null;
    }, 3200);
  }
});

watch([currentMode, () => settings.form], () => {
  stopAudio();
  setLastInteracted(null);
});

const fontToastVisible = ref(false);
const fontToastText = ref('');
let fontToastTimer = null;
let cleanupPinch = null;

function onFontChange(size) {
  const sizeMap = {
    small: t('fontSizeSmall'),
    medium: t('fontSizeMedium'),
    large: t('fontSizeLarge'),
    xlarge: t('fontSizeXLarge'),
  };
  fontToastText.value = t('fontSizeToast', sizeMap[size] || size);
  fontToastVisible.value = true;
  if (fontToastTimer) clearTimeout(fontToastTimer);
  fontToastTimer = setTimeout(() => {
    fontToastVisible.value = false;
    fontToastTimer = null;
  }, 1600);
}

onMounted(() => {
  cleanupPinch = usePinchFontResize(window, onFontChange);
});

onBeforeUnmount(() => {
  if (cleanupPinch) cleanupPinch();
  if (fontToastTimer) clearTimeout(fontToastTimer);
  saveListScroll();
  audioPanelOpen.value = false;
  pauseAudio();
  if (confettiTimer) clearTimeout(confettiTimer);
});

restoreListScroll();

function handleIncrement(item) {
  const target = item.count_display;
  const currentCount = Math.min(getReadCount(item.id, currentMode.value), target);
  const willCompleteThisTap = currentCount < target && currentCount + 1 >= target;

  let anchorTop = null;
  let nextId = null;

  if (willCompleteThisTap) {
    const currentIndex = items.value.findIndex((entry) => entry.id === item.id);
    if (currentIndex >= 0 && currentIndex < items.value.length - 1) {
      nextId = items.value[currentIndex + 1].id;
      setLastInteracted(nextId);
      const currentRow = document.querySelector(`.athkar-row[data-item-id="${item.id}"]`);
      if (currentRow) anchorTop = currentRow.getBoundingClientRect().top;
    } else {
      setLastInteracted(item.id);
    }
  } else {
    setLastInteracted(item.id);
  }

  incrementReadCount(item.id, target, currentMode.value);
  syncAudioRepetition();

  if (willCompleteThisTap && anchorTop !== null && nextId !== null) {
    nextTick(() => {
      requestAnimationFrame(() => {
        const nextRow = document.querySelector(`.athkar-row[data-item-id="${nextId}"]`);
        if (!nextRow) return;
        const delta = nextRow.getBoundingClientRect().top - anchorTop;
        if (Math.abs(delta) < 1) return;
        window.scrollBy({ top: delta, behavior: 'smooth' });
        saveListScroll();
      });
    });
  }
}

function openDetails(item) {
  saveListScroll();
  const current = getReadCount(item.id, currentMode.value);
  if (current >= item.count_display) {
    const currentIndex = items.value.findIndex((entry) => entry.id === item.id);
    if (currentIndex >= 0 && currentIndex < items.value.length - 1) {
      setLastInteracted(items.value[currentIndex + 1].id);
    } else {
      setLastInteracted(item.id);
    }
  } else {
    setLastInteracted(item.id);
  }
  router.push({ name: 'ruqyah-details', params: { id: item.id } });
}

function resetCounters() {
  if (!window.confirm(t('resetConfirm'))) return;
  resetAllCounts();
  stopAudio();
  setLastInteracted(null);
}

function playAllAudio() {
  audioPanelOpen.value = true;
  playPlaylist(audioItems.value);
}

function openAudioPanel() {
  audioPanelOpen.value = true;

  // 1. If the user interacted with an item in the checklist since last close, start playback from that item
  if (lastInteractedItemId.value !== null) {
    const targetId = lastInteractedItemId.value;
    setLastInteracted(null);
    const index = audioItems.value.findIndex((entry) => entry.id === targetId);
    if (index >= 0) {
      playPlaylist(audioItems.value, index);
      return;
    }
  }

  // 2. If audio was previously loaded, restart playback from the beginning for that recitation
  if (audioHasActiveItem.value) {
    if (audioStatus.value === 'playing') {
      return;
    }
    if (audioStatus.value === 'complete') {
      const startIndex = getFirstIncompleteIndex();
      playPlaylist(audioItems.value, startIndex);
      return;
    }
    audioState.singleMode = false;
    restartAudio({ autoplay: true });
    return;
  }

  // 3. Fresh session: begin from the first incomplete item (or 0)
  const startIndex = getFirstIncompleteIndex();
  playPlaylist(audioItems.value, startIndex);
}

function closeAudioPanel() {
  audioPanelOpen.value = false;
  pauseAudio();
  // Reset audio playback position so reopening starts fresh from the beginning
  if (audioHasActiveItem.value) {
    audioState.segmentIndex = 0;
    audioState.currentTime = 0;
  }
  setLastInteracted(null);
}

function handleAudioToggle() {
  if (audioIsPlaying.value) {
    pauseAudio();
    return;
  }

  if (audioStatus.value === 'complete') {
    const startIndex = getFirstIncompleteIndex();
    playPlaylist(audioItems.value, startIndex);
    return;
  }

  if (audioHasActiveItem.value) {
    resumeAudio();
    return;
  }

  const startIndex = getFirstIncompleteIndex();
  playPlaylist(audioItems.value, startIndex);
}

function playItemAudio(item) {
  const index = audioItems.value.findIndex((entry) => entry.id === item.id);
  if (index < 0) return;

  audioPanelOpen.value = true;

  if (activeAudioItemId.value === item.id && audioIsPlaying.value) {
    pauseAudio();
    return;
  }

  if (activeAudioItemId.value === item.id && audioStatus.value === 'paused') {
    resumeAudio();
    return;
  }

  playSingle(audioItems.value, index);
}
</script>

<template>
  <section>
    <div class="overall-progress-edge" role="progressbar" :aria-label="t('progressLabel')" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="overallProgress">
      <i :style="{ width: `${overallProgress}%` }" />
      <span aria-live="polite">{{ locale === 'ar' ? `${toArabicDigits(completedRecitations)} / ${toArabicDigits(totalRecitations)}` : `${completedRecitations} / ${totalRecitations}` }}</span>
    </div>
    <header class="intro-strip">
      <h2 class="intro-title notranslate" lang="ar" translate="no">{{ copy.title_ar }}</h2>
      <p class="intro-sub">{{ locale === 'ar' ? copy.sub_ar : copy.sub_en }}</p>
    </header>

    <div class="list-wrap">
      <template v-for="row in rows" :key="row.key">
        <h2 v-if="row.type === 'section'" class="section-row">
          <span class="section-ar notranslate" lang="ar" translate="no">{{ row.section.ar }}</span>
          <span class="section-en notranslate" :lang="locale" translate="no">{{ locale === 'ar' ? row.section.small_ar : row.section.en }}</span>
        </h2>
        <RuqyahListItem
          v-else
          :item="row.item"
          :index="row.index"
          :total="items.length"
          :current-count="row.item.currentCount"
          :progress="row.item.progress"
          :theme="theme"
          :audio-active="activeAudioItemId === row.item.id"
          :audio-playing="activeAudioItemId === row.item.id && audioIsPlaying"
          @increment="handleIncrement(row.item)"
          @details="openDetails(row.item)"
          @audio="playItemAudio(row.item)"
        />
      </template>
    </div>

    <footer class="list-footer">
      <button class="reset-btn" type="button" @click="resetCounters">{{ t('resetCounters') }}</button>
      <a class="app-link-btn" href="https://athkar.arhmn.sh/">{{ t('openAthkar') }}</a>
      <div class="byline-wrap">
        <a class="app-byline name" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">{{ t('byline') }}</a>
        <a class="app-byline site" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">arhmn.sh</a>
      </div>
    </footer>
    <AudioPlayerBar
      :item="activeAudioItem"
      :expanded="audioPanelOpen"
      :repeat="audioState.repetitionIndex + 1"
      :target="audioCurrentTarget"
      :status="audioStatus"
      :speed="audioState.speed"
      :progress="audioProgress"
      @open="openAudioPanel"
      @close="closeAudioPanel"
      @toggle="handleAudioToggle"
      @previous="previousAudio"
      @next="nextAudio"
      @speed="setAudioSpeed"
    />
    <ConfettiOverlay :visible="showConfetti" />

    <transition name="overlay-fade">
      <div v-if="onboarding.tapHintOpen" class="tap-hint-overlay" @click="closeTapHint">
        <div class="tap-hint-demo" aria-hidden="true">
          <div class="tap-row-shadow" />
          <div class="tap-finger">👆</div>
        </div>
        <p>{{ t('tapHint') }}</p>
        <button type="button" class="tap-hint-close">{{ t('gotIt') }}</button>
      </div>
    </transition>

    <transition name="mode-toast">
      <div v-if="fontToastVisible" class="mode-toast font-toast" role="status" aria-live="polite">
        {{ fontToastText }}
      </div>
    </transition>
  </section>
</template>

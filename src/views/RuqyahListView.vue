<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ConfettiOverlay from '../components/ConfettiOverlay.vue';
import RuqyahListItem from '../components/RuqyahListItem.vue';
import { locale, t } from '../data/i18n';
import { currentMode, MODE_COPY, MODE_THEME } from '../data/modeStore';
import { closeTapHint, onboarding, openHowTo } from '../data/onboardingStore';
import { itemsForForm, resolveItem, SECTIONS } from '../data/ruqyahData';
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
let confettiTimer = null;
const LIST_SCROLL_KEY = 'ruqyah-list-scroll-y';

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
      currentCount: getReadCount(item.id),
      progress: getProgress(item.id, resolved.count_display),
    };
  });
});

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
const overallProgress = computed(() => (items.value.length ? Math.round((completedCount.value / items.value.length) * 100) : 0));

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

onBeforeUnmount(() => {
  saveListScroll();
  if (confettiTimer) clearTimeout(confettiTimer);
});

restoreListScroll();

function handleIncrement(item) {
  const target = item.count_display;
  const currentCount = Math.min(getReadCount(item.id), target);
  const willCompleteThisTap = currentCount < target && currentCount + 1 >= target;

  let anchorTop = null;
  let nextId = null;

  if (willCompleteThisTap) {
    const currentIndex = items.value.findIndex((entry) => entry.id === item.id);
    if (currentIndex >= 0 && currentIndex < items.value.length - 1) {
      nextId = items.value[currentIndex + 1].id;
      const currentRow = document.querySelector(`.athkar-row[data-item-id="${item.id}"]`);
      if (currentRow) anchorTop = currentRow.getBoundingClientRect().top;
    }
  }

  incrementReadCount(item.id, target);

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
  router.push({ name: 'ruqyah-details', params: { id: item.id } });
}

function resetCounters() {
  if (!window.confirm(t('resetConfirm'))) return;
  resetAllCounts();
}
</script>

<template>
  <section>
    <header class="intro-strip">
      <h2 class="intro-title notranslate" lang="ar" translate="no">{{ copy.title_ar }}</h2>
      <p class="intro-sub">{{ locale === 'ar' ? copy.sub_ar : copy.sub_en }}</p>
      <p class="intro-count" aria-live="polite">{{ t('progressOf', completedCount, items.length) }}</p>
      <div class="intro-track" role="progressbar" aria-label="Progress through the wird" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="overallProgress"><i :style="{ width: `${overallProgress}%` }" /></div>
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
          @increment="handleIncrement(row.item)"
          @details="openDetails(row.item)"
        />
      </template>
    </div>

    <footer class="list-footer">
      <button class="reset-btn" type="button" @click="resetCounters">{{ t('resetCounters') }}</button>
      <button class="why-athkar-btn" type="button" @click="openHowTo">{{ t('howToRecite') }}</button>
      <div class="byline-wrap">
        <a class="app-byline name" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">{{ t('byline') }}</a>
        <a class="app-byline site" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">arhmn.sh</a>
      </div>
    </footer>
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
  </section>
</template>

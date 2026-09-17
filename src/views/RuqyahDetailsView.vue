<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { currentMode } from '../data/modeStore';
import { locale, t } from '../data/i18n';
import { resolveItem, ruqyahData } from '../data/ruqyahData';
import { settings } from '../data/settingsStore';

const route = useRoute();
const router = useRouter();

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    router.push('/');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const item = computed(() => {
  const id = Number(route.params.id);
  const matched = ruqyahData.find((entry) => entry.id === id) || null;
  if (!matched) return null;
  return resolveItem(matched, { mode: currentMode.value, target: settings.target });
});

const displayName = computed(() => (locale.value === 'ar' ? item.value?.name_ar : item.value?.name_en));
const repeat = computed(() => (item.value?.count_display > 1 ? t('repeatTimes', item.value.count_display) : t('once')));
</script>

<template>
  <section v-if="item" class="details-wrap">
    <div class="details-shell">
      <button class="back-icon-btn" type="button" :aria-label="t('backToList')" @click="router.push('/')">
        <span aria-hidden="true">❮</span>
      </button>

      <section class="details-section">
        <h2 class="details-label">{{ displayName }}<template v-if="item.ref"> · {{ item.ref }}</template> · {{ repeat }}</h2>
        <p class="arabic-block notranslate" lang="ar" dir="rtl" translate="no">
          <template v-for="(segment, i) in item.segments" :key="i">{{ segment.text }}<span v-if="segment.marker" class="ayah-marker" aria-hidden="true">﴿{{ segment.marker }}﴾</span>{{ ' ' }}</template>
        </p>
      </section>

      <section v-if="item.translation_display" class="details-section">
        <h3 class="details-label">{{ t('translationLabel') }}</h3>
        <p class="translation-block">{{ item.translation_display }}</p>
      </section>

      <section v-if="item.about_display" class="details-section">
        <h3 class="details-label">{{ t('aboutLabel') }}</h3>
        <p class="translation-block">{{ item.about_display }}</p>
      </section>

      <section class="details-section source">
        <h3 class="details-label">{{ t('sourceLabel') }}</h3>
        <p class="source-block">{{ item.source_display }}</p>
      </section>
    </div>
  </section>
  <section v-else class="details-wrap">
    <div class="details-shell">
      <button class="back-icon-btn" type="button" :aria-label="t('backToList')" @click="router.push('/')">
        <span aria-hidden="true">❮</span>
      </button>
      <p>{{ t('notFound') }}</p>
    </div>
  </section>
</template>

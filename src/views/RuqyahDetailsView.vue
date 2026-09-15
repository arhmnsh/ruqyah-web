<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { currentMode } from '../data/modeStore';
import { resolveItem, ruqyahData } from '../data/ruqyahData';
import { settings } from '../data/settingsStore';

const route = useRoute();
const router = useRouter();

const item = computed(() => {
  const id = Number(route.params.id);
  const matched = ruqyahData.find((entry) => entry.id === id) || null;
  if (!matched) return null;
  return resolveItem(matched, { mode: currentMode.value, target: settings.target });
});

const repeat = computed(() => (item.value?.count_display > 1 ? `Repeat ${item.value.count_display} times` : 'Once'));
</script>

<template>
  <section v-if="item" class="details-wrap">
    <div class="details-shell">
      <button class="back-icon-btn" type="button" aria-label="Back to list" @click="router.push('/')">
        <span aria-hidden="true">❮</span>
      </button>

      <section class="details-section">
        <h2 class="details-label">{{ item.name_en }}<template v-if="item.ref"> · {{ item.ref }}</template> · {{ repeat }}</h2>
        <p class="arabic-block notranslate" lang="ar" dir="rtl" translate="no">
          <template v-for="(segment, i) in item.segments" :key="i">{{ segment.text }}<span v-if="segment.marker" class="ayah-marker" aria-hidden="true">﴿{{ segment.marker }}﴾</span>{{ ' ' }}</template>
        </p>
      </section>

      <section v-if="item.translation_display" class="details-section">
        <h3 class="details-label">Translation</h3>
        <p class="translation-block">{{ item.translation_display }}</p>
      </section>

      <section v-if="item.about_display" class="details-section">
        <h3 class="details-label">About</h3>
        <p class="translation-block">{{ item.about_display }}</p>
      </section>

      <section class="details-section source">
        <h3 class="details-label">Source</h3>
        <p class="source-block">{{ item.source_display }}</p>
      </section>
    </div>
  </section>
  <section v-else class="details-wrap">
    <div class="details-shell">
      <button class="back-icon-btn" type="button" aria-label="Back to list" @click="router.push('/')">
        <span aria-hidden="true">❮</span>
      </button>
      <p>That item was not found.</p>
    </div>
  </section>
</template>

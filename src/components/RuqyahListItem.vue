<script setup>
import { computed } from 'vue';

import { locale, t } from '../data/i18n';
import { toArabicDigits } from '../data/ruqyahData';

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
  currentCount: { type: Number, required: true },
  progress: { type: Number, required: true },
  theme: { type: Object, required: true },
});

const emit = defineEmits(['increment', 'details']);

// Rows step their hue and lightness across the list, so a long list still reads as one surface.
const rowStyle = computed(() => {
  const steps = Math.max(props.total - 1, 1);
  const ratio = props.index / steps;
  const [hueFrom, hueTo] = props.theme.rowHue;
  const [lightFrom, lightTo] = props.theme.rowLightness;
  const hue = Math.round(hueFrom + (hueTo - hueFrom) * ratio);
  const light = lightFrom + (lightTo - lightFrom) * ratio;
  const sat = props.theme.rowSaturation;
  return {
    '--row-top': `hsl(${hue}, ${sat}%, ${(light + 2).toFixed(1)}%)`,
    '--row-bottom': `hsl(${hue + 2}, ${sat - 3}%, ${(light - 2).toFixed(1)}%)`,
  };
});

const isComplete = computed(() => props.progress >= 100);
</script>

<template>
  <article
    class="athkar-row"
    :class="{ 'is-complete': isComplete }"
    :style="rowStyle"
    :data-item-id="item.id"
  >
    <div class="progress-fill" :style="{ width: `${progress}%` }" />
    <aside class="side-rail">
      <button
        class="details-hit"
        type="button"
        :aria-label="`${t('openDetailsFor')} ${locale === 'ar' ? item.name_ar : item.name_en}`"
        @click="emit('details')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 10.5v5.2" />
          <circle cx="12" cy="7.35" r="0.7" />
        </svg>
      </button>
      <p class="side-counter">{{ locale === 'ar' ? `${toArabicDigits(currentCount)} \u002F ${toArabicDigits(item.count_display)}` : `${currentCount} / ${item.count_display}` }}</p>
    </aside>
    <button class="body-hit" type="button" @click="emit('increment')">
      <p class="row-head">
        <span class="row-name notranslate" lang="ar" translate="no">{{ item.name_ar }}</span>
        <span v-if="item.ref" class="row-ref">{{ item.ref }}</span>
      </p>
      <p class="arabic notranslate" lang="ar" dir="rtl" translate="no">
        <template v-for="(segment, i) in item.segments" :key="i">{{ segment.text }}<span v-if="segment.marker" class="ayah-marker" aria-hidden="true">﴿{{ segment.marker }}﴾</span>{{ ' ' }}</template>
      </p>
    </button>
  </article>
</template>

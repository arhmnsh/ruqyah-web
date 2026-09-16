<script setup>
import { computed } from 'vue';
import { locale, t } from '../data/i18n.js';

const props = defineProps({
  item: { type: Object, required: true },
  repeat: { type: Number, required: true },
  target: { type: Number, required: true },
  status: { type: String, required: true },
  speed: { type: Number, required: true },
  currentTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
});

defineEmits(['toggle', 'previous', 'next', 'stop', 'speed']);

const title = computed(() => (locale.value === 'ar' ? props.item.name_ar : props.item.name_en));
const progress = computed(() => (
  props.duration > 0 ? Math.min((props.currentTime / props.duration) * 100, 100) : 0
));
</script>

<template>
  <aside class="audio-dock" :class="{ 'is-error': status === 'error' }" :aria-label="t('audioPlayer')">
    <div class="audio-dock-copy">
      <p class="audio-dock-kicker">{{ t('audioNowPlaying') }}</p>
      <p class="audio-dock-title notranslate" :lang="locale" translate="no">{{ title }}</p>
      <p class="audio-dock-meta">
        {{ t('audioRepeat', repeat, target) }} · {{ t('audioReciter') }}
      </p>
      <p v-if="status === 'error'" class="audio-dock-error">{{ t('audioError') }}</p>
    </div>

    <div class="audio-controls" dir="ltr">
      <button class="audio-nav-btn" type="button" :aria-label="t('previousAudio')" @click="$emit('previous')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6V5Zm3 7 9-7v14l-9-7Z" /></svg>
      </button>
      <button
        class="audio-toggle-btn"
        type="button"
        :aria-label="status === 'playing' ? t('pauseAudio') : status === 'complete' ? t('replayAudio') : t('resumeAudio')"
        @click="$emit('toggle')"
      >
        <svg v-if="status === 'playing'" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" /></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" /></svg>
      </button>
      <button class="audio-nav-btn" type="button" :aria-label="t('nextAudio')" @click="$emit('next')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2V5Zm-1 7-9-7v14l9-7Z" /></svg>
      </button>
      <button class="audio-stop-btn" type="button" :aria-label="t('stopAudio')" @click="$emit('stop')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6V6Z" /></svg>
      </button>
    </div>

    <div class="audio-dock-bottom">
      <div class="audio-dock-progress" aria-hidden="true"><i :style="{ width: `${progress}%` }" /></div>
      <label class="audio-speed-control">
        <span>{{ t('audioSpeed') }}</span>
        <select :value="speed" :aria-label="t('audioSpeed')" @change="$emit('speed', Number($event.target.value))">
          <option v-for="option in [0.75, 1, 1.25, 1.5]" :key="option" :value="option">
            {{ option }}×
          </option>
        </select>
      </label>
    </div>
  </aside>
</template>

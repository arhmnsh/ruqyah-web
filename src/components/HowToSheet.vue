<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { locale, t } from '../data/i18n';
import { useFlyTransition } from '../utils/flyTransition';

const props = defineProps({
  open: { type: Boolean, required: true },
  // The top-bar button element (a raw DOM node — Vue already unwraps the parent's template ref
  // before it reaches here) that this sheet flies into on close.
  anchorEl: { type: Object, default: null },
});

const emit = defineEmits(['close']);

const { onEnter, onLeave } = useFlyTransition(() => props.anchorEl || null, '.benefits-modal');

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.open) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-if="props.open" class="overlay-backdrop" @click.self="emit('close')">
      <article class="benefits-modal" :dir="locale === 'ar' ? 'rtl' : 'ltr'" role="dialog" aria-modal="true" :aria-label="t('howToTitle')">
        <div class="benefits-content">
          <h2>{{ t('howToTitle') }}</h2>
          <p class="benefits-intro">{{ t('howToIntro') }}</p>
          <ul class="method-list">
            <li v-for="(step, idx) in t('methodSteps')" :key="idx">{{ step }}</li>
          </ul>
          <div v-for="reminder in t('reminders')" :key="reminder.title" class="benefits-note">
            <h3>{{ reminder.title }}</h3>
            <p>{{ reminder.body }}</p>
          </div>
          <p class="benefits-hadith">
            {{ t('howToHadith') }}
            <span>{{ t('howToHadithSource') }}</span>
          </p>
        </div>
        <div class="benefits-actions">
          <button class="benefits-close" type="button" @click="emit('close')">{{ t('continueLabel') }}</button>
        </div>
      </article>
    </div>
  </Transition>
</template>

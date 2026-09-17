<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { locale, setLocale, t } from '../data/i18n';
import { currentMode, EVENING_MODE, MORNING_MODE, setMode } from '../data/modeStore';
import { itemsForForm } from '../data/ruqyahData';
import {
  FONT_SIZE_LARGE,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SIZE_XLARGE,
  FORM_LONG,
  FORM_SHORT,
  setFontSize,
  setForm,
  setTarget,
  settings,
  TARGET_HER,
  TARGET_HIM,
  TARGET_SELF,
} from '../data/settingsStore';
import { useFlyTransition } from '../utils/flyTransition';

const props = defineProps({
  open: { type: Boolean, required: true },
  // The top-bar button element (a raw DOM node — Vue already unwraps the parent's template ref
  // before it reaches here) that this sheet flies into on close.
  anchorEl: { type: Object, default: null },
});

const emit = defineEmits(['close']);

const { onEnter, onLeave } = useFlyTransition(() => props.anchorEl || null, '.sheet');

const shortCount = itemsForForm(FORM_SHORT).length;
const longCount = itemsForForm(FORM_LONG).length;

const forms = computed(() => [
  { value: FORM_SHORT, label: t('formShort'), help: t('itemsCount', shortCount) },
  { value: FORM_LONG, label: t('formLong'), help: t('itemsCount', longCount) },
]);

// Him/Her recite the ruqyah over someone else — a sick relative, a child, anyone in your care —
// so the wording addresses them directly ("I recite over you") rather than yourself. Arabic marks
// the grammatical gender of the person addressed, so the two differ in their actual wording.
const targets = computed(() => [
  { value: TARGET_SELF, label: t('targetSelf'), help: 'أَرْقِي نَفْسِي', note: t('targetSelfNote') },
  { value: TARGET_HIM, label: t('targetHim'), help: 'أَرْقِيكَ', note: t('targetHimNote') },
  { value: TARGET_HER, label: t('targetHer'), help: 'أَرْقِيكِ', note: t('targetHerNote') },
]);

const modes = computed(() => [
  { value: MORNING_MODE, label: t('morning'), help: 'وِرْدُ الصَّبَاحِ' },
  { value: EVENING_MODE, label: t('evening'), help: 'وِرْدُ الْمَسَاءِ' },
]);

const languages = computed(() => [
  { value: 'en', label: 'English', help: 'EN' },
  { value: 'ar', label: 'العربية', help: 'عربي' },
]);

const fontSizes = computed(() => [
  { value: FONT_SIZE_SMALL, label: t('fontSizeSmall'), help: 'A-' },
  { value: FONT_SIZE_MEDIUM, label: t('fontSizeMedium'), help: 'A' },
  { value: FONT_SIZE_LARGE, label: t('fontSizeLarge'), help: 'A+' },
  { value: FONT_SIZE_XLARGE, label: t('fontSizeXLarge'), help: 'A++' },
]);

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
    <div v-if="props.open" class="sheet-backdrop" @click.self="emit('close')">
      <section class="sheet" :dir="locale === 'ar' ? 'rtl' : 'ltr'" role="dialog" aria-modal="true" :aria-label="t('settings')">
        <div class="sheet-handle" aria-hidden="true" />
        <div class="sheet-head">
          <h2>{{ t('settings') }}</h2>
          <button class="sheet-close" type="button" @click="emit('close')">{{ t('done') }}</button>
        </div>

        <div class="setting">
          <p class="setting-label">{{ t('formLabel') }}</p>
          <p class="setting-help">{{ t('formHelp') }}</p>
          <div class="segmented" role="group" :aria-label="t('formLabel')">
            <button
              v-for="option in forms"
              :key="option.value"
              type="button"
              :aria-pressed="settings.form === option.value"
              @click="setForm(option.value)"
            >
              {{ option.label }}
              <small>{{ option.help }}</small>
            </button>
          </div>
        </div>

        <div class="setting">
          <p class="setting-label">{{ t('targetLabel') }}</p>
          <p class="setting-help">{{ t('targetHelp') }}</p>
          <div class="segmented" role="group" :aria-label="t('targetLabel')">
            <button
              v-for="option in targets"
              :key="option.value"
              type="button"
              :aria-pressed="settings.target === option.value"
              @click="setTarget(option.value)"
            >
              {{ option.label }}
              <small class="notranslate" lang="ar" translate="no">{{ option.help }}</small>
            </button>
          </div>
          <p class="setting-fine">{{ targets.find((opt) => opt.value === settings.target)?.note }}</p>
        </div>

        <div class="setting">
          <p class="setting-label">{{ t('timeLabel') }}</p>
          <p class="setting-help">{{ t('timeHelp') }}</p>
          <div class="segmented" role="group" :aria-label="t('timeLabel')">
            <button
              v-for="option in modes"
              :key="option.value"
              type="button"
              :aria-pressed="currentMode === option.value"
              @click="setMode(option.value)"
            >
              {{ option.label }}
              <small class="notranslate" lang="ar" translate="no">{{ option.help }}</small>
            </button>
          </div>
        </div>

        <div class="setting">
          <p class="setting-label">{{ t('fontSizeLabel') }}</p>
          <p class="setting-help">{{ t('fontSizeHelp') }}</p>
          <div class="segmented" role="group" :aria-label="t('fontSizeLabel')">
            <button
              v-for="option in fontSizes"
              :key="option.value"
              type="button"
              :aria-pressed="settings.fontSize === option.value"
              @click="setFontSize(option.value)"
            >
              {{ option.label }}
              <small>{{ option.help }}</small>
            </button>
          </div>
        </div>

        <div class="setting">
          <p class="setting-label">{{ t('languageLabel') }}</p>
          <p class="setting-help">{{ t('languageHelp') }}</p>
          <div class="segmented" role="group" :aria-label="t('languageLabel')">
            <button
              v-for="option in languages"
              :key="option.value"
              type="button"
              :aria-pressed="locale === option.value"
              @click="setLocale(option.value)"
            >
              {{ option.label }}
              <small>{{ option.help }}</small>
            </button>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

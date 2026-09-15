<script setup>
import { computed } from 'vue';

import { currentMode, EVENING_MODE, MORNING_MODE, setMode } from '../data/modeStore';
import { itemsForForm } from '../data/ruqyahData';
import {
  FORM_LONG,
  FORM_SHORT,
  setForm,
  setTarget,
  settings,
  TARGET_HER,
  TARGET_HIM,
  TARGET_SELF,
} from '../data/settingsStore';

const props = defineProps({
  open: { type: Boolean, required: true },
});

const emit = defineEmits(['close']);

const shortCount = itemsForForm(FORM_SHORT).length;
const longCount = itemsForForm(FORM_LONG).length;

const forms = computed(() => [
  { value: FORM_SHORT, label: 'Short', help: `${shortCount} items` },
  { value: FORM_LONG, label: 'Long', help: `${longCount} items` },
]);

const targets = [
  { value: TARGET_SELF, label: 'Myself', help: 'أَرْقِي نَفْسِي' },
  { value: TARGET_HIM, label: 'Him', help: 'أَرْقِيكَ' },
  { value: TARGET_HER, label: 'Her', help: 'أَرْقِيكِ' },
];

const modes = [
  { value: MORNING_MODE, label: 'Morning', help: 'وِرْدُ الصَّبَاحِ' },
  { value: EVENING_MODE, label: 'Evening', help: 'وِرْدُ الْمَسَاءِ' },
];
</script>

<template>
  <transition name="sheet">
    <div v-if="props.open" class="sheet-backdrop" @click.self="emit('close')">
      <section class="sheet" role="dialog" aria-modal="true" aria-label="Settings">
        <div class="sheet-handle" aria-hidden="true" />
        <div class="sheet-head">
          <h2>Settings</h2>
          <button class="sheet-close" type="button" @click="emit('close')">Done</button>
        </div>

        <div class="setting">
          <p class="setting-label">Form</p>
          <p class="setting-help">
            Short is the daily portion: the core Qur’an passages and the duas. Long adds the extended
            passages recited against sorcery, the evil eye, and the jinn.
          </p>
          <div class="segmented" role="group" aria-label="Form">
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
          <p class="setting-label">Reciting for</p>
          <p class="setting-help">
            The duas that address the person being recited over change their wording. Your own
            adhkar stay in the first person.
          </p>
          <div class="segmented" role="group" aria-label="Reciting for">
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
        </div>

        <div class="setting">
          <p class="setting-label">Time</p>
          <p class="setting-help">
            Chosen from the clock when the app opens. Switch it here or with the sun and moon button.
          </p>
          <div class="segmented" role="group" aria-label="Time of day">
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
      </section>
    </div>
  </transition>
</template>

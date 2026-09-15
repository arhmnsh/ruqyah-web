<script setup>
import { useFlyTransition } from '../utils/flyTransition';

const props = defineProps({
  open: { type: Boolean, required: true },
  // The template ref (an object with `.value`) of the top-bar button this sheet flies into on close.
  anchorEl: { type: Object, default: null },
});

const emit = defineEmits(['close']);

const { onEnter, onLeave } = useFlyTransition(() => props.anchorEl?.value || null, '.benefits-modal');

const method = [
  { text: 'Begin in wudu if you can, seated and unhurried. Say', ar: 'أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', after: 'before you start.' },
  { text: 'Recite aloud enough to hear yourself, with attention to meaning. Slow is better than complete.' },
  { text: 'Cup your palms, breathe lightly into them after the three Quls, and wipe over the head, face and whatever you can reach of the body.' },
  { text: 'Keep it daily. The protection described in these narrations is tied to consistency, not intensity.' },
];

const reminders = [
  { title: 'The cure is from Allah, and the words are a means', body: 'Ruqyah does not work mechanically. What is narrated is tied to yaqīn, recitation with real conviction, not to getting the counts right.' },
  { title: 'Ruqyah sits alongside medicine, never in place of it', body: 'The Prophet ﷺ both recited and instructed people to seek treatment. If something is physically or mentally wrong, see a doctor as well.' },
  { title: 'Recite on yourself first', body: 'Self-ruqyah is the strongest and the safest. Be cautious of anyone who charges for it, asks for your mother’s name, a personal item, or anything not found in the Sunnah.' },
];
</script>

<template>
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-if="props.open" class="overlay-backdrop" @click.self="emit('close')">
      <article class="benefits-modal" role="dialog" aria-modal="true" aria-label="How to recite ruqyah">
        <h2>Ruqyah shar‘iyyah</h2>
        <p class="benefits-intro">
          Ruqyah shar‘iyyah is recitation of the Qur’an and words taught by the Prophet ﷺ, said with the
          conviction that the cure is from Allah alone. Nothing here is a formula or a charm. The short form
          takes roughly ten minutes; the long form adds passages for a longer sitting.
        </p>
        <ol>
          <li v-for="(step, idx) in method" :key="idx">
            <h3>Step {{ idx + 1 }}</h3>
            <p>
              {{ step.text }}
              <template v-if="step.ar"> <span class="method-ar notranslate" lang="ar" translate="no">{{ step.ar }}</span> {{ step.after }}</template>
            </p>
          </li>
        </ol>
        <div v-for="reminder in reminders" :key="reminder.title" class="benefits-note">
          <h3>{{ reminder.title }}</h3>
          <p>{{ reminder.body }}</p>
        </div>
        <p class="benefits-hadith">
          “Whoever recites Qul Huwallahu Ahad, Qul A‘udhu bi-Rabbil-Falaq and Qul A‘udhu bi-Rabbin-Nas
          three times in the morning and evening, they will suffice him against everything.”
          <span>Abū Dāwūd 5082 · al-Tirmidhī 3575</span>
        </p>
        <button class="benefits-close" type="button" @click="emit('close')">Continue</button>
      </article>
    </div>
  </Transition>
</template>

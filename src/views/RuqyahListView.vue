<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ConfettiOverlay from '../components/ConfettiOverlay.vue';
import RuqyahListItem from '../components/RuqyahListItem.vue';
import { currentMode, MODE_COPY, MODE_THEME } from '../data/modeStore';
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
const showHowTo = ref(false);
const showTapHintOverlay = ref(false);
let confettiTimer = null;
const LIST_SCROLL_KEY = 'ruqyah-list-scroll-y';
const HOWTO_SEEN_KEY = 'ruqyah-howto-seen-v1';
const TAP_HINT_SEEN_KEY = 'ruqyah-taphint-seen-v1';

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
      currentCount: Math.min(getReadCount(item.id), resolved.count_display),
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

onMounted(() => {
  restoreListScroll();
  try {
    const hasSeenHowTo = localStorage.getItem(HOWTO_SEEN_KEY) === '1';
    const hasSeenHint = localStorage.getItem(TAP_HINT_SEEN_KEY) === '1';
    showHowTo.value = !hasSeenHowTo;
    showTapHintOverlay.value = hasSeenHowTo && !hasSeenHint;
  } catch {
    showHowTo.value = true;
    showTapHintOverlay.value = false;
  }
});

watch(
  [showHowTo, showTapHintOverlay],
  ([howToOpen, hintOpen]) => {
    window.dispatchEvent(new CustomEvent('ruqyah:onboarding-state', { detail: { active: howToOpen || hintOpen } }));
  },
  { immediate: true },
);

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
  if (!window.confirm('Reset all counters?')) return;
  resetAllCounts();
}

function closeHowTo() {
  showHowTo.value = false;
  try {
    localStorage.setItem(HOWTO_SEEN_KEY, '1');
  } catch {
    // ignore storage failures
  }
  try {
    showTapHintOverlay.value = localStorage.getItem(TAP_HINT_SEEN_KEY) !== '1';
  } catch {
    showTapHintOverlay.value = true;
  }
}

function dismissTapHint() {
  showTapHintOverlay.value = false;
  try {
    localStorage.setItem(TAP_HINT_SEEN_KEY, '1');
  } catch {
    // ignore storage failures
  }
}
</script>

<template>
  <section>
    <header class="intro-strip">
      <h2 class="intro-title notranslate" lang="ar" translate="no">{{ copy.title_ar }}</h2>
      <p class="intro-sub">{{ copy.title_en }} · {{ copy.window }}</p>
      <p class="intro-count" aria-live="polite"><b>{{ completedCount }}</b>of {{ items.length }}</p>
      <div class="intro-track" role="progressbar" aria-label="Progress through the wird" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="overallProgress"><i :style="{ width: `${overallProgress}%` }" /></div>
    </header>

    <div class="list-wrap">
      <template v-for="row in rows" :key="row.key">
        <h2 v-if="row.type === 'section'" class="section-row">
          <span class="section-ar notranslate" lang="ar" translate="no">{{ row.section.ar }}</span>
          <span class="section-en">{{ row.section.en }}</span>
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
      <button class="reset-btn" type="button" @click="resetCounters">Reset counters</button>
      <button class="why-athkar-btn" type="button" @click="showHowTo = true">How to recite</button>
      <div class="byline-wrap">
        <a class="app-byline name" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">by AbdurRahaman Shah</a>
        <a class="app-byline site" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">arhmn.sh</a>
      </div>
    </footer>
    <ConfettiOverlay :visible="showConfetti" />

    <transition name="overlay-fade">
      <div v-if="showHowTo" class="overlay-backdrop" @click.self="closeHowTo">
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
          <button class="benefits-close" type="button" @click="closeHowTo">Continue</button>
        </article>
      </div>
    </transition>

    <transition name="overlay-fade">
      <div v-if="showTapHintOverlay && !showHowTo" class="tap-hint-overlay" @click="dismissTapHint">
        <div class="tap-hint-demo" aria-hidden="true">
          <div class="tap-row-shadow" />
          <div class="tap-finger">👆</div>
        </div>
        <p dir="ltr">Tap a row to count one recitation.</p>
        <button type="button" class="tap-hint-close" dir="ltr">Got it</button>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { locale, t } from '../data/i18n.js';

const props = defineProps({
  item: { type: Object, default: null },
  expanded: { type: Boolean, default: false },
  repeat: { type: Number, default: 1 },
  target: { type: Number, default: 1 },
  status: { type: String, default: 'idle' },
  speed: { type: Number, default: 1 },
  progress: { type: Number, default: 0 },
});

const emit = defineEmits(['open', 'close', 'toggle', 'previous', 'next', 'speed']);

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5];

// Cache last valid item for smooth collapse transitions
const cachedItem = ref(props.item);
const isSpeedPopoverOpen = ref(false);
const isDraggingSlider = ref(false);

const speedPillRef = ref(null);
const speedPopoverRef = ref(null);
const sliderTrackRef = ref(null);

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      cachedItem.value = newItem;
    }
  },
  { immediate: true },
);

const displayItem = computed(() => props.item || cachedItem.value);
const isExpanded = computed(() => props.expanded && Boolean(displayItem.value));

watch(isExpanded, (expanded) => {
  if (!expanded) {
    isSpeedPopoverOpen.value = false;
  }
});

function formatSpeed(val) {
  return `${val}×`;
}

function triggerHaptic(duration = 8) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore if browser restricts vibration
    }
  }
}

function applySpeed(newSpeed) {
  if (newSpeed === props.speed) return;
  triggerHaptic(8);
  emit('speed', newSpeed);
}

function stepSpeed(delta) {
  const currentIndex = speedOptions.indexOf(props.speed);
  const safeIndex = currentIndex >= 0 ? currentIndex : 2;
  const nextIndex = Math.max(0, Math.min(speedOptions.length - 1, safeIndex + delta));
  if (nextIndex !== currentIndex) {
    applySpeed(speedOptions[nextIndex]);
  }
}

function closeSpeedPopover() {
  if (isSpeedPopoverOpen.value) {
    isSpeedPopoverOpen.value = false;
  }
}

// Throttled mouse wheel stepping
let wheelAccumulator = 0;
let lastWheelTimestamp = 0;

function handleWheel(event) {
  const now = performance.now();
  if (now - lastWheelTimestamp > 240) {
    wheelAccumulator = 0;
  }
  lastWheelTimestamp = now;
  wheelAccumulator += event.deltaY;

  const threshold = 50;
  if (Math.abs(wheelAccumulator) >= threshold) {
    const delta = wheelAccumulator < 0 ? 1 : -1;
    stepSpeed(delta);
    wheelAccumulator = 0;
  }
}

// Press-and-Scrub touch & pointer gesture on the Speed Pill
let isPillPointerDown = false;
let hasScrubbed = false;
let pillPointerStartX = 0;
let pillPointerStartSpeedIndex = 0;
let pointerDownWasOpen = false;

function handlePillPointerDown(event) {
  if (event.button && event.button !== 0) return;
  isPillPointerDown = true;
  hasScrubbed = false;
  pillPointerStartX = event.clientX;
  const currentIdx = speedOptions.indexOf(props.speed);
  pillPointerStartSpeedIndex = currentIdx >= 0 ? currentIdx : 2;
  pointerDownWasOpen = isSpeedPopoverOpen.value;

  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Ignore
  }

  isSpeedPopoverOpen.value = true;
}

function handlePillPointerMove(event) {
  if (!isPillPointerDown) return;
  const deltaX = event.clientX - pillPointerStartX;
  if (Math.abs(deltaX) >= 8) {
    hasScrubbed = true;
    const stepDelta = Math.round(deltaX / 24);
    const targetIdx = Math.max(0, Math.min(speedOptions.length - 1, pillPointerStartSpeedIndex + stepDelta));
    if (targetIdx !== speedOptions.indexOf(props.speed)) {
      applySpeed(speedOptions[targetIdx]);
    }
  }
}

function handlePillPointerUp(event) {
  if (!isPillPointerDown) return;
  isPillPointerDown = false;

  try {
    event.currentTarget.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore
  }

  if (hasScrubbed) {
    setTimeout(() => {
      isSpeedPopoverOpen.value = false;
    }, 220);
  } else {
    if (pointerDownWasOpen) {
      isSpeedPopoverOpen.value = false;
    } else {
      isSpeedPopoverOpen.value = true;
    }
  }
}

function handlePillClick(event) {
  if (hasScrubbed) {
    hasScrubbed = false;
    return;
  }
  if (event.detail === 0) {
    isSpeedPopoverOpen.value = !isSpeedPopoverOpen.value;
  }
}

// Slider track interaction within the popover
function updateSpeedFromTrackPointer(clientX) {
  if (!sliderTrackRef.value) return;
  const rect = sliderTrackRef.value.getBoundingClientRect();
  if (rect.width <= 0) return;
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const nearestIndex = Math.round(ratio * (speedOptions.length - 1));
  applySpeed(speedOptions[nearestIndex]);
}

function handleTrackPointerDown(event) {
  isDraggingSlider.value = true;
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Ignore
  }
  updateSpeedFromTrackPointer(event.clientX);
}

function handleTrackPointerMove(event) {
  if (!isDraggingSlider.value) return;
  updateSpeedFromTrackPointer(event.clientX);
}

function handleTrackPointerUp(event) {
  if (!isDraggingSlider.value) return;
  isDraggingSlider.value = false;
  try {
    event.currentTarget.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore
  }
}

const speedPercentage = computed(() => {
  const idx = speedOptions.indexOf(props.speed);
  const safeIdx = idx >= 0 ? idx : 2;
  return (safeIdx / (speedOptions.length - 1)) * 100;
});

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    if (isSpeedPopoverOpen.value) {
      closeSpeedPopover();
      speedPillRef.value?.focus?.();
    } else if (isExpanded.value) {
      emit('close');
    }
  }
}

function handleDocumentClick(event) {
  if (!isSpeedPopoverOpen.value) return;
  if (
    speedPopoverRef.value &&
    !speedPopoverRef.value.contains(event.target) &&
    speedPillRef.value &&
    !speedPillRef.value.contains(event.target)
  ) {
    closeSpeedPopover();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('pointerdown', handleDocumentClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('pointerdown', handleDocumentClick);
});
</script>

<template>
  <div
    class="audio-player-anchor"
    :class="{ 'is-expanded': isExpanded, 'has-speed-popover': isSpeedPopoverOpen && isExpanded }"
    :role="isExpanded ? 'region' : null"
    :aria-label="isExpanded ? t('audioPlayer') : null"
  >
    <!-- Floating speed popover backdrop for dismiss -->
    <transition name="fade-fast">
      <div
        v-if="isSpeedPopoverOpen && isExpanded"
        class="audio-speed-backdrop"
        aria-hidden="true"
        @click="closeSpeedPopover"
      />
    </transition>

    <!-- Morphing color layer for circular button face -->
    <div class="audio-morph-bg" aria-hidden="true" />

    <!-- Circular Playback Button Face -->
    <button
      class="audio-compact-btn"
      type="button"
      :aria-label="t('playRuqyah')"
      :tabindex="isExpanded ? -1 : 0"
      :aria-hidden="isExpanded"
      @click="$emit('open')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m8 5 11 7-11 7V5Z" />
      </svg>
    </button>

    <!-- Expanded Playback Dock -->
    <aside
      v-if="displayItem"
      class="audio-dock"
      :class="{ 'is-error': status === 'error' }"
      :aria-label="t('audioPlayer')"
      :aria-hidden="!isExpanded"
      :inert="!isExpanded"
    >
      <div class="audio-dock-progress" aria-hidden="true">
        <i :style="{ width: `${progress}%` }" />
      </div>

      <div class="audio-dock-header">
        <div class="audio-dock-copy">
          <div class="audio-dock-english" dir="ltr">
            <p class="audio-dock-subtitle notranslate" lang="en" translate="no">{{ displayItem.name_en }}</p>
            <p class="audio-dock-meta" :dir="locale === 'ar' ? 'rtl' : 'ltr'">{{ t('audioReciter') }}</p>
          </div>
          <div class="audio-dock-arabic" dir="rtl">
            <p class="audio-dock-kicker">{{ t('audioNowPlaying') }}</p>
            <p class="audio-dock-title notranslate" lang="ar" translate="no">{{ displayItem.name_ar }}</p>
          </div>
          <p v-if="status === 'error'" class="audio-dock-error">{{ t('audioError') }}</p>
        </div>
        <button
          class="audio-close-btn"
          type="button"
          :aria-label="t('closeAudio')"
          :tabindex="isExpanded ? 0 : -1"
          @click="$emit('close')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6.7 5.3 6.3 6.3 6.3-6.3 1.4 1.4-6.3 6.3 6.3 6.3-1.4 1.4-6.3-6.3-6.3 6.3-1.4-1.4 6.3-6.3-6.3-6.3 1.4-1.4Z" />
          </svg>
        </button>
      </div>

      <div class="audio-dock-actions" dir="ltr">
        <!-- Leading Action: Interactive Speed Pill & Compact Popover -->
        <div class="audio-action-slot is-speed">
          <div class="audio-speed-wrap">
            <button
              ref="speedPillRef"
              class="audio-speed-pill"
              :class="{ 'is-altered': speed !== 1, 'is-open': isSpeedPopoverOpen }"
              type="button"
              :aria-expanded="isSpeedPopoverOpen"
              :aria-haspopup="true"
              :aria-label="t('audioSpeed') + ': ' + formatSpeed(speed)"
              :tabindex="isExpanded ? 0 : -1"
              @pointerdown="handlePillPointerDown"
              @pointermove="handlePillPointerMove"
              @pointerup="handlePillPointerUp"
              @pointercancel="handlePillPointerUp"
              @click="handlePillClick"
              @wheel.prevent="handleWheel"
            >
              <span class="audio-speed-pill-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 4a8 8 0 0 0-8 8c0 2.21.9 4.21 2.35 5.65l1.42-1.42A5.98 5.98 0 0 1 6 12a6 6 0 1 1 12 0c0 1.66-.67 3.16-1.77 4.24l1.42 1.41A7.96 7.96 0 0 0 20 12a8 8 0 0 0-8-8Zm-1 4v5.25l3.75 2.25.75-1.23-3-1.77V8H11Z" />
                </svg>
              </span>
              <span class="audio-speed-pill-value">{{ formatSpeed(speed) }}</span>
              <span class="audio-speed-pill-dot" :class="{ 'is-active': speed !== 1 }" aria-hidden="true" />
            </button>

            <!-- Compact Anchored Speed Popover -->
            <transition name="popover-spring">
              <div
                v-if="isSpeedPopoverOpen && isExpanded"
                ref="speedPopoverRef"
                class="audio-speed-popover"
                role="dialog"
                aria-modal="false"
                :aria-label="t('audioSpeed')"
                @click.stop
              >

                <!-- Stepper & Compact Slider Row -->
                <div class="speed-popover-control-row" dir="ltr">
                  <button
                    class="speed-popover-step-btn"
                    type="button"
                    :aria-label="t('decreaseAudioSpeed')"
                    :disabled="speed <= speedOptions[0]"
                    @click="stepSpeed(-1)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 13H5v-2h14v2Z" />
                    </svg>
                  </button>

                  <div
                    ref="sliderTrackRef"
                    class="speed-popover-track"
                    role="slider"
                    tabindex="0"
                    :aria-label="t('speedSlider')"
                    :aria-valuemin="speedOptions[0]"
                    :aria-valuemax="speedOptions[speedOptions.length - 1]"
                    :aria-valuenow="speed"
                    :aria-valuetext="formatSpeed(speed)"
                    @pointerdown="handleTrackPointerDown"
                    @pointermove="handleTrackPointerMove"
                    @pointerup="handleTrackPointerUp"
                    @pointercancel="handleTrackPointerUp"
                    @keydown.left.prevent="stepSpeed(-1)"
                    @keydown.down.prevent="stepSpeed(-1)"
                    @keydown.right.prevent="stepSpeed(1)"
                    @keydown.up.prevent="stepSpeed(1)"
                    @keydown.home.prevent="applySpeed(speedOptions[0])"
                    @keydown.end.prevent="applySpeed(speedOptions[speedOptions.length - 1])"
                    @wheel.prevent="handleWheel"
                  >
                    <div class="speed-popover-rail" />
                    <div class="speed-popover-fill" :style="{ width: `${speedPercentage}%` }" />
                    <div class="speed-popover-ticks" aria-hidden="true">
                      <span
                        v-for="(opt, idx) in speedOptions"
                        :key="opt"
                        class="speed-popover-tick"
                        :class="{ 'is-active': speed >= opt, 'is-normal': opt === 1 }"
                        :style="{ left: `${(idx / (speedOptions.length - 1)) * 100}%` }"
                      />
                    </div>
                    <div
                      class="speed-popover-thumb"
                      :class="{ 'is-dragging': isDraggingSlider }"
                      :style="{ left: `${speedPercentage}%` }"
                      aria-hidden="true"
                    />
                  </div>

                  <button
                    class="speed-popover-step-btn"
                    type="button"
                    :aria-label="t('increaseAudioSpeed')"
                    :disabled="speed >= speedOptions[speedOptions.length - 1]"
                    @click="stepSpeed(1)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
                    </svg>
                  </button>
                </div>

                <!-- Numbers Row for One-Tap Preset Selection -->
                <div
                  class="speed-popover-numbers"
                  dir="ltr"
                  role="radiogroup"
                  :aria-label="t('speedPresets')"
                >
                  <button
                    v-for="opt in speedOptions"
                    :key="opt"
                    class="speed-popover-num-btn"
                    :class="{ 'is-active': speed === opt, 'is-normal': opt === 1, 'is-center-btn': opt === 1 }"
                    type="button"
                    role="radio"
                    :aria-checked="speed === opt"
                    @click="applySpeed(opt)"
                  >
                    {{ opt }}×
                  </button>
                </div>

                <!-- Downward Caret Arrow pointing to the Speed Pill -->
                <span class="audio-speed-popover-caret" aria-hidden="true" />
              </div>
            </transition>
          </div>
        </div>

        <!-- Center: Primary Playback Transport Controls -->
        <div class="audio-controls" dir="ltr">
          <button
            class="audio-nav-btn"
            type="button"
            :aria-label="t('previousAudio')"
            :tabindex="isExpanded ? 0 : -1"
            @click="$emit('previous')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 5h2v14H6V5Zm3 7 9-7v14l-9-7Z" />
            </svg>
          </button>
          <button
            class="audio-toggle-btn"
            type="button"
            :class="{ 'is-playing': status === 'playing' }"
            :aria-label="status === 'playing' ? t('pauseAudio') : status === 'complete' ? t('replayAudio') : t('resumeAudio')"
            :tabindex="isExpanded ? 0 : -1"
            @click="$emit('toggle')"
          >
            <svg v-if="status === 'playing'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
            </svg>
            <svg v-else-if="status === 'complete'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8Z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <path d="m8 5 11 7-11 7V5Z" />
            </svg>
          </button>
          <button
            class="audio-nav-btn"
            type="button"
            :aria-label="t('nextAudio')"
            :tabindex="isExpanded ? 0 : -1"
            @click="$emit('next')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 5h2v14h-2V5Zm-1 7-9-7v14l9-7Z" />
            </svg>
          </button>
        </div>

        <!-- Trailing Action: Informational Repetition Status -->
        <div class="audio-action-slot is-meta" dir="ltr">
          <div class="audio-dock-meta-info" :title="t('audioRepeat', repeat, target)" :aria-label="t('audioRepeat', repeat, target)">
            <svg viewBox="0 0 24 24" class="audio-dock-meta-icon" aria-hidden="true">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7Zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4Z" />
            </svg>
            <span class="audio-dock-meta-numbers">
              <span class="audio-dock-meta-current">{{ repeat }}</span>
              <span class="audio-dock-meta-slash">/</span>
              <span class="audio-dock-meta-total">{{ target }}</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

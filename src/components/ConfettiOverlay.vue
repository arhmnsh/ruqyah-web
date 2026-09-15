<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const pieces = computed(() =>
  Array.from({ length: 90 }, (_, i) => {
    const lane = i % 15;
    const delay = (i % 18) * 0.05;
    const duration = 2.7 + (i % 7) * 0.22;
    const drift = -70 + (i % 9) * 18;
    const hue = [3, 12, 20, 38, 118, 210, 275][i % 7];
    return {
      left: `${(lane / 15) * 100 + Math.random() * 4}%`,
      delay: `${delay}s`,
      duration: `${duration}s`,
      drift: `${drift}px`,
      hue,
    };
  }),
);
</script>

<template>
  <div v-if="props.visible" class="confetti-overlay" aria-hidden="true">
    <span
      v-for="(piece, idx) in pieces"
      :key="idx"
      class="confetti-piece"
      :style="{
        left: piece.left,
        '--delay': piece.delay,
        '--duration': piece.duration,
        '--drift': piece.drift,
        '--hue': piece.hue,
      }"
    />
  </div>
</template>

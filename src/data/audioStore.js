import { computed, reactive } from 'vue';
import { incrementReadCount } from './progressStore.js';

export const audioState = reactive({
  playlist: [],
  itemIndex: -1,
  repetitionIndex: 0,
  segmentIndex: 0,
  status: 'idle',
  error: null,
  currentTime: 0,
  duration: 0,
  speed: 1,
  singleMode: false,
});

let audioElement = null;

function currentEntry() {
  return audioState.playlist[audioState.itemIndex] ?? null;
}

function ensureAudioElement() {
  if (audioElement || typeof window === 'undefined') return audioElement;

  audioElement = new window.Audio();
  audioElement.preload = 'auto';
  audioElement.playbackRate = audioState.speed;
  audioElement.addEventListener('play', () => {
    audioState.status = 'playing';
    audioState.error = null;
  });
  audioElement.addEventListener('pause', () => {
    if (audioState.status === 'playing') audioState.status = 'paused';
  });
  audioElement.addEventListener('loadedmetadata', () => {
    audioState.duration = Number.isFinite(audioElement.duration) ? audioElement.duration : 0;
  });
  audioElement.addEventListener('timeupdate', () => {
    audioState.currentTime = audioElement.currentTime || 0;
  });
  audioElement.addEventListener('ended', handleTrackEnded);
  audioElement.addEventListener('error', () => {
    audioState.status = 'error';
    audioState.error = 'load';
  });

  return audioElement;
}

export const activeAudioItemId = computed(() => currentEntry()?.id ?? null);
export const audioStatus = computed(() => audioState.status);
export const audioIsPlaying = computed(() => audioState.status === 'playing');
export const audioHasActiveItem = computed(
  () => audioState.itemIndex >= 0 && Boolean(currentEntry()),
);
export const audioCurrentTarget = computed(() => Number(currentEntry()?.count_display) || 1);

function setTrack({ autoplay = true } = {}) {
  const entry = currentEntry();
  const track = entry?.audioTracks?.[audioState.segmentIndex];
  const player = ensureAudioElement();

  if (!entry || !track || !player) {
    audioState.status = 'error';
    audioState.error = 'unavailable';
    return;
  }

  audioState.status = 'loading';
  audioState.error = null;
  audioState.currentTime = 0;
  audioState.duration = 0;
  player.src = track;
  player.load();

  if (!autoplay) return;

  player.play().catch(() => {
    audioState.status = 'paused';
    audioState.error = 'playback';
  });
}

function resetItemPosition(index) {
  audioState.itemIndex = index;
  audioState.repetitionIndex = 0;
  audioState.segmentIndex = 0;
}

function copyPlaylist(entries) {
  return entries.map((entry) => ({
    ...entry,
    audioTracks: Array.isArray(entry.audioTracks) ? [...entry.audioTracks] : [],
  }));
}

function handleTrackEnded() {
  const entry = currentEntry();
  if (!entry) return;

  if (audioState.segmentIndex < entry.audioTracks.length - 1) {
    audioState.segmentIndex += 1;
    setTrack();
    return;
  }

  const target = Number(entry.count_display) || 1;
  incrementReadCount(entry.id, target);

  if (audioState.repetitionIndex + 1 < target) {
    audioState.repetitionIndex += 1;
    audioState.segmentIndex = 0;
    setTrack();
    return;
  }

  if (audioState.singleMode) {
    audioState.status = 'paused';
    audioState.repetitionIndex = 0;
    audioState.segmentIndex = 0;
    audioState.currentTime = 0;
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    return;
  }

  if (audioState.itemIndex < audioState.playlist.length - 1) {
    resetItemPosition(audioState.itemIndex + 1);
    setTrack();
    return;
  }

  audioState.status = 'complete';
  audioState.currentTime = 0;
  if (audioElement) audioElement.pause();
}

export function playPlaylist(entries, startIndex = 0) {
  if (!entries.length) return;

  audioState.playlist = copyPlaylist(entries);
  audioState.singleMode = false;
  const index = Math.min(Math.max(startIndex, 0), audioState.playlist.length - 1);
  resetItemPosition(index);
  setTrack();
}

export function playSingle(entries, index) {
  if (!entries.length) return;

  audioState.playlist = copyPlaylist(entries);
  audioState.singleMode = true;
  const safeIndex = Math.min(Math.max(index, 0), audioState.playlist.length - 1);
  resetItemPosition(safeIndex);
  setTrack();
}

export function resumeAudio() {
  const player = ensureAudioElement();
  if (!player || !currentEntry()) return;

  player.play().then(() => {
    audioState.status = 'playing';
    audioState.error = null;
  }).catch(() => {
    audioState.status = 'paused';
    audioState.error = 'playback';
  });
}

export function setAudioSpeed(speed) {
  const nextSpeed = Number(speed);
  if (![0.75, 1, 1.25, 1.5].includes(nextSpeed)) return;

  audioState.speed = nextSpeed;
  if (audioElement) audioElement.playbackRate = nextSpeed;
}

export function pauseAudio() {
  if (!audioElement) return;
  audioElement.pause();
  audioState.status = 'paused';
}

export function stopAudio() {
  if (audioElement) {
    audioElement.pause();
    audioElement.removeAttribute('src');
    audioElement.load();
  }

  audioState.playlist = [];
  audioState.itemIndex = -1;
  audioState.repetitionIndex = 0;
  audioState.segmentIndex = 0;
  audioState.status = 'idle';
  audioState.error = null;
  audioState.currentTime = 0;
  audioState.duration = 0;
  audioState.speed = 1;
  audioState.singleMode = false;
}

function moveItem(delta) {
  if (!audioState.playlist.length) return;

  const nextIndex = Math.min(
    Math.max(audioState.itemIndex + delta, 0),
    audioState.playlist.length - 1,
  );
  resetItemPosition(nextIndex);
  setTrack();
}

export function nextAudio() {
  moveItem(1);
}

export function previousAudio() {
  moveItem(-1);
}

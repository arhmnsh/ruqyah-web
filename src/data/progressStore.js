import { ref } from 'vue';

const STORAGE_KEY = 'ruqyah-progress-v1';
const LAST_USAGE_KEY = 'ruqyah-last-usage-v1';
const DEFAULT_MODE = 'morning';
const RESET_AFTER_MS = 3 * 60 * 60 * 1000;
const USAGE_WRITE_THROTTLE_MS = 60 * 1000;

function loadMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveMap(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

const progressMap = loadMap();
let lastUsageWrite = 0;
export const progressVersion = ref(0);

function loadLastUsage() {
  try {
    const raw = localStorage.getItem(LAST_USAGE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeLastUsage(timestamp) {
  localStorage.setItem(LAST_USAGE_KEY, String(timestamp));
}

export function markUsage() {
  const now = Date.now();
  if (now - lastUsageWrite < USAGE_WRITE_THROTTLE_MS) {
    return;
  }
  writeLastUsage(now);
  lastUsageWrite = now;
}

function resetProgressMap() {
  for (const key of Object.keys(progressMap)) {
    delete progressMap[key];
  }
  saveMap(progressMap);
  progressVersion.value += 1;
}

function resetIfInactive() {
  const now = Date.now();
  const lastUsage = loadLastUsage();
  if (lastUsage > 0 && now - lastUsage > RESET_AFTER_MS) {
    resetProgressMap();
  }
  writeLastUsage(now);
  lastUsageWrite = now;
}

resetIfInactive();

function mapKey(id, mode = DEFAULT_MODE) {
  return String(id);
}

export function getReadCount(id, mode = DEFAULT_MODE) {
  const value = progressMap[mapKey(id, mode)];
  return typeof value === 'number' && value >= 0 ? value : 0;
}

export function incrementReadCount(id, targetCount, mode = DEFAULT_MODE) {
  const next = Math.min(getReadCount(id, mode) + 1, targetCount);
  progressMap[mapKey(id, mode)] = next;
  saveMap(progressMap);
  progressVersion.value += 1;
  markUsage();
  return next;
}

export function getProgress(id, targetCount, mode = DEFAULT_MODE) {
  if (!targetCount || targetCount <= 0) {
    return 0;
  }
  return Math.min((getReadCount(id, mode) / targetCount) * 100, 100);
}

export function resetAllCounts() {
  resetProgressMap();
  markUsage();
}

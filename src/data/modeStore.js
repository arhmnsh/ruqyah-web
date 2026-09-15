import { ref } from 'vue';
import { markUsage } from './progressStore';

// Morning or evening wird. Inferred from the clock on each visit, switchable by the reader.
export const MORNING_MODE = 'morning';
export const EVENING_MODE = 'evening';

const MORNING_START_HOUR = 4;
const EVENING_START_HOUR = 13;

// Dawn green in the morning, deep sea-teal in the evening. Rows step their hue across the list.
export const MODE_THEME = {
  [MORNING_MODE]: {
    appTop: '#1b5f52',
    appBottom: '#2f8a6f',
    topbar: '#1a5a4e',
    chrome: '#1a5a4e',
    rowHue: [165, 152],
    rowSaturation: 40,
    rowLightness: [30, 34],
  },
  [EVENING_MODE]: {
    appTop: '#12343f',
    appBottom: '#1f5563',
    topbar: '#11313b',
    chrome: '#11313b',
    rowHue: [194, 206],
    rowSaturation: 42,
    rowLightness: [22, 27],
  },
};

export const MODE_COPY = {
  [MORNING_MODE]: {
    title_ar: 'وِرْدُ الصَّبَاحِ',
    title_en: 'Morning ruqyah',
    window: 'Best after Fajr until sunrise · valid until midday',
  },
  [EVENING_MODE]: {
    title_ar: 'وِرْدُ الْمَسَاءِ',
    title_en: 'Evening ruqyah',
    window: 'Best after ʿAṣr until Maghrib · valid into the night',
  },
};

export function inferModeFromTime(date = new Date()) {
  const hour = date.getHours();
  return hour >= MORNING_START_HOUR && hour < EVENING_START_HOUR ? MORNING_MODE : EVENING_MODE;
}

export const currentMode = ref(inferModeFromTime());

function ensureMetaTag(name) {
  const existing = document.querySelector(`meta[name="${name}"]`);
  if (existing) return existing;
  const created = document.createElement('meta');
  created.setAttribute('name', name);
  document.head.appendChild(created);
  return created;
}

function applyModeTheme(mode) {
  if (typeof document === 'undefined') return;
  const theme = MODE_THEME[mode] || MODE_THEME[MORNING_MODE];
  const root = document.documentElement;
  root.style.setProperty('--app-bg-top', theme.appTop);
  root.style.setProperty('--app-bg-bottom', theme.appBottom);
  root.style.setProperty('--topbar-bg', theme.topbar);
  ensureMetaTag('theme-color').setAttribute('content', theme.chrome);
  ensureMetaTag('apple-mobile-web-app-status-bar-style').setAttribute('content', 'default');
}

export function setMode(nextMode) {
  if (nextMode !== MORNING_MODE && nextMode !== EVENING_MODE) return;
  if (nextMode === currentMode.value) return;
  currentMode.value = nextMode;
  applyModeTheme(nextMode);
  markUsage();
}

applyModeTheme(currentMode.value);

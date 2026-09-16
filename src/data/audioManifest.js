import { passages } from './quranText.js';

export const AUDIO_RECITER = 'Mishary Rashid Alafasy';
export const AUDIO_SOURCE_LABEL = 'EveryAyah · Internet Archive';

const QURAN_AUDIO_BASE = 'https://everyayah.com/data/Alafasy_128kbps';
const RUQYAH_AUDIO_BASE = 'https://archive.org/download/ruqia-alafasy';
const MORNING_AUDIO_BASE = 'https://archive.org/download/azkar-al-sabah-1425';

const DUA_AUDIO = Object.freeze({
  kalimat: `${RUQYAH_AUDIO_BASE}/al-ruqia-5.mp3`,
  bismillah: `${MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-12.mp3`,
  hasbi: `${MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-9.mp3`,
  tammah: `${RUQYAH_AUDIO_BASE}/al-ruqia-4.mp3`,
  arqi: `${RUQYAH_AUDIO_BASE}/al-ruqia-9.mp3`,
  adhhib: `${RUQYAH_AUDIO_BASE}/al-ruqia-3.mp3`,
  afini: `${MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-8.mp3`,
  sayyid: `${MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-5.mp3`,
  tahlil: `${MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-18.mp3`,
});

function padded(value) {
  return String(value).padStart(3, '0');
}

function quranAudioForPassage(key) {
  const passage = passages[key];
  if (!passage) return [];

  return Array.from({ length: passage.to - passage.from + 1 }, (_, offset) => {
    const ayah = passage.from + offset;
    return `${QURAN_AUDIO_BASE}/${padded(passage.surah)}${padded(ayah)}.mp3`;
  });
}

export function audioTracksForItem(item) {
  if (item?.quran) return quranAudioForPassage(item.quran);

  const duaAudio = DUA_AUDIO[item?.key];
  return duaAudio ? [duaAudio] : [];
}

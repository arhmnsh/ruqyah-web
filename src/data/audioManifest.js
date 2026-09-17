import { passages } from './quranText.js';

export const AUDIO_RECITER = 'Mishary Rashid Alafasy';
export const AUDIO_SOURCE_LABEL = 'Mishary Alafasy · offline audio';

export const LOCAL_AUDIO_BASE = '/audio';
const QURAN_AUDIO_BASE = `${LOCAL_AUDIO_BASE}/quran`;
const DUA_AUDIO_BASE = `${LOCAL_AUDIO_BASE}/dua`;
const REMOTE_QURAN_AUDIO_BASE = 'https://everyayah.com/data/Alafasy_128kbps';
const REMOTE_RUQYAH_AUDIO_BASE = 'https://archive.org/download/ruqia-alafasy';
const REMOTE_MORNING_AUDIO_BASE = 'https://archive.org/download/azkar-al-sabah-1425';

const DUA_AUDIO = Object.freeze({
  kalimat: {
    src: `${DUA_AUDIO_BASE}/kalimat.mp3`,
    remote: `${REMOTE_RUQYAH_AUDIO_BASE}/al-ruqia-5.mp3`,
    repetitionsPerTrack: 1,
  },
  bismillah: {
    src: `${DUA_AUDIO_BASE}/bismillah.mp3`,
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-12.mp3`,
    repetitionsPerTrack: 1,
  },
  hasbi: {
    src: `${DUA_AUDIO_BASE}/hasbi.mp3`,
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-9.mp3`,
    repetitionsPerTrack: 7,
  },
  tammah: {
    src: `${DUA_AUDIO_BASE}/tammah.mp3`,
    remote: `${REMOTE_RUQYAH_AUDIO_BASE}/al-ruqia-4.mp3`,
    repetitionsPerTrack: 1,
  },
  arqi: {
    src: `${DUA_AUDIO_BASE}/arqi.mp3`,
    remote: `${REMOTE_RUQYAH_AUDIO_BASE}/al-ruqia-9.mp3`,
    repetitionsPerTrack: 1,
  },
  adhhib: {
    src: `${DUA_AUDIO_BASE}/adhhib.mp3`,
    remote: `${REMOTE_RUQYAH_AUDIO_BASE}/al-ruqia-3.mp3`,
    repetitionsPerTrack: 1,
  },
  afini: {
    src: `${DUA_AUDIO_BASE}/afini.mp3`,
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-8.mp3`,
    repetitionsPerTrack: 1,
  },
  sayyid: {
    src: `${DUA_AUDIO_BASE}/sayyid.mp3`,
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-5.mp3`,
    repetitionsPerTrack: 1,
  },
  tahlil: {
    src: `${DUA_AUDIO_BASE}/tahlil.mp3`,
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-18.mp3`,
    repetitionsPerTrack: 1,
  },
});

function padded(value) {
  return String(value).padStart(3, '0');
}

function quranAudioForPassage(key, base = QURAN_AUDIO_BASE) {
  const passage = passages[key];
  if (!passage) return [];

  return Array.from({ length: passage.to - passage.from + 1 }, (_, offset) => {
    const ayah = passage.from + offset;
    return `${base}/${padded(passage.surah)}${padded(ayah)}.mp3`;
  });
}

export function audioTracksForItem(item) {
  if (item?.quran) return quranAudioForPassage(item.quran);

  const duaAudio = DUA_AUDIO[item?.key];
  return duaAudio ? [duaAudio.src] : [];
}

export function audioRepetitionsPerTrackForItem(item) {
  if (item?.quran) return 1;
  return DUA_AUDIO[item?.key]?.repetitionsPerTrack || 1;
}

export function audioDownloadEntriesForItem(item) {
  if (item?.quran) {
    const localTracks = quranAudioForPassage(item.quran);
    const remoteTracks = quranAudioForPassage(item.quran, REMOTE_QURAN_AUDIO_BASE);
    return localTracks.map((local, index) => ({ local, remote: remoteTracks[index] }));
  }

  const duaAudio = DUA_AUDIO[item?.key];
  return duaAudio ? [{ local: duaAudio.src, remote: duaAudio.remote }] : [];
}

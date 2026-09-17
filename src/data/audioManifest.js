import { passages } from './quranText.js';

export const AUDIO_RECITER = 'Mishary Rashid Alafasy';
export const AUDIO_SOURCE_LABEL = 'Mishary Alafasy · offline audio';

export const LOCAL_AUDIO_BASE = '/audio';
const REMOTE_RUQYAH_AUDIO_BASE = 'https://archive.org/download/ruqia-alafasy';
const REMOTE_MORNING_AUDIO_BASE = 'https://archive.org/download/azkar-al-sabah-1425';
const AUDIO_VERSIONS = globalThis.__AUDIO_VERSIONS__ || {};

function localAudioPath(relativePath) {
  return `${LOCAL_AUDIO_BASE}/${relativePath}`;
}

function localAudioUrl(relativePath) {
  const version = AUDIO_VERSIONS[relativePath];
  const url = localAudioPath(relativePath);
  return version ? `${url}?v=${version}` : url;
}

const DUA_AUDIO = Object.freeze({
  kalimat: {
    src: localAudioUrl('dua/kalimat.mp3'),
    remote: `${REMOTE_RUQYAH_AUDIO_BASE}/al-ruqia-5.mp3`,
    repetitionsPerTrack: 1,
  },
  bismillah: {
    src: localAudioUrl('dua/bismillah.mp3'),
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-12.mp3`,
    repetitionsPerTrack: 1,
  },
  hasbi: {
    src: localAudioUrl('dua/hasbi.mp3'),
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-9.mp3`,
    repetitionsPerTrack: 7,
  },
  tammah: {
    src: localAudioUrl('dua/tammah.mp3'),
    remote: `${REMOTE_RUQYAH_AUDIO_BASE}/al-ruqia-4.mp3`,
    repetitionsPerTrack: 1,
  },
  arqi: {
    src: localAudioUrl('dua/arqi.mp3'),
    remote: `${REMOTE_RUQYAH_AUDIO_BASE}/al-ruqia-9.mp3`,
    repetitionsPerTrack: 1,
  },
  adhhib: {
    src: localAudioUrl('dua/adhhib.mp3'),
    remote: `${REMOTE_RUQYAH_AUDIO_BASE}/al-ruqia-3.mp3`,
    repetitionsPerTrack: 1,
  },
  afini: {
    src: localAudioUrl('dua/afini.mp3'),
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-8.mp3`,
    repetitionsPerTrack: 1,
  },
  sayyid: {
    src: localAudioUrl('dua/sayyid.mp3'),
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-5.mp3`,
    repetitionsPerTrack: 1,
  },
  tahlil: {
    src: localAudioUrl('dua/tahlil.mp3'),
    remote: `${REMOTE_MORNING_AUDIO_BASE}/8-azkar-al-sabah-1425-18.mp3`,
    repetitionsPerTrack: 1,
  },
});

function quranAudioForPassage(key) {
  const passage = passages[key];
  if (!passage) return [];
  return [localAudioUrl(`quran/passages/${key}.mp3`)];
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
    const local = localAudioPath(`quran/passages/${item.quran}.mp3`);
    return local ? [{ local, remote: null }] : [];
  }

  const duaAudio = DUA_AUDIO[item?.key];
  return duaAudio
    ? [{ local: localAudioPath(`dua/${item.key}.mp3`), remote: duaAudio.remote }]
    : [];
}

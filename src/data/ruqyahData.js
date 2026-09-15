// The wird: Qur'anic passages and prophetic duas for ruqyah shar'iyyah.
// Qur'an text comes from quranText.js (generated). Dua wording follows the hadith
// text; where a dua addresses the person being recited over, three forms are kept:
// `self` (first person), `him` and `her` (second/third person as the grammar needs).
import { passages } from './quranText.js';

export const SECTION_QURAN = 'quran';
export const SECTION_EXTENDED = 'extended';
export const SECTION_DUA = 'dua';

export const SECTIONS = {
  [SECTION_QURAN]: { ar: 'القُرْآن', en: 'Daily Qur’an' },
  [SECTION_EXTENDED]: { ar: 'الزِّيَادَة', en: 'Extended passages' },
  [SECTION_DUA]: { ar: 'الأَدْعِيَةُ وَالأَذْكَار', en: 'Prophetic duas' },
};

const KALIMAT_TAMMAH = 'بِكَلِمَاتِ اللهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ';
const ADHHIB_TAIL = 'لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا';

export const ruqyahData = [
  // ---------- Daily Qur'an (core) ----------
  {
    id: 0, key: 'fatiha', section: SECTION_QURAN, quran: 'fatiha',
    name_ar: 'سُورَةُ الفَاتِحَة', name_en: 'Al-Fātiḥah', ref: '1:1–7', count: 1,
    about: 'The Prophet ﷺ confirmed al-Fātiḥah as a ruqyah when a companion recited it over a man who had been stung: “And how did you know it was a ruqyah?”',
    source: 'Al-Bukhārī 5736 · Muslim 2201',
  },
  {
    id: 1, key: 'baqarah_1_5', section: SECTION_QURAN, quran: 'baqarah_1_5',
    name_ar: 'أَوَّلُ سُورَةِ البَقَرَة', name_en: 'Al-Baqarah', ref: '2:1–5', count: 1,
    about: 'The opening verses of the sūrah whose recitation drives Shayṭān from a house.',
    source: 'Muslim 780',
  },
  {
    id: 2, key: 'kursi', section: SECTION_QURAN, quran: 'kursi',
    name_ar: 'آيَةُ الكُرْسِيّ', name_en: 'Al-Baqarah', ref: '2:255', count: 1,
    about: {
      morning: 'Recited in the morning, a guardian from Allah remains with you until evening, and no devil comes near.',
      evening: 'Recited in the evening, a guardian from Allah remains with you until morning, and no devil comes near.',
    },
    source: 'Al-Bukhārī 2311 · al-Ḥākim 1/562, graded ṣaḥīḥ',
  },
  {
    id: 3, key: 'baqarah_285_286', section: SECTION_QURAN, quran: 'baqarah_285_286',
    name_ar: 'خَوَاتِيمُ سُورَةِ البَقَرَة', name_en: 'Al-Baqarah', ref: '2:285–286', count: 1,
    about: 'Given to the Prophet ﷺ from a treasure beneath the Throne; whoever recites them at night, they suffice him.',
    source: 'Al-Bukhārī 5009 · Muslim 808',
  },
  {
    id: 4, key: 'ikhlas', section: SECTION_QURAN, quran: 'ikhlas',
    name_ar: 'سُورَةُ الإِخْلَاص', name_en: 'Al-Ikhlāṣ', ref: '112', count: 3,
    about: 'Recite this and the two that follow three times each, morning and evening: “they will suffice you against everything.”',
    source: 'Abū Dāwūd 5082 · al-Tirmidhī 3575',
  },
  {
    id: 5, key: 'falaq', section: SECTION_QURAN, quran: 'falaq',
    name_ar: 'سُورَةُ الفَلَق', name_en: 'Al-Falaq', ref: '113', count: 3,
    about: 'Refuge from what He created, from the night, from those who blow on knots, and from the envier.',
    source: 'Al-Bukhārī 5016 · Muslim 2192',
  },
  {
    id: 6, key: 'nas', section: SECTION_QURAN, quran: 'nas',
    name_ar: 'سُورَةُ النَّاس', name_en: 'An-Nās', ref: '114', count: 3,
    about: {
      self: 'After the third recitation, breathe lightly into your palms and wipe over your body, beginning with the head and face.',
      him: 'After the third recitation, breathe lightly into your palms and wipe over him, beginning with the head and face.',
      her: 'After the third recitation, breathe lightly into your palms and wipe over her, beginning with the head and face.',
    },
    source: 'Al-Bukhārī 5017',
  },

  // ---------- Extended passages (long form only) ----------
  {
    id: 7, key: 'araf', section: SECTION_EXTENDED, quran: 'araf',
    name_ar: 'الأَعْرَاف', name_en: 'Al-Aʿrāf', ref: '7:117–122', count: 1,
    about: 'Mūsā’s staff swallows what the magicians fabricated; the truth is established and their work comes to nothing.',
    source: 'Qur’an · recited against sorcery',
  },
  {
    id: 8, key: 'yunus', section: SECTION_EXTENDED, quran: 'yunus',
    name_ar: 'يُونُس', name_en: 'Yūnus', ref: '10:79–82', count: 1,
    about: '“Allah will nullify it; He does not set right the work of corrupters.”',
    source: 'Qur’an · recited against sorcery',
  },
  {
    id: 9, key: 'taha', section: SECTION_EXTENDED, quran: 'taha',
    name_ar: 'طه', name_en: 'Ṭā Hā', ref: '20:65–69', count: 1,
    about: '“The magician does not succeed, wherever he goes.”',
    source: 'Qur’an · recited against sorcery',
  },
  {
    id: 10, key: 'muminun', section: SECTION_EXTENDED, quran: 'muminun',
    name_ar: 'المُؤْمِنُون', name_en: 'Al-Muʾminūn', ref: '23:115–118', count: 1,
    about: 'Refuge from the whisperings and promptings of devils, and a plea for forgiveness and mercy.',
    source: 'Qur’an · refuge from the devils',
  },
  {
    id: 11, key: 'saffat', section: SECTION_EXTENDED, quran: 'saffat',
    name_ar: 'الصَّافَّات', name_en: 'Aṣ-Ṣāffāt', ref: '37:1–10', count: 1,
    about: 'The heavens guarded against every rebellious devil.',
    source: 'Qur’an · against the devils',
  },
  {
    id: 12, key: 'ahqaf', section: SECTION_EXTENDED, quran: 'ahqaf',
    name_ar: 'الأَحْقَاف', name_en: 'Al-Aḥqāf', ref: '46:29–32', count: 1,
    about: 'The jinn who listened to the Qur’an and submitted, then went back to warn their people.',
    source: 'Qur’an · the jinn hear the Qur’an',
  },
  {
    id: 13, key: 'rahman', section: SECTION_EXTENDED, quran: 'rahman',
    name_ar: 'الرَّحْمَن', name_en: 'Ar-Raḥmān', ref: '55:33–36', count: 1,
    about: 'Jinn and mankind unable to pass beyond Allah’s authority; a flame of fire sent against them.',
    source: 'Qur’an · jinn and mankind subdued',
  },
  {
    id: 14, key: 'hashr', section: SECTION_EXTENDED, quran: 'hashr',
    name_ar: 'الحَشْر', name_en: 'Al-Ḥashr', ref: '59:21–24', count: 1,
    about: 'The closing names of Allah; a mountain would humble itself and split before this Qur’an.',
    source: 'Qur’an · the names of Allah',
  },
  {
    id: 15, key: 'qalam', section: SECTION_EXTENDED, quran: 'qalam',
    name_ar: 'القَلَم', name_en: 'Al-Qalam', ref: '68:51–52', count: 1,
    about: 'The verse of the eye: “they would almost strike you down with their glances.”',
    source: 'Qur’an · recited against the evil eye',
  },
  {
    id: 16, key: 'jinn', section: SECTION_EXTENDED, quran: 'jinn',
    name_ar: 'الجِنّ', name_en: 'Al-Jinn', ref: '72:1–9', count: 1,
    about: 'The account of the jinn in their own words: the heavens now guarded, their eavesdropping ended.',
    source: 'Qur’an · the jinn',
  },

  // ---------- Prophetic duas ----------
  {
    id: 17, key: 'kalimat', section: SECTION_DUA,
    name_ar: 'التَّعَوُّذُ بِكَلِمَاتِ اللهِ التَّامَّات', name_en: 'Refuge in Allah’s perfect words', count: 3,
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    about: 'Whoever says it, nothing will harm him until he moves from that place. Said three times in the evening, no sting will harm him that night.',
    source: 'Muslim 2708 · al-Tirmidhī 3604',
  },
  {
    id: 18, key: 'bismillah', section: SECTION_DUA,
    name_ar: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ', name_en: 'Against sudden affliction', count: 3,
    arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ',
    translation: 'In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
    about: 'Said three times morning and evening, no sudden affliction will strike.',
    source: 'Abū Dāwūd 5088 · al-Tirmidhī 3388',
  },
  {
    id: 19, key: 'hasbi', section: SECTION_DUA,
    name_ar: 'حَسْبِيَ اللهُ', name_en: 'Sufficiency and reliance', count: 7,
    arabic: 'حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ العَرْشِ العَظِيمِ',
    translation: 'Allah is sufficient for me; there is no god but Him. On Him I rely, and He is the Lord of the Mighty Throne.',
    about: 'Seven times, morning and evening; Allah suffices him in whatever concerns him.',
    source: 'Abū Dāwūd 5081',
  },
  {
    id: 20, key: 'tammah', section: SECTION_DUA,
    name_ar: 'مِنْ كُلِّ عَيْنٍ لَامَّة', name_en: 'Against the evil eye', count: 1,
    arabic: {
      self: `أَعُوذُ ${KALIMAT_TAMMAH}`,
      him: `أُعِيذُكَ ${KALIMAT_TAMMAH}`,
      her: `أُعِيذُكِ ${KALIMAT_TAMMAH}`,
    },
    translation: {
      self: 'I seek refuge in the perfect words of Allah from every devil, every vermin, and every harmful eye.',
      him: 'I place you under the protection of the perfect words of Allah, from every devil, every vermin, and every harmful eye.',
      her: 'I place you under the protection of the perfect words of Allah, from every devil, every vermin, and every harmful eye.',
    },
    about: 'The Prophet ﷺ sought protection for al-Ḥasan and al-Ḥusayn with these words, as Ibrāhīm had for Ismāʿīl and Isḥāq.',
    source: 'Al-Bukhārī 3371',
  },
  {
    id: 21, key: 'arqi', section: SECTION_DUA,
    name_ar: 'دُعَاءُ الرُّقْيَة', name_en: 'The ruqyah wording itself', count: 3,
    arabic: {
      self: 'بِسْمِ اللهِ أَرْقِي نَفْسِي، مِنْ كُلِّ شَيْءٍ يُؤْذِينِي، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللهُ يَشْفِينِي، بِسْمِ اللهِ أَرْقِي نَفْسِي',
      him: 'بِسْمِ اللهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللهُ يَشْفِيكَ، بِسْمِ اللهِ أَرْقِيكَ',
      her: 'بِسْمِ اللهِ أَرْقِيكِ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكِ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللهُ يَشْفِيكِ، بِسْمِ اللهِ أَرْقِيكِ',
    },
    translation: {
      self: 'In the name of Allah I recite over myself, from everything that harms me, from the evil of every soul or envious eye. Allah cures me. In the name of Allah I recite over myself.',
      him: 'In the name of Allah I recite over you, from everything that harms you, from the evil of every soul or envious eye. Allah cures you. In the name of Allah I recite over you.',
      her: 'In the name of Allah I recite over you, from everything that harms you, from the evil of every soul or envious eye. Allah cures you. In the name of Allah I recite over you.',
    },
    about: {
      self: 'Jibrīl’s ruqyah over the Prophet ﷺ. Narrated as “I recite over you”; adjusted here to the first person for reciting on yourself.',
      him: 'Jibrīl’s ruqyah over the Prophet ﷺ, in its narrated wording, addressed to the one you recite over.',
      her: 'Jibrīl’s ruqyah over the Prophet ﷺ, in its narrated wording, addressed to the one you recite over.',
    },
    source: 'Muslim 2186',
  },
  {
    id: 22, key: 'adhhib', section: SECTION_DUA,
    name_ar: 'أَذْهِبِ البَاس', name_en: 'For healing', count: 3,
    arabic: {
      self: `اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ البَاسَ، اشْفِ أَنْتَ الشَّافِي، ${ADHHIB_TAIL}`,
      him: `اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ البَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، ${ADHHIB_TAIL}`,
      her: `اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ البَاسَ، اشْفِهَا وَأَنْتَ الشَّافِي، ${ADHHIB_TAIL}`,
    },
    translation: {
      self: 'O Allah, Lord of mankind, remove the harm. Cure, for You are the Curer. There is no cure but Your cure: a cure that leaves no illness behind.',
      him: 'O Allah, Lord of mankind, remove the harm. Cure him, for You are the Curer. There is no cure but Your cure: a cure that leaves no illness behind.',
      her: 'O Allah, Lord of mankind, remove the harm. Cure her, for You are the Curer. There is no cure but Your cure: a cure that leaves no illness behind.',
    },
    about: 'The Prophet ﷺ would visit the sick, wipe with his right hand, and say these words.',
    source: 'Al-Bukhārī 5675 · Muslim 2191',
  },
  {
    id: 23, key: 'afini', section: SECTION_DUA,
    name_ar: 'اللَّهُمَّ عَافِنِي', name_en: 'Wellbeing in body and senses', count: 3,
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الكُفْرِ وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    translation: 'O Allah, grant me wellbeing in my body. O Allah, grant me wellbeing in my hearing. O Allah, grant me wellbeing in my sight. There is no god but You. O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. There is no god but You.',
    about: 'The Prophet ﷺ would not leave these words morning or evening. Your own supplication; it stays in the first person.',
    source: 'Abū Dāwūd 5090 · Aḥmad 20430',
  },
  {
    id: 24, key: 'sayyid', section: SECTION_DUA,
    name_ar: 'سَيِّدُ الاسْتِغْفَار', name_en: 'The master of seeking forgiveness', count: 1,
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    translation: 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I hold to Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me, and I acknowledge my sin, so forgive me, for none forgives sins but You.',
    about: {
      morning: 'Whoever says it in the morning with certainty and dies that day enters Paradise. Sin is an opening; closing it is part of the protection.',
      evening: 'Whoever says it in the evening with certainty and dies that night enters Paradise. Sin is an opening; closing it is part of the protection.',
    },
    source: 'Al-Bukhārī 6306',
  },
  {
    id: 25, key: 'tahlil', section: SECTION_DUA,
    name_ar: 'التَّهْلِيل', name_en: 'A shield from Shayṭān', count: { morning: 100, evening: 10 },
    arabic: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation: 'There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He has power over all things.',
    about: {
      morning: 'A hundred times in a day: the reward of freeing ten slaves, and a guard against Shayṭān until evening. If a hundred is too many to begin with, ten is also narrated; start there and build.',
      evening: 'Ten times: the reward of freeing four slaves from the children of Ismāʿīl. The hundred is narrated for the morning; the evening portion is the ten.',
    },
    source: {
      morning: 'Al-Bukhārī 3293 · Muslim 2691',
      evening: 'Al-Nasāʾī, ʿAmal al-Yawm wa-l-Layla · Aḥmad 4/60',
    },
  },
];

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
export function toArabicDigits(value) {
  return String(value).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

// Fields may be a plain value, a { morning, evening } pair, or a { self, him, her } set.
export function pick(field, { mode, target }) {
  if (field === null || field === undefined || typeof field !== 'object') return field;
  if ('morning' in field || 'evening' in field) return field[mode] ?? field.morning ?? field.evening;
  if ('self' in field || 'him' in field || 'her' in field) return field[target] ?? field.self ?? field.him;
  return field;
}

// Resolve an item for the current mode (morning/evening) and target (self/him/her):
// the Arabic as display segments (Qur'an gets a verse marker after each ayah), the
// translation, note, source, and repetition count.
export function resolveItem(item, context) {
  const passage = item.quran ? passages[item.quran] : null;
  const segments = passage
    ? passage.ayahs.map((ayah) => ({ text: ayah.ar, marker: toArabicDigits(ayah.n) }))
    : [{ text: pick(item.arabic, context), marker: null }];
  const translation = passage
    ? passage.ayahs.map((ayah) => `(${ayah.n}) ${ayah.en}`).join(' ')
    : pick(item.translation, context);
  return {
    ...item,
    segments,
    arabic_display: segments.map((s) => (s.marker ? `${s.text} ﴿${s.marker}﴾` : s.text)).join(' '),
    translation_display: translation,
    about_display: pick(item.about, context),
    source_display: pick(item.source, context),
    count_display: pick(item.count, context) || 1,
  };
}

export function itemsForForm(form) {
  return form === 'long' ? ruqyahData : ruqyahData.filter((item) => item.section !== SECTION_EXTENDED);
}

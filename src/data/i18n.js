import { ref } from 'vue';
import { toArabicDigits } from './ruqyahData';

// The reading content (Qur'an, duas) is always Arabic-first with an English translation alongside
// it — that doesn't change here. This module is only for the surrounding app chrome: button
// labels, settings copy, the how-to sheet, hints, and the footer. It switches to Arabic
// automatically when the device's own language is Arabic, the same way the reference Athkar app
// picks morning/evening from the clock rather than asking.
//
// `?lang=ar` or `?lang=en` in the URL overrides the detection — handy for testing without having
// to change the device's language, and for sharing a link in a specific language.
function detectLocale() {
  try {
    const override = new URLSearchParams(window.location.search).get('lang');
    if (override === 'ar' || override === 'en') return override;
  } catch {
    // ignore malformed URLs
  }
  try {
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    if (langs.some((l) => String(l).toLowerCase().startsWith('ar'))) return 'ar';
  } catch {
    // ignore missing navigator
  }
  return 'en';
}

export const locale = ref(typeof window === 'undefined' ? 'en' : detectLocale());

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('dir', 'rtl');
  document.documentElement.setAttribute('lang', locale.value);
}

const STRINGS = {
  en: {
    appName: 'Ruqyah',
    howToRecite: 'How to recite',
    settings: 'Settings',
    done: 'Done',

    formLabel: 'Form',
    formHelp: 'Short is the daily portion: the core Qur’an passages and the duas. Long adds the extended passages recited against sorcery, the evil eye, and the jinn.',
    formShort: 'Short',
    formLong: 'Long',
    itemsCount: (n) => `${n} items`,

    targetLabel: 'Reciting for',
    targetHelp: 'Reciting for yourself is the usual daily wird, in the first person. Reciting for someone else — a sick relative, a child, anyone in your care — addresses them directly instead, and Arabic grammar marks whether that person is male or female, so Him and Her carry different wording.',
    targetSelf: 'Myself',
    targetHim: 'Him',
    targetHer: 'Her',
    targetSelfNote: 'First person — the usual daily wird',
    targetHimNote: 'Recite over another person — male',
    targetHerNote: 'Recite over another person — female',

    timeLabel: 'Time',
    timeHelp: 'Chosen from the clock when the app opens. Switch it here or with the sun and moon button.',
    morning: 'Morning',
    evening: 'Evening',
    switchToMorning: 'Switch to morning ruqyah',
    switchToEvening: 'Switch to evening ruqyah',
    morningToast: 'Morning ruqyah',
    eveningToast: 'Evening ruqyah',

    fontSizeLabel: 'Text Size',
    fontSizeHelp: 'Adjust the size of the Arabic recitation text. You can also pinch with two fingers anywhere on the list to scale it.',
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Normal',
    fontSizeLarge: 'Large',
    fontSizeXLarge: 'Extra',
    fontSizeToast: (name) => `Text size: ${name}`,
    progressLabel: 'Progress through the wird',
    resetCounters: 'Reset counters',
    resetConfirm: 'Reset all counters?',
    playRuqyah: 'Play Ruqyah',
    playAudio: 'Play audio',
    pauseAudio: 'Pause audio',
    resumeAudio: 'Resume audio',
    replayAudio: 'Replay Ruqyah',
    previousAudio: 'Previous item',
    nextAudio: 'Next item',
    stopAudio: 'Stop audio',
    closeAudio: 'Close audio player',
    audioPlayer: 'Ruqyah audio player',
    audioNowPlaying: 'Now playing',
    audioRepeat: (current, target) => `Recitation ${current} of ${target}`,
    audioSpeed: 'Speed',
    decreaseAudioSpeed: 'Decrease playback speed',
    increaseAudioSpeed: 'Increase playback speed',
    audioReciter: 'Mishary Alafasy',
    audioError: 'This audio could not be loaded. Try again or choose another item.',
    openAthkar: 'Open Athkar',
    byline: 'by AbdurRahaman Shah',

    tapHint: 'Tap anywhere on a passage to count one recitation.',
    gotIt: 'Got it',

    backToList: 'Back to list',
    openDetailsFor: 'Open details for',
    translationLabel: 'Translation',
    aboutLabel: 'About',
    sourceLabel: 'Source',
    repeatTimes: (n) => `Repeat ${n} times`,
    once: 'Once',
    notFound: 'That item was not found.',

    installTitleIos: 'Add Ruqyah to Home Screen',
    installTitleOther: 'Install Ruqyah App',
    installBodyIos: 'Open Share, then choose Add to Home Screen.',
    installBodyOther: 'Install for quicker access and app-like experience.',
    install: 'Install',
    notNow: 'Not now',

    howToTitle: 'Ruqyah shar‘iyyah',
    howToIntro: 'Ruqyah shar‘iyyah is recitation of the Qur’an and words taught by the Prophet ﷺ, said with the conviction that the cure is from Allah alone. Nothing here is a formula or a charm. The short form takes roughly ten minutes; the long form adds passages for a longer sitting.',
    methodSteps: [
      'Begin in wudu if you can, seated and unhurried, and say أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ before you start.',
      'Recite aloud enough to hear yourself, with attention to meaning — slow is better than complete.',
      'Cup your palms, breathe lightly into them after the three Quls, and wipe over the head, face and whatever you can reach of the body.',
      'Keep it daily. The protection described in these narrations is tied to consistency, not intensity.',
    ],
    reminders: [
      { title: 'The cure is from Allah, and the words are a means', body: 'Ruqyah does not work mechanically. What is narrated is tied to yaqīn, recitation with real conviction, not to getting the counts right.' },
      { title: 'Ruqyah sits alongside medicine, never in place of it', body: 'The Prophet ﷺ both recited and instructed people to seek treatment. If something is physically or mentally wrong, see a doctor as well.' },
      { title: 'Recite on yourself first', body: 'Self-ruqyah is the strongest and the safest. Be cautious of anyone who charges for it, asks for your mother’s name, a personal item, or anything not found in the Sunnah.' },
    ],
    howToHadith: '“Whoever recites Qul Huwallahu Ahad, Qul A‘udhu bi-Rabbil-Falaq and Qul A‘udhu bi-Rabbin-Nas three times in the morning and evening, they will suffice him against everything.”',
    howToHadithSource: 'Abū Dāwūd 5082 · al-Tirmidhī 3575',
    continueLabel: 'Continue',
  },

  ar: {
    appName: 'رُقْيَة',
    howToRecite: 'كيفية الرقية',
    settings: 'الإعدادات',
    done: 'تم',

    formLabel: 'الشكل',
    formHelp: 'الشكل القصير هو الورد اليومي: آيات القرآن الأساسية والأدعية. أما الطويل فيضيف القراءات الموسّعة التي تُقرأ ضد السحر والعين والجن.',
    formShort: 'قصير',
    formLong: 'طويل',
    itemsCount: (n) => `${toArabicDigits(n)} عنصرًا`,

    targetLabel: 'الرقية لـ',
    targetHelp: 'الرقية على نفسك هي الورد اليومي المعتاد، بصيغة المتكلم. أما الرقية على شخص آخر — قريب مريض، طفل، أي شخص في رعايتك — فتخاطبه مباشرة، والعربية تُفرّق بين المخاطَب الذكر والأنثى، ولهذا يختلف اللفظ بين «له» و«لها».',
    targetSelf: 'نفسي',
    targetHim: 'له',
    targetHer: 'لها',
    targetSelfNote: 'بصيغة المتكلم — الورد اليومي المعتاد',
    targetHimNote: 'رقية على شخص آخر — ذكر',
    targetHerNote: 'رقية على شخص آخر — أنثى',

    timeLabel: 'الوقت',
    timeHelp: 'يُختار تلقائيًا من ساعة الجهاز عند فتح التطبيق. يمكن تغييره من هنا أو بزر الشمس والقمر.',
    morning: 'الصباح',
    evening: 'المساء',
    switchToMorning: 'التبديل إلى ورد الصباح',
    switchToEvening: 'التبديل إلى ورد المساء',
    morningToast: 'ورد الصباح',
    eveningToast: 'ورد المساء',

    fontSizeLabel: 'حجم الخط',
    fontSizeHelp: 'تعديل حجم النص القرآني والأدعية. يمكنك أيضًا استخدام إيماءة التكبير أو التصغير بإصبعين لتغيير الحجم.',
    fontSizeSmall: 'صغير',
    fontSizeMedium: 'متوسط',
    fontSizeLarge: 'كبير',
    fontSizeXLarge: 'كبير جدًا',
    fontSizeToast: (name) => `حجم الخط: ${name}`,
    progressLabel: 'التقدم في الورد',
    resetCounters: 'إعادة ضبط العدّادات',
    resetConfirm: 'هل تريد إعادة ضبط جميع العدّادات؟',
    playRuqyah: 'تشغيل الرقية',
    playAudio: 'تشغيل الصوت',
    pauseAudio: 'إيقاف الصوت مؤقتًا',
    resumeAudio: 'متابعة الصوت',
    replayAudio: 'إعادة تشغيل الرقية',
    previousAudio: 'العنصر السابق',
    nextAudio: 'العنصر التالي',
    stopAudio: 'إيقاف الصوت',
    closeAudio: 'إغلاق مشغّل الصوت',
    audioPlayer: 'مشغّل صوت الرقية',
    audioNowPlaying: 'يُشغّل الآن',
    audioRepeat: (current, target) => `القراءة ${toArabicDigits(current)} من ${toArabicDigits(target)}`,
    audioSpeed: 'السرعة',
    decreaseAudioSpeed: 'إبطاء سرعة التشغيل',
    increaseAudioSpeed: 'زيادة سرعة التشغيل',
    audioReciter: 'مشاري العفاسي',
    audioError: 'تعذّر تحميل هذا الصوت. حاول مرة أخرى أو اختر عنصرًا آخر.',
    openAthkar: 'فتح تطبيق الأذكار',
    byline: 'بقلم عبدالرحمن شاه',

    tapHint: 'اضغط في أي مكان على السطر لعدّ قراءة واحدة.',
    gotIt: 'حسنًا',

    backToList: 'العودة إلى القائمة',
    openDetailsFor: 'فتح تفاصيل',
    translationLabel: 'الترجمة',
    aboutLabel: 'حول',
    sourceLabel: 'المصدر',
    repeatTimes: (n) => `تُكرَّر ${toArabicDigits(n)} مرات`,
    once: 'مرة واحدة',
    notFound: 'تعذّر العثور على هذا العنصر.',

    installTitleIos: 'أضف رقية إلى الشاشة الرئيسية',
    installTitleOther: 'ثبّت تطبيق رقية',
    installBodyIos: 'افتح قائمة المشاركة، ثم اختر «إضافة إلى الشاشة الرئيسية».',
    installBodyOther: 'ثبّت التطبيق لوصول أسرع وتجربة أشبه بالتطبيقات.',
    install: 'تثبيت',
    notNow: 'ليس الآن',

    howToTitle: 'الرقية الشرعية',
    howToIntro: 'الرقية الشرعية هي قراءة القرآن والكلمات التي علّمها النبي ﷺ، تُقال مع اليقين بأن الشفاء من الله وحده. ليس شيء من هذا رقمًا أو تعويذة. يستغرق الشكل القصير نحو عشر دقائق، ويضيف الشكل الطويل قراءات لجلسة أطول.',
    methodSteps: [
      'توضّأ إن استطعت، واجلس بلا استعجال، وقل «أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ» قبل أن تبدأ.',
      'اقرأ بصوت تسمعه أذناك، مع تدبّر المعنى؛ فالبطء خير من إتمام القراءة على عجل.',
      'اجمع كفّيك وانفث فيهما نفثًا خفيفًا بعد المعوذات الثلاث، وامسح بهما رأسك ووجهك وما استطعت من جسدك.',
      'داوم عليها كل يوم؛ فالحماية المذكورة في هذه الأحاديث مرتبطة بالمداومة لا بكثرة القراءة في مرة واحدة.',
    ],
    reminders: [
      { title: 'الشفاء من الله، والكلمات وسيلة', body: 'الرقية لا تعمل بطريقة آلية. ما ورد في هذه الأحاديث مرتبط باليقين والقراءة بقناعة حقيقية، لا بضبط العدد بدقة.' },
      { title: 'الرقية تكمّل الطب، ولا تُغني عنه', body: 'كان النبي ﷺ يرقي ويأمر بالتداوي معًا. إن كان هناك خلل جسدي أو نفسي فاطلب العلاج الطبي أيضًا.' },
      { title: 'ارقِ نفسك أولًا', body: 'الرقية على النفس هي الأقوى والأسلم. احذر ممن يطلب أجرًا على الرقية، أو يسأل عن اسم والدتك، أو يطلب منك شيئًا شخصيًا، أو أي شيء لم يرد في السنة.' },
    ],
    howToHadith: '«من قرأ قُلْ هُوَ اللهُ أَحَدٌ، وقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، وقُلْ أَعُوذُ بِرَبِّ النَّاسِ حين يصبح وحين يمسي ثلاث مرات، كفته من كل شيء.»',
    howToHadithSource: 'أبو داود ٥٠٨٢ · الترمذي ٣٥٧٥',
    continueLabel: 'متابعة',
  },
};

export function t(key, ...args) {
  const entry = STRINGS[locale.value]?.[key] ?? STRINGS.en[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

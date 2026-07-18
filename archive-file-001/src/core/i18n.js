/**
 * Minimal EN/AR string catalog + live language switching. No build-time
 * dependency, no network fetch — everything the game says lives in this
 * one dictionary, matching the "no external assets" constraint the rest
 * of the pipeline follows.
 */
const STRINGS = {
  en: {
    'game.title': 'ARCHIVE',
    'start.body': 'Tap to step inside.',
    'start.hint.desktop':
      'Move — W A S D &nbsp;·&nbsp; Look — Mouse &nbsp;·&nbsp; Interact — Click<br />Casebook — Tab &nbsp;·&nbsp; Settings — top-left',
    'start.hint.touch':
      'Move — left stick &nbsp;·&nbsp; Look — drag &nbsp;·&nbsp; Interact — button<br />Casebook — book icon &nbsp;·&nbsp; Settings — gear icon',
    'casebook.title': 'CASEBOOK',
    'casebook.case1.title': "CASE 001 — The Clerk's Desk",
    'casebook.case2.title': 'CASE 002 — The Silent Reel',
    'casebook.case3.title': 'CASE 003 — The Noon Mark',
    'casebook.empty': 'Nothing filed yet.',
    'casebook.footer': 'Tab, or tap outside, to close',
    'case1.solve.caption': 'Something shifts beneath the desk.',
    'case1.photo.caption': 'A photograph, pinned above the desk. The chair does not sit like this anymore.',
    'case1.photo.entry':
      'A pinned photograph of this desk — the chair pulled aside, turned toward the window. Not where it stands now.',
    'case1.compartment.denied': 'Sealed. Nothing here moves yet.',
    'case1.key.caption': 'A brass key. Someone meant to come back for this.',
    'case1.key.entry':
      "A key, found beneath the false floor of a clerk's desk — left for whoever finally noticed the chair.",
    'case1.closed.caption': 'Case 001 — closed.',
    'case1.closed.entry': "The desk's last secret is out. Case 001 — closed.",
    'case2.horn.caption': 'A recorded pitch, held on a wax cylinder. Something down here should answer it.',
    'case2.horn.entry': 'A phonograph horn, still holding one recorded tone — a reference for something else in the vault.',
    'case2.dial.caption': 'A selector dial, cycling through the vault pipes.',
    'case2.compartment.denied': 'The panel does not move. Not yet.',
    'case2.solve.caption': 'One pipe answers the recording. A panel clicks free.',
    'case2.key.caption': 'A recording spindle, still warm from the pipe that held it.',
    'case2.key.entry': 'A spindle, drawn from the one vault pipe that ever matched the recorded tone.',
    'case2.closed.caption': 'Case 002 — closed.',
    'case2.closed.entry': 'The vault falls quiet again. Case 002 — closed.',
    'case3.mark.caption': 'A brass mark, set into the floor — waiting for the light to find it.',
    'case3.mark.entry': "A photosensitive mark set into the Conservatory floor — inert until the room's light lands on it correctly.",
    'case3.mirror.caption': 'A mounted lens, free to turn.',
    'case3.compartment.denied': 'No light reaches it yet.',
    'case3.solve.caption': 'The beam finds the mark. Somewhere close, a panel gives way.',
    'case3.key.caption': 'A glass token, warm from the light that found it.',
    'case3.key.entry': 'A token of cut glass, drawn from the one place in the Conservatory the light was ever meant to reach.',
    'case3.closed.caption': 'Case 003 — closed.',
    'case3.closed.entry': 'The Conservatory dims to its ordinary daylight. Case 003 — closed.',
    'ending.caption': 'Three cases closed. The Archive holds far more than three.',
    'settings.title': 'SETTINGS',
    'settings.language': 'Language',
    'settings.brightness': 'Brightness',
    'settings.close': 'Close',
    'settings.language.en': 'English',
    'settings.language.ar': 'Arabic',
  },
  ar: {
    'game.title': 'الأرشيف',
    'start.body': 'اضغط لتدخل.',
    'start.hint.desktop':
      'الحركة — W A S D &nbsp;·&nbsp; النظر — الفأرة &nbsp;·&nbsp; تفاعل — نقرة<br />دفتر القضية — Tab &nbsp;·&nbsp; الإعدادات — أعلى اليسار',
    'start.hint.touch':
      'الحركة — العصا اليسرى &nbsp;·&nbsp; النظر — اسحب &nbsp;·&nbsp; تفاعل — الزر<br />دفتر القضية — أيقونة الدفتر &nbsp;·&nbsp; الإعدادات — أيقونة الترس',
    'casebook.title': 'دفتر القضايا',
    'casebook.case1.title': 'القضية ٠٠١ — مكتب الكاتب',
    'casebook.case2.title': 'القضية ٠٠٢ — البكرة الصامتة',
    'casebook.case3.title': 'القضية ٠٠٣ — علامة الظهيرة',
    'casebook.empty': 'لا يوجد شيء مسجّل بعد.',
    'casebook.footer': 'اضغط Tab، أو انقر خارج الصفحة، للإغلاق',
    'case1.solve.caption': 'شيء ما يتحرك أسفل المكتب.',
    'case1.photo.caption': 'صورة مثبتة فوق المكتب. الكرسي لم يعد بهذا الترتيب.',
    'case1.photo.entry': 'صورة مثبتة لهذا المكتب — الكرسي مسحوب جانبًا، متجهًا نحو النافذة. ليس كما هو الآن.',
    'case1.compartment.denied': 'مغلق. لا شيء يتحرك هنا بعد.',
    'case1.key.caption': 'مفتاح نحاسي. أحدهم كان ينوي العودة من أجله.',
    'case1.key.entry': 'مفتاح، عُثر عليه أسفل الأرضية الزائفة لمكتب كاتب — تُرك لمن يلاحظ أخيرًا الكرسي.',
    'case1.closed.caption': 'القضية ٠٠١ — أُغلقت.',
    'case1.closed.entry': 'سر المكتب الأخير خرج للعلن. القضية ٠٠١ — أُغلقت.',
    'case2.horn.caption': 'نغمة مسجّلة على أسطوانة شمعية. شيء هنا تحت لازم يجاوبها.',
    'case2.horn.entry': 'بوق فونوغراف، لسا محتفظ بنغمة واحدة مسجّلة — مرجع لشيء آخر بالقبو.',
    'case2.dial.caption': 'مؤشر دوّار، يتنقل بين أنابيب القبو.',
    'case2.compartment.denied': 'اللوحة ما تتحرك. مو بعد.',
    'case2.solve.caption': 'أنبوب واحد يجاوب التسجيل. لوحة تنفتح بصوت طقة.',
    'case2.key.caption': 'بكرة تسجيل، لسا دافئة من الأنبوب اللي كانت فيه.',
    'case2.key.entry': 'بكرة، أُخذت من الأنبوب الوحيد اللي طابق النغمة المسجّلة.',
    'case2.closed.caption': 'القضية ٠٠٢ — أُغلقت.',
    'case2.closed.entry': 'القبو يهدأ من جديد. القضية ٠٠٢ — أُغلقت.',
    'case3.mark.caption': 'علامة نحاسية، مثبّتة بالأرضية — تنتظر الضوء يوصلها.',
    'case3.mark.entry': 'علامة حساسة للضوء مثبّتة بأرضية الشرفة الزجاجية — بلا أثر لين يوصلها ضوء الغرفة بالزاوية الصحيحة.',
    'case3.mirror.caption': 'عدسة مثبّتة، حرة الدوران.',
    'case3.compartment.denied': 'الضوء ما وصلها بعد.',
    'case3.solve.caption': 'الشعاع يوصل العلامة. لوحة قريبة تنفتح.',
    'case3.key.caption': 'قطعة زجاج، دافئة من الضوء اللي وصلها.',
    'case3.key.entry': 'قطعة زجاج مقطوعة، أُخذت من المكان الوحيد بالشرفة اللي كان الضوء يقصده.',
    'case3.closed.caption': 'القضية ٠٠٣ — أُغلقت.',
    'case3.closed.entry': 'الشرفة الزجاجية ترجع لضوئها العادي. القضية ٠٠٣ — أُغلقت.',
    'ending.caption': 'ثلاث قضايا أُغلقت. الأرشيف فيه أكثر من ثلاث بكثير.',
    'settings.title': 'الإعدادات',
    'settings.language': 'اللغة',
    'settings.brightness': 'السطوع',
    'settings.close': 'إغلاق',
    'settings.language.en': 'الإنجليزية',
    'settings.language.ar': 'العربية',
  },
};

let currentLang = 'en';
const listeners = new Set();

export function setLanguage(lang) {
  if (!STRINGS[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  for (const fn of listeners) fn(lang);
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  return STRINGS[currentLang]?.[key] ?? STRINGS.en[key] ?? key;
}

/** Returns an unsubscribe function. */
export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Applies t() to every element tagged data-i18n (textContent) / data-i18n-html (innerHTML). */
export function applyStaticTranslations(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
}

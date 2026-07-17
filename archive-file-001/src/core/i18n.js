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
    'casebook.caseId': 'CASE 001',
    'casebook.caseName': "The Clerk's Desk",
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
    'casebook.caseId': 'القضية ٠٠١',
    'casebook.caseName': 'مكتب الكاتب',
    'casebook.empty': 'لا يوجد شيء مسجّل بعد.',
    'casebook.footer': 'اضغط Tab، أو انقر خارج الصفحة، للإغلاق',
    'case1.solve.caption': 'شيء ما يتحرك أسفل المكتب.',
    'case1.photo.caption': 'صورة مثبتة فوق المكتب. الكرسي لم يعد بهذا الترتيب.',
    'case1.photo.entry': 'صورة مثبتة لهذا المكتب — الكرسي مسحوب جانبًا، متجهًا نحو النافذة. ليس كما هو الآن.',
    'case1.compartment.denied': 'مغلق. لا شيء يتحرك هنا بعد.',
    'case1.key.caption': 'مفتاح نحاسي. أحدهم كان ينوي العودة من أجله.',
    'case1.key.entry': 'مفتاح، عُثر عليه أسفل الأرضية الزائفة لمكتب كاتب — تُرك لمن يلاحظ أخيرًا الكرسي.',
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

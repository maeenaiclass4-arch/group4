interface Dictionary {
  appName: string
  tagline: string
  nav_composer: string
  nav_history: string
  nav_favorites: string
  nav_templates: string
  new_prompt: string
  step_of: (a: number, b: number) => string
  choose_type_title: string
  choose_type_subtitle: string
  back: string
  next: string
  skip: string
  finish_review: string
  required: string
  optional: string
  extra_notes_title: string
  extra_notes_placeholder: string
  output_lang_title: string
  output_lang_ar: string
  output_lang_en: string
  select_models_title: string
  select_models_subtitle: string
  generate: string
  regenerate: string
  quality_score: string
  missing_info: string
  missing_info_desc: string
  ai_suggestions: string
  copy: string
  copied: string
  save_favorite: string
  remove_favorite: string
  edit_answers: string
  history_empty: string
  favorites_empty: string
  delete: string
  templates_title: string
  templates_subtitle: string
  use_template: string
  all_types: string
  session_from: string
  theme_toggle: string
  lang_toggle: string
  fields_answered: (a: number, b: number) => string
  start_over: string
  view_result: string
  project_type: string
  generated_on: string
  no_prompts_generated: string
  warning_missing: string
  continue_anyway: string
  complete_fields: string
  footer_note: string
}

export const translations: Record<'ar' | 'en', Dictionary> = {
  ar: {
    appName: 'مُركّب البرومبت',
    tagline: 'حوّل أفكارك إلى برومبت احترافي لأي نموذج ذكاء اصطناعي',
    nav_composer: 'إنشاء برومبت',
    nav_history: 'السجل',
    nav_favorites: 'المفضلة',
    nav_templates: 'القوالب',
    new_prompt: 'برومبت جديد',
    step_of: (a: number, b: number) => `الخطوة ${a} من ${b}`,
    choose_type_title: 'ما نوع مشروعك؟',
    choose_type_subtitle: 'اختر التصنيف الأقرب لفكرتك، وسنطرح عليك أسئلة مخصصة له فقط.',
    back: 'رجوع',
    next: 'التالي',
    skip: 'تخطي',
    finish_review: 'مراجعة وتوليد',
    required: 'مطلوب',
    optional: 'اختياري',
    extra_notes_title: 'هل هناك أي تفاصيل إضافية؟',
    extra_notes_placeholder: 'أي معلومة أخرى تريد إضافتها، مراجع، أمثلة، قيود...',
    output_lang_title: 'لغة البرومبت الناتج',
    output_lang_ar: 'العربية',
    output_lang_en: 'الإنجليزية',
    select_models_title: 'لأي نماذج تريد توليد البرومبت؟',
    select_models_subtitle: 'يمكنك اختيار أكثر من نموذج، وسنولّد نسخة محسّنة لكل واحد.',
    generate: 'توليد البرومبتات',
    regenerate: 'إعادة التوليد',
    quality_score: 'جودة البرومبت',
    missing_info: 'معلومات ناقصة',
    missing_info_desc: 'أضف هذه التفاصيل للحصول على نتائج أدق:',
    ai_suggestions: 'اقتراحات ذكية',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    save_favorite: 'إضافة للمفضلة',
    remove_favorite: 'إزالة من المفضلة',
    edit_answers: 'تعديل الإجابات',
    history_empty: 'لا يوجد سجل بعد. ابدأ بإنشاء أول برومبت لك.',
    favorites_empty: 'لا توجد عناصر مفضلة بعد.',
    delete: 'حذف',
    templates_title: 'قوالب جاهزة',
    templates_subtitle: 'ابدأ بسرعة من قالب جاهز ثم عدّله كما تشاء',
    use_template: 'استخدام القالب',
    all_types: 'الكل',
    session_from: 'برومبت',
    theme_toggle: 'تبديل المظهر',
    lang_toggle: 'English',
    fields_answered: (a: number, b: number) => `${a} من ${b} حقول مُجابة`,
    start_over: 'ابدأ من جديد',
    view_result: 'عرض النتيجة',
    project_type: 'نوع المشروع',
    generated_on: 'تاريخ الإنشاء',
    no_prompts_generated: 'لم يتم توليد أي برومبت بعد.',
    warning_missing: 'بعض الحقول الأساسية غير مكتملة. يمكنك المتابعة لكن جودة النتيجة ستكون أقل.',
    continue_anyway: 'المتابعة رغم ذلك',
    complete_fields: 'إكمال الحقول',
    footer_note: 'أداة إنتاجية احترافية لصناعة برومبتات دقيقة لكل نماذج الذكاء الاصطناعي.',
  },
  en: {
    appName: 'Prompt Composer',
    tagline: 'Turn your ideas into professional prompts for any AI model',
    nav_composer: 'Composer',
    nav_history: 'History',
    nav_favorites: 'Favorites',
    nav_templates: 'Templates',
    new_prompt: 'New Prompt',
    step_of: (a: number, b: number) => `Step ${a} of ${b}`,
    choose_type_title: 'What kind of project is this?',
    choose_type_subtitle: "Pick the category closest to your idea — we'll ask only relevant questions next.",
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    finish_review: 'Review & Generate',
    required: 'Required',
    optional: 'Optional',
    extra_notes_title: 'Any extra details?',
    extra_notes_placeholder: 'Anything else to add — references, examples, constraints...',
    output_lang_title: 'Output prompt language',
    output_lang_ar: 'Arabic',
    output_lang_en: 'English',
    select_models_title: 'Which AI models do you want prompts for?',
    select_models_subtitle: "Pick as many as you like — we'll generate an optimized version for each.",
    generate: 'Generate Prompts',
    regenerate: 'Regenerate',
    quality_score: 'Prompt quality',
    missing_info: 'Missing information',
    missing_info_desc: 'Add these details for more accurate results:',
    ai_suggestions: 'AI suggestions',
    copy: 'Copy',
    copied: 'Copied!',
    save_favorite: 'Add to favorites',
    remove_favorite: 'Remove from favorites',
    edit_answers: 'Edit answers',
    history_empty: 'No history yet. Create your first prompt.',
    favorites_empty: 'No favorites yet.',
    delete: 'Delete',
    templates_title: 'Ready-made templates',
    templates_subtitle: 'Start fast from a template, then tweak it your way',
    use_template: 'Use template',
    all_types: 'All',
    session_from: 'Prompt',
    theme_toggle: 'Toggle theme',
    lang_toggle: 'العربية',
    fields_answered: (a: number, b: number) => `${a} of ${b} fields answered`,
    start_over: 'Start over',
    view_result: 'View result',
    project_type: 'Project type',
    generated_on: 'Generated on',
    no_prompts_generated: 'No prompts generated yet.',
    warning_missing: "Some key fields aren't filled in. You can continue, but result quality will be lower.",
    continue_anyway: 'Continue anyway',
    complete_fields: 'Complete fields',
    footer_note: 'A professional productivity tool for crafting precise prompts across every AI model.',
  },
}

export type TranslationKey = keyof Dictionary

"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AdminLang = "ar" | "en";

const dict = {
  ar: {
    appName: "YAZ CMS",
    nav_dashboard: "الرئيسية",
    nav_categories: "الأقسام",
    nav_projects: "المشاريع",
    nav_settings: "إعدادات الموقع",
    nav_media: "مكتبة الوسائط",
    nav_viewSite: "عرض الموقع",
    nav_logout: "تسجيل الخروج",
    common_save: "حفظ",
    common_saving: "جارٍ الحفظ...",
    common_saved: "تم الحفظ",
    common_autosaving: "حفظ تلقائي...",
    common_autosaved: "تم الحفظ تلقائيًا",
    common_cancel: "إلغاء",
    common_delete: "حذف",
    common_edit: "تعديل",
    common_add: "إضافة",
    common_create: "إنشاء",
    common_new: "جديد",
    common_search: "بحث...",
    common_publish: "نشر",
    common_published: "منشور",
    common_draft: "مسودة",
    common_featured: "مميز",
    common_notFeatured: "غير مميز",
    common_confirmDelete: "هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.",
    common_yes: "نعم، احذف",
    common_no: "تراجع",
    common_back: "رجوع",
    common_preview: "معاينة حية",
    common_tags: "الوسوم",
    common_category: "القسم",
    common_image: "الصورة",
    common_video: "الفيديو",
    common_upload: "رفع ملف",
    common_dragDropHint: "اسحب وأفلت صورة أو فيديو هنا، أو اضغط للاختيار",
    common_all: "الكل",
    common_none: "بدون",
    common_actions: "إجراءات",
    common_order: "الترتيب",
    common_arabic: "العربية",
    common_english: "English",
    common_loading: "جارٍ التحميل...",
    common_noResults: "لا توجد نتائج",
    login_title: "تسجيل الدخول",
    login_subtitle: "لوحة تحكم بورتفوليو YAZ",
    login_email: "البريد الإلكتروني",
    login_password: "كلمة المرور",
    login_submit: "دخول",
    login_error: "بيانات الدخول غير صحيحة",
    dashboard_welcome: "أهلًا بعودتك",
    dashboard_subtitle: "إدارة كل محتوى البورتفوليو من مكان واحد.",
    dashboard_totalProjects: "إجمالي المشاريع",
    dashboard_totalCategories: "الأقسام",
    dashboard_featuredProjects: "مشاريع مميزة",
    dashboard_totalMedia: "ملفات الوسائط",
    dashboard_quickActions: "إجراءات سريعة",
    dashboard_addProject: "إضافة مشروع جديد",
    dashboard_manageCategories: "إدارة الأقسام",
    dashboard_editSettings: "تعديل إعدادات الموقع",
    projects_title: "المشاريع",
    projects_subtitle: "أضف، رتّب، ونظّم كل أعمالك — يظهر التغيير مباشرة على الموقع.",
    projects_addNew: "مشروع جديد",
    projects_filterCategory: "تصفية حسب القسم",
    projects_filterFeatured: "المميزة فقط",
    categories_title: "الأقسام",
    categories_subtitle: "الأقسام الرئيسية التي تظهر كتبويبات في الموقع.",
    categories_addNew: "قسم جديد",
    settings_title: "إعدادات الموقع",
    settings_subtitle: "النصوص العامة، الشعار، وروابط التواصل.",
    media_title: "مكتبة الوسائط",
    media_subtitle: "كل الصور والفيديوهات المرفوعة.",
    editor_arabicContent: "المحتوى بالعربية",
    editor_englishContent: "المحتوى بالإنجليزية",
    editor_title: "العنوان",
    editor_description: "الوصف",
    editor_subCategoryLabel: "تصنيف فرعي (اختياري)",
    editor_toolTag: "أداة/برنامج (اختياري)",
    editor_linkUrl: "رابط التشغيل (اختياري)",
    editor_linkUrlHint: "إذا حطيت رابط، صورة المشروع بتصير قابلة للنقر وتفتح هذا الرابط في تبويب جديد — مفيد لبرامج أو تطبيقات ويب.",
    editor_livePreview: "معاينة حية",
    editor_keyboardHint: "⌘S للحفظ · ⌘Enter للنشر",
  },
  en: {
    appName: "YAZ CMS",
    nav_dashboard: "Dashboard",
    nav_categories: "Categories",
    nav_projects: "Projects",
    nav_settings: "Site Settings",
    nav_media: "Media Library",
    nav_viewSite: "View Site",
    nav_logout: "Log Out",
    common_save: "Save",
    common_saving: "Saving...",
    common_saved: "Saved",
    common_autosaving: "Autosaving...",
    common_autosaved: "Autosaved",
    common_cancel: "Cancel",
    common_delete: "Delete",
    common_edit: "Edit",
    common_add: "Add",
    common_create: "Create",
    common_new: "New",
    common_search: "Search...",
    common_publish: "Publish",
    common_published: "Published",
    common_draft: "Draft",
    common_featured: "Featured",
    common_notFeatured: "Not featured",
    common_confirmDelete: "Are you sure you want to delete this? This cannot be undone.",
    common_yes: "Yes, delete",
    common_no: "Cancel",
    common_back: "Back",
    common_preview: "Live preview",
    common_tags: "Tags",
    common_category: "Category",
    common_image: "Image",
    common_video: "Video",
    common_upload: "Upload file",
    common_dragDropHint: "Drag & drop an image or video, or click to browse",
    common_all: "All",
    common_none: "None",
    common_actions: "Actions",
    common_order: "Order",
    common_arabic: "Arabic",
    common_english: "English",
    common_loading: "Loading...",
    common_noResults: "No results",
    login_title: "Sign in",
    login_subtitle: "YAZ Portfolio Admin",
    login_email: "Email",
    login_password: "Password",
    login_submit: "Sign in",
    login_error: "Invalid credentials",
    dashboard_welcome: "Welcome back",
    dashboard_subtitle: "Manage every part of the portfolio from one place.",
    dashboard_totalProjects: "Total Projects",
    dashboard_totalCategories: "Categories",
    dashboard_featuredProjects: "Featured Projects",
    dashboard_totalMedia: "Media Files",
    dashboard_quickActions: "Quick Actions",
    dashboard_addProject: "Add New Project",
    dashboard_manageCategories: "Manage Categories",
    dashboard_editSettings: "Edit Site Settings",
    projects_title: "Projects",
    projects_subtitle: "Add, reorder, and organize your work — changes go live instantly.",
    projects_addNew: "New Project",
    projects_filterCategory: "Filter by category",
    projects_filterFeatured: "Featured only",
    categories_title: "Categories",
    categories_subtitle: "The top-level tabs shown on the site.",
    categories_addNew: "New Category",
    settings_title: "Site Settings",
    settings_subtitle: "Global text, logo, and social links.",
    media_title: "Media Library",
    media_subtitle: "All uploaded images and videos.",
    editor_arabicContent: "Arabic Content",
    editor_englishContent: "English Content",
    editor_title: "Title",
    editor_description: "Description",
    editor_subCategoryLabel: "Sub-category label (optional)",
    editor_toolTag: "Tool/software tag (optional)",
    editor_linkUrl: "Launch link (optional)",
    editor_linkUrlHint: "If set, the project's image becomes clickable and opens this link in a new tab — useful for apps or software.",
    editor_livePreview: "Live Preview",
    editor_keyboardHint: "⌘S to save · ⌘Enter to publish",
  },
} as const;

export type DictKey = keyof (typeof dict)["ar"];

interface AdminI18nContextValue {
  lang: AdminLang;
  dir: "rtl" | "ltr";
  setLang: (l: AdminLang) => void;
  t: (key: DictKey) => string;
}

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

export function AdminI18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("ar");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("admin-lang") as AdminLang | null) : null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  function setLang(l: AdminLang) {
    setLangState(l);
    localStorage.setItem("admin-lang", l);
  }

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  function t(key: DictKey) {
    return dict[lang][key] ?? key;
  }

  return <AdminI18nContext.Provider value={{ lang, dir, setLang, t }}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) throw new Error("useAdminI18n must be used within AdminI18nProvider");
  return ctx;
}

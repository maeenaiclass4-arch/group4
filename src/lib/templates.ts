import type { Template } from './types'

const t = (ar: string, en: string) => ({ ar, en })

export const TEMPLATES: Template[] = [
  {
    id: 'design-tech-logo',
    projectType: 'design',
    title: t('شعار لشركة ناشئة تقنية', 'Logo for a tech startup'),
    subtitle: t('هوية بصرية عصرية وبسيطة', 'Modern, minimal brand identity'),
    answers: {
      designKind: 'logo',
      brandInfo:
        'شركة ناشئة تقدم حلول ذكاء اصطناعي للشركات الصغيرة، تستهدف رواد أعمال شباب، وتريد الظهور بمظهر موثوق ومبتكر',
      style: 'modern',
      colors: 'أزرق داكن وأبيض مع لمسة بنفسجي',
      deliverable: 'PNG شفاف بخلفية، وصيغة SVG قابلة للتحرير',
    },
  },
  {
    id: 'game-platformer',
    projectType: 'game',
    title: t('لعبة منصات بأسلوب بيكسل', 'Pixel-art platformer game'),
    subtitle: t('مغامرة ثنائية الأبعاد', '2D adventure concept'),
    answers: {
      gameGenre: 'platformer',
      platform: 'mobile',
      artStyle: 'pixel',
      mechanics: 'بطل صغير يجمع بلورات سحرية ويتجنب الأفخاخ عبر مراحل متزايدة الصعوبة، مع قدرة قفز مزدوج تُفتح لاحقًا',
      targetAudience: 'أطفال ومراهقون',
    },
  },
  {
    id: 'video-product-ad',
    projectType: 'video',
    title: t('إعلان منتج لسوشيال ميديا', 'Product ad for social media'),
    subtitle: t('فيديو قصير وحماسي', 'Short, energetic clip'),
    answers: {
      videoType: 'ad',
      concept: 'إعلان قصير لسماعات لاسلكية جديدة يبرز جودة الصوت وعمر البطارية الطويل بأسلوب سريع الإيقاع',
      platform: 'tiktok',
      duration: '15 ثانية',
      toneStyle: 'energetic',
    },
  },
  {
    id: 'programming-bugfix',
    projectType: 'programming',
    title: t('إصلاح خطأ في واجهة برمجية', 'Fix a REST API bug'),
    subtitle: t('مهمة برمجية محددة', 'Focused engineering task'),
    answers: {
      taskType: 'bug-fix',
      stack: 'Node.js, Express, PostgreSQL',
      context: 'نقطة النهاية POST /orders تفشل أحيانًا بخطأ 500 عند إرسال طلبات متزامنة بسبب تعارض في تحديث المخزون',
      acceptance: 'يجب أن تعالج الطلبات المتزامنة بأمان دون فقدان أو ازدواجية في تحديث المخزون',
      constraints: 'الحفاظ على التوافق مع واجهة API الحالية دون كسرها',
    },
  },
  {
    id: 'marketing-launch',
    projectType: 'marketing',
    title: t('حملة إطلاق منتج', 'Product launch campaign'),
    subtitle: t('محتوى إعلاني مقنع', 'Persuasive ad copy'),
    answers: {
      campaignType: 'social-post',
      product: 'كريم ترطيب طبيعي جديد خالٍ من المواد الكيميائية، سعره 25 دولار',
      targetAudience: 'نساء بين 20 و35 سنة مهتمات بالعناية الطبيعية بالبشرة',
      platform: 'instagram',
      cta: 'اطلبي الآن واحصلي على خصم 20٪',
      tone: 'persuasive',
    },
  },
  {
    id: 'image-product-shot',
    projectType: 'image',
    title: t('صورة منتج احترافية', 'Professional product shot'),
    subtitle: t('تصوير تجاري بجودة استوديو', 'Studio-quality commercial shot'),
    answers: {
      subject: 'زجاجة عطر فاخرة موضوعة على سطح رخامي عاكس',
      style: 'photorealistic',
      composition: 'لقطة قريبة بزاوية منخفضة قليلاً',
      lighting: 'studio',
      colorPalette: 'ذهبي وأسود مع انعكاسات ناعمة',
      mood: 'فاخر وهادئ',
      aspectRatio: '1:1',
      negativeElements: 'نص، أيدٍ، خلفية فوضوية',
    },
  },
  {
    id: 'website-saas-landing',
    projectType: 'website',
    title: t('صفحة هبوط لمنتج SaaS', 'SaaS product landing page'),
    subtitle: t('تصميم يركز على التحويل', 'Conversion-focused design'),
    answers: {
      siteType: 'landing',
      purpose: 'صفحة هبوط لأداة إدارة مشاريع تستهدف فرق العمل الصغيرة والمتوسطة لزيادة عدد التسجيلات المجانية',
      pages: 'الرئيسية، المزايا، الأسعار، آراء العملاء، تواصل معنا',
      styleVibe: 'tech',
      keyFeatures: 'نموذج تسجيل، عرض توضيحي تفاعلي، شهادات عملاء، مقارنة الخطط',
      techPreference: 'React و Tailwind CSS',
    },
  },
  {
    id: 'writing-blog-post',
    projectType: 'writing',
    title: t('مقال مدونة تقني', 'Technical blog post'),
    subtitle: t('محتوى تعليمي جذاب', 'Engaging educational content'),
    answers: {
      contentType: 'blog',
      topic: 'مقال يشرح كيف يمكن للشركات الصغيرة استخدام الذكاء الاصطناعي لتحسين خدمة العملاء، مع أمثلة عملية',
      audience: 'أصحاب الأعمال الصغيرة غير التقنيين',
      tone: 'conversational',
      length: 'medium',
    },
  },
]

export function getTemplatesForType(projectTypeId: string): Template[] {
  return TEMPLATES.filter((tpl) => tpl.projectType === projectTypeId)
}

export type Lang = "ar" | "en";

export interface ProjectDTO {
  id: string;
  order: number;
  featured: boolean;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  image: string | null;
  video: string | null;
  link: string | null;
  softTag: string | null;
  catLabelAr: string | null;
  catLabelEn: string | null;
  tags: { id: string; nameAr: string; nameEn: string; slug: string }[];
}

export interface CategoryDTO {
  id: string;
  slug: string;
  order: number;
  isContact: boolean;
  colorFrom: string;
  colorTo: string;
  glowColorHex: string;
  image: string | null;
  labelAr: string;
  labelEn: string;
  greetTitleAr: string | null;
  greetTitleEn: string | null;
  greetTextAr: string | null;
  greetTextEn: string | null;
  projects: ProjectDTO[];
}

export interface SiteSettingsDTO {
  logo: string | null;
  eyebrowAr: string;
  eyebrowEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubAr: string;
  heroSubEn: string;
  sectionLabelAr: string;
  sectionLabelEn: string;
  previewAr: string;
  previewEn: string;
  footerAr: string;
  footerEn: string;
  contactTitleAr: string;
  contactTitleEn: string;
  contactTextAr: string;
  contactTextEn: string;
  contactEmail: string;
  contactEmailLabelAr: string;
  contactEmailLabelEn: string;
  socialInstagram: string | null;
  socialBehance: string | null;
  socialLinkedin: string | null;
  socialX: string | null;
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

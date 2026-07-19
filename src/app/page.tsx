import { prisma } from "@/lib/prisma";
import PortfolioApp from "@/components/site/PortfolioApp";
import type { CategoryDTO, SiteSettingsDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: {
        projects: {
          where: { published: true },
          orderBy: { order: "asc" },
          include: { tags: true },
        },
      },
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  const categoryDTOs: CategoryDTO[] = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    order: c.order,
    isContact: c.isContact,
    colorFrom: c.colorFrom,
    colorTo: c.colorTo,
    glowColorHex: c.glowColorHex,
    image: c.image,
    labelAr: c.labelAr,
    labelEn: c.labelEn,
    greetTitleAr: c.greetTitleAr,
    greetTitleEn: c.greetTitleEn,
    greetTextAr: c.greetTextAr,
    greetTextEn: c.greetTextEn,
    projects: c.projects.map((p) => ({
      id: p.id,
      order: p.order,
      featured: p.featured,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      descAr: p.descAr,
      descEn: p.descEn,
      image: p.image,
      video: p.video,
      link: p.link,
      softTag: p.softTag,
      catLabelAr: p.catLabelAr,
      catLabelEn: p.catLabelEn,
      tags: p.tags.map((t) => ({ id: t.id, nameAr: t.nameAr, nameEn: t.nameEn, slug: t.slug })),
    })),
  }));

  const settingsDTO: SiteSettingsDTO = settings ?? {
    logo: null,
    eyebrowAr: "",
    eyebrowEn: "",
    heroTitleAr: "",
    heroTitleEn: "",
    heroSubAr: "",
    heroSubEn: "",
    sectionLabelAr: "",
    sectionLabelEn: "",
    previewAr: "",
    previewEn: "",
    footerAr: "",
    footerEn: "",
    contactTitleAr: "",
    contactTitleEn: "",
    contactTextAr: "",
    contactTextEn: "",
    contactEmail: "",
    contactEmailLabelAr: "",
    contactEmailLabelEn: "",
    socialInstagram: null,
    socialBehance: null,
    socialLinkedin: null,
    socialX: null,
  };

  return <PortfolioApp categories={categoryDTOs} settings={settingsDTO} />;
}

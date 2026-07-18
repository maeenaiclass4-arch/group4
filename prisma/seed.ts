import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import data from "./seed-data.json";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: { email: adminEmail, passwordHash, name: "YAZ" },
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...data.settings },
  });
  console.log("Seeded site settings");

  for (const cat of data.categories) {
    const { projects, ...catData } = cat;
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: catData.slug,
        order: catData.order,
        isContact: (catData as any).isContact ?? false,
        colorFrom: catData.colorFrom,
        colorTo: catData.colorTo,
        glowColorHex: catData.glowColorHex,
        image: (catData as any).image ?? null,
        labelAr: catData.labelAr,
        labelEn: catData.labelEn,
        greetTitleAr: (catData as any).greetTitleAr ?? null,
        greetTitleEn: (catData as any).greetTitleEn ?? null,
        greetTextAr: (catData as any).greetTextAr ?? null,
        greetTextEn: (catData as any).greetTextEn ?? null,
      },
    });

    const existingProjects = await prisma.project.count({ where: { categoryId: category.id } });
    if (existingProjects === 0) {
      for (let i = 0; i < projects.length; i++) {
        const p = projects[i] as any;
        await prisma.project.create({
          data: {
            categoryId: category.id,
            order: i,
            titleAr: p.titleAr,
            titleEn: p.titleEn,
            descAr: p.descAr ?? "",
            descEn: p.descEn ?? "",
            image: p.image ?? null,
            softTag: p.softTag ?? null,
            catLabelAr: p.catLabelAr ?? null,
            catLabelEn: p.catLabelEn ?? null,
          },
        });
      }
    }
    console.log(`Seeded category "${cat.slug}" with ${projects.length} projects`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

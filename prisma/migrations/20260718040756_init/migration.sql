-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isContact" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "colorFrom" TEXT NOT NULL DEFAULT '#2f9bf5',
    "colorTo" TEXT NOT NULL DEFAULT '#8b5cf6',
    "glowColorHex" TEXT NOT NULL DEFAULT '#2f9bf5',
    "image" TEXT,
    "labelAr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "greetTitleAr" TEXT,
    "greetTitleEn" TEXT,
    "greetTextAr" TEXT,
    "greetTextEn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descAr" TEXT NOT NULL DEFAULT '',
    "descEn" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "video" TEXT,
    "softTag" TEXT,
    "catLabelAr" TEXT,
    "catLabelEn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "logo" TEXT,
    "eyebrowAr" TEXT NOT NULL DEFAULT '',
    "eyebrowEn" TEXT NOT NULL DEFAULT '',
    "heroTitleAr" TEXT NOT NULL DEFAULT '',
    "heroTitleEn" TEXT NOT NULL DEFAULT '',
    "heroSubAr" TEXT NOT NULL DEFAULT '',
    "heroSubEn" TEXT NOT NULL DEFAULT '',
    "sectionLabelAr" TEXT NOT NULL DEFAULT '',
    "sectionLabelEn" TEXT NOT NULL DEFAULT '',
    "previewAr" TEXT NOT NULL DEFAULT '',
    "previewEn" TEXT NOT NULL DEFAULT '',
    "footerAr" TEXT NOT NULL DEFAULT '',
    "footerEn" TEXT NOT NULL DEFAULT '',
    "contactTitleAr" TEXT NOT NULL DEFAULT '',
    "contactTitleEn" TEXT NOT NULL DEFAULT '',
    "contactTextAr" TEXT NOT NULL DEFAULT '',
    "contactTextEn" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "contactEmailLabelAr" TEXT NOT NULL DEFAULT '',
    "contactEmailLabelEn" TEXT NOT NULL DEFAULT '',
    "socialInstagram" TEXT,
    "socialBehance" TEXT,
    "socialLinkedin" TEXT,
    "socialX" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProjectTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProjectTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectTags_AB_unique" ON "_ProjectTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectTags_B_index" ON "_ProjectTags"("B");

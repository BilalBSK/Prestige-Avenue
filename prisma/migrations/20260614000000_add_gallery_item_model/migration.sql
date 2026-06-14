-- CreateEnum
CREATE TYPE "GalleryMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "GalleryRatio" AS ENUM ('PORTRAIT', 'LANDSCAPE', 'SQUARE');

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "mediaType" "GalleryMediaType" NOT NULL DEFAULT 'IMAGE',
    "src" TEXT NOT NULL,
    "poster" TEXT,
    "alt" TEXT NOT NULL,
    "ratio" "GalleryRatio" NOT NULL DEFAULT 'LANDSCAPE',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryItem_isPublished_displayOrder_idx" ON "GalleryItem"("isPublished", "displayOrder");

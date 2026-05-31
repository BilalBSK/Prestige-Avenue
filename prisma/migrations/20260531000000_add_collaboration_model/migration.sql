-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "partnerUrl" TEXT,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Collaboration_isPublished_displayOrder_idx" ON "Collaboration"("isPublished", "displayOrder");

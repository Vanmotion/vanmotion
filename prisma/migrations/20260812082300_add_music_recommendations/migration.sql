-- CreateTable
CREATE TABLE "public"."MusicRecommendation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MusicRecommendation_youtubeVideoId_key"
ON "public"."MusicRecommendation"("youtubeVideoId");

-- CreateIndex
CREATE INDEX "MusicRecommendation_active_idx"
ON "public"."MusicRecommendation"("active");

-- CreateIndex
CREATE INDEX "MusicRecommendation_sortOrder_idx"
ON "public"."MusicRecommendation"("sortOrder");

CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editorialScore" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsArticle_sourceUrl_key" ON "NewsArticle"("sourceUrl");
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");
CREATE INDEX "NewsArticle_locale_idx" ON "NewsArticle"("locale");
CREATE INDEX "NewsArticle_region_idx" ON "NewsArticle"("region");
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle"("category");
CREATE INDEX "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");
CREATE INDEX "NewsArticle_editorialScore_idx" ON "NewsArticle"("editorialScore");
CREATE INDEX "NewsArticle_isActive_idx" ON "NewsArticle"("isActive");
CREATE INDEX "NewsArticle_locale_region_category_isActive_editorialScore_idx" ON "NewsArticle"("locale", "region", "category", "isActive", "editorialScore");
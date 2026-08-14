ALTER TABLE "MusicRecommendation"
ADD COLUMN "editorialHeading" TEXT,
ADD COLUMN "editorialTextEs" TEXT,
ADD COLUMN "editorialTextEn" TEXT,
ADD COLUMN "editorialCredit" TEXT,
ADD COLUMN "editorialStyle" TEXT,
ADD COLUMN "documentImageUrl" TEXT,
ADD COLUMN "documentSourceUrl" TEXT,
ADD COLUMN "documentAuthentic" BOOLEAN NOT NULL DEFAULT false;

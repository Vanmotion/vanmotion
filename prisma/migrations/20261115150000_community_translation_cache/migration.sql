-- Solo crea una tabla nueva. No cambia publicaciones ni respuestas existentes.
CREATE TABLE "CommunityTranslation" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "detectedLanguage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommunityTranslation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CommunityTranslation_resourceType_resourceId_targetLanguage_key"
  ON "CommunityTranslation"("resourceType", "resourceId", "targetLanguage");
CREATE INDEX "CommunityTranslation_updatedAt_idx" ON "CommunityTranslation"("updatedAt");

-- Una sola fila por noticia: texto de origen y versión en el otro idioma.
ALTER TABLE "NewsArticle" ADD COLUMN "translatedTitle" TEXT;
ALTER TABLE "NewsArticle" ADD COLUMN "translatedSummary" TEXT;

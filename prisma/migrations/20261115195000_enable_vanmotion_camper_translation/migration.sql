-- Autoriza SOLO la traducción del tema antiguo propio de VANMOTION.
-- No modifica el título, el cuerpo, las respuestas ni otras publicaciones.
UPDATE "CommunityTopic" AS topic
SET "allowAutoTranslation" = TRUE
FROM "CommunityUser" AS author
WHERE topic."id" = 'cmuio0yni006gl304q0g8yfvw'
  AND topic."authorId" = author."id"
  AND lower(btrim(author."username")) = 'vanmotion'
  AND topic."category" = 'AUTOMOTIVE'
  AND topic."status" <> 'HIDDEN'
  AND lower(btrim(topic."title")) = lower('My camper project: transforming a van into a unique space')
  AND topic."allowAutoTranslation" = FALSE;

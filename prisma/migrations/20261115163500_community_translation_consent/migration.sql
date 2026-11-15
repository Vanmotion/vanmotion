-- Las publicaciones anteriores permanecen sin autorización y nunca se envían al traductor.
ALTER TABLE "CommunityTopic" ADD COLUMN "allowAutoTranslation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CommunityReply" ADD COLUMN "allowAutoTranslation" BOOLEAN NOT NULL DEFAULT false;

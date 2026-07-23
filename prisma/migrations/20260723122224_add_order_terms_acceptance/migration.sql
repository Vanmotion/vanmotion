-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "termsAcceptanceSource" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsVersion" TEXT;

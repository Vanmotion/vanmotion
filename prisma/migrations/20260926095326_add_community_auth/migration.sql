-- CreateTable
CREATE TABLE "CommunityLoginCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityLoginCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunitySession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunitySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityLoginCode_email_createdAt_idx" ON "CommunityLoginCode"("email", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityLoginCode_expiresAt_idx" ON "CommunityLoginCode"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunitySession_tokenHash_key" ON "CommunitySession"("tokenHash");

-- CreateIndex
CREATE INDEX "CommunitySession_userId_idx" ON "CommunitySession"("userId");

-- CreateIndex
CREATE INDEX "CommunitySession_expiresAt_idx" ON "CommunitySession"("expiresAt");

-- AddForeignKey
ALTER TABLE "CommunitySession" ADD CONSTRAINT "CommunitySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CommunityUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

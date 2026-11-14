-- CreateEnum
CREATE TYPE "CommunityCategory" AS ENUM ('MUSIC', 'FASHION', 'AUTOMOTIVE');

-- CreateEnum
CREATE TYPE "CommunityUserRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CommunityUserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CommunityTopicStatus" AS ENUM ('OPEN', 'LOCKED', 'HIDDEN');

-- CreateTable
CREATE TABLE "CommunityUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "passwordHash" TEXT,
    "role" "CommunityUserRole" NOT NULL DEFAULT 'MEMBER',
    "status" "CommunityUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityTopic" (
    "id" TEXT NOT NULL,
    "category" "CommunityCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "CommunityTopicStatus" NOT NULL DEFAULT 'OPEN',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityReply" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityUser_email_key" ON "CommunityUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityUser_username_key" ON "CommunityUser"("username");

-- CreateIndex
CREATE INDEX "CommunityUser_createdAt_idx" ON "CommunityUser"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityUser_status_idx" ON "CommunityUser"("status");

-- CreateIndex
CREATE INDEX "CommunityTopic_category_createdAt_idx" ON "CommunityTopic"("category", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityTopic_authorId_idx" ON "CommunityTopic"("authorId");

-- CreateIndex
CREATE INDEX "CommunityTopic_status_idx" ON "CommunityTopic"("status");

-- CreateIndex
CREATE INDEX "CommunityReply_topicId_createdAt_idx" ON "CommunityReply"("topicId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityReply_authorId_idx" ON "CommunityReply"("authorId");

-- AddForeignKey
ALTER TABLE "CommunityTopic" ADD CONSTRAINT "CommunityTopic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "CommunityUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReply" ADD CONSTRAINT "CommunityReply_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "CommunityTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReply" ADD CONSTRAINT "CommunityReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "CommunityUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

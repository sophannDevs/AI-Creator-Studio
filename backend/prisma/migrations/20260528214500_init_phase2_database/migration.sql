-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoIdea" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hook" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Script" (
    "id" TEXT NOT NULL,
    "videoIdeaId" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "mainContent" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "duration" TEXT,
    "tone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoMetadata" (
    "id" TEXT NOT NULL,
    "videoIdeaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "hashtags" TEXT[],
    "seoScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thumbnail" (
    "id" TEXT NOT NULL,
    "videoIdeaId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "backgroundIdea" TEXT NOT NULL,
    "mainObject" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Script_videoIdeaId_key" ON "Script"("videoIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_videoIdeaId_key" ON "SeoMetadata"("videoIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "Thumbnail_videoIdeaId_key" ON "Thumbnail"("videoIdeaId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoIdea" ADD CONSTRAINT "VideoIdea_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_videoIdeaId_fkey" FOREIGN KEY ("videoIdeaId") REFERENCES "VideoIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoMetadata" ADD CONSTRAINT "SeoMetadata_videoIdeaId_fkey" FOREIGN KEY ("videoIdeaId") REFERENCES "VideoIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thumbnail" ADD CONSTRAINT "Thumbnail_videoIdeaId_fkey" FOREIGN KEY ("videoIdeaId") REFERENCES "VideoIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;


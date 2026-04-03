-- CreateEnum
CREATE TYPE "Language" AS ENUM ('PT', 'EN');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE_URL', 'IMAGE_FILEID', 'VIDEO_URL', 'VIDEO_FILEID');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('SUPREME', 'SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER', 'BANNED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('ANIME', 'GAME', 'MANGA', 'MOVIE');

-- CreateTable
CREATE TABLE "CharacterHusbando" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "origem" VARCHAR(100) NOT NULL,
    "mediaType" "MediaType",
    "media" TEXT,
    "slug" TEXT NOT NULL,
    "extras" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "sourceType" "SourceType" NOT NULL DEFAULT 'ANIME',
    "linkweb" TEXT,
    "linkwebExpiresAt" TIMESTAMP(3),

    CONSTRAINT "CharacterHusbando_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterWaifu" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "origem" VARCHAR(100) NOT NULL,
    "mediaType" "MediaType",
    "media" TEXT,
    "extras" JSONB,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "sourceType" "SourceType" NOT NULL DEFAULT 'ANIME',
    "linkweb" TEXT,
    "linkwebExpiresAt" TIMESTAMP(3),

    CONSTRAINT "CharacterWaifu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT,
    "emoji_id" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HusbandoCollection" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HusbandoCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HusbandoEvent" (
    "characterId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "HusbandoEvent_pkey" PRIMARY KEY ("characterId","eventId")
);

-- CreateTable
CREATE TABLE "HusbandoRarity" (
    "characterId" INTEGER NOT NULL,
    "rarityId" INTEGER NOT NULL,

    CONSTRAINT "HusbandoRarity_pkey" PRIMARY KEY ("characterId","rarityId")
);

-- CreateTable
CREATE TABLE "Rarity" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT,
    "emoji_id" TEXT,

    CONSTRAINT "Rarity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "favoriteWaifuId" INTEGER,
    "favoriteHusbandoId" INTEGER,
    "waifuConfig" JSONB,
    "husbandoConfig" JSONB,
    "telegramData" JSONB,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "profileType" "ProfileType" NOT NULL DEFAULT 'USER',
    "language" "Language" NOT NULL DEFAULT 'PT',
    "telegramId" BIGINT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaifuCollection" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaifuCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaifuEvent" (
    "characterId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "WaifuEvent_pkey" PRIMARY KEY ("characterId","eventId")
);

-- CreateTable
CREATE TABLE "WaifuRarity" (
    "characterId" INTEGER NOT NULL,
    "rarityId" INTEGER NOT NULL,

    CONSTRAINT "WaifuRarity_pkey" PRIMARY KEY ("characterId","rarityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterHusbando_slug_key" ON "CharacterHusbando"("slug");

-- CreateIndex
CREATE INDEX "CharacterHusbando_name_origem_idx" ON "CharacterHusbando"("name", "origem");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterWaifu_slug_key" ON "CharacterWaifu"("slug");

-- CreateIndex
CREATE INDEX "CharacterWaifu_name_origem_idx" ON "CharacterWaifu"("name", "origem");

-- CreateIndex
CREATE UNIQUE INDEX "Event_code_key" ON "Event"("code");

-- CreateIndex
CREATE INDEX "HusbandoCollection_userId_idx" ON "HusbandoCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HusbandoCollection_userId_characterId_key" ON "HusbandoCollection"("userId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Rarity_code_key" ON "Rarity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "WaifuCollection_userId_idx" ON "WaifuCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WaifuCollection_userId_characterId_key" ON "WaifuCollection"("userId", "characterId");

-- AddForeignKey
ALTER TABLE "HusbandoCollection" ADD CONSTRAINT "HusbandoCollection_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoCollection" ADD CONSTRAINT "HusbandoCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoEvent" ADD CONSTRAINT "HusbandoEvent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoEvent" ADD CONSTRAINT "HusbandoEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoRarity" ADD CONSTRAINT "HusbandoRarity_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoRarity" ADD CONSTRAINT "HusbandoRarity_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoriteHusbandoId_fkey" FOREIGN KEY ("favoriteHusbandoId") REFERENCES "CharacterHusbando"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoriteWaifuId_fkey" FOREIGN KEY ("favoriteWaifuId") REFERENCES "CharacterWaifu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuCollection" ADD CONSTRAINT "WaifuCollection_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuCollection" ADD CONSTRAINT "WaifuCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuEvent" ADD CONSTRAINT "WaifuEvent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuEvent" ADD CONSTRAINT "WaifuEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuRarity" ADD CONSTRAINT "WaifuRarity_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuRarity" ADD CONSTRAINT "WaifuRarity_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

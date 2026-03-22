-- CreateEnum
CREATE TYPE "Language" AS ENUM ('PT', 'EN');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE_URL', 'IMAGE_FILEID', 'VIDEO_URL', 'VIDEO_FILEID');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('SUPREME', 'SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER', 'BANNED');

-- CreateTable
CREATE TABLE "alembic_version" (
    "version_num" VARCHAR(32) NOT NULL,

    CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num")
);

-- CreateTable
CREATE TABLE "CharacterWaifu" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "origem" VARCHAR(100) NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'ANIME',
    "mediaType" "MediaType" NOT NULL,
    "media" TEXT,
    "extras" JSONB,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterWaifu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterHusbando" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "origem" VARCHAR(100) NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'ANIME',
    "mediaType" "MediaType" NOT NULL,
    "media" TEXT,
    "slug" TEXT NOT NULL,
    "extras" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterHusbando_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "description" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rarity" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "description" TEXT,

    CONSTRAINT "Rarity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaifuEvent" (
    "characterId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "WaifuEvent_pkey" PRIMARY KEY ("characterId","eventId")
);

-- CreateTable
CREATE TABLE "HusbandoEvent" (
    "characterId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "HusbandoEvent_pkey" PRIMARY KEY ("characterId","eventId")
);

-- CreateTable
CREATE TABLE "WaifuRarity" (
    "characterId" INTEGER NOT NULL,
    "rarityId" INTEGER NOT NULL,

    CONSTRAINT "WaifuRarity_pkey" PRIMARY KEY ("characterId","rarityId")
);

-- CreateTable
CREATE TABLE "HusbandoRarity" (
    "characterId" INTEGER NOT NULL,
    "rarityId" INTEGER NOT NULL,

    CONSTRAINT "HusbandoRarity_pkey" PRIMARY KEY ("characterId","rarityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterWaifu_slug_key" ON "CharacterWaifu"("slug");

-- CreateIndex
CREATE INDEX "CharacterWaifu_name_idx" ON "CharacterWaifu"("name");

-- CreateIndex
CREATE INDEX "CharacterWaifu_origem_idx" ON "CharacterWaifu"("origem");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterHusbando_slug_key" ON "CharacterHusbando"("slug");

-- CreateIndex
CREATE INDEX "CharacterHusbando_name_idx" ON "CharacterHusbando"("name");

-- CreateIndex
CREATE INDEX "CharacterHusbando_origem_idx" ON "CharacterHusbando"("origem");

-- CreateIndex
CREATE UNIQUE INDEX "Event_code_key" ON "Event"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Rarity_code_key" ON "Rarity"("code");

-- AddForeignKey
ALTER TABLE "WaifuEvent" ADD CONSTRAINT "WaifuEvent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuEvent" ADD CONSTRAINT "WaifuEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoEvent" ADD CONSTRAINT "HusbandoEvent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoEvent" ADD CONSTRAINT "HusbandoEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuRarity" ADD CONSTRAINT "WaifuRarity_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuRarity" ADD CONSTRAINT "WaifuRarity_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoRarity" ADD CONSTRAINT "HusbandoRarity_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoRarity" ADD CONSTRAINT "HusbandoRarity_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

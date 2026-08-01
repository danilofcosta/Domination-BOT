-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('PT', 'EN', 'ES', 'JA');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE_URL', 'IMAGE_FILEID', 'VIDEO_URL', 'VIDEO_FILEID', 'VIDEO_LOCAL', 'IMAGE_LOCAL');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('SUPREME', 'SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER', 'BANNED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('ANIME', 'GAME', 'MANGA', 'MOVIE');

-- CreateTable
CREATE TABLE "BotConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'number',

    CONSTRAINT "BotConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "BotSession" (
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "BotSession_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "CharacterHusbando" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "origem" VARCHAR(100) NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "media" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "extras" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "sourceType" "SourceType" NOT NULL DEFAULT 'ANIME',
    "linkweb" TEXT,
    "linkwebExpiresAt" TIMESTAMP(3),
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "addby" JSONB,
    "mediaUniqueId" TEXT,

    CONSTRAINT "CharacterHusbando_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterWaifu" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "origem" VARCHAR(100) NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "media" TEXT NOT NULL,
    "extras" JSONB,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "sourceType" "SourceType" NOT NULL DEFAULT 'ANIME',
    "linkweb" TEXT,
    "linkwebExpiresAt" TIMESTAMP(3),
    "addby" JSONB,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "mediaUniqueId" TEXT,

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Rarity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramGroup" (
    "id" SERIAL NOT NULL,
    "groupId" BIGINT NOT NULL,
    "groupName" TEXT NOT NULL,
    "configuration" JSONB,
    "addedBy" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramUser" (
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
    "webLogin" TEXT,
    "webPassword" TEXT,
    "husbandoLikes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "waifuLikes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "waifuDislikes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "husbandoDislikes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "backupHash" VARCHAR(64),

    CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaifuCollection" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "telegramUserId" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterHusbando_slug_key" ON "CharacterHusbando"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterHusbando_mediaUniqueId_key" ON "CharacterHusbando"("mediaUniqueId");

-- CreateIndex
CREATE INDEX "CharacterHusbando_mediaType_idx" ON "CharacterHusbando"("mediaType");

-- CreateIndex
CREATE INDEX "CharacterHusbando_name_origem_idx" ON "CharacterHusbando"("name", "origem");

-- CreateIndex
CREATE INDEX "CharacterHusbando_origem_idx" ON "CharacterHusbando"("origem");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterWaifu_slug_key" ON "CharacterWaifu"("slug");

-- CreateIndex
CREATE INDEX "CharacterWaifu_mediaType_idx" ON "CharacterWaifu"("mediaType");

-- CreateIndex
CREATE INDEX "CharacterWaifu_name_origem_idx" ON "CharacterWaifu"("name", "origem");

-- CreateIndex
CREATE INDEX "CharacterWaifu_origem_idx" ON "CharacterWaifu"("origem");

-- CreateIndex
CREATE UNIQUE INDEX "Event_code_key" ON "Event"("code");

-- CreateIndex
CREATE INDEX "HusbandoCollection_characterId_idx" ON "HusbandoCollection"("characterId");

-- CreateIndex
CREATE INDEX "HusbandoCollection_createdAt_idx" ON "HusbandoCollection"("createdAt");

-- CreateIndex
CREATE INDEX "HusbandoCollection_userId_idx" ON "HusbandoCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HusbandoCollection_userId_characterId_key" ON "HusbandoCollection"("userId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Rarity_code_key" ON "Rarity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramGroup_groupId_key" ON "TelegramGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_telegramId_key" ON "TelegramUser"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_webLogin_key" ON "TelegramUser"("webLogin");

-- CreateIndex
CREATE INDEX "WaifuCollection_characterId_idx" ON "WaifuCollection"("characterId");

-- CreateIndex
CREATE INDEX "WaifuCollection_createdAt_idx" ON "WaifuCollection"("createdAt");

-- CreateIndex
CREATE INDEX "WaifuCollection_userId_idx" ON "WaifuCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WaifuCollection_userId_characterId_key" ON "WaifuCollection"("userId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "HusbandoCollection" ADD CONSTRAINT "HusbandoCollection_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoCollection" ADD CONSTRAINT "HusbandoCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoEvent" ADD CONSTRAINT "HusbandoEvent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoEvent" ADD CONSTRAINT "HusbandoEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoRarity" ADD CONSTRAINT "HusbandoRarity_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoRarity" ADD CONSTRAINT "HusbandoRarity_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramUser" ADD CONSTRAINT "User_favoriteHusbandoId_fkey" FOREIGN KEY ("favoriteHusbandoId") REFERENCES "CharacterHusbando"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramUser" ADD CONSTRAINT "User_favoriteWaifuId_fkey" FOREIGN KEY ("favoriteWaifuId") REFERENCES "CharacterWaifu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuCollection" ADD CONSTRAINT "WaifuCollection_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuCollection" ADD CONSTRAINT "WaifuCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuEvent" ADD CONSTRAINT "WaifuEvent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuEvent" ADD CONSTRAINT "WaifuEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuRarity" ADD CONSTRAINT "WaifuRarity_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuRarity" ADD CONSTRAINT "WaifuRarity_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;


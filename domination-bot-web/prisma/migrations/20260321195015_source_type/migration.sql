/*
  Warnings:

  - The `sourceType` column on the `CharacterHusbando` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sourceType` column on the `CharacterWaifu` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `telegramId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('ANIME', 'GAME', 'MANGA', 'MOVIE');

-- DropIndex
DROP INDEX "CharacterHusbando_name_idx";

-- DropIndex
DROP INDEX "CharacterHusbando_origem_idx";

-- DropIndex
DROP INDEX "CharacterWaifu_name_idx";

-- DropIndex
DROP INDEX "CharacterWaifu_origem_idx";

-- AlterTable
ALTER TABLE "CharacterHusbando" DROP COLUMN "sourceType",
ADD COLUMN     "sourceType" "SourceType" NOT NULL DEFAULT 'ANIME',
ALTER COLUMN "mediaType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CharacterWaifu" DROP COLUMN "sourceType",
ADD COLUMN     "sourceType" "SourceType" NOT NULL DEFAULT 'ANIME',
ALTER COLUMN "mediaType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "telegramId",
ADD COLUMN     "telegramId" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "CharacterHusbando_name_origem_idx" ON "CharacterHusbando"("name", "origem");

-- CreateIndex
CREATE INDEX "CharacterWaifu_name_origem_idx" ON "CharacterWaifu"("name", "origem");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

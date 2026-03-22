/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `alembic_version` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `data` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_key_key";

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
DROP COLUMN "value",
ADD COLUMN     "data" JSONB NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("key");

-- DropTable
DROP TABLE "alembic_version";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "telegramId" INTEGER NOT NULL,
    "favoriteWaifuId" INTEGER,
    "favoriteHusbandoId" INTEGER,
    "waifuConfig" JSONB,
    "husbandoConfig" JSONB,
    "telegramData" JSONB,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "profileType" "ProfileType" NOT NULL DEFAULT 'USER',
    "language" "Language" NOT NULL DEFAULT 'PT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaifuCollection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaifuCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HusbandoCollection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HusbandoCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "WaifuCollection_userId_idx" ON "WaifuCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WaifuCollection_userId_characterId_key" ON "WaifuCollection"("userId", "characterId");

-- CreateIndex
CREATE INDEX "HusbandoCollection_userId_idx" ON "HusbandoCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HusbandoCollection_userId_characterId_key" ON "HusbandoCollection"("userId", "characterId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoriteWaifuId_fkey" FOREIGN KEY ("favoriteWaifuId") REFERENCES "CharacterWaifu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoriteHusbandoId_fkey" FOREIGN KEY ("favoriteHusbandoId") REFERENCES "CharacterHusbando"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuCollection" ADD CONSTRAINT "WaifuCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaifuCollection" ADD CONSTRAINT "WaifuCollection_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterWaifu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoCollection" ADD CONSTRAINT "HusbandoCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HusbandoCollection" ADD CONSTRAINT "HusbandoCollection_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterHusbando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

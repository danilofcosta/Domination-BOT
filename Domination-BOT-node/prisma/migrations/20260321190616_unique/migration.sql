/*
  Warnings:

  - A unique constraint covering the columns `[userId,characterId]` on the table `HusbandoCollection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,characterId]` on the table `WaifuCollection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "HusbandoCollection_characterId_key";

-- DropIndex
DROP INDEX "WaifuCollection_characterId_key";

-- CreateIndex
CREATE UNIQUE INDEX "HusbandoCollection_userId_characterId_key" ON "HusbandoCollection"("userId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "WaifuCollection_userId_characterId_key" ON "WaifuCollection"("userId", "characterId");

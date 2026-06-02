-- AlterTable: add unique constraint on mediaUniqueId
CREATE UNIQUE INDEX "CharacterHusbando_mediaUniqueId_key" ON "CharacterHusbando"("mediaUniqueId");
CREATE UNIQUE INDEX "CharacterWaifu_mediaUniqueId_key" ON "CharacterWaifu"("mediaUniqueId");

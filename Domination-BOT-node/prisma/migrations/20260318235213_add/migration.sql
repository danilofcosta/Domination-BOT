/*
  Warnings:

  - Made the column `emoji` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emoji` on table `Rarity` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "emoji_id" TEXT,
ALTER COLUMN "emoji" SET NOT NULL;

-- AlterTable
ALTER TABLE "Rarity" ADD COLUMN     "emoji_id" TEXT,
ALTER COLUMN "emoji" SET NOT NULL;

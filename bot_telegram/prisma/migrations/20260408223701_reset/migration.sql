/*
  Warnings:

  - You are about to drop the column `data` on the `Session` table. All the data in the column will be lost.
  - Added the required column `value` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharacterHusbando" ADD COLUMN     "password" TEXT,
ADD COLUMN     "web_username" TEXT;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "data",
ADD COLUMN     "value" JSONB NOT NULL;

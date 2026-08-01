-- AlterTable
ALTER TABLE "HusbandoCollection" ADD COLUMN     "fromIdChat" BIGINT,
ALTER COLUMN "count" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WaifuCollection" ADD COLUMN     "fromIdChat" BIGINT;

-- CreateTable
CREATE TABLE "LocaleKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocaleKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocaleTranslation" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "locale" JSONB NOT NULL,
    "value" TEXT NOT NULL,
    "extrakey" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocaleTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocaleKey_key_key" ON "LocaleKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "LocaleTranslation_keyId_key" ON "LocaleTranslation"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "LocaleTranslation_keyId_locale_key" ON "LocaleTranslation"("keyId", "locale");

-- AddForeignKey
ALTER TABLE "LocaleTranslation" ADD CONSTRAINT "LocaleTranslation_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "LocaleKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

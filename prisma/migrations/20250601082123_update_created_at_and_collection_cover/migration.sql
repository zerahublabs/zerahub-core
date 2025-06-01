-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CollectionMetadata" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Storage" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_cover_fkey" FOREIGN KEY ("cover") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

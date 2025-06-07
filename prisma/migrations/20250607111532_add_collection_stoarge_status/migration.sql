-- CreateEnum
CREATE TYPE "CollectionStorageStatus" AS ENUM ('PENDING', 'INDEXING', 'FAILED', 'SUCCESS');

-- AlterTable
ALTER TABLE "CollectionStorage" ADD COLUMN     "status" "CollectionStorageStatus" NOT NULL DEFAULT 'PENDING';

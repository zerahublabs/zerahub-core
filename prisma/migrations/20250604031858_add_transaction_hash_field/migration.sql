-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "CollectionStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "transactionHash" TEXT;

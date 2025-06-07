/*
  Warnings:

  - The `createdAt` column on the `CollectionCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `collectionid` on the `CollectionMetadata` table. All the data in the column will be lost.
  - Changed the type of `updatedAt` on the `CollectionCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `collectionId` to the `CollectionMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CollectionMetadata" DROP CONSTRAINT "CollectionMetadata_collectionid_fkey";

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CollectionCategory" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CollectionMetadata" DROP COLUMN "collectionid",
ADD COLUMN     "collectionId" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Storage" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StorageMetadata" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StorageUploadRequest" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "CollectionCategory_id_idx" ON "CollectionCategory"("id");

-- CreateIndex
CREATE INDEX "User_address_idx" ON "User"("address");

-- AddForeignKey
ALTER TABLE "CollectionMetadata" ADD CONSTRAINT "CollectionMetadata_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `bucket` on the `Storage` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `Storage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Storage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `StorageMetadata` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Storage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Storage_filename_key";

-- AlterTable
ALTER TABLE "Storage" DROP COLUMN "bucket",
DROP COLUMN "filename",
ADD COLUMN     "key" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "StorageUploadRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StorageUploadRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorageUploadRequest_key_key" ON "StorageUploadRequest"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Storage_key_key" ON "Storage"("key");

-- CreateIndex
CREATE UNIQUE INDEX "StorageMetadata_key_key" ON "StorageMetadata"("key");

-- AddForeignKey
ALTER TABLE "StorageUploadRequest" ADD CONSTRAINT "StorageUploadRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

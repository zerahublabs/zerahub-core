-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_cover_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_userId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionCategory" DROP CONSTRAINT "CollectionCategory_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionMetadata" DROP CONSTRAINT "CollectionMetadata_collectionid_fkey";

-- DropForeignKey
ALTER TABLE "StorageMetadata" DROP CONSTRAINT "StorageMetadata_storageId_fkey";

-- AddForeignKey
ALTER TABLE "CollectionCategory" ADD CONSTRAINT "CollectionCategory_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_cover_fkey" FOREIGN KEY ("cover") REFERENCES "Storage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMetadata" ADD CONSTRAINT "CollectionMetadata_collectionid_fkey" FOREIGN KEY ("collectionid") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageMetadata" ADD CONSTRAINT "StorageMetadata_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

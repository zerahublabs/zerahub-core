-- CreateTable
CREATE TABLE "CollectionStorage" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionStorageFile" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "collectionStorageId" TEXT NOT NULL,

    CONSTRAINT "CollectionStorageFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollectionStorageFile_collectionStorageId_path_filename_idx" ON "CollectionStorageFile"("collectionStorageId", "path", "filename");

-- AddForeignKey
ALTER TABLE "CollectionStorageFile" ADD CONSTRAINT "CollectionStorageFile_collectionStorageId_fkey" FOREIGN KEY ("collectionStorageId") REFERENCES "CollectionStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

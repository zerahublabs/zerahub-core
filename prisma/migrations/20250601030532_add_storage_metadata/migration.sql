-- CreateTable
CREATE TABLE "StorageMetadata" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storageId" TEXT NOT NULL,

    CONSTRAINT "StorageMetadata_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StorageMetadata" ADD CONSTRAINT "StorageMetadata_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

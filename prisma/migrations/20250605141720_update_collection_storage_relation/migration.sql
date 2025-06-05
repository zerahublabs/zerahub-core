-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_cover_fkey";

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_cover_fkey" FOREIGN KEY ("cover") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

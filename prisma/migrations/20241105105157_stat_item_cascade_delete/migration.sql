-- DropForeignKey
ALTER TABLE "StatItem" DROP CONSTRAINT "StatItem_stat_id_fkey";

-- AddForeignKey
ALTER TABLE "StatItem" ADD CONSTRAINT "StatItem_stat_id_fkey" FOREIGN KEY ("stat_id") REFERENCES "Stat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

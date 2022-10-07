/*
  Warnings:

  - The primary key for the `WorkItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `WorkItem` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `WorkItem` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

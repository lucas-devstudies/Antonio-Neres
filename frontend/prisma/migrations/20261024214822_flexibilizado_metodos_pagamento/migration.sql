/*
  Warnings:

  - You are about to drop the column `payform` on the `checkout_attempt` table. All the data in the column will be lost.
  - Changed the type of `payform` on the `ticket` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "checkout_attempt" DROP COLUMN "payform";

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "payform",
ADD COLUMN     "payform" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PaymentMethod";

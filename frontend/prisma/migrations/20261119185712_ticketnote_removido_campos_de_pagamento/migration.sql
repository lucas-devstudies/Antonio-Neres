/*
  Warnings:

  - You are about to drop the column `mercadoPagoId` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `payform` on the `ticket` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `ticket` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to drop the `checkout_attempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "ticket_mercadoPagoId_key";

-- DropIndex
DROP INDEX "ticket_status_idx";

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "mercadoPagoId",
DROP COLUMN "payform",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "checkout_attempt";

-- CreateTable
CREATE TABLE "ticket_note" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_note_ticketId_key" ON "ticket_note"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_deleted_status_position_idx" ON "ticket"("deleted", "status", "position");

-- AddForeignKey
ALTER TABLE "ticket_note" ADD CONSTRAINT "ticket_note_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_note" ADD CONSTRAINT "ticket_note_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

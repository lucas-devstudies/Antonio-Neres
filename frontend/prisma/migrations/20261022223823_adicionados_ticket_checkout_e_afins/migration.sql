-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('TO_DO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD');

-- CreateTable
CREATE TABLE "ticket" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "city" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "bundle" TEXT NOT NULL,
    "payform" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "motive" TEXT,
    "indication" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'DONE',
    "mercadoPagoId" TEXT NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_attempt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "preferenceId" TEXT,
    "city" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "bundle" TEXT NOT NULL,
    "payform" "PaymentMethod" NOT NULL,
    "motive" TEXT,
    "indication" TEXT,

    CONSTRAINT "checkout_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_mercadoPagoId_key" ON "ticket"("mercadoPagoId");

-- CreateIndex
CREATE INDEX "ticket_status_idx" ON "ticket"("status");

-- CreateIndex
CREATE INDEX "ticket_email_idx" ON "ticket"("email");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_attempt_preferenceId_key" ON "checkout_attempt"("preferenceId");

-- CreateIndex
CREATE INDEX "checkout_attempt_expiresAt_idx" ON "checkout_attempt"("expiresAt");

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

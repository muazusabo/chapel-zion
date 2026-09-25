-- CreateEnum
CREATE TYPE "ReceiptRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "amount" DECIMAL(12,2),
ADD COLUMN     "issuedAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentType" "GivingType",
ADD COLUMN     "requestedName" TEXT;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "provider" SET DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "receipt_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "requestedName" TEXT NOT NULL,
    "status" "ReceiptRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "receiptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receipt_requests_transactionId_key" ON "receipt_requests"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_requests_receiptId_key" ON "receipt_requests"("receiptId");

-- CreateIndex
CREATE INDEX "receipt_requests_userId_idx" ON "receipt_requests"("userId");

-- CreateIndex
CREATE INDEX "receipt_requests_status_idx" ON "receipt_requests"("status");

-- AddForeignKey
ALTER TABLE "receipt_requests" ADD CONSTRAINT "receipt_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_requests" ADD CONSTRAINT "receipt_requests_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_requests" ADD CONSTRAINT "receipt_requests_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."WithdrawalStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'RETURN_RECEIVED', 'REFUNDED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "public"."WithdrawalStatus" NOT NULL DEFAULT 'RECEIVED',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "customerMessage" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmationSentAt" TIMESTAMP(3),
    "returnReceivedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalRequest_orderId_key" ON "public"."WithdrawalRequest"("orderId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_idx" ON "public"."WithdrawalRequest"("status");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_customerEmail_idx" ON "public"."WithdrawalRequest"("customerEmail");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_requestedAt_idx" ON "public"."WithdrawalRequest"("requestedAt");

-- AddForeignKey
ALTER TABLE "public"."WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "abandoned_checkouts" (
    "id" TEXT NOT NULL,
    "checkoutToken" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "checkoutUrl" TEXT NOT NULL,
    "lineItems" JSONB NOT NULL,
    "totalPrice" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abandoned_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivered_orders" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lineItems" JSONB NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivered_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_checkouts_checkoutToken_key" ON "abandoned_checkouts"("checkoutToken");

-- CreateIndex
CREATE INDEX "abandoned_checkouts_emailSent_completedAt_createdAt_idx" ON "abandoned_checkouts"("emailSent", "completedAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "delivered_orders_shopifyOrderId_key" ON "delivered_orders"("shopifyOrderId");

-- CreateIndex
CREATE INDEX "delivered_orders_reminderSent_deliveredAt_idx" ON "delivered_orders"("reminderSent", "deliveredAt");

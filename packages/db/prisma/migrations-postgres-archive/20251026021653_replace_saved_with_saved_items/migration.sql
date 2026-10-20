/*
  Warnings:

  - You are about to drop the `saved` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."saved" DROP CONSTRAINT "saved_userId_fkey";

-- DropTable
DROP TABLE "public"."saved";

-- CreateTable
CREATE TABLE "public"."saved_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_items_productId_idx" ON "public"."saved_items"("productId");

-- CreateIndex
CREATE INDEX "saved_items_userId_idx" ON "public"."saved_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_items_userId_productId_key" ON "public"."saved_items"("userId", "productId");

-- AddForeignKey
ALTER TABLE "public"."saved_items" ADD CONSTRAINT "saved_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortCode" VARCHAR(32) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastVisitedAt" TIMESTAMP(3),

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Link_shortCode_key" ON "Link"("shortCode");
CREATE INDEX "Link_createdAt_idx" ON "Link"("createdAt");
CREATE INDEX "Link_clicks_idx" ON "Link"("clicks");

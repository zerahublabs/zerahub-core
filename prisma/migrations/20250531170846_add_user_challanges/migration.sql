-- CreateTable
CREATE TABLE "UserChallange" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChallange_pkey" PRIMARY KEY ("id")
);

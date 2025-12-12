-- CreateTable
CREATE TABLE "AILog" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_preview" TEXT NOT NULL,
    "response_preview" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AILog_pkey" PRIMARY KEY ("id")
);

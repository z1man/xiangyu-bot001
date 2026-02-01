-- CreateTable
CREATE TABLE "UserLlmConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'azure_openai',
    "endpoint" TEXT NOT NULL,
    "deployment" TEXT NOT NULL,
    "apiVersion" TEXT NOT NULL DEFAULT '2024-02-01',
    "apiKeyEnc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLlmConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLlmConfig_userId_key" ON "UserLlmConfig"("userId");

-- AddForeignKey
ALTER TABLE "UserLlmConfig" ADD CONSTRAINT "UserLlmConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[sourceUrl]` on the table `Passage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passageId,stem,choiceA,choiceB,choiceC,choiceD]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Passage_sourceUrl_idx" ON "Passage"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Passage_sourceUrl_key" ON "Passage"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Question_passageId_stem_choiceA_choiceB_choiceC_choiceD_key" ON "Question"("passageId", "stem", "choiceA", "choiceB", "choiceC", "choiceD");

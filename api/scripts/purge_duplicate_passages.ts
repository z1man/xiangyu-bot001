import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function purgePassage(passageId: string) {
  // delete quizzes + attempts + answers
  const quizzes = await prisma.quiz.findMany({ where: { passageId: passageId }, select: { id: true } });
  for (const q of quizzes) {
    const attempts = await prisma.attempt.findMany({ where: { quizId: q.id }, select: { id: true } });
    for (const a of attempts) {
      await prisma.attemptAnswer.deleteMany({ where: { attemptId: a.id } });
    }
    await prisma.attempt.deleteMany({ where: { quizId: q.id } });
    await prisma.quizItem.deleteMany({ where: { quizId: q.id } });
    await prisma.quiz.delete({ where: { id: q.id } });
  }

  await prisma.question.deleteMany({ where: { passageId: passageId } });
  await prisma.passage.delete({ where: { id: passageId } });
}

async function main() {
  const passages = await prisma.passage.findMany({
    where: { sourceUrl: { not: null } },
    select: { id: true, sourceUrl: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const byUrl = new Map<string, { id: string; createdAt: Date }[]>();
  for (const p of passages) {
    const url = (p.sourceUrl ?? '').trim();
    if (!url) continue;
    const arr = byUrl.get(url) ?? [];
    arr.push({ id: p.id, createdAt: p.createdAt });
    byUrl.set(url, arr);
  }

  let purged = 0;
  for (const [url, arr] of byUrl.entries()) {
    if (arr.length <= 1) continue;

    // Keep the newest record for that URL
    const keep = arr[arr.length - 1].id;
    const toPurge = arr.slice(0, -1).map((x) => x.id);

    console.log('Purging duplicate passages for', url, { keep, toPurgeCount: toPurge.length });
    for (const id of toPurge) {
      await purgePassage(id);
      purged++;
    }
  }

  console.log('Done. purged passages=', purged);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Dedupe by sourceUrl when present.
  const passages = await prisma.passage.findMany({
    select: { id: true, sourceUrl: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const byUrl = new Map<string, string[]>();
  for (const p of passages) {
    if (!p.sourceUrl) continue;
    const url = p.sourceUrl.trim();
    if (!url) continue;
    const arr = byUrl.get(url) ?? [];
    arr.push(p.id);
    byUrl.set(url, arr);
  }

  let removed = 0;
  for (const [url, ids] of byUrl.entries()) {
    if (ids.length <= 1) continue;

    // Prefer keeping a passage that has quizzes; otherwise keep the newest.
    let keep: string | null = null;
    for (const id of ids) {
      const quizCount = await prisma.quiz.count({ where: { passageId: id } });
      if (quizCount > 0) {
        keep = id;
        break;
      }
    }
    if (!keep) keep = ids[ids.length - 1];

    const toDelete = ids.filter((id) => id !== keep);
    for (const id of toDelete) {
      const quizCount = await prisma.quiz.count({ where: { passageId: id } });
      if (quizCount > 0) continue; // safety
      await prisma.question.deleteMany({ where: { passageId: id } });
      await prisma.passage.delete({ where: { id } });
      removed++;
    }

    console.log('dedupe sourceUrl', url, { keep, deleted: toDelete.length });
  }

  console.log('passage dedupe done. removed=', removed);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

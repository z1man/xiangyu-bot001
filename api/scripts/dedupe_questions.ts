import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type QKey = string;

function keyOf(q: { passageId: string; stem: string; choiceA: string; choiceB: string; choiceC: string; choiceD: string }): QKey {
  return [q.passageId, q.stem, q.choiceA, q.choiceB, q.choiceC, q.choiceD].join('||');
}

async function main() {
  const questions = await prisma.question.findMany({
    select: { id: true, passageId: true, stem: true, choiceA: true, choiceB: true, choiceC: true, choiceD: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const groups = new Map<QKey, string[]>();
  for (const q of questions) {
    const k = keyOf(q);
    const arr = groups.get(k) ?? [];
    arr.push(q.id);
    groups.set(k, arr);
  }

  let removed = 0;
  for (const [k, ids] of groups.entries()) {
    if (ids.length <= 1) continue;

    // Keep one that is referenced by QuizItem/AttemptAnswer; else keep newest.
    let keep: string | null = null;
    for (const id of ids) {
      const qi = await prisma.quizItem.count({ where: { questionId: id } });
      const aa = await prisma.attemptAnswer.count({ where: { questionId: id } });
      if (qi + aa > 0) {
        keep = id;
        break;
      }
    }
    if (!keep) keep = ids[ids.length - 1];

    const toDelete = ids.filter((id) => id !== keep);
    for (const id of toDelete) {
      const qi = await prisma.quizItem.count({ where: { questionId: id } });
      const aa = await prisma.attemptAnswer.count({ where: { questionId: id } });
      if (qi + aa > 0) continue; // safety
      await prisma.question.delete({ where: { id } });
      removed++;
    }
  }

  console.log('question dedupe done. removed=', removed);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

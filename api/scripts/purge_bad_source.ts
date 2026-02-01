import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE_URL = 'https://en.wikisource.org/wiki/Letter_to_Horace_Greeley';

async function main() {
  const bad = await prisma.passage.findFirst({ where: { sourceUrl: SOURCE_URL } });
  if (!bad) {
    console.log('No bad passage found for URL:', SOURCE_URL);
    return;
  }

  const quizzes = await prisma.quiz.findMany({ where: { passageId: bad.id }, select: { id: true } });
  for (const q of quizzes) {
    // Delete attempts & answers
    const attempts = await prisma.attempt.findMany({ where: { quizId: q.id }, select: { id: true } });
    for (const a of attempts) {
      await prisma.attemptAnswer.deleteMany({ where: { attemptId: a.id } });
    }
    await prisma.attempt.deleteMany({ where: { quizId: q.id } });

    // Delete quiz items then quiz
    await prisma.quizItem.deleteMany({ where: { quizId: q.id } });
    await prisma.quiz.delete({ where: { id: q.id } });
  }

  await prisma.question.deleteMany({ where: { passageId: bad.id } });
  await prisma.passage.delete({ where: { id: bad.id } });

  console.log('Purged bad source:', bad.id, 'quizzes removed:', quizzes.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

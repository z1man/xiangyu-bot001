import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Remove the known bad wiksource page that was previously ingested
  const url = 'https://en.wikisource.org/wiki/Letter_to_Horace_Greeley';
  const p = await prisma.passage.findFirst({ where: { sourceUrl: url } });
  if (!p) {
    console.log('No such passage:', url);
    return;
  }
  const quizCount = await prisma.quiz.count({ where: { passageId: p.id } });
  if (quizCount > 0) {
    console.log('Has quizzes; not deleting:', p.id);
    return;
  }
  await prisma.question.deleteMany({ where: { passageId: p.id } });
  await prisma.passage.delete({ where: { id: p.id } });
  console.log('Deleted:', p.id);
}

main().finally(async () => prisma.$disconnect());

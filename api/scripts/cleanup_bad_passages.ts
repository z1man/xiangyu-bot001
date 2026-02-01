import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BAD_RE = [
  /page not found/i,
  /does not have a text with this exact name/i,
];

function isBad(p: { title: string; text: string }) {
  const t = `${p.title}\n${p.text}`;
  return BAD_RE.some((r) => r.test(t));
}

async function main() {
  const passages = await prisma.passage.findMany({ select: { id: true, title: true, text: true, sourceUrl: true } });
  const bad = passages.filter(isBad);

  if (bad.length === 0) {
    console.log('No bad passages found.');
    return;
  }

  // Only delete passages that have never been used in quizzes.
  for (const p of bad) {
    const quizCount = await prisma.quiz.count({ where: { passageId: p.id } });
    if (quizCount > 0) {
      console.log('SKIP (has quizzes):', p.title, p.sourceUrl);
      continue;
    }
    await prisma.question.deleteMany({ where: { passageId: p.id } });
    await prisma.passage.delete({ where: { id: p.id } });
    console.log('DELETED:', p.title, p.sourceUrl);
  }

  console.log(`Done. Evaluated ${passages.length}, matched bad=${bad.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

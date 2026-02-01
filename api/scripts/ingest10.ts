import { PrismaClient } from '@prisma/client';
import { PASSAGE_URL_POOL } from '../src/contentSources.js';
import { fetchReadableText } from '../src/passageFetch.js';
import { fakeGenerateQuestions } from '../src/fakeGenerator.js';

const prisma = new PrismaClient();

function shuffle<T>(arr: T[]): T[] {
  return arr.map((x) => ({ x, r: Math.random() })).sort((a, b) => a.r - b.r).map((o) => o.x);
}

async function main() {
  const targetCount = 10;
  const selected = shuffle(PASSAGE_URL_POOL);

  const created: Array<{ title: string; passageId: string; questions: number }> = [];

  for (const s of selected) {
    if (created.length >= targetCount) break;

    const existing = await prisma.passage.findFirst({ where: { sourceUrl: s.url } });
    if (existing) {
      const qCount = await prisma.question.count({ where: { passageId: existing.id } });
      if (qCount >= 10) {
        created.push({ title: existing.title, passageId: existing.id, questions: qCount });
        continue;
      }
    }

    const { title, text } = await fetchReadableText(s.url);
    if (/page not found/i.test(title)) continue;

    const passage = existing
      ? existing
      : await prisma.passage.create({
          data: {
            title,
            author: s.author ?? null,
            sourceUrl: s.url,
            license: 'unknown',
            text,
          },
        });

    const existingCount = await prisma.question.count({ where: { passageId: passage.id } });
    if (existingCount < 10) {
      const qs = fakeGenerateQuestions(text);
      await prisma.question.createMany({
        data: qs.map((q) => ({
          passageId: passage.id,
          stem: q.stem,
          choiceA: q.choices.A,
          choiceB: q.choices.B,
          choiceC: q.choices.C,
          choiceD: q.choices.D,
          correct: q.correct,
          explanation: q.explanation,
          tag: q.tag,
          difficulty: q.difficulty,
        })),
      });
      created.push({ title: passage.title, passageId: passage.id, questions: qs.length });
    } else {
      created.push({ title: passage.title, passageId: passage.id, questions: existingCount });
    }
  }

  if (created.length < targetCount) {
    throw new Error(`Only ingested ${created.length}/${targetCount}. Expand PASSAGE_URL_POOL.`);
  }

  console.log(JSON.stringify({ created }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

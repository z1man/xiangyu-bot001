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
  const created: Array<{ title: string; passageId: string; questions: number; sourceUrl: string }> = [];

  // Try multiple rounds until we hit targetCount.
  const rounds = 5;
  for (let round = 0; round < rounds && created.length < targetCount; round++) {
    for (const s of shuffle(PASSAGE_URL_POOL)) {
      if (created.length >= targetCount) break;

      // Skip if already created in this run
      if (created.some((c) => c.sourceUrl === s.url)) continue;

      // If already exists and has >=10 questions, just include it.
      const existing = await prisma.passage.findFirst({ where: { sourceUrl: s.url } });
      if (existing) {
        const qCount = await prisma.question.count({ where: { passageId: existing.id } });
        if (qCount >= 10) {
          created.push({ title: existing.title, passageId: existing.id, questions: qCount, sourceUrl: s.url });
          continue;
        }
      }

      try {
        const { title, text } = await fetchReadableText(s.url);

        const passage = existing
          ? await prisma.passage.update({ where: { id: existing.id }, data: { title, text, author: s.author ?? null } })
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
          created.push({ title: passage.title, passageId: passage.id, questions: qs.length, sourceUrl: s.url });
        } else {
          created.push({ title: passage.title, passageId: passage.id, questions: existingCount, sourceUrl: s.url });
        }
      } catch (e: any) {
        // Skip bad sources and continue
        continue;
      }
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

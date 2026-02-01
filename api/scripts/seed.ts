import { PrismaClient, QuestionTag } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Public domain / government text is safest for MVP.
  const title = 'Inaugural Address (excerpt)';
  const author = 'John F. Kennedy';
  const sourceUrl = 'https://www.archives.gov/milestone-documents/president-john-f-kennedy-inaugural-address';
  const license = 'Public domain (US government archive)';

  const text = `We observe today not a victory of party but a celebration of freedom—symbolizing an end as well as a beginning—signifying renewal as well as change. For I have sworn before you and Almighty God the same solemn oath our forebears prescribed nearly a century and three quarters ago.

The world is very different now. For man holds in his mortal hands the power to abolish all forms of human poverty and all forms of human life. And yet the same revolutionary beliefs for which our forebears fought are still at issue around the globe—the belief that the rights of man come not from the generosity of the state but from the hand of God.

Let every nation know, whether it wishes us well or ill, that we shall pay any price, bear any burden, meet any hardship, support any friend, oppose any foe, to assure the survival and the success of liberty.

This much we pledge—and more.`;

  const existing = await prisma.passage.findFirst({ where: { title } });
  const passage = existing
    ? existing
    : await prisma.passage.create({ data: { title, author, sourceUrl, license, text } });

  // 10 starter MCQs (handwritten placeholders for now).
  // Later we will generate these programmatically.
  const qs = [
    {
      stem: 'The primary purpose of the opening sentence is to',
      A: 'criticize political parties for divisiveness',
      B: 'frame the moment as a renewal with shared values',
      C: 'announce a major policy proposal',
      D: 'summarize the prior administration’s failures',
      correct: 'B',
      tag: QuestionTag.RHETORICAL_SITUATION,
      difficulty: 2,
      explanation: 'The speaker emphasizes celebration of freedom and renewal rather than partisan victory.',
    },
    {
      stem: 'In the second paragraph, the contrast primarily highlights',
      A: 'technological power versus persistent moral beliefs',
      B: 'economic growth versus military strength',
      C: 'national isolation versus global cooperation',
      D: 'religious faith versus scientific progress',
      correct: 'A',
      tag: QuestionTag.REASONING,
      difficulty: 3,
      explanation: 'It contrasts human power over poverty/life with enduring revolutionary beliefs.',
    },
    {
      stem: 'The phrase “pay any price, bear any burden” functions rhetorically to',
      A: 'reduce the urgency of foreign conflicts',
      B: 'signal a limited and cautious commitment',
      C: 'create a sense of resolve through parallelism and escalation',
      D: 'suggest that liberty is already secure',
      correct: 'C',
      tag: QuestionTag.STYLE_TONE,
      difficulty: 3,
      explanation: 'Parallel structure and escalating commitments convey determination.',
    },
    {
      stem: 'The author’s intended audience in this excerpt is best described as',
      A: 'only domestic political opponents',
      B: 'only allied nations',
      C: 'a global audience including allies and adversaries',
      D: 'only members of Congress',
      correct: 'C',
      tag: QuestionTag.RHETORICAL_SITUATION,
      difficulty: 2,
      explanation: '“Let every nation know, whether it wishes us well or ill” signals global audience.',
    },
    {
      stem: 'The reference to an oath “our forebears prescribed” primarily appeals to',
      A: 'logic by presenting statistical evidence',
      B: 'ethos by invoking tradition and continuity',
      C: 'pathos by describing personal tragedy',
      D: 'humor by using irony',
      correct: 'B',
      tag: QuestionTag.CLAIMS_EVIDENCE,
      difficulty: 2,
      explanation: 'Invoking founding tradition supports credibility and legitimacy.',
    },
    {
      stem: 'The passage suggests that human rights originate from',
      A: 'international treaties',
      B: 'economic systems',
      C: 'the state’s generosity',
      D: 'a divine source',
      correct: 'D',
      tag: QuestionTag.CLAIMS_EVIDENCE,
      difficulty: 1,
      explanation: 'It states rights come not from the state but from the hand of God.',
    },
    {
      stem: 'Which choice best describes the tone of the excerpt?',
      A: 'Cynical and dismissive',
      B: 'Resolute and aspirational',
      C: 'Playful and sarcastic',
      D: 'Detached and clinical',
      correct: 'B',
      tag: QuestionTag.STYLE_TONE,
      difficulty: 2,
      explanation: 'The language pledges commitment and frames ideals of liberty.',
    },
    {
      stem: 'The author’s use of “not… but…” in the first sentence serves to',
      A: 'introduce a minor detail',
      B: 'draw a sharp distinction that refocuses the audience',
      C: 'contradict the central claim',
      D: 'add unnecessary complexity',
      correct: 'B',
      tag: QuestionTag.REASONING,
      difficulty: 3,
      explanation: 'The construction redirects from partisan victory to celebration of freedom.',
    },
    {
      stem: 'The main claim implied by the third paragraph is that the nation will',
      A: 'avoid foreign entanglements',
      B: 'prioritize economic prosperity over liberty',
      C: 'commit significant resources to defend liberty',
      D: 'delegate responsibility to allies',
      correct: 'C',
      tag: QuestionTag.CLAIMS_EVIDENCE,
      difficulty: 2,
      explanation: 'The pledge lists sacrifices to assure survival and success of liberty.',
    },
    {
      stem: 'The final sentence “This much we pledge—and more.” primarily functions as a',
      A: 'concession',
      B: 'qualification',
      C: 'call to action',
      D: 'climactic reinforcement',
      correct: 'D',
      tag: QuestionTag.ORGANIZATION,
      difficulty: 2,
      explanation: 'It caps the pledge and intensifies commitment.',
    },
  ];

  // Idempotent seed: only create questions if none exist for this passage.
  const existingCount = await prisma.question.count({ where: { passageId: passage.id } });
  if (existingCount === 0) {
    await prisma.question.createMany({
      data: qs.map((q) => ({
        passageId: passage.id,
        stem: q.stem,
        choiceA: q.A,
        choiceB: q.B,
        choiceC: q.C,
        choiceD: q.D,
        correct: q.correct,
        tag: q.tag,
        difficulty: q.difficulty,
        explanation: q.explanation,
      })),
    });
  }

  console.log('Seed completed:', { passageId: passage.id, questions: qs.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

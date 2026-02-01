import { QuestionTag } from '@prisma/client';

export function fakeGenerateQuestions(passageText: string) {
  // Deterministic-ish placeholder generator for CI.
  const baseStem = passageText.split(/\s+/).slice(0, 12).join(' ');
  const tags = [
    QuestionTag.RHETORICAL_SITUATION,
    QuestionTag.CLAIMS_EVIDENCE,
    QuestionTag.REASONING,
    QuestionTag.STYLE_TONE,
    QuestionTag.ORGANIZATION,
  ];

  const out = Array.from({ length: 10 }).map((_, i) => {
    const correct = (['A', 'B', 'C', 'D'] as const)[i % 4];
    return {
      stem: `(${i + 1}) Based on the passage, which statement best matches the author’s purpose? (${baseStem}...)`,
      choices: {
        A: 'To inform the audience with a clear explanation.',
        B: 'To persuade the audience through reasoning and evidence.',
        C: 'To entertain the audience with a narrative.',
        D: 'To criticize an opposing viewpoint.',
      },
      correct,
      explanation: 'Placeholder explanation for CI.',
      tag: tags[i % tags.length],
      difficulty: 2 + (i % 3),
    };
  });

  return out;
}

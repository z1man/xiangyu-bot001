import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const app = Fastify({ logger: true });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
});

envSchema.parse(process.env);

const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

await app.register(cors, { origin: corsOrigins.length ? corsOrigins : true, credentials: true });
await app.register(jwt, { secret: process.env.JWT_SECRET });

app.get('/health', async () => ({ ok: true }));

app.get('/passages', async () => {
  const passages = await prisma.passage.findMany({
    select: { id: true, title: true, author: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return { passages };
});

const authBody = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(128),
});

type AuthedRequest = Parameters<Parameters<typeof app.decorate>[1]>[0];

app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
}

app.post('/auth/register', async (req, reply) => {
  const body = authBody.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { username: body.username } });
  if (existing) return reply.code(409).send({ error: 'Username already exists' });

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({ data: { username: body.username, passwordHash } });
  const token = app.jwt.sign({ sub: user.id, username: user.username });
  return { token };
});

app.post('/auth/login', async (req, reply) => {
  const body = authBody.parse(req.body);
  const user = await prisma.user.findUnique({ where: { username: body.username } });
  if (!user) return reply.code(401).send({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) return reply.code(401).send({ error: 'Invalid credentials' });
  const token = app.jwt.sign({ sub: user.id, username: user.username });
  return { token };
});

const createQuizBody = z.object({
  passageId: z.string().min(1),
});

app.post('/quizzes', { preHandler: app.authenticate }, async (req: any, reply) => {
  const userId = req.user?.sub as string;
  const body = createQuizBody.parse(req.body);

  const passage = await prisma.passage.findUnique({ where: { id: body.passageId } });
  if (!passage) return reply.code(404).send({ error: 'Passage not found' });

  const questions = await prisma.question.findMany({
    where: { passageId: body.passageId },
    take: 10,
    orderBy: { createdAt: 'asc' },
  });

  if (questions.length < 10) {
    return reply.code(400).send({ error: 'Not enough questions for this passage (need 10)' });
  }

  const quiz = await prisma.quiz.create({
    data: {
      userId,
      passageId: body.passageId,
      items: {
        create: questions.slice(0, 10).map((q, i) => ({ questionId: q.id, position: i + 1 })),
      },
    },
    include: {
      passage: true,
      items: { include: { question: true }, orderBy: { position: 'asc' } },
    },
  });

  return {
    id: quiz.id,
    passage: { id: quiz.passage.id, title: quiz.passage.title, text: quiz.passage.text },
    questions: quiz.items.map((it) => ({
      id: it.question.id,
      stem: it.question.stem,
      choices: { A: it.question.choiceA, B: it.question.choiceB, C: it.question.choiceC, D: it.question.choiceD },
      tag: it.question.tag,
      difficulty: it.question.difficulty,
    })),
  };
});

const submitBody = z.object({
  quizId: z.string().min(1),
  answers: z.array(z.object({ questionId: z.string().min(1), selected: z.enum(['A', 'B', 'C', 'D']) })),
});

app.post('/attempts/submit', { preHandler: app.authenticate }, async (req: any, reply) => {
  const userId = req.user?.sub as string;
  const body = submitBody.parse(req.body);

  const quiz = await prisma.quiz.findFirst({
    where: { id: body.quizId, userId },
    include: { items: { include: { question: true } } },
  });
  if (!quiz) return reply.code(404).send({ error: 'Quiz not found' });

  const correctById = new Map(quiz.items.map((it) => [it.questionId, it.question.correct]));

  let score = 0;
  for (const a of body.answers) {
    if (correctById.get(a.questionId) === a.selected) score += 1;
  }

  const attempt = await prisma.attempt.create({
    data: {
      quizId: quiz.id,
      userId,
      mcqScore: score,
      mcqTotal: quiz.items.length,
      answers: {
        create: body.answers.map((a) => ({
          questionId: a.questionId,
          selected: a.selected,
          isCorrect: correctById.get(a.questionId) === a.selected,
        })),
      },
    },
  });

  return { attemptId: attempt.id, mcqScore: attempt.mcqScore, mcqTotal: attempt.mcqTotal };
});

app.get('/attempts/:id', { preHandler: app.authenticate }, async (req: any, reply) => {
  const userId = req.user?.sub as string;
  const attemptId = req.params.id as string;

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      quiz: {
        include: {
          passage: true,
          items: { include: { question: true }, orderBy: { position: 'asc' } },
        },
      },
      answers: true,
    },
  });

  if (!attempt) return reply.code(404).send({ error: 'Attempt not found' });

  const selectedByQ = new Map(attempt.answers.map((a) => [a.questionId, a.selected]));

  return {
    attempt: {
      id: attempt.id,
      submittedAt: attempt.submittedAt,
      mcqScore: attempt.mcqScore,
      mcqTotal: attempt.mcqTotal,
      rubric: {
        evidence: attempt.rubricEvidence,
        reasoning: attempt.rubricReasoning,
        style: attempt.rubricStyle,
        notes: attempt.rubricNotes,
      },
    },
    passage: {
      id: attempt.quiz.passage.id,
      title: attempt.quiz.passage.title,
      text: attempt.quiz.passage.text,
    },
    questions: attempt.quiz.items.map((it) => ({
      id: it.question.id,
      stem: it.question.stem,
      choices: {
        A: it.question.choiceA,
        B: it.question.choiceB,
        C: it.question.choiceC,
        D: it.question.choiceD,
      },
      selected: selectedByQ.get(it.question.id) ?? null,
      correct: it.question.correct,
      isCorrect: selectedByQ.get(it.question.id)
        ? selectedByQ.get(it.question.id) === it.question.correct
        : null,
      explanation: it.question.explanation ?? null,
      tag: it.question.tag,
      difficulty: it.question.difficulty,
    })),
  };
});

const rubricBody = z.object({
  attemptId: z.string().min(1),
  evidence: z.number().int().min(0).max(5),
  reasoning: z.number().int().min(0).max(5),
  style: z.number().int().min(0).max(5),
  notes: z.string().max(5000).optional().default(''),
});

app.post('/attempts/rubric', { preHandler: app.authenticate }, async (req: any, reply) => {
  const userId = req.user?.sub as string;
  const body = rubricBody.parse(req.body);

  const attempt = await prisma.attempt.findFirst({ where: { id: body.attemptId, userId } });
  if (!attempt) return reply.code(404).send({ error: 'Attempt not found' });

  const updated = await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      rubricEvidence: body.evidence,
      rubricReasoning: body.reasoning,
      rubricStyle: body.style,
      rubricNotes: body.notes,
    },
  });

  return {
    attemptId: updated.id,
    rubric: {
      evidence: updated.rubricEvidence,
      reasoning: updated.rubricReasoning,
      style: updated.rubricStyle,
      notes: updated.rubricNotes,
    },
  };
});

const port = Number(process.env.PORT ?? 3001);
app.listen({ port, host: '0.0.0.0' });

app.get('/attempts', { preHandler: app.authenticate }, async (req: any) => {
  const userId = req.user?.sub as string;
  const attempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
    take: 50,
    include: {
      quiz: { include: { passage: { select: { id: true, title: true } } } },
    },
  });

  return {
    attempts: attempts.map((a) => ({
      id: a.id,
      submittedAt: a.submittedAt,
      mcqScore: a.mcqScore,
      mcqTotal: a.mcqTotal,
      rubric: {
        evidence: a.rubricEvidence,
        reasoning: a.rubricReasoning,
        style: a.rubricStyle,
      },
      passage: a.quiz.passage,
    })),
  };
});

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

export type Passage = { id: string; title: string; author?: string | null };

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as any),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error ?? `Request failed: ${res.status}`);
  return data as T;
}

export async function register(username: string, password: string) {
  return request<{ token: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export async function login(username: string, password: string) {
  return request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export async function listPassages() {
  return request<{ passages: Passage[] }>('/passages');
}

export type QuizQuestion = {
  id: string;
  stem: string;
  choices: { A: string; B: string; C: string; D: string };
  tag: string;
  difficulty: number;
};

export type QuizPayload = {
  id: string;
  passage: { id: string; title: string; text: string };
  questions: QuizQuestion[];
};

export async function createQuiz(passageId: string) {
  return request<QuizPayload>('/quizzes', { method: 'POST', body: JSON.stringify({ passageId }) });
}

export async function submitAttempt(quizId: string, answers: { questionId: string; selected: 'A' | 'B' | 'C' | 'D' }[]) {
  return request<{ attemptId: string; mcqScore: number; mcqTotal: number }>('/attempts/submit', {
    method: 'POST',
    body: JSON.stringify({ quizId, answers }),
  });
}

export async function saveRubric(attemptId: string, evidence: number, reasoning: number, style: number, notes: string) {
  return request<{ attemptId: string; rubric: { evidence: number; reasoning: number; style: number; notes: string } }>(
    '/attempts/rubric',
    {
      method: 'POST',
      body: JSON.stringify({ attemptId, evidence, reasoning, style, notes }),
    }
  );
}

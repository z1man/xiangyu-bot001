# PRD — AP Lang Practice App (MVP)

## Goal
Help students practice **AP English Language & Composition** through passage-based multiple-choice quizzes, with saved attempts and rubric self-scoring.

## Non-goals (MVP)
- Teacher/admin roles
- Automatic essay scoring
- Paid/copyrighted content scraping

## Users
- Student (single role in MVP)

## Core flows
### 1) Authentication
- Register: username + password
- Login: username + password

### 2) Start practice
- Student selects a passage (MVP: simple list)
- System creates a quiz with exactly **10 MCQ** tied to that passage

### 3) Submit
- Student submits answers
- System auto-scores MCQ and saves an Attempt

### 4) Rubric scoring
- Student enters rubric scores (0–5):
  - Evidence
  - Reasoning
  - Style
- Optional notes

## Screens (MVP)
- Login / Register
- Passage list
- Quiz taking page (passage + 10 questions)
- Results page (MCQ score + rubric form)
- History page (list attempts)

## API (MVP)
- `POST /auth/register` → `{ token }`
- `POST /auth/login` → `{ token }`
- `POST /quizzes` (auth) `{ passageId }` → quiz payload
- `POST /attempts/submit` (auth) `{ quizId, answers[] }` → `{ attemptId, mcqScore, mcqTotal }`
- `POST /attempts/rubric` (auth) `{ attemptId, evidence, reasoning, style, notes }` → updated rubric

## Data model (high level)
- User
- Passage
- Question (MCQ)
- Quiz, QuizItem
- Attempt, AttemptAnswer

## Content policy
- Use public-domain / Creative Commons passages, or user-provided passages.
- Avoid scraping/redistributing copyrighted exam materials.

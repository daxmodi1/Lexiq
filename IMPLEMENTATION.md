# LEXIQ — Implementation Plan
> Full Stack Development Roadmap | v1.0
> **Stack: Next.js (latest) · Tailwind CSS · PostgreSQL · Prisma · Groq API · Clerk**

---

## 1. Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js Latest (App Router) + Tailwind CSS | UI, routing, SSR |
| Animation | Framer Motion | Card transitions, quiz animations |
| Charts | Recharts | Mastery score graphs, progress charts |
| Backend | Next.js API Routes | REST endpoints (no separate server needed) |
| Database | PostgreSQL via Supabase | All relational data |
| ORM | Prisma | Type-safe DB queries |
| Cache | Upstash Redis | Daily word cache, rate limiting, per-user quiz cache |
| AI (Primary) | Groq API — `llama-3.3-70b-versatile` | Word lookup, mnemonic generation |
| AI (Secondary) | Groq API — `llama-3.1-8b-instant` | Quiz grading, sentence generation |
| Auth | Clerk | User accounts, sessions, social login |
| TTS | Web Speech API | In-browser pronunciation audio |
| Background Jobs | Vercel Cron Jobs | 30-day queue scan, daily word selection |
| Deployment | Vercel | Frontend + API routes |
| DB Hosting | Supabase | Managed Postgres + free tier |

### Groq Model Split

| Task | Model |
|---|---|
| Word lookup — full entry card | `llama-3.3-70b-versatile` |
| Mnemonic generation | `llama-3.3-70b-versatile` |
| Generate fill-in-the-blank sentence | `llama-3.1-8b-instant` |
| Grade user quiz answer | `llama-3.1-8b-instant` |
| Difficulty classification | `llama-3.1-8b-instant` |

---

## 2. Development Phases

### Phase 1 — Foundation (Week 1–2)
> **Goal: Project setup, auth, database, and basic word lookup**

#### 1.1 Project Setup
- Scaffold latest Next.js project with App Router (`npx create-next-app@latest`)
- Install and configure Tailwind CSS + Framer Motion
- Set up ESLint, Prettier, TypeScript strict mode
- Configure environment variables (`.env.local`)
- Initialize Git repository with `main`/`dev` branch structure

#### 1.2 Authentication (Clerk)
- Install `@clerk/nextjs`
- Configure `ClerkProvider` in root layout
- Create Sign In / Sign Up pages using Clerk components
- Set up middleware to protect authenticated routes
- Create user webhook to sync Clerk user to Postgres on first sign-in

#### 1.3 Database Setup (Prisma + Supabase)
- Create Supabase project, get connection string
- Install Prisma, run `prisma init`
- Define schema: `User`, `Word`, `UserWord`, `Collection`, `QuizSession`, `QuizAnswer`, `DailyWord`, `Achievement`
- Run `prisma migrate dev` to create tables
- Generate Prisma client
- Seed database with 100 starter words for global daily word pool

#### 1.4 Groq API Integration — Word Lookup
- Install Groq SDK: `npm install groq-sdk`
- Create `/api/words/lookup` endpoint
- Write system prompt that returns structured JSON with all word fields (definition, etymology, synonyms, antonyms, examples, mnemonic, difficulty, word family, phonetic) — use `llama-3.3-70b-versatile`
- Handle API errors and rate limits gracefully
- Cache word lookups in DB — if word already exists in `words` table, return cached version

#### Groq Model Usage Split

| Task | Model |
|---|---|
| Word lookup — full entry card | `llama-3.3-70b-versatile` |
| Mnemonic generation | `llama-3.3-70b-versatile` |
| Generate fill-in-the-blank sentence | `llama-3.1-8b-instant` |
| Grade user quiz answer | `llama-3.1-8b-instant` |
| Difficulty classification | `llama-3.1-8b-instant` |

#### 1.5 Basic Word Search UI
- Build search bar component with debounce
- Build `WordCard` component displaying all fields from PRD section 3.1
- Add Web Speech API button for pronunciation playback
- Add "Add to My List" button + Auto-Add toggle
- Wire up to `/api/words/lookup`

---

### Phase 2 — Vocabulary List & Mastery (Week 3–4)
> **Goal: Personal word list, mastery scores, difficulty tags, collections**

#### 2.1 Vocabulary List Page
- Create `/vocabulary` route
- Fetch all `user_words` with joined word data
- Build vocabulary table with columns: Word, Difficulty, Mastery Score (badge), Date Added, Actions
- Add filter by difficulty tag (Beginner / Intermediate / Advanced / Rare)
- Add sort by: Mastery Score (asc/desc), Date Added, Alphabetical
- Add search/filter within vocabulary list

#### 2.2 Mastery Score System
- Initialize `mastery_score = 50` when word is added to `user_words`
- Create `updateMastery(userId, wordId, event)` utility function
- Implement score delta logic per PRD section 3.2 (correct: +8, wrong: -10, skip: -3, streak bonus: +5)
- Clamp score to `[0, 100]` in all update paths
- Update `last_reviewed_at` timestamp on every quiz interaction
- Add mastery tier label logic (Learning / Familiar / Practiced / Proficient / Mastered)
- Display mastery score as colored badge on vocabulary list and word cards

#### 2.3 30-Day Queue System
- Add `in_review_queue` boolean field to `user_words`
- Create Vercel Cron Job running nightly at 00:00 UTC
- Cron job query: find all `user_words` where `last_reviewed_at < NOW() - 30 days` AND `in_review_queue = false`
- Set `in_review_queue = true` for all matched records
- In `updateMastery()`: if word is `in_review_queue` and answer is wrong → apply -10 and keep in queue
- If answer is correct and `in_review_queue` → set `in_review_queue = false` (exit queue)

#### 2.4 Collections
- Create `collections` table in Prisma schema
- Build Collections UI: create, rename, delete collection
- Allow assigning/removing words to collections from vocabulary list
- Filter vocabulary list and practice modes by collection

---

### Phase 3 — Daily Questions & Streaks (Week 5–6)
> **Goal: Global Word of the Day, personal daily quiz, streak system**

#### 3.1 Global Word of the Day
- Create `DailyWord` table (`word_id`, `date`) with unique constraint on `date`
- Cron job at 00:00 UTC: select random word from global word pool, insert into `daily_word`
- Cache selected word in Upstash Redis with 24h TTL for fast reads
- Build `/api/daily/global` endpoint — returns today's word + user's answer status
- Build `GlobalWordOfDay` UI component on dashboard
- Multiple choice format: 4 options, one correct definition
- After answering, reveal full word entry card

#### 3.2 Word of the Day Streak
- Track `streak_count` and `streak_last_date` on `User` model
- On correct answer:
  - If `streak_last_date` was yesterday → increment `streak_count`
  - If today already → no change
  - If older than yesterday → reset to 1
- Grace period: treat "yesterday" as within the last 48h window
- Display streak count with flame icon on dashboard and profile
- Trigger badge awards at 7, 30, 60, 100 day milestones

#### 3.3 Personal Vocabulary Quiz (Daily)
- Build `/api/daily/personal` endpoint
- Implement word selection priority from PRD section 3.4 (queue first → low mastery → medium → random)
- Generate fill-in-the-blank questions using Groq API `llama-3.1-8b-instant`
- Return 3 questions per day, cached per user per day in Redis
- Build quiz UI: show sentence with blank, text input, submit button
- Call Groq API (`llama-3.1-8b-instant`) to grade answer (accepts synonyms and minor spelling variations)
- Show result: correct / incorrect + full word card reveal
- Update mastery score after each answer
- Mark user's daily quiz as complete when all 3 answered

---

### Phase 4 — Quiz Modes & Gamification (Week 7–8)
> **Goal: Timed challenge, definition match, achievements**

#### 4.1 Definition Match Quiz
- Pull random words from user's vocabulary list
- For each word, fetch 3 distractor definitions from other words in their list
- Present 4-choice multiple select, one correct
- Update mastery scores on completion

#### 4.2 Timed Challenge Mode
- Build `/quiz/timed` route
- Difficulty filter selector (Beginner / Intermediate / Advanced / All)
- 60-second countdown timer component
- Pull words from user's vocabulary list filtered by difficulty
- Rapid-fire multiple choice: word shown, user picks definition
- Score = correct answers in 60 seconds
- Show results screen: score, words missed, mastery changes
- Save best score to user profile
- Update mastery scores for all words encountered in session

#### 4.3 Achievements & Badges

| Badge | Trigger Condition |
|---|---|
| First Word | Add first word to vocabulary |
| Word Collector | Add 50 words |
| Century Club | Add 100 words |
| Week Warrior | 7-day Word of the Day streak |
| Month Master | 30-day streak |
| Speed Demon | Score 15+ in Timed Challenge |
| Perfectionist | Get 5 correct answers in a row |
| Rare Hunter | Add 5 Rare difficulty words |

---

### Phase 5 — Dashboard & Polish (Week 9–10)
> **Goal: Main dashboard, analytics, performance, final polish**

#### 5.1 Dashboard
- Vocabulary stats: total words, breakdown by difficulty
- Mastery distribution chart (Recharts bar/donut chart)
- Daily streak display
- Today's daily challenges (global + personal) with completion status
- Re-review queue count and shortcut to practice those words
- Recent activity feed: words added, quizzes completed

#### 5.2 Profile Page
- User avatar and name (from Clerk)
- Streak count and history
- Total words learned, quiz accuracy stats
- Achievements / badges earned
- Best timed challenge score

#### 5.3 Performance & Polish
- Add React Suspense and loading skeletons throughout
- Implement optimistic UI updates for adding words and submitting quiz answers
- Add error boundaries for API failures
- Keyboard navigation support for quiz inputs
- Mobile responsive layout for all pages
- Cache Groq API responses aggressively — looked up words saved to DB to avoid repeat API calls
- Add Vercel Analytics

---

## 3. API Route Reference

| Method + Route | Description |
|---|---|
| `GET /api/words/lookup?word=xyz` | Look up word via Groq API or DB cache |
| `POST /api/words/add` | Add word to user vocabulary list |
| `DELETE /api/words/[id]` | Remove word from user vocabulary |
| `GET /api/vocabulary` | Get all user words with mastery scores |
| `GET /api/daily/global` | Get today's global Word of the Day + answer status |
| `POST /api/daily/global/answer` | Submit answer for global daily word |
| `GET /api/daily/personal` | Get today's 3 personal quiz questions |
| `POST /api/daily/personal/answer` | Submit fill-in-the-blank answer (AI graded) |
| `GET /api/quiz/timed/words` | Get word set for timed challenge by difficulty |
| `POST /api/quiz/session` | Save completed quiz session + update mastery scores |
| `GET /api/user/stats` | Get user dashboard stats, streak, achievements |
| `GET /api/collections` | Get user's collections |
| `POST /api/collections` | Create new collection |
| `POST /api/collections/[id]/words` | Add word to collection |

---

## 4. Background Jobs (Vercel Cron)

| Job Name | Schedule | Action |
|---|---|---|
| `daily-word-selector` | `0 0 * * *` (midnight UTC) | Pick global Word of the Day, insert to DB, cache in Redis |
| `review-queue-scanner` | `0 1 * * *` (1am UTC) | Find words not reviewed in 30+ days, set `in_review_queue = true` |
| `streak-reset-check` | `0 2 * * *` (2am UTC) | Flag users who may lose streak for notification prep |

---

## 5. Folder Structure

```
lexiq/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (dashboard)/page.tsx          ← Dashboard
│   ├── vocabulary/page.tsx           ← Vocabulary list
│   ├── quiz/
│   │   ├── daily/page.tsx
│   │   └── timed/page.tsx            ← Timed challenge
│   ├── profile/page.tsx
│   ├── globals.css
│   └── api/
│       ├── words/
│       │   ├── lookup/route.ts
│       │   └── add/route.ts
│       ├── daily/
│       │   ├── global/route.ts
│       │   └── personal/route.ts
│       ├── quiz/session/route.ts
│       └── user/stats/route.ts
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── word/
│   │   ├── WordCard.tsx
│   │   ├── WordCardSkeleton.tsx
│   │   └── MasteryBadge.tsx
│   ├── quiz/
│   │   ├── QuizQuestion.tsx
│   │   └── TimedChallenge.tsx
│   ├── dashboard/
│   │   ├── DailyCards.tsx
│   │   ├── StatCard.tsx
│   │   └── MasteryChart.tsx
│   ├── vocabulary/
│   │   ├── VocabularyTable.tsx
│   │   └── WordDrawer.tsx
│   └── ui/
│       ├── ThemeToggle.tsx
│       ├── Badge.tsx
│       └── Toggle.tsx
│
├── lib/
│   ├── groq.ts                       ← Groq API calls
│   ├── mastery.ts                    ← Score update logic
│   ├── redis.ts                      ← Upstash client
│   └── prisma.ts                     ← DB client
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── jobs/
│   ├── daily-word.ts
│   └── review-queue.ts
│
└── tailwind.config.ts                ← All design tokens
```

---

## 6. Timeline Summary

| Week | Phase | Deliverable |
|---|---|---|
| 1–2 | Phase 1: Foundation | Auth, DB, word lookup UI, Groq API integration |
| 3–4 | Phase 2: Vocabulary | Word list, mastery scores, 30-day queue, collections |
| 5–6 | Phase 3: Daily Challenges | Word of the Day, personal quiz, streak system |
| 7–8 | Phase 4: Quiz Modes | Timed challenge, definition match, achievements |
| 9–10 | Phase 5: Polish | Dashboard, profile, mobile, analytics, launch prep |

---

*End of Implementation Plan — Lexiq v1.0*

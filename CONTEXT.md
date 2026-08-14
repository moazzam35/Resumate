# Resumate — Complete Project Context

> **Read this file first before writing any code.** It documents the stack,
> architecture, conventions, data model, admin panel behavior, and known
> limitations. `AGENTS.md` and `CLAUDE.md` both point here.

---

## 1. What this project is

**Resumate** is an AI-powered resume builder SaaS: users build ATS-optimized
resumes, get AI writing help, score their resume against job descriptions, run
mock interviews, and generate cover letters. It has a public marketing site, a
member dashboard, and a full admin panel.

App name: **Resumate** (see `lib/constants.js` → `SITE_CONFIG.name`).

---

## 2. Tech stack

| Layer      | Choice                                                              |
| ---------- | ------------------------------------------------------------------- |
| Framework  | Next.js **16.2.11** (App Router, Turbopack, React Compiler on)      |
| React      | 19.2.4                                                              |
| Language   | JavaScript (JSX), TypeScript 5.9 (strict: **false**), `allowJs: true` |
| Database   | PostgreSQL via **Prisma 7.9** with `@prisma/adapter-pg` driver adapter |
| State      | Zustand 5 (`store/index.js`)                                        |
| Styling    | Tailwind 4 (`@tailwindcss/postcss`), Radix UI primitives, framer-motion, lucide-react |
| Charts     | recharts                                                            |
| AI         | Groq API, model `llama-3.3-70b-versatile` (`lib/ai.js`)             |
| Auth       | jose JWT (HS256), bcryptjs (cost 12)                                |
| PDF/DOCX   | pdf-lib + pdfjs-dist (server), mammoth (DOCX import)                |
| Uploads    | Cloudinary (`lib/upload.js`)                                        |
| Email      | nodemailer (SMTP) or Resend (`lib/mailer.js`)                       |
| Validation | zod (`validators/index.js`)                                         |

> **Next.js 16 gotcha:** APIs/conventions differ from older training data.
> Read `node_modules/next/dist/docs/` before writing framework code. There is
> **no ESLint** and **no test suite** — verification is `tsc --noEmit` + `npm run build`.

---

## 3. Commands

```bash
npm run dev        # dev server (port 3000)
npm run build      # production build (≈100s compile + TS pass)
npm start          # run production build
npx tsc --noEmit   # typecheck (covers JS/JSX via allowJs)
npx prisma validate            # schema check
npx prisma db push / migrate   # schema → DB (schema: prisma/schema.prisma)
```

Helper scripts (`scripts/`, run with node):
- `seed-users.js` — creates demo users + free subscriptions (user1@example.com, admin@example.com, …)
- `seed-templates.js` — seeds the `ResumeTemplate` rows
- `make-admin.js` — promote a user to ADMIN
- `cleanup-orphans.js` — removes orphaned sub-resources

---

## 4. Environment variables

Secrets live in `.env` (never commit). `.env.example` exists but may contain
real values — do **not** copy values into code or docs.

| Variable | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Access-token signing secret (≥32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret (≥32 chars) | ✅ |
| `GROQ_API_KEY` | AI provider (Groq) | ✅ for AI features |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (defaults localhost:3000) | |
| `NEXT_PUBLIC_SITE_URL` | Site URL (admin settings read it) | |
| `SITE_NAME` | Overrides brand name | |
| `AI_MODEL` | Default `llama-3.3-70b-versatile` | |
| `AI_ENABLED` | `"false"` disables AI | |
| `STRIPE_SECRET_KEY` | **Not wired up** — presence only toggles a settings flag | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM` | nodemailer | |
| `RESEND_API_KEY` / `Resend_Api_key` | Resend alternative to SMTP | |
| `EMAIL_FROM`, `SUPPORT_EMAIL`, `CONTACT_TO` | From/contact addresses | |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Avatar/uploads | |
| `MAX_RESUMES_PER_USER`, `FREE_AI_REQUESTS_PER_DAY`, `PRO_AI_REQUESTS_PER_DAY` | Read by admin settings page **only** — real limits are hardcoded in `lib/usage.js` | |

---

## 5. Architecture / folder map

```
app/
  (marketing)/        public pages: /, /features, /faq, /blog, /contact, /about, /privacy, /terms, /security
  (auth)/             /login, /register, /forgot-password, /reset-password, /verify-email
  dashboard/          member app: resumes, ats-checker, cover-letters, interview, job-match,
                      analytics, notifications, profile, settings, templates, upgrade
  resume/             resume editor: /resume/new, /resume/[id]
  cover-letter/       cover letter editor
  templates/          public template gallery
  admin/              admin panel: dashboard, users(+[id]), resumes, templates, ai-usage,
                      analytics, audit-log, settings, payments (stub), reports (CSV exports)
  api/                all API routes (auth, resumes, cover-letters, ai, ats-score,
                      ats-improve, job-match, analytics, admin/*, usage, upload, …)
lib/
  prisma.js           Prisma client singleton (PrismaPg adapter) — always import this
  auth.js             JWT sign/verify helpers (jose)
  middleware.js       ROUTE-level auth helpers: authenticate, requireAdmin, authenticateOptional,
                      verifyResumeOwnership
  api-response.js     apiSuccess/apiError/apiPaginated/safeBody/validateRequired/parsePagination
  ai.js               AI_PROMPTS + callGroq + generateAIContent + parseJSONResponse
  ats.js              Deterministic ATS scoring engine (analyzeATS, section parsing)
  usage.js            SERVER-SIDE plan limits & credit enforcement (source of truth)
  usage-client.js     client mirror (UI badges only)
  resume-completion.js, resume-status.js   completion % and DRAFT/COMPLETED/PUBLISHED logic
  pdf.js              generateResumePDF (pdf-lib)
  templates/          registry.js (TEMPLATES/ARCHETYPES), design.js, normalize.js, access.js, pending.js
  mailer.js, upload.js, rate-limit.js, password.js, audit.js, constants.js, utils.js, api.js, blog-posts.js
components/           ui/ (Radix wrappers), shared/, layout/, features/, dashboard/, seo/
store/index.js        useAuthStore, useResumeStore, useUIStore (Zustand)
validators/index.js   zod schemas
prisma/schema.prisma  data model
proxy.js              ⚠️ ACTIVE Next.js middleware (route protection) — NOT lib/middleware.js
```

---

## 6. Core conventions (follow these)

### API routes
- Every endpoint uses helpers from `lib/api-response.js`:
  `apiSuccess(data, msg)`, `apiError(msg, status)`, `apiPaginated(data, {total, page, limit}, extra?)`,
  `safeBody(request)`, `validateRequired(body, fields)`.
- `apiPaginated` accepts an optional 3rd arg to attach extra top-level fields
  (e.g. `/api/admin/resumes` returns `{ data, pagination, summary }`).
- Auth: `await requireAdmin(request)` / `authenticate(request)` from `lib/middleware.js`;
  return the `Response` object it throws when auth fails (`if (error instanceof Response) return error`).
- Ownership: always scope queries to the user (`findFirst({ id, userId })` or `verifyResumeOwnership`).
- Rate limits: `lib/rate-limit.js` (`checkRateLimit(key, limit, windowMs)`) on auth/AI/contact/extract endpoints.

### Route protection
- `proxy.js` (root) is the actual middleware: JWT check, guest-allow lists,
  admin-route protection, role redirects. Don't confuse it with `lib/middleware.js`.

### Auth
- Access token: JWT, 1h expiry. Refresh token: JWT, 7d expiry. Issuer: `ai-resume-builder`.
- Tokens are sent as httpOnly cookies **and** kept in localStorage (`token`) — the
  localStorage copy is a known XSS surface; migrating to cookie-only is a planned improvement.
- Passwords bcrypt cost 12; reset/verify tokens are single-use, stored as sha256.

### Plan limits (single source of truth)
- `lib/usage.js`: FREE {3 resumes, 7 AI/month}, PRO {10, 20}, ENTERPRISE {unlimited};
  admins = ENTERPRISE. Every AI-capable and resume-creation endpoint must call
  `enforceResumeLimit` / `consumeCredit` / `refundCredit` here — never hardcode limits elsewhere.
- `lib/usage-client.js` + `PLANS` in `lib/constants.js` are the UI mirror (same numbers — keep in sync).

### AI
- `lib/ai.js` `AI_PROMPTS` keyed by type; `/api/ai` validates the type against the
  known keys (returns 422 otherwise — do not let arbitrary types hit the DB enum).
- AI credits are consumed/refunded around AI calls; failed calls must refund.

### Templates & resume data
- `lib/templates/registry.js` defines templates/archetypes; `normalize.js` shapes DB
  JSON into editor data; `design.js` resolves design/colors; `access.js` gates premium templates.
- PDF export: `lib/pdf.js generateResumePDF`, served via `/api/resumes/[id]/download`.

### Client
- Zustand stores in `store/index.js`; auth bootstrapping in `components/auth-initializer.jsx`.
- Client components fetch `/api/...` directly; server pages render `page-content.js` components.

---

## 7. Data model (prisma/schema.prisma)

- **User** (roles: USER/CLIENT/MODERATOR/ADMIN; `isTest` flag to exclude test accounts
  from analytics) → resumes, coverLetters, aiHistories, atsResults, notifications,
  sessions, subscription (1:1), loginHistory, auditLogs (admin actions), templateFavorites
- **Resume** (title, slug, template, colorTheme, status DRAFT/COMPLETED/PUBLISHED,
  aiScore, atsScore, isPublic, personalInfo JSON, design JSON, version, lastAutosave)
  with sub-resources: **Experience, Education, Skill, Project, Certificate, Language,
  Achievement, SectionOrder, VersionHistory** (all `@@unique([resumeId, …])`-safe, ordered)
- **CoverLetter** (title, slug, company, position, content, template, status)
- **ResumeTemplate** (name, slug, category, thumbnail, isPremium, isActive, config, order)
- **AtsResult** (resumeContent, jobDescription, score, data JSON)
- **AIHistory** (type, input, output, model, tokens) — `AIType` enum lists every AI feature
- **Subscription** (plan FREE/PRO/ENTERPRISE, stripeId, isActive, aiCreditsUsed, aiCreditResetAt)
- **Notification, Session, LoginHistory, AuditLog, TemplateFavorite**

---

## 8. Admin panel (data honesty notes)

- **Real data:** users, resumes, templates, audit log, AI usage, analytics charts — all live Prisma queries.
- **Revenue is ESTIMATED:** `PLAN_PRICES = { PRO: 12, ENTERPRISE: 29 }` in
  `app/api/admin/route.js` and `app/api/admin/stats/route.js` multiply active premium
  subscriptions. No payment provider is wired up. UI labels say "Est. Revenue".
- **Admin Settings cannot be saved:** `PUT /api/admin/settings` returns 400 — settings
  come from env vars. The page shows the real error; do not "fix" it into a fake success.
- **Reports page** generates real CSV from `/api/admin` + `/api/admin/stats`; Download works.
- `/api/admin/resumes` returns `summary` { total, drafts, completed, published, templatesUsed }.
- `/api/admin/usage` and `/api/admin/users` expose `aiActions` (all AI calls) — labeled "AI Actions".

---

## 9. Known limitations & honest notes

- No ESLint, no automated tests (Next 16 removed `next lint`).
- Stripe not integrated: `/admin/payments` is a stub; `/api/billing/upgrade` exists but no real provider.
- `app/dashboard/resumes/[id]/page-content.js` is a dead editor (page redirects to `/resume/[id]`).
- Access token also stored in localStorage (XSS surface) — httpOnly-only is planned.
- Email silently no-ops in dev when no provider configured (by design).
- `public/blog_hero.png` is 1.9MB — candidate for compression/next/image.
- `app/generated/prisma` is gitignored and excluded from tsconfig — do not re-import it
  (it added ~48s to builds).
- `audit-report.txt` + `audit-completion-report.txt` (2026-08) document a full
  production-readiness audit; all listed bugs were fixed and verified (build, tsc, prisma,
  HTTP/API smoke tests).

---

## 10. Verification workflow (do this after non-trivial changes)

1. `npx tsc --noEmit` — must exit 0
2. `npm run build` — must pass (85 routes)
3. `npx prisma validate` — if schema touched
4. Smoke-test affected pages/APIs against a running server; never fabricate results.

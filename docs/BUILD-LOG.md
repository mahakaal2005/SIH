# Build log

Append-only. Newest at the bottom. Never rewrite an old entry.

---

## 2026-09-26: Scaffold + shared engine

**Built**
- npm workspaces: `apps/web` (React 19, Vite 8, TS 6, Tailwind 4, shadcn radix/nova) and `packages/shared` (pure TS).
- `packages/shared`: eligibility evaluator over versioned JSON rules (all ops, `when` guards, priority groups, near-miss detection); recommender (tiering, approval-odds ranking, low-odds alternatives, caste-neutral fallback, per-scheme rule version); finance (EMI with moratorium capitalisation, NSFDC 90% + caps, PM-AJAY 5-component split, affordability); partner health gate (NSFDC prudential rules); district alias resolver + search; stage timeline + stall detection; receipt canonicalisation. 97 tests.
- Real seed data: 75 districts + 9 legacy aliases, 16 PM-AJAY projects, approval stats reconciled to the 73,888 / 25,000 funnel, NSFDC + PMEGP + Mudra schemes and rules, document checklist, partner entities and branches.

**Decisions**
- Monorepo with the engine in `packages/shared`, so the future Fastify backend runs the identical rule engine (doc 06: shared types, rules decide).
- Rules are data (Zod-validated, versioned), so eligibility changes never need a code change (F1.6) and every decision stays auditable.
- Moratorium: simple interest accrues and is capitalised, then amortised. Affordability thresholds are 35% (stretch) and 50% (unaffordable) of monthly family income.
- Fallback schemes (PMEGP, Mudra) show as primary only when no SC scheme fits; otherwise they're listed as "also available" (F1.7).
- Low-odds threshold is 20%; alternatives are other PM-AJAY projects the applicant would qualify for with better historical odds (F4.3).
- Seed data is written in TypeScript instead of JSON so the compiler checks it; the seed-integrity test guards references and totals.
- Kept oxlint from the Vite template; architecture rules live in `scripts/check-boundaries.mjs`. A parallel session added the PII-in-LLM rule and `scripts/check-i18n.mjs`, and those are adopted as project rules.

**Skipped / deferred**
- Everything in the web app beyond the scaffold (next: web core).

# SIH 2026 — PS 26092 · Yojna Sarthi

**AI-Driven Scheme Matching for Marginalized Entrepreneurs**
Ministry of Social Justice and Empowerment · Team Zenith · KIET Group of Institutions

---

## What this is

Government lends to Scheduled Caste entrepreneurs at 6.5–8% through NSFDC. The money exists. The people it was written for mostly never get it.

We are building the **decision-and-execution layer** that sits between the citizen and that money: which scheme actually fits you, what it truly costs, which partner near you can genuinely fund it, and what is happening to your application right now.

**We are not a scheme-discovery portal.** myScheme already does discovery. Discovery is not the gap.

---

## The five numbers this project exists because of

| | |
|---|---|
| **62.9%** | of UP Grant-in-Aid applications never get *any* decision |
| **5.8×** | swing in approval odds based only on which project you tick |
| **58.8%** | of beneficiaries cross the poverty line, down from ~99% |
| **~212 days** | PMEGP end-to-end, against a 130-day official expectation |
| **0.15%** | of SC households reached in a year |

Every one is from a government source. Citations in `docs/01-the-system.md` and `docs/02-the-problem.md`.

---

## Read the docs in this order

| # | File | What it answers |
|---|---|---|
| **0** | [`docs/00-INDEX.md`](docs/00-INDEX.md) | **Start here.** What each doc is for, what's decided, what's open |
| 1 | [`docs/01-the-system.md`](docs/01-the-system.md) | How the money actually flows, and every number |
| 2 | [`docs/02-the-problem.md`](docs/02-the-problem.md) | What breaks, for whom, and who else has tried |
| 3 | [`docs/03-evidence-and-data.md`](docs/03-evidence-and-data.md) | Real voices, and what data we can actually get |
| 4 | [`docs/04-up-reference.md`](docs/04-up-reference.md) | Uttar Pradesh operational detail — the build reference |
| 5 | [`docs/05-features.md`](docs/05-features.md) | What we're building, in what order |
| 6 | [`docs/06-tech-stack.md`](docs/06-tech-stack.md) | Stack, architecture, and why not the alternatives |
| — | [`docs/explainer.html`](docs/explainer.html) | Judge-facing visual explainer. Open it in a browser |

**If you only read one thing:** `docs/00-INDEX.md`, then `docs/05-features.md`.

---

## Locked decisions

- **PS 26092**, SC scope via NSFDC, with PM-AJAY Grant-in-Aid as a second track
- **Target state: Uttar Pradesh.** Demo districts: Sitapur, Hardoi, Rae Bareli, Lucknow, Ghaziabad
- **Web-first PWA**, not Android-first
- **Node + TypeScript end to end** — Fastify backend, React frontend, shared types
- **Supabase** for database, auth and storage. Postgres + PostGIS + pgvector
- **Rules decide eligibility. The LLM only explains.** Never the reverse
- **Multilingual is Tier 0**, PS-mandated, built from day one alongside voice
- **Partner health data is seeded**, with the API contract we'd need published openly

---

## Stack

```
React 19 + Vite + TS + Tailwind + shadcn/ui   → Cloudflare Pages
                  ↓ shared types
Fastify + TypeScript                           → Cloud Run
   rule engine (zero LLM) · LanguageService · AI layer
   privacy gate: PII mask · injection screen · signed receipts
                  ↓ Drizzle
Supabase: Postgres + PostGIS + pgvector + Auth + Storage + RLS
```

LLM fallback chain: **Gemini → Groq → Ollama → rules-only.** A dead API key costs us quality, not uptime.

Full reasoning, including the two documented reversals, in `docs/06-tech-stack.md`.

---

## Before anyone writes code

- [ ] Supabase project created, PostGIS + pgvector enabled
- [ ] GCP budget alerts at ₹8,000 / ₹16,000 / ₹24,000
- [ ] Maps API key created and **restricted by HTTP referrer** ⚠️
- [ ] Gemini (Vertex) enabled · Groq free key · Ollama installed locally
- [ ] Bhashini / ULCA account registered
- [ ] `.env` never committed — check `.gitignore` first

⚠️ **The Maps key ships inside the frontend bundle.** An unrestricted key gets scraped and drains the credits overnight. Restrict it before the first deploy, not after.

---

## Repo layout (planned)

```
SIH/
├── docs/              ← research and planning (this is what's here now)
├── apps/
│   ├── web/           ← React + Vite PWA
│   └── api/           ← Fastify backend
├── packages/
│   ├── types/         ← shared TypeScript types
│   └── rules/         ← eligibility engine, zero LLM
└── data/seed/         ← schemes, partners, districts
```

---

## Team

Atul · Faiqua · Rudra · Charan · Ayush · Chirag

Work allocation is deliberately deferred until the repo scaffold exists and the shape of the work is visible.

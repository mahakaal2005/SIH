# Doc 6: Tech Stack & Architecture

> **v2 — 26 September 2026.** Supersedes v1. Two decisions were reversed after review: **Python → Node/TypeScript**, and **Cloud SQL + Firebase → Supabase**. Both reversals are explained below rather than quietly edited out.
> Constraint context: ₹32,000 Google Cloud credits, billing enabled.
> Team allocation deliberately **not** in this document.

---

## The five principles

1. **Rules decide, LLM explains.** Eligibility is deterministic code. The LLM never decides who qualifies. This one sentence answers the reliability question a judge will ask.
2. **One language, one database, one deploy.** Every extra moving part is a thing that breaks at 2am before demo day.
3. **Degrade, never die.** Every external dependency has a fallback. A dead API key must cost us quality, not availability.
4. **Citizen data stays defensible.** We handle caste, income and Aadhaar under DPDP 2023. Architecture must survive that question.
5. **Nothing in the demo path is non-deterministic.**

---

## ⚠️ Two reversals from v1, and why

### Reversal 1: Python → **Node + TypeScript**

v1 chose FastAPI because "the AI/ML people know Python." That reasoning does not survive scrutiny.

**We are not doing any machine learning.** No training, no fine-tuning, no numpy, no pandas in the request path. We make HTTP calls to Gemini. Every language does that identically. Python's ML ecosystem advantage is worth **zero** to this project.

What Node actually buys us:

| Benefit | Why it matters here |
|---|---|
| **One language end to end** | Six people, one mental model, no context switching |
| **Shared types** | Define `Scheme` and `Partner` once. Change the API and TypeScript breaks the frontend immediately, at compile time |
| **LangGraph.js is production-ready** | `@langchain/langgraph`. Our single agent is simple enough that Python's extra maturity is irrelevant |
| **Best-supported Supabase client** | Supabase is JS-first |
| **Everyone already writes React** | Zero onboarding cost |

Python's last real advantage was WeasyPrint for PDF generation. `react-pdf` covers it, using React knowledge the team already has.

### Reversal 2: Cloud SQL + Firebase → **Supabase**

v1 split the stack across Cloud SQL (data) and Firebase (auth, storage). That was two systems doing what one can do, and it caused genuine confusion about where data lived.

**Supabase is Postgres + PostGIS + pgvector + Auth + Storage in a single service.**

| | Supabase | Cloud SQL + Firebase | Neon |
|---|---|---|---|
| Real Postgres | ✅ | ✅ | ✅ |
| PostGIS + pgvector | ✅ | ✅ | ✅ |
| **Free when idle** | ✅ | ❌ bills 24/7 | ✅ |
| Auth included | ✅ | Firebase, separate | ❌ |
| Storage included | ✅ | Firebase, separate | ❌ |
| Number of services | **1** | 2 | 1 (db only) |

Free tier: 500MB database, 1GB storage, 50k monthly active auth users. Our entire dataset is a few MB.

**The one catch:** the free tier pauses after 7 days idle. Either ping it, or pay $25 for the demo month. Put a reminder in the calendar the week of the demo.

**Neon** stays the alternative if we ever want pure database with no bundled services.

---

## Layer-by-layer

### Frontend framework

| Option | Verdict | Why / why not |
|---|---|---|
| **React 19 + Vite** | ✅ **CHOSEN** | Fastest HMR, simplest model, static build |
| Next.js | ❌ | SSR and SEO are its gifts, and our own positioning (Doc 5) says we are **not** a discovery portal. Paying complexity for an unwanted benefit |
| SvelteKit | ❌ | Smaller bundles, genuinely good, but a hackathon is the wrong place to learn a framework |

### Styling & components

| Option | Verdict | Why |
|---|---|---|
| **Tailwind + shadcn/ui** | ✅ **CHOSEN** | Tokens enforce a design system. Radix underneath gives keyboard and screen-reader correctness free — **not optional when 15.3% of users are illiterate** |
| MUI / Chakra / Bootstrap | ❌ | Heavy, opinionated, and every judge has seen Bootstrap |

### Backend

| Option | Verdict | Why |
|---|---|---|
| **Node 22 + TypeScript + Fastify** | ✅ **CHOSEN** | First-class TS, Zod schema validation built in, fast, unremarkable |
| Express | 🟡 Safe fallback | More familiar, weaker TS story. Switch if Fastify fights anyone |
| Hono | 🟡 | Lovely and very fast, smaller community |
| NestJS | ❌ | Decorator ceremony we cannot afford |
| FastAPI (Python) | ❌ | See Reversal 1 |

### Database & ORM

| Option | Verdict | Why |
|---|---|---|
| **Supabase Postgres + PostGIS + pgvector** | ✅ **CHOSEN** | One service, three capabilities, free when idle |
| **Drizzle ORM** | ✅ **CHOSEN** | SQL-like, handles **raw PostGIS queries cleanly** — Prisma's raw SQL story is worse, and our core F3 query is raw geo |
| Prisma | ❌ | Awkward with PostGIS |
| Firestore / MongoDB | ❌ | **Cannot do the multi-range geo query that IS our core feature.** Eligibility rules are relational; storing them in a document DB means doing relational work in the wrong engine |
| Separate vector DB (Pinecone, Qdrant) | ❌ | pgvector does it inside a database we already run |

**Why the database choice hinges entirely on F3:** *find partners within X km, authorised for scheme Y, with NPA < 15% AND utilisation > 80% AND no overdues > 1 year, ranked by travel time.* Document databases handle multi-range + geo + aggregate badly. And the PS explicitly asks for routing on **current** fund utilisation — precomputing that into buckets would quietly gut our best feature.

### Maps & geo — **two keys, not one**

| Option | Verdict | Why |
|---|---|---|
| **Google Maps Platform** | ✅ **CHOSEN** | **Places Autocomplete on Indian village names is the deciding factor.** Directions gives real travel time, not straight-line distance |
| `@vis.gl/react-google-maps` | ✅ | Official React wrapper for the render layer |
| Leaflet + OSM + OSRM | 🟡 **Fallback flag** | Fully free, zero keys, but weaker India village coverage. Behind `USE_GOOGLE_MAPS=false` so credit exhaustion never breaks the demo |

**The Maps APIs are not one thing. They split by where they can physically run:**

| API | Runs where | Key |
|---|---|---|
| **Directions** | Server-side REST | 🔒 **Server key, backend only** |
| **Geocoding** | Server-side REST | 🔒 **Server key, backend only** |
| **Places (Web Service)** | Server-side REST | 🔒 **Server key, backend only** |
| **Maps JavaScript API** | **Browser only, unavoidably** | ⚠️ Public by necessity |

The Maps JS API loads Google's script into the page and the browser talks directly to Google's tile servers. It cannot be proxied — tile proxying violates the ToS and would wreck performance.

**So we run two keys:**

**1. Server key** (`GOOGLE_MAPS_SERVER_KEY`)
- Directions, Geocoding, Places Web Service
- Lives in `.env` on Cloud Run. **Never reaches the browser**
- IP-restricted to Cloud Run egress if a static IP is configured
- This is where all the expensive calls happen

**2. Browser key** (`VITE_GOOGLE_MAPS_BROWSER_KEY`)
- **Maps JavaScript API only**
- Public by necessity, so locked down three ways:
  1. **HTTP referrer restriction** to exact domains (+ localhost for dev)
  2. **API restriction to Maps JavaScript API alone** — a stolen key cannot call Directions or Places
  3. **Daily quota cap** set on that specific key in GCP

**Worst case if the browser key is scraped: someone renders maps.** They cannot run our expensive geo queries. Damage is bounded and capped.

### 🆕 Directions cache — the real cost control

Once Directions runs through our backend, results are cacheable. **Travel time from a given village to a given partner branch does not change.**

```
directions_cache
  origin_place_id   text
  dest_place_id     text
  distance_m        int
  duration_s        int
  fetched_at        timestamptz
  PRIMARY KEY (origin_place_id, dest_place_id)
```

Our five demo districts have a fixed set of partner branches. **After the first run, nearly every routing query is a cache hit costing nothing.** Geocoding results cache the same way.

The frontend never sees a raw Google response. It receives *"nearest 5 eligible partners with travel times"* — our API, our shape, our rate limits.

⚠️ **ToS constraint, worth knowing before someone suggests it:** Google's Maps Platform terms restrict using Google Maps content with a non-Google map. **Directions data rendered on a Leaflet/OSM basemap is a violation.** So the fallback is all-or-nothing: either Google maps + Google APIs, or OSM + OSRM routing. Never mixed.

### 🔐 Key-exposure principle (applies beyond maps)

> **No API key reaches the browser unless the API technically requires it there.**

| Key | Where | Why |
|---|---|---|
| Google Maps **server** key | 🔒 Backend | Can be server-side, so it is |
| Google Maps **browser** key | ⚠️ Browser | Technically unavoidable. Scoped and capped |
| Bhashini | 🔒 Backend | Every call goes through `LanguageService` |
| Gemini / Groq | 🔒 Backend | Never client-side |
| **Supabase anon key** | ✅ Browser, **by design** | This one is *meant* to be public. **RLS is what protects the data.** Do not "fix" this — just make sure RLS is on |

### Language & voice (F0 + F5)

| Layer | Choice | Fallback |
|---|---|---|
| Speech → text | **Bhashini ASR** | Google Cloud STT → Web Speech API |
| Text → speech | **Bhashini TTS** | Google Cloud TTS |
| Translation | **Bhashini** | Gemini |
| UI strings | **react-i18next** | — |

**Architecture rule:** one `LanguageService` interface. No component ever calls Bhashini directly. No string is ever hardcoded.

**Why Bhashini primary:** in a **Ministry of Social Justice** problem statement, using India's own language stack is a genuine narrative win with government judges, and it's free.

### LLM — three-tier fallback 🆕

*Adopted from the Yojna Setu review. This is the single best idea in that system.*

```
Gemini 2.5 Flash  (primary, Vertex AI, credits)
      ↓ quota exhausted / error / timeout
Groq  (Llama 3.3 70B — free tier, extremely fast)
      ↓ unavailable
Ollama + Gemma 3  (local, always works, lower quality)
      ↓ all three down
Rule-engine output only, no LLM prose
```

**Why this matters more than it looks:** it means a dead API key costs us quality, not availability. When a judge asks *"what happens if your API fails during the demo?"*, we answer by pulling the network cable and letting it degrade live. Almost no team can do that.

**Bulk work runs on Ollama at zero cost.** If we ever batch-process the 2,066-scheme myScheme dataset, that runs locally, not on paid API calls.

### AI orchestration

| Option | Verdict | Why |
|---|---|---|
| **LangGraph.js** | ✅ **CHOSEN, narrowly scoped** | Explicit graph. **Lets us mix deterministic rule nodes and LLM nodes in one flow** — "rules decide, LLM explains" expressed in code |
| LangChain (full) | ❌ | Abstraction over a handful of API calls |
| CrewAI / AutoGen | ❌ | Role-playing crews and variable turn counts. **Our problem has no genuine division of labour between agents.** Non-determinism in the demo path |
| Plain function calls | 🟡 | Correct for 3 of our 4 AI tasks |

### Where AI actually lives — four places, and one deliberate absence

| Task | Tool | Why not an agent |
|---|---|---|
| **Eligibility matching (F1)** | **Plain TypeScript rules. Zero LLM** | Must be auditable. "You don't qualify" cannot be probabilistic |
| **Voice → structured fields (F5)** | **One Gemini call**, Zod schema | Extraction, not reasoning. ~1s |
| **"Why this fits you" (F1.2)** | **One Gemini call** | Single generation |
| **Project report (F6.3)** | ✅ **LangGraph agent — the one genuine case** | Multi-step with validation and retry |
| **Officer stall analysis (F7.2)** | 🟡 SQL → one Gemini summary | Optional |

**The one agent that earns its place:**

```
[rule] load scheme + SOP cost template
   ↓
[llm]  draft business rationale
   ↓
[rule] compute financials (total, 5% contribution, grant, training, CGTMSE)
   ↓
[llm]  write narrative sections
   ↓
[rule] VALIDATE all 5 SOP-mandated components present
   ↓ fail → retry (max 2)
[out]  PDF
```

**The sentence that wins the reliability question:**

> "We use a LangGraph agent for document generation, where multi-step reasoning with validation genuinely helps. We deliberately kept eligibility as a deterministic rule engine, because when a citizen is told they don't qualify, that decision has to be auditable, not probabilistic."

### Security & privacy layer 🆕

*Also adopted from the Yojna Setu review. Most teams skip this entirely.*

| Control | What it does |
|---|---|
| **PII masking before any LLM call** | Aadhaar, phone, name, exact address are stripped or tokenised before text leaves our server |
| **Prompt-injection screening on all user text** | Voice transcripts and free-text fields are screened before reaching a model |
| **Caste and income never sent to an LLM** | They go to the **rule engine only**. The LLM sees "eligible for scheme X", never "SC, income ₹1.8L" |
| **Signed application receipt** 🆕 | Cryptographically signed receipt at submission. **Directly counters our B19 fraud finding** — fake sanction letters become detectable, because a real one verifies and a fake one does not |
| **RLS on Supabase** | Row Level Security so a citizen can only read their own application |

**Why this earns its place in the pitch:** we handle caste, income and Aadhaar under **DPDP Act 2023**. A sharp MoSJE judge may ask about it. Having a real answer turns a compliance risk into a differentiator.

### Everything else

| Layer | Choice | Rejected |
|---|---|---|
| Auth | **Supabase Auth** (phone OTP) | Firebase Auth (extra service now that Supabase covers it) |
| Storage | **Supabase Storage** | Firebase Storage (same) |
| Push | **FCM** (the only Firebase piece left) | Twilio (cost) |
| Frontend host | **Cloudflare Pages** or Vercel | Both free. Firebase Hosting works equally |
| Backend host | **Cloud Run** | Uses credits, scales to zero |
| Server state | **TanStack Query** | Redux (overkill) |
| Forms | **React Hook Form + Zod** | Zod schemas shared with the backend |
| PDF | **react-pdf** | Puppeteer (needs a browser in the container) |
| Charts | **Recharts** | — |
| Embeddings | **multilingual-e5** (open, CPU) | Gemini embeddings (fine too, this is free) |
| CI/CD | **GitHub Actions → Cloud Run** | — |
| Errors | **Sentry** free tier | Flying blind during a live demo |

---

## Open-source alternatives, honestly assessed

| Job | We use | OSS alternative | Should we? |
|---|---|---|---|
| LLM | Gemini | **Gemma 3, Llama 3.3, Qwen 2.5, Mistral** | ✅ **Already in the fallback chain.** Ollama for local dev |
| Speech → text | Bhashini | IndicWhisper, Whisper, wav2vec2 | ❌ Bhashini is already free and Indian-government. OSS adds GPU cost for no gain |
| Embeddings | — | **multilingual-e5, IndicBERT, LaBSE** | ✅ **Using OSS.** Runs on CPU, free, fine for 2,066 rows |
| Local runtime | — | **Ollama**, vLLM, llama.cpp | ✅ **Ollama for dev and the third fallback tier** |
| Orchestration | LangGraph.js | — | Already OSS, MIT |
| Database | Supabase | Postgres self-hosted | 🟡 Supabase *is* Postgres. Self-hosting is the go-live path |

**The data-sovereignty pitch line:**

> "The LLM is swappable behind an interface. We develop against an open model running locally, and the identical code runs on a government server with zero citizen data leaving Indian infrastructure. Under DPDP, that matters."

**And you can prove it live** by flipping an env var mid-demo.

---

## The stack

```
┌──────────────────────────────────────────────────────────┐
│  React 19 + Vite + TypeScript + Tailwind + shadcn/ui     │
│  PWA · react-i18next · TanStack Query                     │
│  @vis.gl/react-google-maps                                │
│  → Cloudflare Pages                                       │
└──────────────────────────────────────────────────────────┘
                     │ REST, shared TS types
┌──────────────────────────────────────────────────────────┐
│  Fastify + TypeScript  →  Cloud Run                       │
│                                                            │
│  ┌───────────────┐ ┌──────────────┐ ┌─────────────────┐  │
│  │ RULE ENGINE   │ │ LanguageSvc  │ │ AI LAYER        │  │
│  │ eligibility   │ │ Bhashini →   │ │ Gemini → Groq   │  │
│  │ EMI / costs   │ │ Google STT → │ │   → Ollama      │  │
│  │ partner gates │ │ Web Speech   │ │ + LangGraph.js  │  │
│  │ ZERO LLM      │ │              │ │ (reports only)  │  │
│  └───────────────┘ └──────────────┘ └─────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ PRIVACY GATE — PII mask · injection screen · sign  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                     │ Drizzle
┌──────────────────────────────────────────────────────────┐
│  SUPABASE                                                 │
│   Postgres 16 · PostGIS (geo) · pgvector (search)        │
│   Auth (phone OTP) · Storage (documents) · RLS           │
└──────────────────────────────────────────────────────────┘

FCM for push (the only Firebase piece remaining)
```

**One line:** a TypeScript monolith on Cloud Run over Supabase Postgres, with AI confined to the places it genuinely helps and a privacy gate in front of every model call.

---

## Cost against ₹32,000

**Correction, 26 Sept:** the first version of this table priced each service as if it ran at steady monthly load for three months. That's the wrong model for a hackathon build. Nobody is a paying customer here — it's six of us testing for a few weeks, then judges clicking through a demo once. Below is what that actually consumes, service by service, against what's free regardless of usage.

| Service | Free no matter what | What our actual usage costs |
|---|---|---|
| Supabase | Free tier: 500MB DB, 50k monthly active users | ₹0 — we will never get near this ceiling |
| Cloud Run | 2 million requests/month free, scales to zero between them | ₹0 — a few thousand requests total across dev + demo |
| Google Maps Platform | **$200/month credit, automatic on every billing-enabled account** (~₹16,600) | ₹0 — with the directions cache, maybe a few hundred live Directions/Geocoding calls total before the cache absorbs the rest. Nowhere close to $200 |
| Gemini (Vertex, Flash) | — | ~₹30–100 total. Flash is fractions of a rupee per call; even 2,000 dev+demo calls at ~2k tokens each is a few million tokens, which prices in cents |
| Groq / Ollama fallbacks | Free / local | ₹0 |
| Cloudflare Pages, FCM | Free tier | ₹0 |
| **Realistic total, whole project through demo day** | | **under ₹200** |

**So why keep the ₹8k/16k/24k budget alerts at all, if the real cost is near-zero?** Because the alerts aren't sized to expected usage — they're a tripwire for *mis*use: an unrestricted key scraped and hammered overnight, a caching bug that replays the same call in a loop, someone leaving a Cloud SQL instance on instead of Supabase. The ₹32k credit is a safety margin against a mistake, not a budget we're expected to spend. If we're anywhere near ₹8k before demo day, something is broken, not merely busy.

*Google Maps Platform pricing changed in 2025 — worth a 2-minute check of current per-call rates before the first live demo, but the $200 monthly credit itself has been stable and applies automatically once billing is enabled.*

---

## Guardrails — before any code ships

1. **GCP budget alerts at ₹8,000 / ₹16,000 / ₹24,000**
2. **Two Maps keys, split by surface:**
   - Server key (Directions/Geocoding/Places) — backend `.env` only, never shipped
   - Browser key (Maps JS only) — referrer-restricted **+ API-restricted to Maps JS alone + daily quota cap**
3. **Separate dev and prod keys** for both
4. **Directions and geocoding cached in Postgres** before the first demo — this is the actual cost control
5. **`USE_GOOGLE_MAPS` flag** with Leaflet + OSRM behind it (all-or-nothing, never mixed with Google data)
5. **Every LLM call behind a timeout + circuit breaker** — degrade to rule-only output rather than hanging in front of judges
6. **`.gitignore` before the first commit.** Nothing in `.env` ever committed
7. **Supabase RLS on from day one**, not bolted on later
8. **Calendar reminder to wake Supabase** the week of the demo

---

## What we deliberately did NOT use

| Not used | One-line reason |
|---|---|
| Firestore / MongoDB | Cannot do the multi-range geo query that IS our core feature |
| Multi-agent frameworks | No genuine division of labour. Non-determinism in the demo path |
| 13-agent architecture | Most such "agents" are cron jobs and SQL queries wearing a costume. Six honest ones beat thirteen loose ones |
| LLM for eligibility | Must be auditable |
| Separate vector DB | pgvector, inside a database we already run |
| Next.js | SSR complexity for an SEO benefit our positioning rejects |
| Python backend | No ML in the request path, so its ecosystem advantage is zero here |
| Microservices / Kubernetes | Six people, ten weeks. A monolith is correct |

---

## Checklist before the first commit

- [ ] Supabase project created, PostGIS + pgvector enabled
- [ ] GCP project + budget alerts
- [ ] Maps API key, referrer-restricted
- [ ] Gemini (Vertex) enabled · Groq free key · Ollama installed locally
- [ ] Bhashini / ULCA account registered
- [ ] Repo scaffolded, `.gitignore` first
- [ ] Shared `types/` package wired to both frontend and backend
- [ ] Seed data loaded (Docs 1 and 4 are the source)

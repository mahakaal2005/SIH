# PRD: Yojna Sarthi

Thin by design: it links to the owning doc instead of restating facts (`docs/00-INDEX.md` rule).

## Product
The decision-and-execution layer between SC entrepreneurs in Uttar Pradesh and NSFDC / PM-AJAY money: which scheme fits, what it really costs, which partner can fund it today, and where the application is. Built for Smart India Hackathon 2026, PS 26092 (Ministry of Social Justice and Empowerment), team Zenith, KIET.

## Users
- **Citizen** (SC entrepreneur, largely rural, 15.3% illiterate): Hindi-first, voice-friendly, phone-first PWA.
- **District officer**: queue of applications, pre-scrutiny actions, stall alerts.
- **HQ admin**: partner-health overview, eligibility rule versions.

## Problem
See `docs/02-the-problem.md` (pain points, competitor audit) and `docs/03-evidence-and-data.md` (evidence). Positioning guardrails (not a discovery portal; never say "funds go unused") are in `docs/05-features.md`.

## Goals
1. Recommend the right scheme with plain-language reasons (F1) and honest approval odds (F4).
2. Show true cost with EMI, moratorium and grant split (F2).
3. Route to the nearest partner that passes the health gate (F3).
4. Make application progress visible to citizen and officer (F6-F8).
5. Multilingual from day one (F0), voice input and read-aloud (F5).

## Scope
Features F0-F8, tiers and out-of-scope list: `docs/05-features.md`. Stack and architecture: `docs/06-tech-stack.md`, `specs/architecture.md`. Delivery order: `specs/office/progress.md`.

## Success measures
TODO: agree demo-day measures with the team (task completion in Hindi on a 360px phone, judge walkthrough time, error-free journey rate). The five pitch numbers are sourced in `docs/00-INDEX.md`.

## Constraints
Rules decide, LLM explains; PII never reaches an LLM (DPDP 2023); GCP credits Rs 32,000; demo path is deterministic; partner health data is seeded and labelled as such.

## Open items
TODO: real partner-health source; Bhashini/ULCA access; backend timeline after the hackathon. Tracked in `docs/00-INDEX.md`.

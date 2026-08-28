# Life in the UK Atlas

Independent **study aid** for the Life in the UK test (British citizenship / ILR). Not an official Home Office or TSO product.

## Product model (freemium + Exam Pass)

| Plan | Access |
|------|--------|
| **Free** | Time Journey, Knowledge Atlas, UK Today, flashcards, mocks 1–3, limited SRS (20 cards), 1 Focus set/day, custom quizzes ≤10 questions |
| **7-Day Sprint** | Full access for 7 days |
| **30-Day Pass** | Full access for 30 days (recommended) |
| **Lifetime Pass** | Long-term full access |

Gated on Free: timed official exam, mocks 4+, full SRS, unlimited Focus/custom.

## Architecture (target)

| Layer | Choice |
|-------|--------|
| Identity | Email magic-link + Apple/Google |
| Progress | Cloud profile keyed to user |
| Entitlement | `plan`, `expires_at` |
| Payments | Stripe Checkout + Customer Portal |
| Content | Versioned question bank |
| Legal | “Study aid, not official test” |

Current build: client-side auth/entitlement **stubs**, paywall UI, three SKUs (demo local unlock), legal footer, rename to Life in the UK Atlas, sync stub. Stripe + real sync next.

## Deploy

Hosted on Netlify: https://lifeintheukatlas.netlify.app/

## Disclaimer

Primary study grounding: *Life in the UK: A guide for new residents, 3rd edition*. Practice items are handbook-aligned study material, not live official questions. Always verify requirements on [GOV.UK](https://www.gov.uk/life-in-the-uk-test).

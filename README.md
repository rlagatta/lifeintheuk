# Life in the UK Atlas

Independent **study aid** for the Life in the UK test (citizenship / ILR). Not an official Home Office or TSO product.

## Architecture

```
marketing/     → site root (landing, legal, guides)
app/           → /app product (PWA study surface)
content/       → versioned JSON question bank + milestones
functions/     → Stripe / auth (planned)
```

| Layer | Choice |
|-------|--------|
| Identity | Email magic-link + Apple/Google (stub) |
| Progress | Cloud profile keyed to user (local now) |
| Entitlement | `plan`, `expires_at` |
| Payments | Stripe Checkout + Customer Portal (next) |
| Content | Versioned JSON (`content/*.v12.json`) |
| Legal | Study aid, not official test |

## Freemium + Exam Pass

- **Free:** journey, atlas, flashcards, mocks 1–3, limited SRS, 1 Focus/day, custom ≤10Q
- **7-Day Sprint £4.99** · **30-Day Pass £9.99** · **Lifetime £19.99**

Gated: timed exam, mocks 4+, full SRS, unlimited Focus/custom.

## Develop

```bash
npm install
npm run build    # → dist/ for Netlify
```

## Deploy

Netlify publish directory: `dist` (see `netlify.toml`).  
Live: https://lifeintheukatlas.netlify.app/

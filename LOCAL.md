# Local-first workflow (save Netlify credits)

**Policy:** Build and test locally. Deploy to Netlify only when a version is deliberately released.

## Stop continuous builds (once)

In Netlify → **lifeintheukatlas** → **Build & deploy** → **Continuous deployment**:

- **Stop builds** or unlink GitHub, **or**
- Use manual deploys only

Every push to `main` otherwise burns a build credit.

## Local full stack

```bash
npm i -g netlify-cli
netlify link   # site lifeintheukatlas
# Set local env: SESSION_SECRET, ALLOWLIST_EMAILS, AUTH_DEV_MODE=true
netlify dev
# http://localhost:8888/app/
```

Without `RESEND_API_KEY`, `/api/auth/request` returns `devLink` — open it to finish sign-in.

## Local UI only

```bash
npx serve . -p 3000
# http://localhost:3000/app/
```

## Release deploy (when ready)

```bash
netlify deploy --prod   # only after checklist in ARCHITECTURE.md / LOCAL.md
```

Or use Netlify UI drag-drop / manual upload of a verified folder.

## Do not

- Auto-deploy every agent experiment
- Push broken `app/index.html` and rely on production to test
- Leave continuous deploy on while iterating

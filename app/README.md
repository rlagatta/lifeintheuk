# App shell

## Create `app/index.html` on Windows (no download path)

From the repo root:

```powershell
cd C:\lifeintheukatlas\lifeintheuk
mkdir app -Force
copy .\index.html .\app\index.html
```

That uses your local study app as `/app/`.

For Sign-in UI, either:
1. Run `inject-auth.ps1` from the project (if present), or
2. Use production https://lifeintheukatlas.netlify.app/app/ for login testing

Do **not** type `path\to\app-index.html` — that was a placeholder, not a real file.

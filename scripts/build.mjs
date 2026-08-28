import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist, { recursive: true });

// Marketing → site root
if (existsSync(join(root, "marketing", "index.html"))) {
  cpSync(join(root, "marketing"), dist, { recursive: true });
} else if (existsSync(join(root, "index.html"))) {
  cpSync(join(root, "index.html"), join(dist, "index.html"));
} else {
  writeFileSync(
    join(dist, "index.html"),
    "<!DOCTYPE html><meta http-equiv=refresh content='0;url=/app/'><a href=/app/>Open app</a>\n"
  );
}

// App → /app (prefer app/index.html, else root index.html product shell)
mkdirSync(join(dist, "app"), { recursive: true });
const appSrc = existsSync(join(root, "app", "index.html"))
  ? join(root, "app", "index.html")
  : existsSync(join(root, "index.html"))
    ? join(root, "index.html")
    : null;
if (!appSrc) {
  throw new Error("No app shell found: need app/index.html or index.html");
}
cpSync(appSrc, join(dist, "app", "index.html"));
console.log("app shell from", appSrc);

if (existsSync(join(root, "app", "src"))) {
  cpSync(join(root, "app", "src"), join(dist, "app", "src"), { recursive: true });
}
if (existsSync(join(root, "content"))) {
  cpSync(join(root, "content"), join(dist, "content"), { recursive: true });
}

writeFileSync(join(dist, "_redirects"), "/app/*  /app/index.html  200\n/app  /app/index.html  200\n");
console.log("Built dist/");

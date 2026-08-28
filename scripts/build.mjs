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
  console.log("marketing → dist/");
} else {
  writeFileSync(
    join(dist, "index.html"),
    '<!DOCTYPE html><meta http-equiv="refresh" content="0;url=/app/"><a href="/app/">Open app</a>\n'
  );
}

// App shell
mkdirSync(join(dist, "app"), { recursive: true });
const preferred = join(root, "app", "index.html");
const fallback = join(root, "index.html");
if (existsSync(preferred)) {
  cpSync(preferred, join(dist, "app", "index.html"));
  console.log("app shell from app/index.html");
} else if (existsSync(fallback)) {
  cpSync(fallback, join(dist, "app", "index.html"));
  console.log("app shell from root index.html (fallback)");
} else {
  throw new Error("Need app/index.html or index.html");
}

if (existsSync(join(root, "app", "src"))) {
  cpSync(join(root, "app", "src"), join(dist, "app", "src"), { recursive: true });
}
if (existsSync(join(root, "content"))) {
  cpSync(join(root, "content"), join(dist, "content"), { recursive: true });
}

writeFileSync(
  join(dist, "_redirects"),
  "/app/*  /app/index.html  200\n/app  /app/index.html  200\n"
);
console.log("Built dist/");

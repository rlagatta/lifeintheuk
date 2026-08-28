import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { gunzipSync } from "zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist, { recursive: true });

if (existsSync(join(root, "marketing", "index.html"))) {
  cpSync(join(root, "marketing"), dist, { recursive: true });
  console.log("marketing → dist/");
} else {
  writeFileSync(
    join(dist, "index.html"),
    '<!DOCTYPE html><meta http-equiv="refresh" content="0;url=/app/"><a href="/app/">Open app</a>\n'
  );
}

function resolveAppShell() {
  const preferred = join(root, "app", "index.html");
  if (existsSync(preferred)) return preferred;

  const part0 = join(root, "app", "shell.part0.b64");
  if (existsSync(part0)) {
    let b64 = "";
    let i = 0;
    while (existsSync(join(root, "app", `shell.part${i}.b64`))) {
      b64 += readFileSync(join(root, "app", `shell.part${i}.b64`), "utf8");
      i++;
    }
    b64 = b64.replace(/\s+/g, "");
    const html = gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
    const out = join(root, "app", "_decoded_index.html");
    writeFileSync(out, html);
    console.log("decoded app shell from shell.part*.b64");
    return out;
  }

  const fallback = join(root, "index.html");
  if (existsSync(fallback)) return fallback;
  return null;
}

mkdirSync(join(dist, "app"), { recursive: true });
const shell = resolveAppShell();
if (!shell) throw new Error("Need app/index.html, app/shell.part*.b64, or index.html");
cpSync(shell, join(dist, "app", "index.html"));
console.log("app shell from", shell);

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

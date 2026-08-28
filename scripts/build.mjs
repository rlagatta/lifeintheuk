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
} else if (existsSync(join(root, "index.html"))) {
  cpSync(join(root, "index.html"), join(dist, "index.html"));
} else {
  writeFileSync(
    join(dist, "index.html"),
    "<!DOCTYPE html><meta http-equiv=refresh content='0;url=/app/'><a href=/app/>Open app</a>\n"
  );
}

function resolveAppShell() {
  const preferred = join(root, "app", "index.html");
  if (existsSync(preferred)) return { path: preferred, mode: "file" };

  const single = join(root, "app", "shell.html.gz.b64");
  const part0 = join(root, "app", "shell.part0.b64");
  let b64 = "";
  if (existsSync(single)) {
    b64 = readFileSync(single, "utf8");
  } else if (existsSync(part0)) {
    let i = 0;
    while (existsSync(join(root, "app", `shell.part${i}.b64`))) {
      b64 += readFileSync(join(root, "app", `shell.part${i}.b64`), "utf8");
      i++;
    }
  }
  if (b64) {
    b64 = b64.replace(/\s+/g, "");
    const html = gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
    const out = join(root, "app", "_shell_decoded.html");
    writeFileSync(out, html);
    return { path: out, mode: "decoded" };
  }

  const rootIndex = join(root, "index.html");
  if (existsSync(rootIndex)) return { path: rootIndex, mode: "fallback-root" };
  return null;
}

mkdirSync(join(dist, "app"), { recursive: true });
const shell = resolveAppShell();
if (!shell) throw new Error("No app shell found");
cpSync(shell.path, join(dist, "app", "index.html"));
console.log("app shell from", shell.path, "(" + shell.mode + ")");

if (existsSync(join(root, "app", "src"))) {
  cpSync(join(root, "app", "src"), join(dist, "app", "src"), { recursive: true });
}
if (existsSync(join(root, "content"))) {
  cpSync(join(root, "content"), join(dist, "content"), { recursive: true });
}

writeFileSync(join(dist, "_redirects"), "/app/*  /app/index.html  200\n/app  /app/index.html  200\n");
console.log("Built dist/");

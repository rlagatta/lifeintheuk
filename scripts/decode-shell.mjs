import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { gunzipSync } from "zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = join(root, "app");

function loadB64() {
  const single = join(appDir, "shell.html.gz.b64");
  if (existsSync(single)) {
    return readFileSync(single, "utf8").replace(/\s+/g, "");
  }
  let b64 = "";
  let i = 0;
  while (existsSync(join(appDir, `shell.part${i}.b64`))) {
    b64 += readFileSync(join(appDir, `shell.part${i}.b64`), "utf8");
    i++;
  }
  if (!b64) throw new Error("No app/shell.html.gz.b64 or app/shell.part*.b64 found");
  return b64.replace(/\s+/g, "");
}

const b64 = loadB64();
const html = gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
writeFileSync(join(appDir, "index.html"), html);
writeFileSync(join(root, "index.html"), html);
console.log("Wrote app/index.html and index.html (" + html.length + " bytes)");
if (!html.includes("length:30") || !html.includes("topicFor")) {
  console.warn("Warning: expected markers missing — parts may be incomplete.");
}

/**
 * Static publish build: marketing + app + content → dist/
 */
import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist, { recursive: true });

cpSync(join(root, 'marketing'), dist, { recursive: true });

mkdirSync(join(dist, 'app'), { recursive: true });
cpSync(join(root, 'app', 'index.html'), join(dist, 'app', 'index.html'));
if (existsSync(join(root, 'app', 'public'))) {
  cpSync(join(root, 'app', 'public'), join(dist, 'app'), { recursive: true });
}
if (existsSync(join(root, 'app', 'src'))) {
  cpSync(join(root, 'app', 'src'), join(dist, 'app', 'src'), { recursive: true });
}

cpSync(join(root, 'content'), join(dist, 'content'), { recursive: true });

writeFileSync(join(dist, '_redirects'), ['/app/*  /app/index.html  200', '/app    /app/index.html  200'].join('\n') + '\n');

console.log('Built dist/: marketing + app + content');

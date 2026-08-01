// Gera a pasta estática `capacitor-www` a partir de `public/`,
// usando app.html como index.html do app nativo.
import { cp, rm, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'public');
const out = path.join(root, 'capacitor-www');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(src, out, { recursive: true });

const html = await readFile(path.join(src, 'app.html'), 'utf8');
await writeFile(path.join(out, 'index.html'), html, 'utf8');

console.log('capacitor-www gerado com sucesso (index.html <- app.html)');

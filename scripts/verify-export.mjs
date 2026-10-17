import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const html = readFileSync('out/index.html', 'utf8');
assert.match(html, /Rishabh Kaushik/);
assert.match(html, /lang="en"/);
assert.ok(html.includes(`href="${base}/CV.pdf"`), 'Resume link must include the deployment base path');
assert.ok(html.includes('mailto:reachmeatrish@gmail.com'), 'Contact email must be available');
assert.ok(html.includes('https://linkedin.com/in/rishabh-kaushik-4206531b8/'), 'Verified LinkedIn URL must be preserved');
assert.ok(!html.includes('Visitor Count:'), 'Do not show an unavailable visitor counter');
assert.ok(!existsSync('out/api'), 'Export must not depend on server API routes');
const urls = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]);
let checked = 0;
for (const url of new Set(urls)) {
  if (!url.startsWith('/')) continue;
  assert.ok(url.startsWith(`${base}/`), `Missing base path: ${url}`);
  const path = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]);
  const file = join('out', path);
  assert.ok(existsSync(file), `Missing exported asset: ${url}`);
  assert.ok(statSync(file).isFile() || path === '/', `Unexpected directory asset: ${url}`);
  checked++;
}
assert.equal(readFileSync('out/CV.pdf').subarray(0, 5).toString(), '%PDF-');
console.log(`Static export verified: ${checked} local asset/link targets, contact, LinkedIn, and PDF.`);

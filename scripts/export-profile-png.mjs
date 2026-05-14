import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../public/instagram-profile.svg');
const outPath = resolve(__dirname, '../public/instagram-profile.png');

const svg = readFileSync(svgPath, 'utf-8');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 400, height: 400 });
await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#1a7a35">${svg}</body></html>`);
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 400, height: 400 } });
await browser.close();
console.log('✅ 書き出し完了:', outPath);

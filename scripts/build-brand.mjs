// Renders the favicons (16, 32, 180, 512 px) and the OG image (1200x630) from the snake-P
// mark in public/brand/mark.svg, with the real display and text fonts (REDESIGN-2.md 1).
// Run once after changing the mark or the name; the PNGs are committed.
//   node scripts/build-brand.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const mark = fs.readFileSync(path.join(root, "public/brand/mark.svg"), "utf8").replace(/<title>[^<]*<\/title>/, "");
const font = (p) => `data:font/woff2;base64,${fs.readFileSync(path.join(root, "node_modules", p)).toString("base64")}`;
const display = font("@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2");
const text = font("@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-400-normal.woff2");
const sized = (px) => mark.replace('width="64" height="64"', `width="${px}" height="${px}"`);

const page = (body, w, h, bg = "transparent") => `<!doctype html><html><head><style>
@font-face { font-family: Display; src: url(${display}) format("woff2"); font-weight: 200 800; }
@font-face { font-family: Text; src: url(${text}) format("woff2"); font-weight: 400; }
html, body { margin: 0; width: ${w}px; height: ${h}px; background: ${bg}; overflow: hidden; }
</style></head><body>${body}</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
async function shot(file, html, w, h, transparent = true) {
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(root, "public", file), omitBackground: transparent });
  await p.close();
  console.log(`public/${file}`);
}

// Small sizes: the mark alone, edge to edge, on transparency.
for (const [file, px] of [["icon-16.png", 16], ["icon-32.png", 32], ["icon.png", 32], ["icon-512.png", 512]]) {
  await shot(file, page(`<div style="display:grid;place-items:center;width:${px}px;height:${px}px">${sized(px)}</div>`, px, px), px, px);
}
// Apple touch icon: no transparency allowed, so the mark sits on the dark page colour.
await shot("apple-icon.png", page(`<div style="display:grid;place-items:center;width:180px;height:180px;background:#0F1115">${sized(132)}</div>`, 180, 180, "#0F1115"), 180, 180, false);

// The OG image: the wordmark and the tagline on the dark page colour.
await shot(
  "og.png",
  page(
    `<div style="box-sizing:border-box;width:1200px;height:630px;padding:96px 104px;display:flex;flex-direction:column;justify-content:center;gap:40px;background:#0F1115;color:#F2F3F5">
      <div style="display:flex;align-items:center;gap:28px">${sized(112)}<span style="font-family:Display;font-weight:800;font-size:76px;letter-spacing:-0.02em;line-height:1">Paul's Python Course</span></div>
      <div style="font-family:Display;font-weight:700;font-size:52px;letter-spacing:-0.02em;line-height:1.1;color:#FFB627">Learn Python by building real things.</div>
      <div style="font-family:Text;font-size:30px;line-height:1.45;color:#A4ABB8;max-width:920px">From your first line of code to machine learning, one real project at a time. Free to start.</div>
    </div>`,
    1200,
    630,
    "#0F1115",
  ),
  1200,
  630,
  false,
);
await browser.close();

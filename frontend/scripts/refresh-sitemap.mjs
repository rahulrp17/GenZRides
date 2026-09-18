// Refreshes every <lastmod> in public/sitemap.xml to today's date so each
// deploy ships a fresh sitemap (wired as `prebuild` in package.json).
// Run: node scripts/refresh-sitemap.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = path.join(root, "public", "sitemap.xml");

const today = new Date().toISOString().slice(0, 10);
const xml = readFileSync(file, "utf8");
const updated = xml.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

if (updated !== xml) {
  writeFileSync(file, updated);
  console.log(`sitemap lastmod refreshed to ${today}`);
} else {
  console.log("sitemap lastmod already current");
}

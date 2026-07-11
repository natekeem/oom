import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const distDirectory = join(process.cwd(), "dist");
const indexPath = join(distDirectory, "index.html");
const indexHtml = await readFile(indexPath, "utf8");

if (indexHtml.includes("/src/main.tsx") || indexHtml.includes('src="/src/')) {
  throw new Error("Production HTML still references Vite development source files.");
}

const assetPaths = [...indexHtml.matchAll(/(?:src|href)="((?:\.\/|\/)assets\/[^\"]+)"/g)].map((match) => match[1]);
if (assetPaths.length === 0) {
  throw new Error("Production HTML does not reference any bundled assets.");
}

const requiredRootFiles = ["CNAME", "robots.txt", "sitemap.xml"];
const requiredRouteFiles = [
  "magazine/opic-2026-strategy/index.html",
  "magazine/opic-survey-choice-guide/index.html",
  "magazine/opic-answer-checklist/index.html",
  "exam-guide/index.html",
  "privacy/index.html",
  "about/index.html",
  "contact/index.html",
  "terms/index.html",
];
const pathsToVerify = [
  ...assetPaths.map((assetPath) => assetPath.replace(/^(?:\.\/|\/)/, "")),
  ...requiredRootFiles,
  ...requiredRouteFiles,
];

await Promise.all(pathsToVerify.map((path) => access(join(distDirectory, path))));
const routeHtmlFiles = await Promise.all(requiredRouteFiles.map(async (path) => [path, await readFile(join(distDirectory, path), "utf8")]));
for (const [path, routeHtml] of routeHtmlFiles) {
  if (routeHtml.includes("http-equiv=\"refresh\"") || routeHtml.includes("location.replace('/?p='")) {
    throw new Error("A generated route HTML file still contains the SPA redirect fallback.");
  }
  if (!routeHtml.includes("<main class=\"seo-static-content\"")) {
    throw new Error(`${path} does not contain static SEO body content.`);
  }
  const sectionCount = (routeHtml.match(/<h2>/g) ?? []).length;
  if (path.startsWith("magazine/") && (!routeHtml.includes("<article>") || sectionCount < 4)) {
    throw new Error(`${path} does not contain enough generated article body sections.`);
  }
  if (["privacy/index.html", "about/index.html", "contact/index.html", "terms/index.html"].includes(path) && sectionCount < 4) {
    throw new Error(`${path} does not contain enough legal page body sections.`);
  }
}
console.log(`Verified GitHub Pages artifact with ${assetPaths.length} bundled asset reference(s), ${requiredRootFiles.length} root static file(s), and ${requiredRouteFiles.length} static route file(s).`);

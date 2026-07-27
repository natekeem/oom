import { access, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const distDirectory = join(process.cwd(), "dist");
const indexPath = join(distDirectory, "index.html");
const indexHtml = await readFile(indexPath, "utf8");
const canonicalOrigin = "https://opic-on-me.com";

async function findGeneratedIndexFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) return findGeneratedIndexFiles(absolutePath);
    return entry.name === "index.html" ? [absolutePath] : [];
  }));
  return nestedFiles.flat();
}

function containsRedirectFallback(html) {
  return html.includes("OOM — Redirect")
    || html.includes("http-equiv=\"refresh\"")
    || html.includes("location.replace('/?p='");
}

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
  "editorial-policy/index.html",
  "image-credits/index.html",
];
const pathsToVerify = [
  ...assetPaths.map((assetPath) => assetPath.replace(/^(?:\.\/|\/)/, "")),
  ...requiredRootFiles,
  ...requiredRouteFiles,
];

await Promise.all(pathsToVerify.map((path) => access(join(distDirectory, path))));
const sitemapXml = await readFile(join(distDirectory, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length === 0) {
  throw new Error("The generated sitemap does not contain any URLs.");
}
if (!sitemapUrls.includes(`${canonicalOrigin}/`) || !sitemapUrls.includes(`${canonicalOrigin}/image-credits/`) || !sitemapUrls.includes(`${canonicalOrigin}/editorial-policy/`)) {
  throw new Error("The generated sitemap must include the canonical root, editorial policy, and image credits URLs.");
}

for (const sitemapUrl of sitemapUrls) {
  const parsedUrl = new URL(sitemapUrl);
  if (parsedUrl.origin !== canonicalOrigin || parsedUrl.search || parsedUrl.hash) {
    throw new Error(`Sitemap URL is not canonical: ${sitemapUrl}`);
  }
  if (parsedUrl.pathname !== "/" && !parsedUrl.pathname.endsWith("/")) {
    throw new Error(`Sitemap URL is missing its trailing slash: ${sitemapUrl}`);
  }
  if (parsedUrl.pathname === "/ai-settings/") {
    throw new Error("The noindex AI settings route must not appear in the sitemap.");
  }

  const routeArtifact = parsedUrl.pathname === "/" ? "index.html" : `${parsedUrl.pathname.slice(1)}index.html`;
  const routeHtml = await readFile(join(distDirectory, routeArtifact), "utf8");
  if (!routeHtml.includes(`<link rel="canonical" href="${sitemapUrl}" />`)) {
    throw new Error(`${routeArtifact} does not contain its matching canonical URL.`);
  }
  if (!/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/.test(routeHtml)) {
    throw new Error(`${routeArtifact} does not contain an h1.`);
  }
  const visibleText = routeHtml
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (visibleText.length < 450) {
    throw new Error(`${routeArtifact} contains too little crawler-visible body text (${visibleText.length} characters).`);
  }
}

const robotsTxt = await readFile(join(distDirectory, "robots.txt"), "utf8");
for (const requiredDirective of ["User-agent: *", "Allow: /", `Sitemap: ${canonicalOrigin}/sitemap.xml`]) {
  if (!robotsTxt.includes(requiredDirective)) {
    throw new Error(`robots.txt is missing: ${requiredDirective}`);
  }
}

const generatedIndexFiles = await findGeneratedIndexFiles(distDirectory);
for (const routeFile of generatedIndexFiles) {
  const routeHtml = await readFile(routeFile, "utf8");
  const routeName = relative(distDirectory, routeFile);
  if (containsRedirectFallback(routeHtml)) {
    throw new Error(`${routeName} still contains the SPA redirect fallback.`);
  }
  const canonicalMatch = routeHtml.match(/<link rel="canonical" href="([^"]+)" \/>/);
  if (!canonicalMatch) {
    throw new Error(`${routeName} does not contain a canonical URL.`);
  }
  const canonicalUrl = new URL(canonicalMatch[1]);
  if (canonicalUrl.origin !== canonicalOrigin || (canonicalUrl.pathname !== "/" && !canonicalUrl.pathname.endsWith("/"))) {
    throw new Error(`${routeName} contains a non-canonical URL: ${canonicalMatch[1]}`);
  }

  for (const match of routeHtml.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/g)) {
    const internalHref = match[1];
    if (internalHref !== "/" && !internalHref.endsWith("/") && !/\.[a-z0-9]+(?:[?#].*)?$/i.test(internalHref)) {
      throw new Error(`${routeName} contains an internal link without a trailing slash: ${internalHref}`);
    }
  }
}

const adExcludedRoutes = [
  "practice/index.html",
  "ai-settings/index.html",
  "magazine/index.html",
  "about/index.html",
  "privacy/index.html",
  "contact/index.html",
  "terms/index.html",
  "editorial-policy/index.html",
  "image-credits/index.html",
];
for (const routePath of adExcludedRoutes) {
  const routeHtml = await readFile(join(distDirectory, routePath), "utf8");
  if (routeHtml.includes("pagead2.googlesyndication.com")) {
    throw new Error(`${routePath} must not load AdSense on an interaction or trust page.`);
  }
}

const articleRouteFiles = generatedIndexFiles.filter((path) => relative(distDirectory, path).replaceAll("\\", "/").startsWith("magazine/") && !relative(distDirectory, path).replaceAll("\\", "/").endsWith("magazine/index.html"));
for (const articlePath of articleRouteFiles) {
  const articleHtml = await readFile(articlePath, "utf8");
  const articleName = relative(distDirectory, articlePath);
  for (const requiredSignal of ['"@type":"Article"', "작성·검수:", "작성·검수 메모", "확인한 공식 자료", "콘텐츠 편집 원칙", "<time datetime="]) {
    if (!articleHtml.includes(requiredSignal)) {
      throw new Error(`${articleName} is missing article trust signal: ${requiredSignal}`);
    }
  }
  const externalLinkCount = (articleHtml.match(/<a\b[^>]*href="https?:\/\//g) ?? []).length;
  const internalLinkCount = (articleHtml.match(/<a\b[^>]*href="\//g) ?? []).length;
  if (externalLinkCount < 2 || internalLinkCount < 3) {
    throw new Error(`${articleName} needs at least 2 official source links and 3 internal learning links.`);
  }
}

const routeHtmlFiles = await Promise.all(requiredRouteFiles.map(async (path) => [path, await readFile(join(distDirectory, path), "utf8")]));
for (const [path, routeHtml] of routeHtmlFiles) {
  if (!routeHtml.includes("<main class=\"seo-static-content\"")) {
    throw new Error(`${path} does not contain static SEO body content.`);
  }
  const sectionCount = (routeHtml.match(/<h2>/g) ?? []).length;
  if (path.startsWith("magazine/") && (!routeHtml.includes("<article>") || !routeHtml.includes("<p>") || sectionCount < 4)) {
    throw new Error(`${path} does not contain enough generated article body sections.`);
  }
  if (["privacy/index.html", "about/index.html", "contact/index.html", "terms/index.html", "editorial-policy/index.html", "image-credits/index.html"].includes(path) && sectionCount < 4) {
    throw new Error(`${path} does not contain enough legal page body sections.`);
  }
}
console.log(`Verified GitHub Pages artifact with ${assetPaths.length} bundled asset reference(s), ${sitemapUrls.length} canonical sitemap route(s), ${generatedIndexFiles.length} generated index file(s), ${requiredRootFiles.length} root static file(s), and ${requiredRouteFiles.length} representative static route file(s).`);

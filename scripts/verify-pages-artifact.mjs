import { access, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const distDirectory = join(process.cwd(), "dist");
const indexPath = join(distDirectory, "index.html");
const indexHtml = await readFile(indexPath, "utf8");
const canonicalOrigin = "https://opic-on-me.com";
const adsenseAccountMeta = '<meta name="google-adsense-account" content="ca-pub-8734087248170812"';
const selectionDependentPaths = [
  "/training/survey/",
  "/training/difficulty/",
  "/training/scripts/",
  "/training/scripts/self-introduction/",
  "/training/scripts/outdoor/",
  "/training/scripts/indoor/",
  "/training/scripts/sports/",
  "/training/scripts/home/",
  "/roleplay/",
  "/roleplay/formula/",
  "/roleplay/travel/",
  "/roleplay/indoor/",
  "/roleplay/sports/",
  "/roleplay/home/",
  "/practice/",
  "/practice/quick/",
  "/practice/mock/",
];
const noindexPaths = new Set([
  "/ai-settings/",
  "/mypage/",
  "/auth/callback/",
  "/admin/",
  "/admin/users/",
  "/admin/learning/",
  "/admin/audit/",
  "/admin/ai/",
  ...selectionDependentPaths,
]);

function isAdEligiblePath(pathname) {
  return /^\/magazine\/[^/]+\/$/.test(pathname)
    || pathname === "/exam-guide/"
    || pathname.startsWith("/exam-guide/");
}

function pathnameForArtifact(routeFile) {
  const normalized = relative(distDirectory, routeFile).replaceAll("\\", "/");
  if (normalized === "index.html") return "/";
  return `/${normalized.replace(/index\.html$/, "")}`;
}

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
  "pricing/index.html",
  "privacy/index.html",
  "about/index.html",
  "mypage/index.html",
  "auth/callback/index.html",
  "practice/index.html",
  "practice/quick/index.html",
  "practice/mock/index.html",
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
const sitemapEntries = [...sitemapXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/g)]
  .map((match) => ({ url: match[1], lastmod: match[2] }));
const sitemapLastmodByUrl = new Map(sitemapEntries.map((entry) => [entry.url, entry.lastmod]));
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
  if (noindexPaths.has(parsedUrl.pathname)) {
    throw new Error(`The noindex route must not appear in the sitemap: ${parsedUrl.pathname}`);
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

for (const { url, lastmod } of sitemapEntries) {
  if (!lastmod) continue;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod) || Number.isNaN(Date.parse(`${lastmod}T00:00:00Z`))) {
    throw new Error(`Sitemap lastmod is invalid for ${url}: ${lastmod}`);
  }
  if (Date.parse(`${lastmod}T00:00:00Z`) > Date.now()) {
    throw new Error(`Sitemap lastmod must not be in the future for ${url}: ${lastmod}`);
  }
}

if (sitemapXml.includes("<changefreq>") || sitemapXml.includes("<priority>")) {
  throw new Error("Sitemap must omit unsupported editorial guesses for changefreq and priority.");
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
  const routePathname = pathnameForArtifact(routeFile);
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
  if (!routeHtml.includes(adsenseAccountMeta)) {
    throw new Error(`${routeName} is missing the AdSense ownership metadata.`);
  }
  const loadsAdsense = routeHtml.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
  if (loadsAdsense !== isAdEligiblePath(routePathname)) {
    throw new Error(`${routeName} does not follow the editorial-only AdSense policy.`);
  }

  for (const match of routeHtml.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/g)) {
    const internalHref = match[1];
    if (internalHref !== "/" && !internalHref.endsWith("/") && !/\.[a-z0-9]+(?:[?#].*)?$/i.test(internalHref)) {
      throw new Error(`${routeName} contains an internal link without a trailing slash: ${internalHref}`);
    }
  }
}

const articleRouteFiles = generatedIndexFiles.filter((path) => relative(distDirectory, path).replaceAll("\\", "/").startsWith("magazine/") && !relative(distDirectory, path).replaceAll("\\", "/").endsWith("magazine/index.html"));
const magazineIndexHtml = await readFile(join(distDirectory, "magazine", "index.html"), "utf8");
for (const articlePath of articleRouteFiles) {
  const articleHtml = await readFile(articlePath, "utf8");
  const articleName = relative(distDirectory, articlePath).replaceAll("\\", "/");
  const articleSlug = articleName.split("/")[1];
  const articleCanonical = `${canonicalOrigin}/magazine/${articleSlug}/`;
  const hubHref = `href="/magazine/${articleSlug}/"`;
  const hubLinkCount = magazineIndexHtml.split(hubHref).length - 1;
  if (hubLinkCount !== 1) {
    throw new Error(`magazine/index.html must link exactly once to ${articleSlug}; found ${hubLinkCount}.`);
  }
  for (const requiredSignal of ['"@type":"Article"', "작성 근거", "확인한 공식 자료", "콘텐츠 편집 원칙", "<time datetime="]) {
    if (!articleHtml.includes(requiredSignal)) {
      throw new Error(`${articleName} is missing article trust signal: ${requiredSignal}`);
    }
  }
  if (!/작성 책임:|작성:[\s\S]*?별도 검수:/.test(articleHtml)) {
    throw new Error(`${articleName} is missing an honest author/review credit.`);
  }
  const externalLinkCount = (articleHtml.match(/<a\b[^>]*href="https?:\/\//g) ?? []).length;
  const internalLinkCount = (articleHtml.match(/<a\b[^>]*href="\//g) ?? []).length;
  if (externalLinkCount < 2 || internalLinkCount < 3) {
    throw new Error(`${articleName} needs at least 2 official source links and 3 internal learning links.`);
  }
  const peerArticleLinks = new Set(
    [...articleHtml.matchAll(/href="\/magazine\/([^/"]+)\/"/g)]
      .map((match) => match[1])
      .filter((slug) => slug !== articleSlug),
  );
  if (peerArticleLinks.size < 3) {
    throw new Error(`${articleName} needs at least 3 distinct peer article links.`);
  }
  if (articleHtml.includes(`href="/magazine/${articleSlug}/"`)) {
    throw new Error(`${articleName} must not contain a self-referencing article link.`);
  }

  const structuredDataMatch = articleHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!structuredDataMatch) throw new Error(`${articleName} is missing Article structured data.`);
  const structuredData = JSON.parse(structuredDataMatch[1]);
  if (structuredData.mainEntityOfPage !== articleCanonical) {
    throw new Error(`${articleName} structured-data canonical does not match its route.`);
  }
  for (const field of ["datePublished", "dateModified"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(structuredData[field] ?? "")) {
      throw new Error(`${articleName} has invalid ${field}: ${structuredData[field]}`);
    }
  }
  if (structuredData.datePublished > structuredData.dateModified) {
    throw new Error(`${articleName} datePublished must not be after dateModified.`);
  }
  if (Date.parse(`${structuredData.dateModified}T00:00:00Z`) > Date.now()) {
    throw new Error(`${articleName} dateModified must not be in the future.`);
  }
  if (sitemapLastmodByUrl.get(articleCanonical) !== structuredData.dateModified) {
    throw new Error(`${articleName} sitemap lastmod must equal Article dateModified.`);
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
  if (path === "about/index.html" && sectionCount < 3) {
    throw new Error(`${path} does not contain the compact product overview sections.`);
  }
  if (["privacy/index.html", "contact/index.html", "terms/index.html", "editorial-policy/index.html", "image-credits/index.html"].includes(path) && sectionCount < 4) {
    throw new Error(`${path} does not contain enough legal page body sections.`);
  }
}
for (const pathname of noindexPaths) {
  const path = pathname.slice(1, -1);
  const html = await readFile(join(distDirectory, path, "index.html"), "utf8");
  if (!html.includes('name="robots" content="noindex,follow"')) throw new Error(path + " must be noindex");
  if (!html.includes('<link rel="canonical" href="' + canonicalOrigin + '/' + path + '/" />')) throw new Error(path + " canonical missing");
  if (!html.includes("<h1")) throw new Error(path + " generic content missing");
  if (sitemapUrls.includes(`${canonicalOrigin}${pathname}`)) throw new Error(path + " must not appear in sitemap");
}

console.log(`Verified GitHub Pages artifact with ${assetPaths.length} bundled asset reference(s), ${sitemapUrls.length} canonical sitemap route(s), ${generatedIndexFiles.length} generated index file(s), ${requiredRootFiles.length} root static file(s), and ${requiredRouteFiles.length} representative static route file(s).`);

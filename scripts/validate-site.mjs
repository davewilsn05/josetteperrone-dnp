import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", ".wayland", ".wayland-core", "tmp"]);
const siteHost = "josetteperrone.com";
const issues = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...walk(path.join(dir, entry.name)));
      }
      continue;
    }

    if (entry.isFile()) files.push(path.join(dir, entry.name));
  }

  return files;
}

function relative(file) {
  return path.relative(root, file) || ".";
}

function lineFor(source, index) {
  return source.slice(0, index).split("\n").length;
}

function attrValue(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? match[2] || match[3] || match[4] || "" : "";
}

function hasAttr(tag, name) {
  return new RegExp(`\\b${name}\\s*=`, "i").test(tag);
}

function addIssue(file, line, message) {
  issues.push(`${relative(file)}:${line}: ${message}`);
}

function validateJavaScript(files) {
  for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (result.status !== 0) {
      issues.push(`${relative(file)}: JavaScript syntax check failed\n${result.stderr || result.stdout}`.trim());
    }
  }
}

function validateHtmlImages(file, html) {
  const imageTags = html.matchAll(/<img\b[^>]*>/gi);

  for (const match of imageTags) {
    const tag = match[0];
    const line = lineFor(html, match.index || 0);

    if (!hasAttr(tag, "width") || !hasAttr(tag, "height")) {
      addIssue(file, line, "image is missing width and height attributes");
    }

    const priorityImage = hasAttr(tag, "fetchpriority");
    const parallaxImage = hasAttr(tag, "data-parallax-speed");
    if (!priorityImage && !parallaxImage && !hasAttr(tag, "loading")) {
      addIssue(file, line, "non-priority image is missing loading attribute");
    }
  }
}

function validateRawAmpersands(file, html) {
  const badAmpersand = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-f]+;)/i;
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);

  if (titleMatch && badAmpersand.test(titleMatch[1])) {
    addIssue(file, lineFor(html, titleMatch.index || 0), "title contains a raw ampersand");
  }

  for (const match of html.matchAll(/<meta\b[^>]*\bcontent\s*=\s*("[^"]*"|'[^']*')[^>]*>/gi)) {
    const content = match[1].slice(1, -1);
    if (badAmpersand.test(content)) {
      addIssue(file, lineFor(html, match.index || 0), "meta content contains a raw ampersand");
    }
  }
}

function routeCandidates(routePath) {
  const normalized = path.posix.normalize(`/${routePath}`.replace(/\/+/g, "/"));
  const withoutLeadingSlash = normalized.replace(/^\//, "");

  if (normalized === "/") {
    return [path.join(root, "index.html")];
  }

  if (path.extname(withoutLeadingSlash)) {
    return [path.join(root, withoutLeadingSlash)];
  }

  return [path.join(root, `${withoutLeadingSlash}.html`), path.join(root, withoutLeadingSlash, "index.html")];
}

function fileForInternalPath(routePath) {
  return routeCandidates(routePath).find((candidate) => fs.existsSync(candidate));
}

function publicPathForFile(file) {
  const normalized = relative(file).split(path.sep).join("/");
  if (normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) return `/${normalized.slice(0, -"index.html".length - 1)}`;
  if (normalized.endsWith(".html")) return `/${normalized.slice(0, -".html".length)}`;
  return `/${normalized}`;
}

function normalizeHref(href) {
  if (!href) return null;
  const scheme = href.match(/^([a-z][a-z\d+.-]*):/i)?.[1]?.toLowerCase();
  if (scheme && scheme !== "http" && scheme !== "https") return null;
  if (href.startsWith("//")) return null;

  if (/^https?:\/\//i.test(href)) {
    const url = new URL(href);
    if (url.hostname !== siteHost) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  }

  return href;
}

function resolveInternalUrl(file, rawValue) {
  const normalized = normalizeHref(rawValue);
  if (!normalized) return null;

  try {
    const pageUrl = `https://${siteHost}${publicPathForFile(file)}`;
    const resolved = new URL(normalized, pageUrl);
    if (resolved.hostname !== siteHost) return null;
    return resolved;
  } catch {
    return null;
  }
}

function validateInternalLinks(file, html) {
  for (const match of html.matchAll(/\bhref\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
    const rawHref = match[2] || match[3] || "";
    const resolvedUrl = resolveInternalUrl(file, rawHref);
    if (!resolvedUrl) continue;

    const line = lineFor(html, match.index || 0);
    const rawFragment = resolvedUrl.hash ? resolvedUrl.hash.slice(1) : "";
    const targetRoute = resolvedUrl.pathname;
    const targetFile = fileForInternalPath(targetRoute);

    if (!targetFile) {
      addIssue(file, line, `internal link target does not exist: ${rawHref}`);
      continue;
    }

    if (rawFragment) {
      const targetHtml = fs.readFileSync(targetFile, "utf8");
      const fragment = rawFragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const hasTarget = new RegExp(`\\b(id|name)\\s*=\\s*["']${fragment}["']`, "i").test(targetHtml);
      if (!hasTarget) {
        addIssue(file, line, `fragment target does not exist: ${rawHref}`);
      }
    }
  }
}

function validatePageAssets(file, html) {
  for (const match of html.matchAll(/<link\b[^>]*rel\s*=\s*["'][^"']*stylesheet[^"']*["'][^>]*>/gi)) {
    const tag = match[0];
    const href = attrValue(tag, "href");
    const resolvedUrl = resolveInternalUrl(file, href);
    if (!resolvedUrl) continue;

    const targetFile = fileForInternalPath(resolvedUrl.pathname);
    if (!targetFile) {
      addIssue(file, lineFor(html, match.index || 0), `stylesheet target does not exist: ${href}`);
    }
  }

  for (const match of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["'][^"']+["'][^>]*>/gi)) {
    const tag = match[0];
    const src = attrValue(tag, "src");
    const resolvedUrl = resolveInternalUrl(file, src);
    if (!resolvedUrl) continue;

    const targetFile = fileForInternalPath(resolvedUrl.pathname);
    if (!targetFile) {
      addIssue(file, lineFor(html, match.index || 0), `script target does not exist: ${src}`);
    }
  }
}

function validateSitemap() {
  const sitemapPath = path.join(root, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    issues.push("sitemap.xml: missing sitemap");
    return;
  }

  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const seen = new Set();

  for (const match of sitemap.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/gi)) {
    const loc = match[1];
    const url = new URL(loc);
    if (url.hostname !== siteHost) continue;

    if (seen.has(loc)) {
      issues.push(`sitemap.xml: duplicate URL ${loc}`);
    }
    seen.add(loc);

    const targetFile = fileForInternalPath(url.pathname);
    if (!targetFile) {
      issues.push(`sitemap.xml: URL does not resolve to an HTML file: ${loc}`);
      continue;
    }

    const html = fs.readFileSync(targetFile, "utf8");
    if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
      issues.push(`sitemap.xml: noindex page is listed: ${loc}`);
    }
  }
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const scriptFiles = files.filter((file) => file.endsWith(".js") || file.endsWith(".mjs"));

validateJavaScript(scriptFiles);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  validateHtmlImages(file, html);
  validateRawAmpersands(file, html);
  validateInternalLinks(file, html);
  validatePageAssets(file, html);
}

validateSitemap();

if (issues.length) {
  console.error(`Site validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}:`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Site validation passed for ${htmlFiles.length} HTML files and ${scriptFiles.length} scripts.`);

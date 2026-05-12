import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_IMAGE,
  DEFAULT_SITE_URL,
  SITE_NAME,
  getSeoMetaForPath,
  staticSeoRoutes,
} from "../src/config/seoConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
const indexPath = path.join(distDir, "index.html");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJsonForHtml(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function cleanText(value, maxLength = 155) {
  const text = String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function routeOutputPath(routePath) {
  if (routePath === "/") return path.join(distDir, "index.html");
  return path.join(distDir, routePath.replace(/^\/+/, ""), "index.html");
}

function writeFileEnsured(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function routePriority(routePath) {
  if (routePath === "/") return "1.0";
  if (routePath.split("/").length <= 3) return "0.8";
  return "0.6";
}

function buildHead(meta) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": meta.type,
    name: meta.title,
    description: meta.description,
    url: meta.canonical,
    image: meta.image,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
    },
  };

  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${meta.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:type" content="${meta.type === "WebSite" ? "website" : "article"}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
    `<script id="a9vn-jsonld" type="application/ld+json">${escapeJsonForHtml(jsonLd)}</script>`,
  ].join("\n    ");
}

function stripSeoHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta\s+name=["']description["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+name=["']robots["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<script\s+id=["']a9vn-jsonld["'][\s\S]*?<\/script>\s*/gi, "\n");
}

function buildPrerenderContent(route) {
  const links = route.links?.length
    ? `<ul>${route.links
        .slice(0, 24)
        .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
        .join("")}</ul>`
    : "";

  return [
    `<main class="seo-prerender" data-prerendered-route="${escapeHtml(route.path)}">`,
    `<h1>${escapeHtml(route.h1 || route.meta.title)}</h1>`,
    `<p>${escapeHtml(route.description || route.meta.description)}</p>`,
    links,
    `</main>`,
  ].join("");
}

function renderRoute(baseHtml, route) {
  const meta = route.meta;
  const html = stripSeoHead(baseHtml)
    .replace(/<html\s+lang=["'][^"']*["']/i, '<html lang="vi"')
    .replace("</head>", `    ${buildHead(meta)}\n  </head>`)
    .replace(/<div id="root"><\/div>/, `<div id="root">${buildPrerenderContent(route)}</div>`);

  return html;
}

function getOperators() {
  const operators = readJson("src/data/operators/character_table.json");
  const charPatchTable = readJson("src/data/operators/char_patch_table.json");
  const nameVn = readJson("src/data/operators/name_vn.json");
  const merged = { ...operators, ...(charPatchTable.patchChars || {}) };

  return Object.entries(merged)
    .filter(([id, operator]) => id !== "char_512_aprot" && operator.profession !== "TOKEN")
    .map(([id, operator]) => {
      const name = nameVn[id]?.name_vn || operator.name || id;
      return {
        id,
        name,
        profession: operator.profession || "",
        rarity: operator.rarity || "",
        description: cleanText(operator.description),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

function getBosses() {
  const source = fs.readFileSync(path.join(rootDir, "src/data/enemies/enemies.ts"), "utf8");
  const match = source.match(/export const bosses: Boss\[\] = (\[[\s\S]*?\n\]);/);
  if (!match) return [];

  return Function(`"use strict"; return (${match[1]});`)()
    .map((boss) => ({
      id: boss.id,
      name: boss.name,
      description: cleanText(boss.description),
      damageType: Array.isArray(boss.damageType) ? boss.damageType.join(", ") : "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

function getMaterialLinks() {
  const itemTable = readJson("src/data/operators/item_table_en.json");
  return Object.entries(itemTable.items || {})
    .filter(([, item]) => {
      const itemType = typeof item.itemType === "string" ? item.itemType : "";
      return item.classifyType === "MATERIAL" || itemType.includes("MATERIAL");
    })
    .slice(0, 80)
    .map(([id, item]) => ({
      href: `/database/materials/${encodeURIComponent(id)}`,
      label: item.name || id,
    }));
}

function buildRoutes() {
  const operators = getOperators();
  const bosses = getBosses();
  const routes = Object.keys(staticSeoRoutes).map((routePath) => ({
    path: routePath,
    meta: getSeoMetaForPath(routePath, { siteUrl }),
    h1: staticSeoRoutes[routePath].title,
    description: staticSeoRoutes[routePath].description,
  }));

  const operatorLinks = operators.slice(0, 60).map((operator) => ({
    href: `/operator/${encodeURIComponent(operator.id)}`,
    label: operator.name,
  }));
  const bossLinks = bosses.slice(0, 60).map((boss) => ({
    href: `/database/bosses/${encodeURIComponent(boss.id)}`,
    label: boss.name,
  }));

  routes.find((route) => route.path === "/operator").links = operatorLinks;
  routes.find((route) => route.path === "/database/bosses").links = bossLinks;
  routes.find((route) => route.path === "/database/materials").links = getMaterialLinks();

  for (const operator of operators) {
    const routePath = `/operator/${encodeURIComponent(operator.id)}`;
    const description = cleanText(
      `Tra cứu ${operator.name}: class ${operator.profession}, rarity ${operator.rarity}, chỉ số, kỹ năng, module, skin và lời thoại trong Arknights.`,
    );
    routes.push({
      path: routePath,
      meta: {
        ...getSeoMetaForPath(routePath, { siteUrl }),
        title: `${operator.name} - Operator - A9vn`,
        description,
        image: `${siteUrl}${DEFAULT_IMAGE}`,
      },
      h1: operator.name,
      description,
    });
  }

  for (const boss of bosses) {
    const routePath = `/database/bosses/${encodeURIComponent(boss.id)}`;
    const description = cleanText(
      boss.description || `Tra cứu boss ${boss.name}, loại sát thương ${boss.damageType} và cơ chế kỹ năng trong Arknights.`,
    );
    routes.push({
      path: routePath,
      meta: {
        ...getSeoMetaForPath(routePath, { siteUrl }),
        title: `${boss.name} - Boss - A9vn`,
        description,
        image: `${siteUrl}${DEFAULT_IMAGE}`,
      },
      h1: boss.name,
      description,
    });
  }

  return routes;
}

function writeSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${escapeHtml(route.meta.canonical)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${routePriority(route.path)}</priority>
  </url>`,
    )
    .join("\n");

  writeFileEnsured(
    path.join(distDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  );
}

function writeRobots() {
  writeFileEnsured(
    path.join(distDir, "robots.txt"),
    `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`,
  );
}

if (!fs.existsSync(indexPath)) {
  throw new Error("dist/index.html not found. Run vite build before prerender-seo.");
}

const baseHtml = fs.readFileSync(indexPath, "utf8");
const routes = buildRoutes();

for (const route of routes) {
  writeFileEnsured(routeOutputPath(route.path), renderRoute(baseHtml, route));
}

writeSitemap(routes);
writeRobots();

console.log(`SEO prerendered ${routes.length} routes.`);
console.log(`Sitemap: ${path.relative(rootDir, path.join(distDir, "sitemap.xml"))}`);

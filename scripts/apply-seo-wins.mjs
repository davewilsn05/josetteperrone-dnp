import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blogDir = path.join(root, "blog");
const baseUrl = "https://josetteperrone.com";
const today = "2026-05-24";
const articles = JSON.parse(fs.readFileSync(path.join(blogDir, "articles.json"), "utf8"));

const categoryDescriptions = {
  "Healthcare Worker Safety":
    "Practical writing on workplace safety, violence prevention, reporting culture, and the daily conditions that help nurses deliver safer care.",
  "Burnout and Resilience":
    "Reflections on nurse burnout, recovery, moral distress, and resilience practices that pair human support with operational change.",
  "Emergency and Trauma Nursing":
    "Field-informed articles on emergency nursing, trauma care, high-acuity decision-making, and team readiness under pressure.",
  "Nursing Education":
    "Writing for nurse educators, preceptors, and academic leaders focused on clinical judgment, student confidence, and practical teaching.",
  "Clinical Communication":
    "Communication-focused articles for nursing teams, educators, and healthcare leaders who need clarity during high-stakes moments.",
  "Patient Advocacy":
    "Articles on nursing advocacy, patient dignity, family communication, ethics, and speaking up with professionalism.",
  "Advanced Practice Nursing":
    "Reflections on advanced practice nursing, nurse practitioner judgment, doctoral preparation, and leadership rooted in bedside experience.",
  "Mentorship and Career Growth":
    "Career-focused writing for nurses navigating mentorship, graduate education, professional identity, and sustainable growth.",
};

const categoryTags = {
  "Healthcare Worker Safety": ["worker safety", "safety culture", "nursing teams"],
  "Burnout and Resilience": ["nurse burnout", "resilience", "clinician well-being"],
  "Emergency and Trauma Nursing": ["emergency nursing", "trauma nursing", "high-acuity care"],
  "Nursing Education": ["nursing education", "clinical judgment", "student learning"],
  "Clinical Communication": ["clinical communication", "team communication", "escalation"],
  "Patient Advocacy": ["patient advocacy", "ethics", "family communication"],
  "Advanced Practice Nursing": ["advanced practice", "nurse practitioner", "DNP"],
  "Mentorship and Career Growth": ["mentorship", "career growth", "nursing leadership"],
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const slugify = (value) =>
  value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const wordsInArticle = (html) => {
  const match = html.match(/<article class="article-page">([\s\S]*?)<\/article>/);
  return stripTags(match ? match[1] : html).split(/\s+/).filter(Boolean).length;
};

const readingTime = (html) => Math.max(4, Math.ceil(wordsInArticle(html) / 190));

const byCategory = new Map();
for (const article of articles) {
  if (!byCategory.has(article.category)) byCategory.set(article.category, []);
  byCategory.get(article.category).push(article);
}

const categories = [...byCategory.keys()].map((name) => ({
  name,
  slug: slugify(name),
  articles: byCategory.get(name),
  description: categoryDescriptions[name],
  tags: categoryTags[name],
}));

const relatedFor = (article) => {
  const peers = byCategory.get(article.category).filter((candidate) => candidate.slug !== article.slug);
  if (peers.length >= 3) return peers.slice(0, 3);
  return [
    ...peers,
    ...articles.filter((candidate) => candidate.category !== article.category).slice(0, 3 - peers.length),
  ];
};

for (const article of articles) {
  const file = path.join(blogDir, `${article.slug}.html`);
  let html = fs.readFileSync(file, "utf8");
  const minutes = readingTime(html);
  const category = categories.find((candidate) => candidate.name === article.category);
  const tags = category.tags;

  html = html.replace(
    /<meta name="description" content="([^"]+)" \/>/,
    `<meta name="description" content="$1" />\n    <meta name="reading-time" content="${minutes} min" />\n    <meta name="article:section" content="${escapeHtml(article.category)}" />\n    <meta name="keywords" content="${escapeHtml([article.category, ...tags, article.title].join(", "))}" />`,
  );

  html = html.replace(
    /<p class="article-meta"><span>[\s\S]*?<\/time><\/p>/,
    `<p class="article-meta"><a href="${category.slug}.html">${escapeHtml(article.category)}</a><time datetime="${article.date}">${article.dateDisplay}</time><span>${minutes} min read</span></p>`,
  );

  const tagMarkup = `<div class="article-tags" aria-label="Article topics">${tags
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("")}</div>`;
  html = html.replace(/(<p class="article-dek">[\s\S]*?<\/p>)/, `$1\n        ${tagMarkup}`);

  const relatedMarkup = `<section class="related-articles" aria-labelledby="related-title">
          <p class="eyebrow">Related reading</p>
          <h2 id="related-title">More on ${escapeHtml(article.category)}</h2>
          <div class="related-grid">
            ${relatedFor(article)
              .map(
                (related) => `<a href="${related.slug}.html">
              <span>${escapeHtml(related.category)}</span>
              <strong>${escapeHtml(related.title)}</strong>
            </a>`,
              )
              .join("\n            ")}
          </div>
        </section>`;

  html = html.replace(/(\s*<section class="article-references">)/, `\n        ${relatedMarkup}$1`);
  fs.writeFileSync(file, html);
}

const categoryNav = categories
  .map((category) => `<a href="${category.slug}.html"><span>${escapeHtml(category.name)}</span><strong>${category.articles.length}</strong></a>`)
  .join("\n              ");

let blogIndex = fs.readFileSync(path.join(blogDir, "index.html"), "utf8");
blogIndex = blogIndex.replace(/<a href="#[^"]+"><span>[\s\S]*?<\/strong><\/a>(\s*<a href="#[^"]+"><span>[\s\S]*?<\/strong><\/a>)*/m, categoryNav);
blogIndex = blogIndex.replace(/<link rel="stylesheet" href="\.\.\/styles\.css\?v=[^"]+" \/>/, '<link rel="stylesheet" href="../styles.css?v=20260524-posthog-seo" />');
blogIndex = blogIndex.replace(/<link rel="stylesheet" href="blog\.css\?v=[^"]+" \/>/, '<link rel="stylesheet" href="blog.css?v=20260524-topic-silos" />');
fs.writeFileSync(path.join(blogDir, "index.html"), blogIndex);

for (const category of categories) {
  const title = `${category.name} Articles for Nurses and Healthcare Leaders | Josette Perrone`;
  const description = category.description;
  const itemList = category.articles
    .map(
      (article, index) => `{
          "@type": "ListItem",
          "position": ${index + 1},
          "url": "${baseUrl}/blog/${article.slug}",
          "name": "${escapeHtml(article.title)}"
        }`,
    )
    .join(",\n        ");
  const cards = category.articles
    .map(
      (article) => `<a class="category-article-card" href="${article.slug}.html">
              <p class="article-meta"><span>${escapeHtml(article.category)}</span><time datetime="${article.date}">${article.dateDisplay}</time></p>
              <h2>${escapeHtml(article.title)}</h2>
              <p>${escapeHtml(article.focus)}.</p>
            </a>`,
    )
    .join("\n            ");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="Josette Perrone" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${baseUrl}/blog/${category.slug}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${baseUrl}/blog/${category.slug}" />
    <meta property="og:image" content="${baseUrl}/assets/brand/og-josette-perrone-contrast.png" />
    <meta property="og:site_name" content="Josette Perrone" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${baseUrl}/assets/brand/og-josette-perrone-contrast.png" />
    <meta name="theme-color" content="#0d7c78" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../styles.css?v=20260524-posthog-seo" />
    <link rel="stylesheet" href="blog.css?v=20260524-topic-silos" />
    <script type="application/ld+json">{
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": "${baseUrl}/blog/${category.slug}#collection",
          "name": "${escapeHtml(category.name)}",
          "url": "${baseUrl}/blog/${category.slug}",
          "description": "${escapeHtml(description)}",
          "isPartOf": { "@id": "${baseUrl}/#website" },
          "author": { "@id": "${baseUrl}/#josette-perrone" }
        },
        {
          "@type": "ItemList",
          "@id": "${baseUrl}/blog/${category.slug}#articles",
          "itemListElement": [
        ${itemList}
          ]
        }
      ]
    }</script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../index.html#top" aria-label="Josette Perrone home"><span class="brand-mark">JP</span><span><strong>Josette Perrone</strong><small>DNP, FNP-C, RN</small></span></a>
      <nav class="site-nav"><a href="../index.html#speaking">Speaking</a><a href="../index.html#experience">Experience</a><a href="index.html">Blog</a><a href="../index.html#booking">Booking</a></nav>
    </header>
    <main>
      <section class="blog-hero section category-hero">
        <div class="blog-hero-copy">
          <a class="back-link" href="index.html">Back to all articles</a>
          <p class="eyebrow">Topic library</p>
          <h1>${escapeHtml(category.name)}</h1>
          <p class="hero-lede">${escapeHtml(description)}</p>
          <div class="article-tags" aria-label="Topic tags">
            ${category.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
        <aside class="blog-hero-panel" aria-label="${escapeHtml(category.name)} summary">
          <div><strong>${category.articles.length}</strong><span>Articles</span></div>
          <div><strong>Clinical</strong><span>Professional development</span></div>
        </aside>
      </section>
      <section class="section category-article-grid" aria-label="${escapeHtml(category.name)} articles">
        ${cards}
      </section>
    </main>
    <script src="../analytics.js"></script>
  </body>
</html>`;

  fs.writeFileSync(path.join(blogDir, `${category.slug}.html`), html);
}

const sitemapUrls = [
  { loc: `${baseUrl}/`, lastmod: today, changefreq: "monthly", priority: "1.0" },
  { loc: `${baseUrl}/blog/`, lastmod: today, changefreq: "weekly", priority: "0.8" },
  ...categories.map((category) => ({
    loc: `${baseUrl}/blog/${category.slug}`,
    lastmod: today,
    changefreq: "weekly",
    priority: "0.7",
  })),
  ...articles.map((article) => ({
    loc: `${baseUrl}/blog/${article.slug}`,
    lastmod: article.date,
    changefreq: "monthly",
    priority: "0.6",
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

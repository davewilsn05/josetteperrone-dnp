# Blog Guidelines

Updated: 2026-06-09

These guidelines keep the Josette Perrone blog useful for readers and safe for Google indexing. The blog should support speaker authority, event-planner trust, and long-tail discovery without creating thin duplicate pages.

## Editorial Strategy

The blog is a curated authority library, not a daily archive. Only rewritten cornerstone posts should be indexable.

Current source of truth:

- Indexable article slugs live in `blog/editorial-index.json`.
- Indexable blog URLs belong in `sitemap.xml`.
- Thin support posts may remain accessible, but they must use `noindex, follow` and stay out of the sitemap.

## Indexable Article Requirements

An article can be indexable only if it meets all of these requirements:

- Minimum 650 words of main article content, excluding navigation, related links, references, and boilerplate disclaimers.
- A distinct search intent that does not duplicate a category page, topic page, or another article.
- No repeated paragraph templates from another post.
- At least four substantive sections with article-specific headings.
- At least one practical application section for nurses, educators, leaders, or event planners.
- A clear connection to Josette's speaking themes without turning the article into generic promotional copy.
- A self-referencing canonical URL.
- `meta name="robots"` set to `index, follow, max-image-preview:large`.
- A current `article:modified_time` and JSON-LD `dateModified` when materially rewritten.

## Prune Or Noindex

Use `noindex, follow` when any of these are true:

- The page is under 650 words and has not been rewritten.
- The article is a generic reflection, archive filler, or programmatic variant.
- The page repeats the same structure and core paragraphs as other posts.
- The topic is already covered better by a cornerstone post.
- The page exists mainly to provide internal context for users, not to rank in search.

Noindexed pages must not appear in `sitemap.xml`.

## Writing Standards

Each article should answer a specific practical question. Good examples:

- What should nurse leaders do when safety risks become normalized?
- How can educators use case studies to build clinical judgment?
- Why is documentation part of patient advocacy?

Avoid vague article premises:

- Practical reflection 12
- Why this topic matters
- A clinical lens on nursing
- General thoughts on resilience

## Structure

Use this default structure for indexable articles:

1. Open with the specific problem, not a generic definition.
2. Explain why the issue matters in real clinical or educational settings.
3. Name concrete patterns, risks, or decisions the reader can recognize.
4. Provide practical behaviors, questions, or team applications.
5. Close with a reflection that connects the topic to safer, more sustainable care.
6. Include related reading only from indexable cornerstone posts.
7. Include references when the topic touches safety, burnout, education, communication, ethics, or professional practice.

Do not reuse a stock paragraph across posts. If a paragraph could appear unchanged in another article, rewrite it or remove it.

## SEO Requirements

Before publishing or reindexing:

- Confirm the page returns `200`.
- Confirm the canonical URL is slashless and matches the deployed URL.
- Confirm the article is not blocked by `robots.txt`.
- Confirm the sitemap includes only canonical, indexable URLs.
- Confirm no `.html`, `www`, `http`, or trailing-slash duplicate URLs are in the sitemap.
- Confirm the page has one `meta name="robots"` tag.
- Confirm the page has one `meta name="description"` tag.
- Confirm related links do not promote noindexed archive pages from high-value pages.

## Workflow

For a new article:

1. Draft the article against one specific reader problem.
2. Compare it with existing cornerstone posts and topic pages.
3. If it is not clearly stronger or more specific, do not index it.
4. Add the slug to `blog/editorial-index.json` only after the article meets the indexable requirements.
5. Run the SEO generator and validate the sitemap.
6. Request indexing in Google Search Console only after deployment.

For an old thin post:

1. Rewrite it to meet the indexable requirements, or leave it `noindex, follow`.
2. Do not add it to the sitemap until rewritten.
3. Remove duplicated boilerplate and generic section patterns.
4. Update `article:modified_time`, JSON-LD `dateModified`, and reading time after rewriting.

## Search Console Response

If Google reports `Crawled - currently not indexed`:

1. Check status code, canonical, robots meta, and sitemap inclusion.
2. If the technical setup is correct, review the page for thin or duplicated content.
3. Rewrite only pages that have a clear search or business purpose.
4. Prune the rest with `noindex, follow` and remove them from the sitemap.
5. Revalidate after deployment and give Google time to recrawl.

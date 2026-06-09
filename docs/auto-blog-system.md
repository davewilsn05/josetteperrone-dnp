# Auto-Blog System

Updated: 2026-06-09

This project is a static site, so the auto-blog system generates committed HTML files instead of writing to a CMS database. The daily workflow creates one new noindexed field note at `/blog/{slug}`, updates `blog/articles.json`, and rebuilds `/blog/daily-field-notes`.

The current SEO rule still applies: daily generated notes are not cornerstone articles. They stay out of `sitemap.xml` and use `noindex, follow` until a human rewrites and promotes one through `blog/editorial-index.json`.

## Files

- `scripts/auto-blog.mjs` - dependency-free Node generator.
- `.github/workflows/auto-blog.yml` - daily unattended GitHub Actions runner.
- `blog/auto-blog-log.json` - initialized empty and updated after each publish run; stores recent generated notes.
- `blog/daily-field-notes.html` - initialized as an empty noindexed feed and rebuilt after each publish run.
- `.env.example` - required environment variables.

## What The Generator Does

1. Reads `blog/articles.json` and `blog/editorial-index.json`.
2. Chooses the least-covered content pillar unless a category is provided.
3. Builds a prompt from existing cornerstone articles, category tags, audience notes, and reference sets.
4. Calls an OpenAI-compatible chat completions endpoint when `OPENAI_API_KEY` and `AUTO_BLOG_MODEL` are set.
5. Validates the output for minimum structure, no duplicate slug, no AI boilerplate, and 650+ words.
6. Renders a static blog article using the existing blog template.
7. Sets `meta name="robots"` to `noindex, follow, max-image-preview:large`.
8. Updates `blog/articles.json`, `blog/auto-blog-log.json`, and `blog/daily-field-notes.html`.

## Local Commands

Dry run without an API call:

```sh
npm run auto-blog:dry-run
```

Publish with the configured AI model:

```sh
OPENAI_API_KEY=... AUTO_BLOG_MODEL=... npm run auto-blog:publish
```

Publish a fallback article without AI, useful only for testing the file pipeline:

```sh
npm run auto-blog:publish:fallback
```

Generate for a specific category and working title:

```sh
node scripts/auto-blog.mjs --publish --require-ai \
  --category "Clinical Communication" \
  --title "Why Clear Requests Protect Clinical Teams"
```

## GitHub Actions Setup

Add these repository settings before enabling the scheduled workflow:

- Secret: `OPENAI_API_KEY`
- Variable: `AUTO_BLOG_MODEL`

The workflow runs every day at `13:00 UTC`. It commits generated blog files back to the repository, which should trigger the existing Vercel deployment if the repo is connected to Vercel.

Manual runs are available from the GitHub Actions tab. Use the `dry_run` input to test the prompt and validation without committing files.

## Server Cron Setup

On a server that has the repository checked out:

```cron
0 6 * * * cd /path/to/josieperrone-dnp && OPENAI_API_KEY=... AUTO_BLOG_MODEL=... npm run auto-blog:publish && git add blog && git commit -m "Generate daily clinical field note" && git push
```

Use a deploy key or machine user with push access. If Vercel deploys from Git, the push is the publishing event.

## Promotion Workflow

Generated notes are useful as raw material. To make one indexable:

1. Rewrite the article so it meets `docs/seo/blog-guidelines.md`.
2. Add the slug to `blog/editorial-index.json`.
3. Run `node scripts/apply-seo-wins.mjs`.
4. Confirm the article appears in `sitemap.xml`.
5. Deploy and request indexing only after reviewing the page.

## Guardrails

- Do not remove `noindex` from the daily generator.
- Do not add generated daily notes directly to `sitemap.xml`.
- Keep references restricted to the category reference sets unless a reviewed article needs more specific sourcing.
- Avoid first-person claims, clinical directives, diagnosis/treatment guidance, and unsupported credential claims.

# Josette Perrone Content Dashboard

Generated: 2026-05-28

This dashboard maps existing articles to SEO/AEO/GEO clusters and points each cluster back to a speaker or topic page. After the June 9, 2026 pruning pass, only the cornerstone posts listed in `blog/editorial-index.json` should be indexable.

## Indexing Status

- Indexable cornerstone posts: 8
- Noindex support/archive posts: 142
- Blog category archive pages: noindex, follow
- Sitemap policy: include only the blog hub, the 8 rewritten cornerstone posts, and primary speaker/topic/audience pages

## Cluster Counts

- Healthcare Worker Safety: 19
- Burnout and Resilience: 19
- Emergency and Trauma Nursing: 19
- Nursing Education: 19
- Clinical Communication: 19
- Patient Advocacy: 19
- Advanced Practice Nursing: 18
- Mentorship and Career Growth: 18

## Landing Page Targets

- Healthcare Worker Safety: https://josetteperrone.com/topics/healthcare-communication-safety
- Burnout and Resilience: https://josetteperrone.com/topics/nurse-burnout-resilience
- Emergency and Trauma Nursing: https://josetteperrone.com/topics/emergency-trauma-nursing
- Nursing Education: https://josetteperrone.com/topics/nursing-education
- Clinical Communication: https://josetteperrone.com/topics/healthcare-communication-safety
- Patient Advocacy: https://josetteperrone.com/keynotes-workshops
- Advanced Practice Nursing: https://josetteperrone.com/speaker-summary
- Mentorship and Career Growth: https://josetteperrone.com/nursing-speaker

## Workflow

- Keep one broad topic page as the canonical page for each cluster.
- Refresh individual blog posts only when they can become cornerstone-quality resources.
- Leave thin support posts as `noindex, follow`.
- Add a blog slug to `blog/editorial-index.json` only after it meets `docs/seo/blog-guidelines.md`.
- Add a visible booking CTA to high-traffic posts.
- Avoid creating new posts that target the same phrase as an existing category or topic page.

CSV source:
`docs/seo/josette-content-dashboard.csv`

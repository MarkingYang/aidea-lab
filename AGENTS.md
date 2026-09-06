## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

### Blog content principle: no images

Blog articles must not use images, including screenshots, slide images, decorative illustrations, or raster/vector images of diagrams and tables. Express their information directly in clear, model-readable language: explicit definitions, relationships, ordered steps, Markdown tables, and code where appropriate. Explain actors, inputs, outputs, conditions, and exceptions in text; never rely on visual layout, colors, or an image caption to carry the argument. Preserve source links and evidence limitations. This is the default for new and revised articles. The user subsequently requested the exact earliest unsplit Lu Qi article with screenshots and original dates: restore `src/content/writing/lu-qi-researcher-founder.md` verbatim from `d8274cb`, including its four slide images and 2026-09-03 publication date. This specific historical restoration is an exception; do not apply the no-images rewrite to it.

### Current editorial direction

The latest user request restores all 19 original articles published September 1–4, 2026, as listed in `docs/blog-rewrite/september-originals-restoration.json`. These original texts, dates, four Lu Qi images and the standalone evaluation report are explicitly authorized historical restorations. Preserve their originals instead of rewriting, splitting, or applying newer editorial formatting rules. This supersedes the earlier empty-site/only-Lu-Qi state. Keep the Reading homepage and current site UI.

The active writing brief is `docs/blog-rewrite/README.md`. The user requested a fresh rewrite on 2026-09-06: old articles were removed, with Git history and existing backups retained. Do not reuse or merge legacy article prose unless the user explicitly requests restoration, and do not follow the superseded 24-article plan in `docs/blog-design-v1/`. The user explicitly requested restoring the three Lu Qi / Researcher Founder articles and merging them into `src/content/writing/lu-qi-researcher-founder.md`; this is an authorized exception. The site starts at the Reading page at `/`, with “阅读” first in navigation; `/series/` redirects there.

The user clarified that each complete research subject should have one coherent long-form article; the entire Blog is not restricted to one article. Keep a project’s architecture, runtime, state, extensions, and tradeoffs together, and a product’s users, workflows, interaction, delivery, and tradeoffs together. Write concrete project studies, product studies, cross-object comparisons, Mini Harness architecture, and OS Agent product design as complete articles. The user rejected the meta-level article introducing the overall research direction and writing method; `harness-agent-design.md` has been deleted. Do not recreate it or a renamed equivalent. Editorial planning belongs only in internal documentation. Finalize the complete research units before fixing the article count; do not restore the 24-article fragmentation. Read the full relevant article before revising it, and preserve its continuous argument. Research GitHub projects and products on their own terms, derive comparisons from evidence, and keep Mini Harness architecture and OS Agent product design as peer outcomes. Separate verified facts, interpretations, proposals, and unrun experiments. Raw sources and experiment records may be separate supporting files; they are not additional articles.

Reader-facing pages should show article titles, subject matter, and the articles themselves. Keep editorial labels such as “总稿 / 总论”, writing plans, review instructions, and internal progress in documentation, not in article introductions or site navigation. Preserve substantive evidence limitations where they qualify technical claims.

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

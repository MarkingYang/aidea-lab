## Latest user request — 2026-09-07

Restore the site articles to the September 6 09:23 review period: 88 articles, 17 series, 4 domains. The selected snapshot is `2b43aed`, the latest commit before that time. Restore historical article text, dates, images and relationships verbatim, including the Lu Qi version in that snapshot; this explicit restoration supersedes earlier local-only-two-articles and earliest-Lu-Qi requirements below. The new OS Agent draft is archived outside published content. Keep the current Reading homepage and site implementation. The user explicitly authorized pushing this restoration on 2026-09-07; publish through `origin/main`. See `docs/blog-rewrite/88-article-restoration.json`. Earlier editorial direction below is historical where it conflicts with this request.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

### Blog content principle: no images

Blog articles must not use images, including screenshots, slide images, decorative illustrations, or raster/vector images of diagrams and tables. Express their information directly in clear, model-readable language: explicit definitions, relationships, ordered steps, Markdown tables, and code where appropriate. Explain actors, inputs, outputs, conditions, and exceptions in text; never rely on visual layout, colors, or an image caption to carry the argument. Preserve source links and evidence limitations. This is the default for new and revised articles. The user subsequently requested the exact earliest unsplit Lu Qi article with screenshots and original dates: restore `src/content/writing/lu-qi-researcher-founder.md` verbatim from `d8274cb`, including its four slide images and 2026-09-03 publication date. This specific historical restoration is an exception; do not apply the no-images rewrite to it.

The user rejected the diagram-first Harness draft and explicitly requested its deletion. `mini-harness-architecture.md` and its navigation entries are removed locally. Keep the Lu Qi original and OS Agent product article. Do not recreate the Harness article or a replacement without a new user request. Supporting research remains internal.

### Current editorial direction

The earlier writing brief kept the original Lu Qi article locally and started two peer top-level articles: Harness architecture design and OS Agent product design. The 19 restored articles are already published at commit `278bac5`. Work locally on `codex/top-level-articles`; do not push the rewrite without a new explicit publish request. Preserve Lu Qi verbatim, including original screenshots and date. The other 18 historical articles and standalone report are removed locally. New articles are researched and written fresh, not patched from restored originals. See `docs/blog-rewrite/local-rewrite-start.json`.

The active writing brief is `docs/blog-rewrite/README.md`. The user requested a fresh rewrite on 2026-09-06: old articles were removed, with Git history and existing backups retained. Do not reuse or merge legacy article prose unless the user explicitly requests restoration, and do not follow the superseded 24-article plan in `docs/blog-design-v1/`. The user explicitly requested restoring the three Lu Qi / Researcher Founder articles and merging them into `src/content/writing/lu-qi-researcher-founder.md`; this is an authorized exception. The site starts at the Reading page at `/`, with “阅读” first in navigation; `/series/` redirects there.

The user clarified that each complete research subject should have one coherent long-form article; the entire Blog is not restricted to one article. Keep a project’s architecture, runtime, state, extensions, and tradeoffs together, and a product’s users, workflows, interaction, delivery, and tradeoffs together. The user clarified the hierarchy: only Harness architecture design and OS Agent product design are top-level articles. GitHub projects, product comparisons, mechanisms and experiments are supporting research, with independent object-level scope and the right to contradict either design. Do not automatically turn every supporting study into a separate published article. The user rejected the meta-level article introducing the overall research direction and writing method; `harness-agent-design.md` has been deleted. Do not recreate it or a renamed equivalent. Editorial planning belongs only in internal documentation. Finalize the complete research units before fixing the article count; do not restore the 24-article fragmentation. Read the full relevant article before revising it, and preserve its continuous argument. Research GitHub projects and products on their own terms, derive comparisons from evidence, and keep Mini Harness architecture and OS Agent product design as peer outcomes. Separate verified facts, interpretations, proposals, and unrun experiments. Raw sources and experiment records may be separate supporting files; they are not additional articles.

Reader-facing pages should show article titles, subject matter, and the articles themselves. Keep editorial labels such as “总稿 / 总论”, writing plans, review instructions, and internal progress in documentation, not in article introductions or site navigation. Preserve substantive evidence limitations where they qualify technical claims.

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

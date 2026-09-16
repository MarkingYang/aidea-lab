// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkTimeline from './src/plugins/remark-timeline.mjs';
import contentRedirects from './src/data/content-redirects.json';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://ainoteatlas.com',
  redirects: contentRedirects,
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkTimeline],
      rehypePlugins: [rehypeKatex],
    }),
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid', 'echarts', 'math', 'timeline'],
    },
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});

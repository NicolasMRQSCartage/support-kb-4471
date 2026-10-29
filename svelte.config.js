import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook: join(dirname(fileURLToPath(import.meta.url)), 'src/lib/layouts/runbook.svelte') } })],
  kit: {
    adapter: adapter(),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['*'], handleHttpError: 'warn' },
  },
};

<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemOf } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  // Intake's tag next to the problem the report belongs to.
  const pairs = $derived.by(() => {
    const n = new Map<string, number>();
    for (const r of uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket)) {
      const k = `${r.meta.intakeTag}→${problemOf(r, tenantOf(r), notes.oneDayMove)}`;
      n.set(k, (n.get(k) ?? 0) + 1);
    }
    return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([k, count]) => ({ tag: k.split('→')[0], problem: k.split('→')[1], count }));
  });
  const wrong = $derived(pairs.filter((p) => p.tag !== p.problem).reduce((s, p) => s + p.count, 0));
</script>

<p><strong>{wrong}</strong> reports carry an intake tag that is not their problem.</p>

<table>
  <thead><tr><th>intake tagged</th><th>problem</th><th>reports</th></tr></thead>
  <tbody>
    {#each pairs as p (p.tag + p.problem)}
      <tr class:off={p.tag !== p.problem}><td><code>{p.tag}</code></td><td><code>{p.problem}</code></td><td>{p.count}</td></tr>
    {/each}
  </tbody>
</table>

<style>
  .off td { background: var(--warn-bg); }
</style>

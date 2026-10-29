<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, splitTicket } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const rows = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(splitTicket(rows, ticket, tenantOf, notes.oneDayMove));
  const exported = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket).length);
</script>

<p class="sum">
  <strong>{rows.length}</strong> reports in #{ticket} ({exported - rows.length} more rows in the export are repeats of the same ids) ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br /><span class="what">{PROBLEMS[g.problem].what}</span></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if PROBLEMS[g.problem].issue}<a href={PROBLEMS[g.problem].issue}>{PROBLEMS[g.problem].issue?.replace(/^.*\/issues\//, '#')}</a>
          {:else}<span class="none">no ticket yet</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>

// What #4471 really holds: one problem per fix. causes.ts places a report by its tenant; the desk
// notes add what tenant can't show: reports that read as a one-day move, not a flipped month.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift' | 'unplaced';

export const PROBLEMS: Record<Problem, { what: string; issue?: string }> = {
  parser: { issue: 'https://github.com/NicolasMRQSCartage/support-kb-4471/issues/1', what: 'The shared parser reads every date month first; day-first tenants get day and month swapped.' },
  hint: { issue: 'https://github.com/NicolasMRQSCartage/support-kb-4471/issues/2', what: "booking-v3's form prints MM/DD/YYYY under the date field but reads the tenant's way, day first." },
  shift: { issue: 'https://github.com/NicolasMRQSCartage/support-kb-4471/issues/3', what: 'The date moves by one day, not a swap: the same booking lands on the day before or after.' },
  unplaced: { what: 'No tenant on file, or a tenant that writes the month first: none of the problems above.' },
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'shift';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const by = new Map<Problem, Report[]>();
  for (const r of uniqueById(reports).filter((r) => r.mergedInto === ticket)) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

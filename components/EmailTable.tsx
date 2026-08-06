import CategoryBadge from "@/components/CategoryBadge";
import StatusBadge from "@/components/StatusBadge";
import UrgencyBar from "@/components/UrgencyBar";
import { formatRelativeTime, truncate } from "@/lib/format";
import { EMAIL_CATEGORIES } from "@/lib/types";
import type { EmailCategory, EmailWithRelations } from "@/lib/types";

export default function EmailTable({
  emails,
  compact = false,
}: {
  emails: EmailWithRelations[];
  compact?: boolean;
}) {
  if (emails.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No emails found in the inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              <th className="px-4 py-3">Urgency</th>
              <th className="px-4 py-3">Sender</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Category</th>
              {!compact && <th className="px-4 py-3">Status</th>}
              {!compact && <th className="px-4 py-3">Matter</th>}
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-black">
            {emails.map((email) => (
              <tr
                key={email.id}
                className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-950/50"
              >
                <td className="px-4 py-3">
                  <UrgencyBar score={email.urgency_score} />
                </td>
                <td className="max-w-[10rem] truncate px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  {email.sender}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                    {truncate(email.subject, 60)}
                  </p>
                  {!compact && email.body && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {truncate(email.body, 80)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={email.category} />
                </td>
                {!compact && (
                  <td className="px-4 py-3">
                    <StatusBadge status={email.status} />
                  </td>
                )}
                {!compact && (
                  <td className="max-w-[10rem] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {email.matters?.name ?? "—"}
                  </td>
                )}
                <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {formatRelativeTime(email.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CategoryBreakdown({
  categoryCounts,
  total,
}: {
  categoryCounts: Partial<Record<EmailCategory, number>>;
  total: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        By Category
      </h2>
      <ul className="mt-4 space-y-3">
        {EMAIL_CATEGORIES.map((category) => {
          const count = categoryCounts[category] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <li key={category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <CategoryBadge category={category} />
                <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                  {count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

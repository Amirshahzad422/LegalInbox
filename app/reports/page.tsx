import { fetchReportsData } from "@/lib/reports";
import { EMAIL_CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  try {
    const data = await fetchReportsData();

    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Reports
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Live aggregated metrics across the inbox.
        </p>

        {/* Top stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total Emails
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {data.totalEmails}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Average Urgency
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(data.averageUrgency * 100)}%
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Auto-Send Rate
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(data.autoSendRate * 100)}%
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {data.autoSentCount} of {data.totalDrafts} drafts
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Template Edits
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {data.totalEdits}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Category breakdown */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Emails by Category
            </h2>
            <ul className="space-y-3">
              {EMAIL_CATEGORIES.map((category) => {
                const count = data.categoryCounts[category] ?? 0;
                const pct =
                  data.totalEmails > 0
                    ? Math.round((count / data.totalEmails) * 100)
                    : 0;
                return (
                  <li key={category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {category.replace("_", " ")}
                      </span>
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

          {/* Emails by day */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Emails per Day (recent)
            </h2>
            {data.emailsByDay.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No data yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.emailsByDay.map(({ date, count }) => {
                  const max = Math.max(
                    ...data.emailsByDay.map((d) => d.count),
                    1,
                  );
                  const pct = Math.round((count / max) * 100);
                  return (
                    <li key={date}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {date}
                        </span>
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
            )}
          </div>

          {/* Edit frequency by template category */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Template Edit Frequency
            </h2>
            {data.editsByTemplate.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No template edits logged yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.editsByTemplate.map((row, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {row.templateCategory.replace("_", " ")}
                    </span>
                    <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                      {row.count} edit{row.count === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load reports";
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {message}
        </div>
      </div>
    );
  }
}
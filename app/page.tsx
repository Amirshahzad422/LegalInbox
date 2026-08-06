import Link from "next/link";
import EmailTable, { CategoryBreakdown } from "@/components/EmailTable";
import StatCard from "@/components/StatCard";
import {
  fetchDashboardStats,
  fetchPriorityEmails,
} from "@/lib/emails";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const [stats, priorityEmails] = await Promise.all([
      fetchDashboardStats(),
      fetchPriorityEmails(5),
    ]);

    return (
      <div className="p-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Live overview of your firm&apos;s inbox
            </p>
          </div>
          <Link
            href="/inbox"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            View full inbox
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Needs Reply"
            value={stats.needsReply}
            hint={`of ${stats.totalEmails} total`}
          />
          <StatCard
            label="High Urgency"
            value={stats.highUrgency}
            hint="urgency ≥ 70%"
            accent="urgent"
          />
          <StatCard
            label="Court Deadlines"
            value={stats.courtDeadlines}
            accent="warning"
          />
          <StatCard label="Open Matters" value={stats.openMatters} />
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Priority Inbox
              </h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Top {priorityEmails.length} by urgency
              </span>
            </div>
            <EmailTable emails={priorityEmails} compact />
          </section>

          <CategoryBreakdown
            categoryCounts={stats.categoryCounts}
            total={stats.totalEmails}
          />
        </div>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load dashboard";

    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <p className="font-medium">Could not load dashboard data</p>
          <p className="mt-1">{message}</p>
        </div>
      </div>
    );
  }
}

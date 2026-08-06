import ReviewQueue from "@/components/ReviewQueue";
import { fetchPendingDrafts } from "@/lib/drafts";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  try {
    const drafts = await fetchPendingDrafts();

    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Review Queue
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          {drafts.length} draft{drafts.length === 1 ? "" : "s"} pending review
        </p>
        <ReviewQueue initialDrafts={drafts} />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load review queue";
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Review Queue</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {message}
        </div>
      </div>
    );
  }
}
import { formatUrgency } from "@/lib/format";

function urgencyColor(score: number | null): string {
  if (score === null) return "bg-zinc-200 dark:bg-zinc-700";
  if (score >= 0.8) return "bg-red-500";
  if (score >= 0.5) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function UrgencyBar({
  score,
  showLabel = true,
}: {
  score: number | null;
  showLabel?: boolean;
}) {
  const width = score !== null ? `${Math.round(score * 100)}%` : "0%";

  return (
    <div className="flex min-w-[5rem] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${urgencyColor(score)}`}
          style={{ width }}
        />
      </div>
      {showLabel && (
        <span className="w-8 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
          {formatUrgency(score)}
        </span>
      )}
    </div>
  );
}

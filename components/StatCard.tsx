export default function StatCard({
  label,
  value,
  hint,
  accent = "default",
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: "default" | "urgent" | "warning";
}) {
  const accentStyles = {
    default: "border-zinc-200 dark:border-zinc-800",
    urgent: "border-red-200 dark:border-red-900/50",
    warning: "border-amber-200 dark:border-amber-900/50",
  };

  const valueStyles = {
    default: "text-zinc-900 dark:text-zinc-50",
    urgent: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div
      className={`rounded-xl border bg-white p-5 dark:bg-zinc-950 ${accentStyles[accent]}`}
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-semibold tracking-tight ${valueStyles[accent]}`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      )}
    </div>
  );
}

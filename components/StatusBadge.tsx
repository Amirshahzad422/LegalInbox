import type { EmailStatus } from "@/lib/types";
import { formatStatus } from "@/lib/format";

const STATUS_STYLES: Record<EmailStatus, string> = {
  needs_reply:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  drafted:
    "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  replied:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  snoozed:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function StatusBadge({ status }: { status: EmailStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

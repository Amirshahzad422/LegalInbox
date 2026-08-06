import type { EmailCategory } from "@/lib/types";
import { formatCategory } from "@/lib/format";

const CATEGORY_STYLES: Record<EmailCategory, string> = {
  new_inquiry:
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  document_request:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  scheduling:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  billing:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  court_deadline:
    "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  opposing_counsel:
    "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  spam: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function CategoryBadge({
  category,
}: {
  category: EmailCategory | null;
}) {
  if (!category) {
    return (
      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Unclassified
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}
    >
      {formatCategory(category)}
    </span>
  );
}

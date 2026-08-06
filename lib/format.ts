import type { EmailCategory, EmailStatus } from "@/lib/types";

const CATEGORY_LABELS: Record<EmailCategory, string> = {
  new_inquiry: "New Inquiry",
  document_request: "Document Request",
  scheduling: "Scheduling",
  billing: "Billing",
  court_deadline: "Court Deadline",
  opposing_counsel: "Opposing Counsel",
  spam: "Spam",
};

const STATUS_LABELS: Record<EmailStatus, string> = {
  needs_reply: "Needs Reply",
  drafted: "Drafted",
  replied: "Replied",
  snoozed: "Snoozed",
};

export function formatCategory(category: EmailCategory | null): string {
  if (!category) return "Unclassified";
  return CATEGORY_LABELS[category];
}

export function formatStatus(status: EmailStatus): string {
  return STATUS_LABELS[status];
}

export function formatUrgency(score: number | null): string {
  if (score === null) return "—";
  return `${Math.round(score * 100)}%`;
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function truncate(text: string | null, maxLength: number): string {
  if (!text) return "—";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

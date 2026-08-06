"use client";

import { useMemo, useState } from "react";
import EmailTable from "@/components/EmailTable";
import { EMAIL_CATEGORIES } from "@/lib/types";
import type { EmailWithRelations } from "@/lib/types";

const STATUSES = ["needs_reply", "drafted", "replied", "snoozed"] as const;

type StaffOption = { id: string; name: string };

export default function InboxWithFilters({
  emails,
  staffOptions = [],
}: {
  emails: EmailWithRelations[];
  staffOptions?: StaffOption[];
}) {
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [minUrgency, setMinUrgency] = useState<number>(0);
  const [staffFilter, setStaffFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return emails.filter((email) => {
      if (category !== "all" && email.category !== category) return false;
      if (status !== "all" && email.status !== status) return false;
      if ((email.urgency_score ?? 0) < minUrgency) return false;
      if (staffFilter !== "all") {
        if (staffFilter === "unassigned" && email.assigned_staff_id) return false;
        if (staffFilter !== "unassigned" && email.assigned_staff_id !== staffFilter) return false;
      }
      return true;
    });
  }, [emails, category, status, minUrgency, staffFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="all">All categories</option>
          {EMAIL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          value={minUrgency}
          onChange={(e) => setMinUrgency(Number(e.target.value))}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value={0}>Any urgency</option>
          <option value={0.5}>50%+</option>
          <option value={0.7}>70%+</option>
          <option value={0.9}>90%+</option>
        </select>

        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="all">All staff</option>
          <option value="unassigned">Unassigned</option>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing {filtered.length} of {emails.length}
        </span>
      </div>

      <EmailTable emails={filtered} staffOptions={staffOptions} />
    </div>
  );
}
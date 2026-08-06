"use client";

import { useState } from "react";
import type { Staff } from "@/lib/types";

export default function StaffManager({
  initialStaff,
}: {
  initialStaff: Staff[];
}) {
  const [staff, setStaff] = useState(initialStaff);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(staffId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_profile: draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setStaff((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, voice_profile: draft } : s)),
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {staff.map((member) => (
        <div
          key={member.id}
          className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mb-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {member.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {member.email}
            </p>
          </div>

          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Voice profile (sample of their writing style)
          </label>

          {editingId === member.id ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(member.id)}
                  disabled={loading}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {member.voice_profile || (
                  <span className="italic text-zinc-400">No sample set</span>
                )}
              </p>
              <button
                onClick={() => {
                  setEditingId(member.id);
                  setDraft(member.voice_profile ?? "");
                }}
                className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
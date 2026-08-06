"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DraftWithEmail } from "@/lib/drafts";

export default function ReviewQueue({
  initialDrafts,
}: {
  initialDrafts: DraftWithEmail[];
}) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleAction(
    draftId: string,
    action: "approve" | "discard" | "edit_and_approve",
    editedText?: string,
  ) {
    setLoading(draftId);
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(editedText ? { edited_text: editedText } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Action failed");
      }
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      setEditingId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  if (drafts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No drafts pending review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Original Email
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {draft.emails?.subject}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                From: {draft.emails?.sender}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {draft.emails?.body}
              </p>
            </div>

            <div>
              <p className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span>AI Draft</span>
                <span className="normal-case text-zinc-400">
                  confidence: {Math.round((draft.confidence_score ?? 0) * 100)}%
                </span>
              </p>

              {editingId === draft.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                  {draft.generated_text}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {editingId === draft.id ? (
              <>
                <button
                  onClick={() =>
                    handleAction(draft.id, "edit_and_approve", editText)
                  }
                  disabled={loading === draft.id}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save & Send
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleAction(draft.id, "approve")}
                  disabled={loading === draft.id}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Approve & Send
                </button>
                <button
                  onClick={() => {
                    setEditingId(draft.id);
                    setEditText(draft.generated_text);
                  }}
                  disabled={loading === draft.id}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleAction(draft.id, "discard")}
                  disabled={loading === draft.id}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Discard
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
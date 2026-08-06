"use client";

import { useState } from "react";
import { EMAIL_CATEGORIES } from "@/lib/types";
import type { EmailCategory, Template } from "@/lib/types";

export default function TemplateManager({
    initialTemplates,
    editCounts,
  }: {
    initialTemplates: Template[];
    editCounts: Record<string, number>;
  }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [newCategory, setNewCategory] = useState<EmailCategory>(
    EMAIL_CATEGORIES[0],
  );
  const [newBody, setNewBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show the latest version per category in the main list
  const latestByCategory = new Map<EmailCategory, Template>();
  for (const t of templates) {
    const existing = latestByCategory.get(t.category);
    if (!existing || t.version > existing.version) {
      latestByCategory.set(t.category, t);
    }
  }

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory, body: newBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create template");
      setTemplates((prev) => [data, ...prev]);
      setNewBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(templateId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update template");
      setTemplates((prev) => [data, ...prev]);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAutoSend(template: Template) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/templates/${template.id}/auto-send`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !template.auto_send_enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle auto-send");
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === template.id
            ? { ...t, auto_send_enabled: !t.auto_send_enabled }
            : t,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Create new template */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Add Template
        </h2>
        <div className="flex flex-col gap-3">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as EmailCategory)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {EMAIL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            rows={4}
            placeholder="Template body..."
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !newBody.trim()}
            className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add Template
          </button>
        </div>
      </div>

      {/* List of templates by category */}
      <div className="space-y-4">
        {Array.from(latestByCategory.values()).map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
  {template.category.replace("_", " ")}{" "}
  <span className="font-normal text-zinc-400">
    v{template.version}
  </span>
  {(editCounts[template.id] ?? 0) >= 3 && (
    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      Suggested update needed
    </span>
  )}
</span>
              <label className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={template.auto_send_enabled}
                  onChange={() => handleToggleAutoSend(template)}
                />
                Auto-send enabled
              </label>
            </div>

            {editingId === template.id ? (
              <div className="space-y-2">
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(template.id)}
                    disabled={loading}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Save as new version
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
                  {template.body}
                </p>
                <button
                  onClick={() => {
                    setEditingId(template.id);
                    setEditBody(template.body);
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
    </div>
  );
}
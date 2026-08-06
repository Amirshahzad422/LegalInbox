"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateDraftButton({ emailId }: { emailId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_id: emailId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate draft");
      setResult(data.status === "auto_sent" ? "Auto-sent" : "Draft created");
      router.refresh();
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        {result}
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
    >
      {loading ? "Generating..." : "Generate Draft"}
    </button>
  );
}
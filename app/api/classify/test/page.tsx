"use client";

import { useState } from "react";

export default function ClassifyTestPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request failed";
      setResponse(JSON.stringify({ error: message }, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Classify API Test
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Temporary page for testing POST /api/classify
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="subject"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Subject
          </label>
          <textarea
            id="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            placeholder="Email subject"
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Body
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={8}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            placeholder="Email body"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Classifying..." : "Submit"}
        </button>
      </form>

      {response && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Response
          </h2>
          <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}

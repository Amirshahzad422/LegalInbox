"use client";

import { useState } from "react";
import type { GmailConnectionPublic } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";

type SyncResponse = {
  results?: Array<{
    gmail_address: string;
    fetched: number;
    imported: number;
    skipped: number;
    classified: number;
    errors: string[];
  }>;
  error?: string;
};

export default function GmailConnectPanel({
  configured,
  initialConnections,
  banner,
}: {
  configured: boolean;
  initialConnections: GmailConnectionPublic[];
  banner?: { type: "success" | "error"; message: string } | null;
}) {
  const [connections, setConnections] =
    useState<GmailConnectionPublic[]>(initialConnections);
  const [syncing, setSyncing] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);

  async function refreshStatus() {
    const response = await fetch("/api/gmail/status");
    const data = await response.json();
    if (data.connections) {
      setConnections(data.connections);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch("/api/gmail/sync", { method: "POST" });
      const data = (await response.json()) as SyncResponse;
      setSyncResult(data);
      await refreshStatus();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sync request failed";
      setSyncResult({ error: message });
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect(connectionId: string) {
    setDisconnectingId(connectionId);
    setSyncResult(null);

    try {
      const response = await fetch("/api/gmail/sync", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Disconnect failed");
      }

      setConnections((current) =>
        current.filter((connection) => connection.id !== connectionId),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Disconnect failed";
      setSyncResult({ error: message });
    } finally {
      setDisconnectingId(null);
    }
  }

  return (
    <section className="max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Gmail Integration
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Connect a Gmail inbox to import new messages, store them in Supabase,
          and classify them with the existing AI pipeline.
        </p>
      </div>

      {banner && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {banner.message}
        </div>
      )}

      {!configured && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          Add <code className="font-mono">GOOGLE_CLIENT_ID</code> and{" "}
          <code className="font-mono">GOOGLE_CLIENT_SECRET</code> to your{" "}
          <code className="font-mono">.env</code> after completing Google Cloud
          Console setup.
        </div>
      )}

      {connections.length === 0 ? (
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          No Gmail account connected yet.
        </p>
      ) : (
        <ul className="mb-4 space-y-3">
          {connections.map((connection) => (
            <li
              key={connection.id}
              className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {connection.gmail_address}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Last sync:{" "}
                    {connection.last_sync_at
                      ? formatRelativeTime(connection.last_sync_at)
                      : "Never"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDisconnect(connection.id)}
                  disabled={disconnectingId === connection.id}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  {disconnectingId === connection.id
                    ? "Disconnecting..."
                    : "Disconnect"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <a
          href={configured ? "/api/gmail/auth" : "#"}
          aria-disabled={!configured}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            configured
              ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              : "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
          }`}
        >
          {connections.length === 0 ? "Connect Gmail" : "Connect another inbox"}
        </a>

        <button
          type="button"
          onClick={handleSync}
          disabled={!configured || connections.length === 0 || syncing}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {syncing ? "Syncing..." : "Sync now"}
        </button>
      </div>

      {syncResult && (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-black">
          {syncResult.error ? (
            <p className="text-red-600 dark:text-red-400">{syncResult.error}</p>
          ) : (
            <div className="space-y-2 text-zinc-700 dark:text-zinc-300">
              {syncResult.results?.map((result) => (
                <p key={result.gmail_address}>
                  <span className="font-medium">{result.gmail_address}</span>:{" "}
                  fetched {result.fetched}, imported {result.imported}, skipped{" "}
                  {result.skipped}, classified {result.classified}
                  {result.errors.length > 0 && (
                    <span className="block text-red-600 dark:text-red-400">
                      {result.errors.join(" · ")}
                    </span>
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
        Redirect URI for Google Cloud Console:{" "}
        <code className="font-mono">
          {(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
            /\/$/,
            "",
          )}
          /api/gmail/callback
        </code>
      </p>
    </section>
  );
}

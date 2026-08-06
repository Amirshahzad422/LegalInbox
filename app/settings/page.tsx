import GmailConnectPanel from "@/components/GmailConnectPanel";
import {
  getGmailConnections,
  toPublicConnection,
} from "@/lib/gmail/connections";
import { isGoogleOAuthConfigured } from "@/lib/gmail/config";

export const dynamic = "force-dynamic";

function getBanner(searchParams: {
  gmail?: string;
  message?: string;
}): { type: "success" | "error"; message: string } | null {
  if (searchParams.gmail === "connected") {
    return {
      type: "success",
      message: "Gmail connected successfully. Run a sync to import inbox messages.",
    };
  }

  if (searchParams.gmail === "error") {
    return {
      type: "error",
      message: searchParams.message
        ? decodeURIComponent(searchParams.message.replace(/\+/g, " "))
        : "Gmail connection failed.",
    };
  }

  return null;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail?: string; message?: string }>;
}) {
  const params = await searchParams;
  const configured = isGoogleOAuthConfigured();

  let connections = [];
  let loadError: string | null = null;

  try {
    const rows = await getGmailConnections();
    connections = rows.map(toPublicConnection);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Failed to load Gmail connections";
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Connect external services and manage inbox automation
        </p>
      </div>

      {loadError && (
        <div className="mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <p className="font-medium">Could not load Gmail connections</p>
          <p className="mt-1">{loadError}</p>
          <p className="mt-2 text-xs">
            If this is your first time, apply{" "}
            <code className="font-mono">supabase/sql/gmail.sql</code> in the
            Supabase SQL editor.
          </p>
        </div>
      )}

      <GmailConnectPanel
        configured={configured}
        initialConnections={connections}
        banner={getBanner(params)}
      />
    </div>
  );
}

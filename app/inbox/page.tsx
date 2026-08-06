import ConnectGmailButton from "@/components/ConnectGmailButton";
import EmailTable from "@/components/EmailTable";
import { fetchEmails } from "@/lib/emails";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  try {
    const emails = await fetchEmails();
    const needsReply = emails.filter((e) => e.status === "needs_reply").length;

    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Inbox
          </h1>
          <ConnectGmailButton />
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {emails.length} message{emails.length === 1 ? "" : "s"} ·{" "}
            {needsReply} need{needsReply === 1 ? "s" : ""} reply · sorted by
            urgency
          </p>
        </div>

        <EmailTable emails={emails} />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load inbox";

    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <p className="font-medium">Could not load inbox</p>
          <p className="mt-1">{message}</p>
        </div>
      </div>
    );
  }
}

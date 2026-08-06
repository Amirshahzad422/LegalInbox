import { classifyAndUpdateEmail } from "@/lib/classify";
import {
  emailExistsByGmailMessageId,
  getGmailConnectionById,
  getGmailConnections,
  insertImportedEmail,
  markGmailSynced,
} from "@/lib/gmail/connections";
import { getAuthorizedGmailClient } from "@/lib/gmail/oauth";
import {
  formatGmailAfterDate,
  parseGmailMessage,
} from "@/lib/gmail/parse-message";
import type { GmailConnection, GmailSyncResult } from "@/lib/types";

const DEFAULT_SYNC_LIMIT = 25;

async function syncGmailConnection(
  connection: GmailConnection,
  limit = DEFAULT_SYNC_LIMIT,
): Promise<GmailSyncResult> {
  const result: GmailSyncResult = {
    connection_id: connection.id,
    gmail_address: connection.gmail_address,
    fetched: 0,
    imported: 0,
    skipped: 0,
    classified: 0,
    errors: [],
  };

  const gmail = await getAuthorizedGmailClient(connection);

  let query = "in:inbox";
  if (connection.last_sync_at) {
    const afterDate = formatGmailAfterDate(new Date(connection.last_sync_at));
    query += ` after:${afterDate}`;
  }

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: limit,
  });

  const messageIds = listResponse.data.messages?.map((message) => message.id) ?? [];
  result.fetched = messageIds.length;

  for (const messageId of messageIds) {
    if (!messageId) continue;

    try {
      const alreadyImported = await emailExistsByGmailMessageId(messageId);
      if (alreadyImported) {
        result.skipped += 1;
        continue;
      }

      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const parsed = parseGmailMessage(fullMessage.data);
      if (!parsed) {
        result.skipped += 1;
        continue;
      }

      const inserted = await insertImportedEmail({
        sender: parsed.sender,
        subject: parsed.subject,
        body: parsed.body,
        gmail_message_id: parsed.gmail_message_id,
        assigned_staff_id: connection.staff_id,
      });

      result.imported += 1;

      try {
        await classifyAndUpdateEmail(
          inserted.id,
          parsed.subject,
          parsed.body,
        );
        result.classified += 1;
      } catch (classifyError) {
        const message =
          classifyError instanceof Error
            ? classifyError.message
            : "Classification failed";
        result.errors.push(`Message ${messageId}: ${message}`);
      }
    } catch (messageError) {
      const message =
        messageError instanceof Error
          ? messageError.message
          : "Failed to import message";
      result.errors.push(`Message ${messageId}: ${message}`);
    }
  }

  await markGmailSynced(connection.id);
  return result;
}

export async function syncAllGmailConnections(
  limit = DEFAULT_SYNC_LIMIT,
): Promise<GmailSyncResult[]> {
  const connections = await getGmailConnections();

  if (connections.length === 0) {
    throw new Error("No Gmail account is connected. Connect Gmail in Settings first.");
  }

  const results: GmailSyncResult[] = [];

  for (const connection of connections) {
    results.push(await syncGmailConnection(connection, limit));
  }

  return results;
}

export async function syncGmailConnectionById(
  connectionId: string,
  limit = DEFAULT_SYNC_LIMIT,
): Promise<GmailSyncResult> {
  const connection = await getGmailConnectionById(connectionId);

  if (!connection) {
    throw new Error(`Gmail connection ${connectionId} not found.`);
  }

  return syncGmailConnection(connection, limit);
}

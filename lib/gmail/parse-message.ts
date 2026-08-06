type GmailHeader = { name?: string | null; value?: string | null };
type GmailPart = {
  mimeType?: string | null;
  body?: { data?: string | null };
  parts?: GmailPart[] | null;
};

export type ParsedGmailMessage = {
  gmail_message_id: string;
  sender: string;
  subject: string;
  body: string;
};

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function getHeader(headers: GmailHeader[] | undefined, name: string): string {
  const match = headers?.find(
    (header) => header.name?.toLowerCase() === name.toLowerCase(),
  );
  return match?.value?.trim() ?? "";
}

function extractBodyFromPart(part: GmailPart): string {
  if (part.body?.data) {
    return decodeBase64Url(part.body.data);
  }

  if (!part.parts?.length) {
    return "";
  }

  const plainPart = part.parts.find((child) => child.mimeType === "text/plain");
  if (plainPart) {
    return extractBodyFromPart(plainPart);
  }

  const htmlPart = part.parts.find((child) => child.mimeType === "text/html");
  if (htmlPart) {
    const html = extractBodyFromPart(htmlPart);
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  return part.parts.map(extractBodyFromPart).find(Boolean) ?? "";
}

export function parseGmailMessage(message: {
  id?: string | null;
  payload?: GmailPart & { headers?: GmailHeader[] | null };
  snippet?: string | null;
}): ParsedGmailMessage | null {
  if (!message.id) {
    return null;
  }

  const headers = message.payload?.headers ?? undefined;
  const sender = getHeader(headers, "From") || "unknown@sender";
  const subject = getHeader(headers, "Subject") || "(no subject)";

  let body = "";
  if (message.payload) {
    body = extractBodyFromPart(message.payload).trim();
  }

  if (!body) {
    body = message.snippet?.trim() ?? "";
  }

  return {
    gmail_message_id: message.id,
    sender,
    subject,
    body,
  };
}

export function formatGmailAfterDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

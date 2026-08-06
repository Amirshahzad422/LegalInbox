export const EMAIL_CATEGORIES = [
  "new_inquiry",
  "document_request",
  "scheduling",
  "billing",
  "court_deadline",
  "opposing_counsel",
  "spam",
] as const;

export type EmailCategory = (typeof EMAIL_CATEGORIES)[number];

export const EMAIL_STATUSES = [
  "needs_reply",
  "drafted",
  "replied",
  "snoozed",
] as const;

export type EmailStatus = (typeof EMAIL_STATUSES)[number];

export type Email = {
  id: string;
  sender: string;
  subject: string | null;
  body: string | null;
  category: EmailCategory | null;
  urgency_score: number | null;
  matter_id: string | null;
  client_id: string | null;
  status: EmailStatus;
  assigned_staff_id: string | null;
  gmail_message_id: string | null;
  created_at: string;
};

export type EmailWithRelations = Email & {
  clients: { name: string } | null;
  matters: { name: string } | null;
  staff: { name: string } | null;
};

export type DashboardStats = {
  totalEmails: number;
  needsReply: number;
  highUrgency: number;
  courtDeadlines: number;
  openMatters: number;
  categoryCounts: Partial<Record<EmailCategory, number>>;
};

export type GmailConnection = {
  id: string;
  staff_id: string | null;
  gmail_address: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GmailConnectionPublic = Pick<
  GmailConnection,
  "id" | "staff_id" | "gmail_address" | "last_sync_at" | "created_at"
>;

export type GmailSyncResult = {
  connection_id: string;
  gmail_address: string;
  fetched: number;
  imported: number;
  skipped: number;
  classified: number;
  errors: string[];
};

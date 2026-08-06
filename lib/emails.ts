import { supabase } from "@/lib/supabase";
import type {
  DashboardStats,
  EmailCategory,
  EmailWithRelations,
} from "@/lib/types";

const EMAIL_SELECT = `
  id,
  sender,
  subject,
  body,
  category,
  urgency_score,
  matter_id,
  client_id,
  status,
  assigned_staff_id,
  created_at,
  clients ( name ),
  matters ( name ),
  staff ( name )
`;

type RelatedName = { name: string };

type SupabaseEmailRow = EmailWithRelations & {
  clients: RelatedName | RelatedName[] | null;
  matters: RelatedName | RelatedName[] | null;
  staff: RelatedName | RelatedName[] | null;
};

function normalizeRelation(
  relation: RelatedName | RelatedName[] | null,
): RelatedName | null {
  if (!relation) return null;
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation;
}

function normalizeEmail(row: SupabaseEmailRow): EmailWithRelations {
  return {
    ...row,
    clients: normalizeRelation(row.clients),
    matters: normalizeRelation(row.matters),
    staff: normalizeRelation(row.staff),
  };
}

export async function fetchEmails(): Promise<EmailWithRelations[]> {
  const { data, error } = await supabase
    .from("emails")
    .select(EMAIL_SELECT)
    .order("urgency_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeEmail(row as SupabaseEmailRow));
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [emailsResult, mattersResult] = await Promise.all([
    supabase.from("emails").select("category, status, urgency_score"),
    supabase.from("matters").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  if (emailsResult.error) {
    throw new Error(emailsResult.error.message);
  }

  if (mattersResult.error) {
    throw new Error(mattersResult.error.message);
  }

  const emails = emailsResult.data ?? [];
  const categoryCounts: Partial<Record<EmailCategory, number>> = {};

  for (const email of emails) {
    if (email.category) {
      categoryCounts[email.category as EmailCategory] =
        (categoryCounts[email.category as EmailCategory] ?? 0) + 1;
    }
  }

  return {
    totalEmails: emails.length,
    needsReply: emails.filter((e) => e.status === "needs_reply").length,
    highUrgency: emails.filter(
      (e) => e.urgency_score !== null && e.urgency_score >= 0.7,
    ).length,
    courtDeadlines: emails.filter((e) => e.category === "court_deadline").length,
    openMatters: mattersResult.count ?? 0,
    categoryCounts,
  };
}

export async function fetchPriorityEmails(
  limit = 5,
): Promise<EmailWithRelations[]> {
  const { data, error } = await supabase
    .from("emails")
    .select(EMAIL_SELECT)
    .eq("status", "needs_reply")
    .order("urgency_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeEmail(row as SupabaseEmailRow));
}

export async function assignStaffToEmail(
  emailId: string,
  staffId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("emails")
    .update({ assigned_staff_id: staffId })
    .eq("id", emailId);

  if (error) throw new Error(error.message);
}
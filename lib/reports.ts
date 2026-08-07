import { supabase } from "@/lib/supabase";
import { EMAIL_CATEGORIES } from "@/lib/types";
import type { EmailCategory } from "@/lib/types";

export type ReportsData = {
  categoryCounts: Partial<Record<EmailCategory, number>>;
  totalEmails: number;
  averageUrgency: number;
  totalDrafts: number;
  autoSentCount: number;
  autoSendRate: number;
  totalEdits: number;
  editsByTemplate: { templateCategory: string; count: number }[];
  emailsByDay: { date: string; count: number }[];
};

export async function fetchReportsData(): Promise<ReportsData> {
  const [emailsResult, draftsResult, editsResult, templatesResult] =
    await Promise.all([
      supabase.from("emails").select("category, urgency_score, created_at"),
      supabase.from("drafts").select("status"),
      supabase.from("template_edits").select("template_id"),
      supabase.from("templates").select("id, category"),
    ]);

  if (emailsResult.error) throw new Error(emailsResult.error.message);
  if (draftsResult.error) throw new Error(draftsResult.error.message);
  if (editsResult.error) throw new Error(editsResult.error.message);
  if (templatesResult.error) throw new Error(templatesResult.error.message);

  const emails = emailsResult.data ?? [];
  const drafts = draftsResult.data ?? [];
  const edits = editsResult.data ?? [];
  const templates = templatesResult.data ?? [];

  // Category counts
  const categoryCounts: Partial<Record<EmailCategory, number>> = {};
  for (const email of emails) {
    if (email.category) {
      categoryCounts[email.category as EmailCategory] =
        (categoryCounts[email.category as EmailCategory] ?? 0) + 1;
    }
  }

  // Average urgency
  const urgencyValues = emails
    .map((e) => e.urgency_score)
    .filter((v): v is number => v !== null);
  const averageUrgency =
    urgencyValues.length > 0
      ? urgencyValues.reduce((sum, v) => sum + v, 0) / urgencyValues.length
      : 0;

  // Auto-send rate
  const totalDrafts = drafts.length;
  const autoSentCount = drafts.filter((d) => d.status === "auto_sent").length;
  const autoSendRate = totalDrafts > 0 ? autoSentCount / totalDrafts : 0;

  // Edits by template (mapped to category names for readability)
  const templateIdToCategory = new Map(
    templates.map((t) => [t.id, t.category]),
  );
  const editCountByTemplateId: Record<string, number> = {};
  for (const edit of edits) {
    if (edit.template_id) {
      editCountByTemplateId[edit.template_id] =
        (editCountByTemplateId[edit.template_id] ?? 0) + 1;
    }
  }
  const editsByTemplate = Object.entries(editCountByTemplateId).map(
    ([templateId, count]) => ({
      templateCategory: templateIdToCategory.get(templateId) ?? "unknown",
      count,
    }),
  );

  // Emails by day (last 7 distinct days present in data)
  const countsByDay: Record<string, number> = {};
  for (const email of emails) {
    const day = email.created_at.slice(0, 10); // YYYY-MM-DD
    countsByDay[day] = (countsByDay[day] ?? 0) + 1;
  }
  const emailsByDay = Object.entries(countsByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, count]) => ({ date, count }));

  return {
    categoryCounts,
    totalEmails: emails.length,
    averageUrgency,
    totalDrafts,
    autoSentCount,
    autoSendRate,
    totalEdits: edits.length,
    editsByTemplate,
    emailsByDay,
  };
}
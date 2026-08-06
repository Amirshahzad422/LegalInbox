export type DraftStatus =
  | "pending"
  | "approved"
  | "sent"
  | "auto_sent"
  | "discarded";

export type Draft = {
  id: string;
  email_id: string;
  template_id: string | null;
  generated_text: string;
  confidence_score: number | null;
  auto_send_eligible: boolean;
  status: DraftStatus;
  created_at: string;
};
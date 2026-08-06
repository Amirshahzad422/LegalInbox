import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";
import { EMAIL_CATEGORIES, type EmailCategory } from "@/lib/types";

export type ClassificationResult = {
  category: EmailCategory;
  urgency_score: number;
};

function buildPrompt(subject: string, body: string): string {
  return `You are classifying inbound emails for a law firm inbox.

Classify the email below into exactly ONE of these categories:
- new_inquiry
- document_request
- scheduling
- billing
- court_deadline
- opposing_counsel
- spam

Assign an urgency_score between 0 and 1 based on the real stakes and tone of the content, not just keywords. Higher scores reflect greater time sensitivity or legal/financial risk.

Respond with ONLY valid JSON in this exact shape. Do not include markdown, code fences, or any explanation:
{"category":"<one category>","urgency_score":<number between 0 and 1>}

Email subject: ${subject}

Email body:
${body}`;
}

function parseClassification(text: string): ClassificationResult {
  const trimmed = text.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  const parsed = JSON.parse(trimmed) as Partial<ClassificationResult>;

  if (
    typeof parsed.category !== "string" ||
    !EMAIL_CATEGORIES.includes(parsed.category as EmailCategory)
  ) {
    throw new Error("Invalid category in model response");
  }

  if (
    typeof parsed.urgency_score !== "number" ||
    parsed.urgency_score < 0 ||
    parsed.urgency_score > 1
  ) {
    throw new Error("Invalid urgency_score in model response");
  }

  return {
    category: parsed.category as EmailCategory,
    urgency_score: parsed.urgency_score,
  };
}

const MAX_BODY_CHARS = 6000; // keeps requests safely under Groq's 12k TPM limit

export async function classifyEmail(
  subject: string,
  body: string,
): Promise<ClassificationResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const truncatedBody =
    body.length > MAX_BODY_CHARS
      ? body.slice(0, MAX_BODY_CHARS) + "\n\n[...truncated for length...]"
      : body;

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: buildPrompt(subject, truncatedBody),
      },
    ],
  });
}
export async function classifyAndUpdateEmail(
  emailId: string,
  subject: string,
  body: string,
) {
  const result = await classifyEmail(subject, body);

  const { data, error } = await supabase
    .from("emails")
    .update({
      category: result.category,
      urgency_score: result.urgency_score,
    })
    .eq("id", emailId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`No email found with id ${emailId}`);
  }

return data;
}


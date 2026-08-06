import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";
import type { Draft } from "@/lib/types";

const MAX_BODY_CHARS = 6000;

function buildDraftPrompt(
  emailSubject: string,
  emailBody: string,
  templateBody: string,
  voiceProfile: string | null,
): string {
  return `You are drafting a reply email for a law firm attorney.

Use the following reply TEMPLATE as the structural basis for the response, but personalize the wording and tone to match the attorney's own writing voice shown below. Fill in any bracketed placeholders (like [MATTER_NAME] or [PROPOSED_TIMES]) with reasonable specifics inferred from the original email, or leave a natural placeholder if no specific detail is available.

TEMPLATE:
${templateBody}

ATTORNEY'S VOICE SAMPLE (match this tone and style, not the content):
${voiceProfile || "No sample provided — use a professional, courteous tone."}

ORIGINAL EMAIL:
Subject: ${emailSubject}
Body: ${emailBody}

Respond with ONLY the drafted reply text. Do not include a subject line, do not include any explanation, greeting like "Here is the draft", or markdown formatting — just the email body text itself.`;
}

export async function generateDraft(emailId: string): Promise<Draft> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  // 1. Fetch the email
  const { data: email, error: emailError } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .single();

  if (emailError) throw new Error(emailError.message);
  if (!email) throw new Error("Email not found");
  if (!email.category) {
    throw new Error("Email has no category — classify it before drafting");
  }

  // 2. Find the latest version template for that category
  const { data: templates, error: templateError } = await supabase
    .from("templates")
    .select("*")
    .eq("category", email.category)
    .order("version", { ascending: false })
    .limit(1);

  if (templateError) throw new Error(templateError.message);
  const template = templates?.[0] ?? null;

  if (!template) {
    throw new Error(`No template found for category "${email.category}"`);
  }

  // 3. Get the assigned staff's voice profile (or fall back to the first staff member)
  let voiceProfile: string | null = null;
  const staffId = email.assigned_staff_id;

  if (staffId) {
    const { data: staffMember } = await supabase
      .from("staff")
      .select("voice_profile")
      .eq("id", staffId)
      .single();
    voiceProfile = staffMember?.voice_profile ?? null;
  } else {
    const { data: fallbackStaff } = await supabase
      .from("staff")
      .select("voice_profile")
      .limit(1)
      .single();
    voiceProfile = fallbackStaff?.voice_profile ?? null;
  }

  // 4. Generate the draft via Groq
  const truncatedBody =
    (email.body ?? "").length > MAX_BODY_CHARS
      ? email.body.slice(0, MAX_BODY_CHARS) + "\n\n[...truncated...]"
      : email.body ?? "";

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: buildDraftPrompt(
          email.subject ?? "",
          truncatedBody,
          template.body,
          voiceProfile,
        ),
      },
    ],
  });

  const generatedText = completion.choices[0]?.message?.content;
  if (!generatedText) {
    throw new Error("Empty response from Groq");
  }

  // 5. Compute a simple confidence score: high urgency + spam/routine categories
  // are treated as more "routine" and thus higher confidence for auto-send purposes.
  const confidenceScore = email.urgency_score !== null
    ? Math.max(0, 1 - Math.abs(email.urgency_score - 0.3))
    : 0.5;

  // 6. Determine auto-send eligibility
  const autoSendEligible =
    template.auto_send_enabled && confidenceScore >= template.confidence_threshold;

  // 7. Save the draft
  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .insert({
      email_id: emailId,
      template_id: template.id,
      generated_text: generatedText.trim(),
      confidence_score: confidenceScore,
      auto_send_eligible: autoSendEligible,
      status: autoSendEligible ? "auto_sent" : "pending",
    })
    .select()
    .single();

  if (draftError) throw new Error(draftError.message);

  // 8. Update the email's status to reflect a draft now exists
  await supabase
    .from("emails")
    .update({ status: "drafted" })
    .eq("id", emailId);

  return draft;
}
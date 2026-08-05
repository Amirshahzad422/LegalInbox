import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "new_inquiry",
  "document_request",
  "scheduling",
  "billing",
  "court_deadline",
  "opposing_counsel",
  "spam",
] as const;

type Category = (typeof CATEGORIES)[number];

type ClassificationResult = {
  category: Category;
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
    !CATEGORIES.includes(parsed.category as Category)
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
    category: parsed.category as Category,
    urgency_score: parsed.urgency_score,
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const payload = (await request.json()) as {
      subject?: unknown;
      body?: unknown;
      email_id?: unknown;
    };

    if (typeof payload.subject !== "string" || typeof payload.body !== "string") {
      return NextResponse.json(
        { error: "Request body must include subject and body strings" },
        { status: 400 },
      );
    }

    if (
      payload.email_id !== undefined &&
      typeof payload.email_id !== "string"
    ) {
      return NextResponse.json(
        { error: "email_id must be a string when provided" },
        { status: 400 },
      );
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: buildPrompt(payload.subject, payload.body),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Empty response from Groq");
    }

    const result = parseClassification(text);

    if (payload.email_id) {
      const { data, error } = await supabase
        .from("emails")
        .update({
          category: result.category,
          urgency_score: result.urgency_score,
        })
        .eq("id", payload.email_id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error(`No email found with id ${payload.email_id}`);
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Classification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

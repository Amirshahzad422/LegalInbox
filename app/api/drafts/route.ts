import { NextResponse } from "next/server";
import { generateDraft } from "@/lib/drafts";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email_id?: unknown };

    if (typeof payload.email_id !== "string") {
      return NextResponse.json(
        { error: "email_id is required" },
        { status: 400 },
      );
    }

    const draft = await generateDraft(payload.email_id);
    return NextResponse.json(draft);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
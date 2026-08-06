import { NextResponse } from "next/server";
import {
  classifyAndUpdateEmail,
  classifyEmail,
} from "@/lib/classify";


export async function POST(request: Request) {
  try {
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

    if (payload.email_id) {
      const data = await classifyAndUpdateEmail(
        payload.email_id,
        payload.subject,
        payload.body,
      );
      return NextResponse.json(data);
    }

    const result = await classifyEmail(payload.subject, payload.body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Classification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

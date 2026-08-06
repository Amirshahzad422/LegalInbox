import { NextResponse } from "next/server";
import { createTemplate } from "@/lib/templates";
import { EMAIL_CATEGORIES } from "@/lib/types";
import type { EmailCategory } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      category?: unknown;
      body?: unknown;
    };

    if (
      typeof payload.category !== "string" ||
      !EMAIL_CATEGORIES.includes(payload.category as EmailCategory)
    ) {
      return NextResponse.json(
        { error: "Valid category is required" },
        { status: 400 },
      );
    }

    if (typeof payload.body !== "string" || !payload.body.trim()) {
      return NextResponse.json(
        { error: "Template body is required" },
        { status: 400 },
      );
    }

    const template = await createTemplate(
      payload.category as EmailCategory,
      payload.body,
    );

    return NextResponse.json(template);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { updateTemplateAsNewVersion } from "@/lib/templates";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as { body?: unknown };

    if (typeof payload.body !== "string" || !payload.body.trim()) {
      return NextResponse.json(
        { error: "Template body is required" },
        { status: 400 },
      );
    }

    const template = await updateTemplateAsNewVersion(id, payload.body);
    return NextResponse.json(template);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
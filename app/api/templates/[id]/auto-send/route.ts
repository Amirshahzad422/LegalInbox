import { NextResponse } from "next/server";
import { toggleAutoSend } from "@/lib/templates";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as { enabled?: unknown };

    if (typeof payload.enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled must be a boolean" },
        { status: 400 },
      );
    }

    await toggleAutoSend(id, payload.enabled);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle auto-send";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
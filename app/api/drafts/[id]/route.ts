import { NextResponse } from "next/server";
import {
  approveDraft,
  discardDraft,
  editAndApproveDraft,
} from "@/lib/drafts";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as {
      action?: unknown;
      edited_text?: unknown;
    };

    if (payload.action === "approve") {
      await approveDraft(id);
      return NextResponse.json({ success: true });
    }

    if (payload.action === "discard") {
      await discardDraft(id);
      return NextResponse.json({ success: true });
    }

    if (payload.action === "edit_and_approve") {
      if (typeof payload.edited_text !== "string") {
        return NextResponse.json(
          { error: "edited_text is required" },
          { status: 400 },
        );
      }
      await editAndApproveDraft(id, payload.edited_text);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
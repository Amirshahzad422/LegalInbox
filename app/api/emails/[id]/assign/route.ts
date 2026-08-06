import { NextResponse } from "next/server";
import { assignStaffToEmail } from "@/lib/emails";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as { staff_id?: unknown };

    if (payload.staff_id !== null && typeof payload.staff_id !== "string") {
      return NextResponse.json(
        { error: "staff_id must be a string or null" },
        { status: 400 },
      );
    }

    await assignStaffToEmail(id, payload.staff_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to assign staff";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { updateVoiceProfile } from "@/lib/staff";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as { voice_profile?: unknown };

    if (typeof payload.voice_profile !== "string") {
      return NextResponse.json(
        { error: "voice_profile must be a string" },
        { status: 400 },
      );
    }

    await updateVoiceProfile(id, payload.voice_profile);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update voice profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
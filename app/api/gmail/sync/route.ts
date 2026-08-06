import { NextResponse } from "next/server";
import { deleteGmailConnection } from "@/lib/gmail/connections";
import {
  syncAllGmailConnections,
  syncGmailConnectionById,
} from "@/lib/gmail/sync";

function isAuthorizedCron(request: Request): boolean {
  const cronSecret = process.env.GMAIL_SYNC_SECRET;
  if (!cronSecret) return true;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as {
      connection_id?: unknown;
      limit?: unknown;
    };

    const limit =
      typeof payload.limit === "number" && payload.limit > 0
        ? Math.min(payload.limit, 100)
        : 25;

    if (typeof payload.connection_id === "string") {
      const result = await syncGmailConnectionById(payload.connection_id, limit);
      return NextResponse.json({ results: [result] });
    }

    const results = await syncAllGmailConnections(limit);
    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gmail sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json()) as { connection_id?: unknown };

    if (typeof payload.connection_id !== "string") {
      return NextResponse.json(
        { error: "connection_id is required" },
        { status: 400 },
      );
    }

    await deleteGmailConnection(payload.connection_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to disconnect Gmail";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

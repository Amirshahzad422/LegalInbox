import { NextResponse } from "next/server";
import {
  getGmailConnections,
  toPublicConnection,
} from "@/lib/gmail/connections";
import { isGoogleOAuthConfigured } from "@/lib/gmail/config";

export async function GET() {
  try {
    const connections = await getGmailConnections();

    return NextResponse.json({
      configured: isGoogleOAuthConfigured(),
      connections: connections.map(toPublicConnection),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Gmail status";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

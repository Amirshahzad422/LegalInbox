import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { isGoogleOAuthConfigured } from "@/lib/gmail/config";
import {
  createOAuthState,
  setOAuthCookies,
} from "@/lib/gmail/oauth-cookies";
import { getGmailAuthUrl } from "@/lib/gmail/oauth";

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get("staff_id");

  const state = createOAuthState();
  await setOAuthCookies(state, staffId);

  redirect(getGmailAuthUrl(state));
}

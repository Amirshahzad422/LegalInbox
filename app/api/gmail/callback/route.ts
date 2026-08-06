import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { upsertGmailConnection } from "@/lib/gmail/connections";
import { isGoogleOAuthConfigured } from "@/lib/gmail/config";
import { exchangeCodeForTokens } from "@/lib/gmail/oauth";
import { readAndClearOAuthCookies } from "@/lib/gmail/oauth-cookies";

function settingsRedirect(query: string) {
  redirect(`/settings?${query}`);
}

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth is not configured." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const oauthError = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (oauthError) {
    settingsRedirect(`gmail=error&message=${encodeURIComponent(oauthError)}`);
  }

  const { state: expectedState, staffId } = await readAndClearOAuthCookies();

  if (!code || !state || !expectedState || state !== expectedState) {
    settingsRedirect("gmail=error&message=Invalid+OAuth+state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code!);
    await upsertGmailConnection({
      ...tokens,
      staff_id: staffId,
    });

    settingsRedirect("gmail=connected");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gmail connection failed";
    settingsRedirect(`gmail=error&message=${encodeURIComponent(message)}`);
  }

  return NextResponse.json({ error: "Unexpected callback state" }, { status: 500 });
}

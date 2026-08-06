import { google } from "googleapis";
import { getGoogleOAuthConfig } from "@/lib/gmail/config";
import type { GmailConnection } from "@/lib/types";
import {
  getGmailConnectionById,
  updateGmailTokens,
} from "@/lib/gmail/connections";

export function createOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGmailAuthUrl(state: string): string {
  const { scopes } = getGoogleOAuthConfig();
  const client = createOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    throw new Error(
      "Google did not return the required OAuth tokens. Try reconnecting with consent.",
    );
  }

  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const profile = await oauth2.userinfo.get();
  const gmailAddress = profile.data.email;

  if (!gmailAddress) {
    throw new Error("Could not determine the connected Gmail address.");
  }

  return {
    gmail_address: gmailAddress,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: new Date(tokens.expiry_date),
  };
}

export async function getAuthorizedGmailClient(connection: GmailConnection) {
  const client = createOAuthClient();
  client.setCredentials({
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
    expiry_date: new Date(connection.token_expires_at).getTime(),
  });

  const expiresAt = new Date(connection.token_expires_at).getTime();
  const needsRefresh = Date.now() >= expiresAt - 60_000;

  if (needsRefresh) {
    const { credentials } = await client.refreshAccessToken();

    if (!credentials.access_token || !credentials.expiry_date) {
      throw new Error("Failed to refresh Gmail access token.");
    }

    await updateGmailTokens(connection.id, {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token ?? undefined,
      token_expires_at: new Date(credentials.expiry_date),
    });

    client.setCredentials(credentials);
  }

  return google.gmail({ version: "v1", auth: client });
}

export async function getAuthorizedGmailClientById(connectionId: string) {
  const connection = await getGmailConnectionById(connectionId);

  if (!connection) {
    throw new Error(`Gmail connection ${connectionId} not found.`);
  }

  return {
    connection,
    gmail: await getAuthorizedGmailClient(connection),
  };
}

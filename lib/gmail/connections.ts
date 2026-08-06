import { supabase } from "@/lib/supabase";
import type { GmailConnection, GmailConnectionPublic } from "@/lib/types";

export function toPublicConnection(
  connection: GmailConnection,
): GmailConnectionPublic {
  return {
    id: connection.id,
    staff_id: connection.staff_id,
    gmail_address: connection.gmail_address,
    last_sync_at: connection.last_sync_at,
    created_at: connection.created_at,
  };
}

export async function getGmailConnections(): Promise<GmailConnection[]> {
  const { data, error } = await supabase
    .from("gmail_connections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GmailConnection[];
}

export async function getGmailConnectionById(
  id: string,
): Promise<GmailConnection | null> {
  const { data, error } = await supabase
    .from("gmail_connections")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as GmailConnection | null) ?? null;
}

export async function upsertGmailConnection(input: {
  gmail_address: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: Date;
  staff_id?: string | null;
}): Promise<GmailConnection> {
  let staffId = input.staff_id ?? null;

  if (!staffId) {
    const { data: staffMatch } = await supabase
      .from("staff")
      .select("id")
      .eq("email", input.gmail_address)
      .maybeSingle();

    staffId = staffMatch?.id ?? null;
  }

  const { data, error } = await supabase
    .from("gmail_connections")
    .upsert(
      {
        gmail_address: input.gmail_address,
        access_token: input.access_token,
        refresh_token: input.refresh_token,
        token_expires_at: input.token_expires_at.toISOString(),
        staff_id: staffId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "gmail_address" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GmailConnection;
}

export async function updateGmailTokens(
  connectionId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    token_expires_at: Date;
  },
): Promise<GmailConnection> {
  const payload: Record<string, string> = {
    access_token: tokens.access_token,
    token_expires_at: tokens.token_expires_at.toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (tokens.refresh_token) {
    payload.refresh_token = tokens.refresh_token;
  }

  const { data, error } = await supabase
    .from("gmail_connections")
    .update(payload)
    .eq("id", connectionId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GmailConnection;
}

export async function markGmailSynced(connectionId: string): Promise<void> {
  const { error } = await supabase
    .from("gmail_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", connectionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteGmailConnection(connectionId: string): Promise<void> {
  const { error } = await supabase
    .from("gmail_connections")
    .delete()
    .eq("id", connectionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function emailExistsByGmailMessageId(
  gmailMessageId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("emails")
    .select("id")
    .eq("gmail_message_id", gmailMessageId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function insertImportedEmail(input: {
  sender: string;
  subject: string;
  body: string;
  gmail_message_id: string;
  assigned_staff_id?: string | null;
}) {
  const { data, error } = await supabase
    .from("emails")
    .insert({
      sender: input.sender,
      subject: input.subject,
      body: input.body,
      gmail_message_id: input.gmail_message_id,
      assigned_staff_id: input.assigned_staff_id ?? null,
      status: "needs_reply",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

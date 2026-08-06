import { randomBytes } from "crypto";
import { cookies } from "next/headers";

const STATE_COOKIE = "gmail_oauth_state";
const STAFF_COOKIE = "gmail_oauth_staff_id";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 10,
  path: "/",
};

export function createOAuthState(): string {
  return randomBytes(16).toString("hex");
}

export async function setOAuthCookies(state: string, staffId?: string | null) {
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, cookieOptions);

  if (staffId) {
    cookieStore.set(STAFF_COOKIE, staffId, cookieOptions);
  } else {
    cookieStore.delete(STAFF_COOKIE);
  }
}

export async function readAndClearOAuthCookies(): Promise<{
  state: string | null;
  staffId: string | null;
}> {
  const cookieStore = await cookies();
  const state = cookieStore.get(STATE_COOKIE)?.value ?? null;
  const staffId = cookieStore.get(STAFF_COOKIE)?.value ?? null;

  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(STAFF_COOKIE);

  return { state, staffId };
}

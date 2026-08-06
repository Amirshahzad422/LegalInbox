import { supabase } from "@/lib/supabase";
import type { Staff } from "@/lib/types";

export async function fetchStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function updateVoiceProfile(
  staffId: string,
  voiceProfile: string,
): Promise<void> {
  const { error } = await supabase
    .from("staff")
    .update({ voice_profile: voiceProfile })
    .eq("id", staffId);

  if (error) {
    throw new Error(error.message);
  }
}
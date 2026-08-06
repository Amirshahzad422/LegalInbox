import { supabase } from "@/lib/supabase";
import type { EmailCategory, Template } from "@/lib/types";

export async function fetchTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .order("category", { ascending: true })
    .order("version", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createTemplate(
  category: EmailCategory,
  body: string,
): Promise<Template> {
  const { data, error } = await supabase
    .from("templates")
    .insert({ category, body, version: 1 })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Editing a template creates a NEW version row rather than overwriting history,
// per the task spec ("Version templates so an update does not overwrite history").
export async function updateTemplateAsNewVersion(
  templateId: string,
  newBody: string,
): Promise<Template> {
  const { data: existing, error: fetchError } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const { data, error } = await supabase
    .from("templates")
    .insert({
      category: existing.category,
      body: newBody,
      version: existing.version + 1,
      auto_send_enabled: existing.auto_send_enabled,
      confidence_threshold: existing.confidence_threshold,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function toggleAutoSend(
  templateId: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("templates")
    .update({ auto_send_enabled: enabled })
    .eq("id", templateId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchEditCountsByTemplate(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from("template_edits")
      .select("template_id");
  
    if (error) throw new Error(error.message);
  
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      if (row.template_id) {
        counts[row.template_id] = (counts[row.template_id] ?? 0) + 1;
      }
    }
    return counts;
  }
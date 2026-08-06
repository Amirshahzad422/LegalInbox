import TemplateManager from "@/components/TemplateManager";
import { fetchTemplates, fetchEditCountsByTemplate } from "@/lib/templates";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  try {
    const [templates, editCounts] = await Promise.all([
      fetchTemplates(),
      fetchEditCountsByTemplate(),
    ]);

    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Templates
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Manage reply templates by category, versioned automatically on edit.
        </p>
        <TemplateManager initialTemplates={templates} editCounts={editCounts} />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load templates";
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {message}
        </div>
      </div>
    );
  }
}
import StaffManager from "@/components/StaffManager";
import { fetchStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  try {
    const staff = await fetchStaff();

    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Staff
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Manage attorney voice profiles used to personalize AI-drafted replies.
        </p>
        <StaffManager initialStaff={staff} />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load staff";
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Staff</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {message}
        </div>
      </div>
    );
  }
}
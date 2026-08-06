"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StaffOption = { id: string; name: string };

export default function AssignStaffDropdown({
  emailId,
  currentStaffId,
  staffOptions,
}: {
  emailId: string;
  currentStaffId: string | null;
  staffOptions: StaffOption[];
}) {
  const [value, setValue] = useState(currentStaffId ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(newValue: string) {
    setValue(newValue);
    setLoading(true);
    try {
      const res = await fetch(`/api/emails/${emailId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: newValue || null }),
      });
      if (!res.ok) throw new Error("Failed to assign");
      router.refresh();
    } catch (err) {
      alert("Failed to assign staff");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <option value="">Unassigned</option>
      {staffOptions.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
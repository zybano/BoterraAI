"use client";

import { useState, useTransition } from "react";
import { Play } from "lucide-react";
import { runRoutine } from "../actions";

export function RunRoutineButton({ routineId }: { routineId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className="btn-secondary px-3 py-2 text-xs"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await runRoutine(routineId);
            setError(result.error ?? null);
          })
        }
      >
        <Play className="h-3.5 w-3.5" /> {pending ? "Running…" : "Run now"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

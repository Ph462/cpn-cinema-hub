import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getSaved, saveFilm } from "@/lib/offline";

type Props = { id: string; title: string; poster: string; url: string; name: string };

export function SaveOfflineButton(p: Props) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pct, setPct] = useState(0);
  useEffect(() => {
    getSaved(p.id).then((f) => f && setState("saved")).catch(() => {});
  }, [p.id]);

  if (state === "saved")
    return (
      <Link to="/downloads" className="rounded-full border border-accent px-6 py-2.5 text-sm font-semibold text-accent">
        ✓ Saved offline — open My downloads
      </Link>
    );
  return (
    <button
      type="button"
      disabled={state === "saving"}
      onClick={async () => {
        setState("saving");
        setPct(0);
        try {
          await saveFilm(p, setPct);
          setState("saved");
        } catch {
          setState("error");
        }
      }}
      className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-70"
    >
      {state === "saving" ? `Saving… ${pct}%` : state === "error" ? "Retry save offline" : "📥 Save offline in app"}
    </button>
  );
}

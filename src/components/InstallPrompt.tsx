import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    if (standalone || localStorage.getItem("cpn-install-dismissed")) return;
    const onBip = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isIos) {
      setIos(true);
      t = setTimeout(() => setShow(true), 3000);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      if (t) clearTimeout(t);
    };
  }, []);

  if (!show) return null;
  const dismiss = () => {
    localStorage.setItem("cpn-install-dismissed", "1");
    setShow(false);
  };

  return (
    <div role="dialog" aria-label="Install CPN Movies" className="fixed inset-x-3 bottom-3 z-90 mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-glow animate-fade-in">
      <div className="flex items-start gap-3">
        <img src="/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Install CPN Movies</p>
          {ios ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the <span className="font-semibold text-foreground">Share</span> button below, then choose{" "}
              <span className="font-semibold text-foreground">Add to Home Screen</span>.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Open it like an app, even without internet.</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={dismiss} className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground">
          Not now
        </button>
        {evt ? (
          <button
            type="button"
            onClick={async () => {
              await evt.prompt();
              await evt.userChoice;
              setEvt(null);
              setShow(false);
            }}
            className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
          >
            Install
          </button>
        ) : null}
      </div>
    </div>
  );
}

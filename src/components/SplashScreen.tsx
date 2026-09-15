import { useEffect, useState } from "react";

export function SplashScreen() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const a = setTimeout(() => setFading(true), 1700);
    const b = setTimeout(() => setGone(true), 2500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="relative flex flex-col items-center">
        
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground shadow-glow">
             CPN
          </span>
          
          <div>
          <span className="text-4xl font-black tracking-tight text-foreground">
            CPN 
            <span className="text-primary">Movies</span>
          </span>
        </div>
        <p className="mt-3 text-sm tracking-[0.35em] text-muted-foreground uppercase">
          Movies · Series · Music
        </p>
        <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/3 animate-splash-bar rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

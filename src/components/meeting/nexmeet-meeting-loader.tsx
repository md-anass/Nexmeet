"use client";

import { useEffect, useState } from "react";
import { NexMeetBrand } from "@/components/brand/nexmeet-brand";

export function NexMeetMeetingLoader({ label = "Connecting to your meeting..." }: { label?: string }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showStatic, setShowStatic] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#020817] px-6 pt-[env(safe-area-inset-top)] text-center text-white">
    {reducedMotion || showStatic ? <NexMeetBrand /> : <video src="/brand/nexmeet-intro.mp4" autoPlay muted playsInline aria-label="NexMeet" className="h-36 w-36 rounded-3xl object-cover" onError={() => setShowStatic(true)} onEnded={() => setShowStatic(true)} />}
    <div className="absolute mt-64"><p className="text-sm font-medium text-slate-300">{label}</p><span className="mt-4 inline-flex gap-1" aria-hidden="true"><i className="size-1.5 animate-pulse rounded-full bg-cyan-300" /><i className="size-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:150ms]" /><i className="size-1.5 animate-pulse rounded-full bg-violet-400 [animation-delay:300ms]" /></span></div>
  </div>;
}

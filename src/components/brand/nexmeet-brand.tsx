import Image from "next/image";

type NexMeetBrandProps = { compact?: boolean; className?: string };

export function NexMeetBrand({ compact = false, className = "" }: NexMeetBrandProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className={`${compact ? "size-10" : "size-16"} grid shrink-0 place-items-center overflow-hidden rounded-[var(--nm-radius-md)] border border-slate-200 bg-white shadow-sm`}>
        <Image unoptimized src="/brand/logo.png" alt="" width={compact ? 72 : 112} height={compact ? 40 : 63} className="h-auto w-full object-contain" />
      </span>
      {!compact && <span className="ml-3"><span className="block text-xl font-bold tracking-[-0.04em] text-current">Nex<span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">Meet</span></span><span className="mt-0.5 block text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-cyan-500">Connect · Meet · Together</span></span>}
    </span>
  );
}

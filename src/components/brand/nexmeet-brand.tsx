type NexMeetBrandProps = { compact?: boolean; className?: string };

export function NexMeetBrand({ compact = false, className = "" }: NexMeetBrandProps) {
  return <div className={`flex items-center ${className}`}>
    <img src="/brand/nexmeet-logo.png" alt="NexMeet" className={compact ? "h-10 w-10 rounded-xl object-cover object-[50%_18%]" : "h-28 w-28 rounded-3xl object-contain"} />
    {!compact && <div className="ml-4"><p className="text-2xl font-semibold tracking-tight text-white">NexMeet</p><p className="mt-1 text-[0.65rem] font-medium tracking-[0.28em] text-cyan-300">CONNECT | MEET | TOGETHER</p></div>}
  </div>;
}

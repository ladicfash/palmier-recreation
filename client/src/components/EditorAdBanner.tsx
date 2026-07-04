interface EditorAdBannerProps {
  position?: "top" | "bottom";
}

export default function EditorAdBanner({ position = "top" }: EditorAdBannerProps) {
  const publisherId = import.meta.env.VITE_ADSTERRA_ID || "";
  const carbonId = import.meta.env.VITE_CARBON_ADS_ID || "";

  // If live ad keys exist, render live container
  if (publisherId || carbonId) {
    return (
      <div className={`w-full bg-card/90 border-border flex items-center justify-center px-4 py-2 ${position === "top" ? "border-b h-16" : "border-t h-24"}`}>
        {publisherId && (
          <div
            data-adsterra-pub-id={publisherId}
            data-adsterra-placement={position === "top" ? "5892184" : "5892185"}
            className="w-full h-full flex items-center justify-center"
          />
        )}
      </div>
    );
  }

  // Stage / Preview Sponsored Banner Space (ensures visual ad space exists during staging)
  return (
    <div className={`w-full bg-[#111111] border-border flex items-center justify-between px-6 py-2.5 select-none ${position === "top" ? "border-b h-12" : "border-t h-20"}`}>
      <div className="flex items-center gap-3">
        <span className="bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
          Sponsored Space
        </span>
        <span className="text-xs font-semibold text-white/70">
          {position === "top" ? "Top Editor Leaderboard Banner (728x90 / Full Strip)" : "Bottom Workspace Sponsor Strip (Dual 468x60 Placement)"}
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-[11px] text-white/40 font-mono">
        <span>[ ADSTERRA / CARBON ADS COMPATIBLE ]</span>
        <span className="text-[#10b981]/70 underline cursor-pointer hover:text-[#10b981]">Advertise Here ➔</span>
      </div>
    </div>
  );
}

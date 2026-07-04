interface EditorAdBannerProps {
  position?: "top" | "bottom";
}

export default function EditorAdBanner({ position = "top" }: EditorAdBannerProps) {
  const publisherId = import.meta.env.VITE_ADSTERRA_ID || "";
  const carbonId = import.meta.env.VITE_CARBON_ADS_ID || "";

  // If live ad keys exist, render live container
  if (publisherId || carbonId) {
    return (
      <div className={`w-full bg-zinc-900 border-zinc-800 flex items-center justify-center px-4 py-2 ${position === "top" ? "border-b h-14" : "border-t h-20"}`}>
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

  // Staging Sponsored Space
  return (
    <div className={`w-full bg-zinc-900/80 border-zinc-800/80 flex items-center justify-between px-6 py-2 select-none ${position === "top" ? "border-b h-11" : "border-t h-16"}`}>
      <div className="flex items-center gap-3">
        <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-medium text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
          Sponsored Placement
        </span>
        <span className="text-xs font-medium text-zinc-400">
          {position === "top" ? "Top Editor Leaderboard Strip (728x90)" : "Bottom Workspace Sponsor Unit (Dual 468x60)"}
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-[11px] text-zinc-500 font-mono">
        <span>[ ADSTERRA / CARBON ADS ]</span>
        <span className="text-zinc-400 underline cursor-pointer hover:text-zinc-200">Advertise Here ➔</span>
      </div>
    </div>
  );
}

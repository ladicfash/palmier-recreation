interface EditorAdBannerProps {
  position?: "top" | "bottom" | "sidebar";
}

export default function EditorAdBanner({ position = "top" }: EditorAdBannerProps) {
  const publisherId = import.meta.env.VITE_ADSTERRA_ID || "";
  const carbonId = import.meta.env.VITE_CARBON_ADS_ID || "";

  // If live ad keys exist, render live container
  if (publisherId || carbonId) {
    if (position === "sidebar") {
      return (
        <div className="w-full bg-zinc-950 border-t border-zinc-800/80 p-3 flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Sponsored Space</span>
          <div
            data-adsterra-pub-id={publisherId}
            data-adsterra-placement="5892186"
            className="w-full h-[180px] flex items-center justify-center bg-zinc-900/60 rounded border border-zinc-800"
          />
        </div>
      );
    }

    return (
      <div className={`w-full bg-zinc-950 border-zinc-800/80 flex items-center justify-center px-4 py-2.5 ${position === "top" ? "border-b min-h-[60px]" : "border-t min-h-[96px]"}`}>
        {publisherId && (
          <div
            data-adsterra-pub-id={publisherId}
            data-adsterra-placement={position === "top" ? "5892184" : "5892185"}
            className="w-full h-full flex items-center justify-center max-w-6xl mx-auto"
          />
        )}
      </div>
    );
  }

  // Staging Sponsored Space with generous visual dimensions
  if (position === "sidebar") {
    return (
      <div className="w-full bg-zinc-950 border-t border-zinc-800/80 p-3.5 flex flex-col items-center justify-center gap-2 select-none min-h-[190px]">
        <div className="flex items-center justify-between w-full">
          <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
            Sponsored
          </span>
          <span className="text-[10px] font-mono text-zinc-500">300x250</span>
        </div>
        <div className="w-full flex-1 min-h-[120px] bg-zinc-900/60 rounded border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center p-3 gap-1">
          <span className="text-xs font-semibold text-zinc-300">Inspector Partner Unit</span>
          <span className="text-[10px] text-zinc-500">High-visibility sidebar rectangle placement</span>
        </div>
      </div>
    );
  }

  if (position === "bottom") {
    return (
      <div className="w-full bg-zinc-950 border-t border-zinc-800/80 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 select-none min-h-[80px]">
        <div className="flex items-center gap-3">
          <span className="bg-zinc-900 border border-zinc-800 text-yellow-400 font-mono font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
            Sponsored
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">Studio Partner Leaderboard (728x90)</span>
            <span className="text-[10px] text-zinc-500">Premium placement below timeline workspace</span>
          </div>
        </div>
        <div className="flex-1 max-w-3xl h-14 bg-zinc-900/80 rounded border border-dashed border-zinc-800 flex items-center justify-center gap-6 px-4">
          <span className="text-[11px] font-mono text-zinc-400">[ PROMOTED AI PRODUCTION SUITE / ADSTERRA UNIT ]</span>
          <span className="text-[10px] text-yellow-500 underline cursor-pointer font-mono font-semibold hover:text-yellow-400">Advertise Here</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between px-6 py-3 select-none gap-2 min-h-[56px]">
      <div className="flex items-center gap-3">
        <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono font-medium text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
          Sponsored Placement
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-xs font-semibold text-zinc-300">
            Top Studio Leaderboard Strip (728x90)
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono">
        <span className="hidden lg:inline-block">[ ADSTERRA / CARBON ADS / PROMOTED TOOLS ]</span>
        <span className="text-zinc-400 underline cursor-pointer hover:text-zinc-200">Advertise Here</span>
      </div>
    </div>
  );
}

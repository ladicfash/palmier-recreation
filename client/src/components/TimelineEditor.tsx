import { useState, useRef, useEffect } from "react";
import { Scissors, Zap, Layers, Type, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface TimelineClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  type: "video" | "audio" | "text";
  opacity: number;
  speed: number;
}

interface SceneMarker {
  id: number;
  timestamp: number;
  confidence: number;
}

interface Caption {
  id: string;
  startTime: number; // ms
  endTime: number;   // ms
  text: string;
}

interface LayerItem {
  id: string;
  name: string;
  type: string;
  startTime: number;
  endTime: number;
}

interface TimelineEditorProps {
  duration: number;
  currentTime: number;
  clips: TimelineClip[];
  scenes: SceneMarker[];
  captions?: Caption[];
  layers?: LayerItem[];
  onSeek: (time: number) => void;
  onTrimStart: (time: number) => void;
  onTrimEnd: (time: number) => void;
  trimStart: number;
  trimEnd: number;
}

export function TimelineEditor({
  duration,
  currentTime,
  clips,
  scenes,
  captions = [],
  layers = [],
  onSeek,
  onTrimStart,
  onTrimEnd,
  trimStart,
  trimEnd,
}: TimelineEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1.2);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"seek" | "trim-start" | "trim-end" | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const safeDuration = isFinite(duration) && duration > 0 ? duration : 10;
  const pixelsPerSecond = 50 * zoom;
  const totalWidth = Math.max(safeDuration * pixelsPerSecond + 120, 750);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    onSeek(Math.max(0, Math.min(time, safeDuration)));
  };

  const handleMouseMoveHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min(x / pixelsPerSecond, safeDuration));
    setHoverTime(time);
  };

  const handleMouseDown = (e: React.MouseEvent, type: "seek" | "trim-start" | "trim-end") => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !dragType) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = Math.max(0, Math.min(x / pixelsPerSecond, duration));
      if (dragType === "seek") onSeek(time);
      else if (dragType === "trim-start") onTrimStart(Math.min(time, trimEnd - 0.1));
      else if (dragType === "trim-end") onTrimEnd(Math.max(time, trimStart + 0.1));
    };
    const handleMouseUp = () => { setIsDragging(false); setDragType(null); };
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragType, pixelsPerSecond, duration, trimStart, trimEnd, onSeek, onTrimStart, onTrimEnd]);

  const formatTime = (time: number) => {
    if (typeof time !== "number" || isNaN(time) || !isFinite(time) || time < 0) return "0:00.0";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms}`;
  };

  const hasCaptions = captions.length > 0;
  const hasLayers = layers.length > 0;

  // Track height calculation
  // Scenes row (24px) + Clips row (48px) + Layers row (optional 32px) + Captions row (optional 28px)
  const timelineHeight = 24 + 48 + (hasLayers ? 34 : 0) + (hasCaptions ? 30 : 0) + 16;

  return (
    <div className="w-full bg-card border border-border rounded-xl p-3.5 space-y-3 shadow-lg select-none">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] mr-1">Studio Timeline</span>
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.3))} className="p-1 hover:bg-accent/15 rounded text-muted-foreground hover:text-foreground" title="Zoom Out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="0.4"
            max="4"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 h-1 accent-accent cursor-pointer"
          />
          <button onClick={() => setZoom(z => Math.min(4, z + 0.3))} className="p-1 hover:bg-accent/15 rounded text-muted-foreground hover:text-foreground" title="Zoom In">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(Math.max(0.5, 600 / Math.max(10, duration * 50)))} className="p-1 hover:bg-accent/15 rounded text-muted-foreground hover:text-foreground ml-1" title="Fit to View">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-muted-foreground font-mono text-[10px] w-10">{zoom.toFixed(1)}x</span>
        </div>

        <div className="flex items-center gap-4">
          {hoverTime !== null && (
            <div className="bg-accent/20 border border-accent/40 text-accent font-mono px-2 py-0.5 rounded text-[11px] flex items-center gap-1.5">
              <span>Hover: {formatTime(hoverTime)}</span>
              <span className="text-muted-foreground">Frame #{Math.floor(hoverTime * 30)}</span>
            </div>
          )}
          <div className="bg-background border border-border px-3 py-1 rounded-lg font-mono text-accent font-bold">
            {formatTime(currentTime)} <span className="text-muted-foreground font-normal">/ {formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Track Area */}
      <div className="flex overflow-x-auto rounded-lg border border-border bg-background/80 shadow-inner">
        {/* Track Label Column */}
        <div className="flex-shrink-0 w-28 border-r border-border bg-card flex flex-col text-xs text-muted-foreground select-none z-20">
          <div className="h-6 border-b border-border px-2.5 flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wide text-accent">
            <Zap className="w-3 h-3" /> Scenes
          </div>
          <div className="h-12 border-b border-border px-2.5 flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wide text-foreground">
            <Scissors className="w-3 h-3 text-green-400" /> Clips ({clips.length})
          </div>
          {hasLayers && (
            <div className="h-8 border-b border-border px-2.5 flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wide text-emerald-400">
              <Layers className="w-3 h-3" /> Layers ({layers.length})
            </div>
          )}
          {hasCaptions && (
            <div className="h-7 px-2.5 flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wide text-yellow-400">
              <Type className="w-3 h-3" /> Captions
            </div>
          )}
        </div>

        {/* Scrollable Ruler & Track Canvas */}
        <div className="flex-1 overflow-x-auto">
          <div
            ref={containerRef}
            className="relative cursor-pointer select-none"
            style={{ width: totalWidth, height: timelineHeight }}
            onClick={handleTimelineClick}
            onMouseMove={handleMouseMoveHover}
            onMouseLeave={() => setHoverTime(null)}
          >
            {/* Time Grid & Ruler */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: Math.ceil(duration / 2) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 border-l ${i % 5 === 0 ? "border-border/60" : "border-border/25"}`}
                  style={{ left: i * 2 * pixelsPerSecond }}
                >
                  {i % 5 === 0 && (
                    <span className="absolute top-0.5 left-1 text-[9px] text-muted-foreground/70 font-mono">
                      {formatTime(i * 2)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ── 1. Scenes Track (Top 24px) ── */}
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="absolute top-0 h-6 w-0.5 bg-accent/80 hover:bg-accent transition-colors group cursor-pointer z-10"
                style={{ left: (scene.timestamp / 1000) * pixelsPerSecond }}
                title={`Scene cut at ${formatTime(scene.timestamp / 1000)} (${Math.round(scene.confidence * 100)}% conf)`}
                onClick={(e) => { e.stopPropagation(); onSeek(scene.timestamp / 1000); }}
              >
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-bold text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none shadow-md">
                  Cut #{scene.id + 1}
                </div>
              </div>
            ))}

            {/* ── 2. Clips Track (24px – 72px) ── */}
            <div
              className="absolute bg-accent/15 border-x-2 border-accent/60 pointer-events-none"
              style={{
                top: 24,
                height: 48,
                left: trimStart * pixelsPerSecond,
                width: (trimEnd - trimStart) * pixelsPerSecond,
              }}
            />
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="absolute rounded-md flex items-center px-2.5 text-[11px] text-white overflow-hidden border shadow-sm transition-transform hover:scale-[1.01]"
                style={{
                  top: 28,
                  height: 40,
                  left: clip.startTime * pixelsPerSecond,
                  width: Math.max((clip.endTime - clip.startTime) * pixelsPerSecond, 8),
                  background: "linear-gradient(135deg, rgba(16,185,129,0.35), rgba(5,150,105,0.45))",
                  borderColor: "rgba(16,185,129,0.8)",
                }}
                title={`${clip.name}: ${formatTime(clip.startTime)} – ${formatTime(clip.endTime)}`}
              >
                <span className="truncate font-semibold drop-shadow">{clip.name}</span>
              </div>
            ))}

            {/* Trim Handles */}
            <div
              className="absolute top-6 h-12 w-2 bg-accent cursor-col-resize hover:bg-accent/90 transition-colors rounded-sm z-20 shadow-md flex items-center justify-center"
              style={{ left: trimStart * pixelsPerSecond - 1 }}
              onMouseDown={(e) => handleMouseDown(e, "trim-start")}
              title="Drag Start Trim"
            >
              <div className="w-0.5 h-4 bg-accent-foreground/60 rounded-full" />
            </div>
            <div
              className="absolute top-6 h-12 w-2 bg-accent cursor-col-resize hover:bg-accent/90 transition-colors rounded-sm z-20 shadow-md flex items-center justify-center"
              style={{ left: trimEnd * pixelsPerSecond - 1 }}
              onMouseDown={(e) => handleMouseDown(e, "trim-end")}
              title="Drag End Trim"
            >
              <div className="w-0.5 h-4 bg-accent-foreground/60 rounded-full" />
            </div>

            {/* ── 3. Layers Track (Optional 72px – 104px) ── */}
            {hasLayers && layers.map((layer) => {
              const startSec = layer.startTime;
              const endSec = layer.endTime;
              const widthPx = Math.max((endSec - startSec) * pixelsPerSecond, 8);
              const isActive = currentTime >= startSec && currentTime <= endSec;
              return (
                <div
                  key={layer.id}
                  className="absolute rounded flex items-center px-2 text-[10px] overflow-hidden border cursor-pointer transition-colors shadow-xs"
                  style={{
                    top: 76,
                    height: 24,
                    left: startSec * pixelsPerSecond,
                    width: widthPx,
                    background: isActive ? "rgba(52,211,153,0.35)" : "rgba(52,211,153,0.12)",
                    borderColor: isActive ? "rgba(52,211,153,0.9)" : "rgba(52,211,153,0.4)",
                  }}
                  title={`${layer.name} (${layer.type})`}
                  onClick={(e) => { e.stopPropagation(); onSeek(startSec); }}
                >
                  <span className="truncate font-medium text-emerald-200">{layer.name}</span>
                </div>
              );
            })}

            {/* ── 4. Captions Track ── */}
            {hasCaptions && captions.map((cap) => {
              const startSec = cap.startTime / 1000;
              const endSec = cap.endTime / 1000;
              const widthPx = Math.max((endSec - startSec) * pixelsPerSecond, 6);
              const isActive = currentTime >= startSec && currentTime <= endSec;
              const topPos = hasLayers ? 108 : 76;
              return (
                <div
                  key={cap.id}
                  className="absolute rounded flex items-center px-1.5 text-[9px] overflow-hidden border cursor-pointer transition-colors"
                  style={{
                    top: topPos,
                    height: 22,
                    left: startSec * pixelsPerSecond,
                    width: widthPx,
                    background: isActive ? "rgba(250,204,21,0.35)" : "rgba(250,204,21,0.12)",
                    borderColor: isActive ? "rgba(250,204,21,0.9)" : "rgba(250,204,21,0.4)",
                  }}
                  title={cap.text}
                  onClick={(e) => { e.stopPropagation(); onSeek(startSec); }}
                >
                  <span className="truncate text-yellow-200 font-medium">{cap.text}</span>
                </div>
              );
            })}

            {/* Hover Indicator */}
            {hoverTime !== null && (
              <div
                className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none z-15"
                style={{ left: hoverTime * pixelsPerSecond }}
              />
            )}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-30"
              style={{ left: currentTime * pixelsPerSecond }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

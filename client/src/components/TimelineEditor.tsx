import { useState, useRef, useEffect } from "react";
import { Scissors, Zap, Layers, Type, ZoomIn, ZoomOut, Maximize2, Clock, Film } from "lucide-react";

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
      const time = Math.max(0, Math.min(x / pixelsPerSecond, safeDuration));
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
  }, [isDragging, dragType, pixelsPerSecond, safeDuration, trimStart, trimEnd, onSeek, onTrimStart, onTrimEnd]);

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
  const timelineHeight = 24 + 52 + (hasLayers ? 34 : 0) + (hasCaptions ? 30 : 0) + 16;

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-3 shadow-lg select-none text-zinc-100">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
            <Film className="w-3.5 h-3.5 text-zinc-400" /> Multi-Track Studio
          </span>
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.3))} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.4"
              max="4"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-24 h-1 accent-zinc-300 cursor-pointer"
            />
            <button onClick={() => setZoom(z => Math.min(4, z + 0.3))} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(Math.max(0.5, 600 / Math.max(10, safeDuration * 50)))} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors ml-1" title="Fit to View">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-zinc-400 font-mono text-[10px] w-10 text-right">{zoom.toFixed(1)}x</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hoverTime !== null && (
            <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono px-2.5 py-1 rounded text-[11px] flex items-center gap-2">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>Hover: {formatTime(hoverTime)}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Frame #{Math.floor(hoverTime * 30)}</span>
            </div>
          )}
          <div className="bg-zinc-900 border border-zinc-800 px-3.5 py-1 rounded font-mono text-zinc-100 font-bold text-sm flex items-center gap-1.5">
            <span>{formatTime(currentTime)}</span>
            <span className="text-zinc-600 text-xs font-normal">/</span>
            <span className="text-zinc-400 text-xs font-normal">{formatTime(safeDuration)}</span>
          </div>
        </div>
      </div>

      {/* Track Area */}
      <div className="flex overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/40">
        {/* Track Label Column */}
        <div className="flex-shrink-0 w-32 border-r border-zinc-800 bg-zinc-900 flex flex-col text-xs text-zinc-400 select-none z-20">
          <div className="h-6 border-b border-zinc-800 px-3 flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wider text-zinc-300">
            <Zap className="w-3 h-3 text-zinc-400" /> Scenes
          </div>
          <div className="h-13 border-b border-zinc-800 px-3 flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wider text-zinc-100">
            <Scissors className="w-3.5 h-3.5 text-blue-400" /> Video Clips ({clips.length})
          </div>
          {hasLayers && (
            <div className="h-8 border-b border-zinc-800 px-3 flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wider text-emerald-400">
              <Layers className="w-3.5 h-3.5" /> Layers ({layers.length})
            </div>
          )}
          {hasCaptions && (
            <div className="h-7 px-3 flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wider text-yellow-400">
              <Type className="w-3.5 h-3.5" /> Subtitles
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
              {Array.from({ length: Math.ceil(safeDuration / 2) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 border-l ${i % 5 === 0 ? "border-zinc-700/60" : "border-zinc-800/40"}`}
                  style={{ left: i * 2 * pixelsPerSecond }}
                >
                  {i % 5 === 0 && (
                    <span className="absolute top-0.5 left-1.5 text-[9px] text-zinc-500 font-mono">
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
                className="absolute top-0 h-6 w-0.5 bg-zinc-400 hover:bg-zinc-200 hover:w-1 transition-all group cursor-pointer z-10"
                style={{ left: (scene.timestamp / 1000) * pixelsPerSecond }}
                title={`Scene cut at ${formatTime(scene.timestamp / 1000)} (${Math.round(scene.confidence * 100)}% conf)`}
                onClick={(e) => { e.stopPropagation(); onSeek(scene.timestamp / 1000); }}
              >
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 font-bold text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none shadow-md">
                  Cut #{scene.id + 1}
                </div>
              </div>
            ))}

            {/* ── 2. Clips Track (24px – 76px) ── */}
            <div
              className="absolute bg-zinc-700/20 border-x-2 border-zinc-400 pointer-events-none rounded-sm"
              style={{
                top: 26,
                height: 48,
                left: trimStart * pixelsPerSecond,
                width: (trimEnd - trimStart) * pixelsPerSecond,
              }}
            />
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="absolute rounded flex items-center justify-between px-3 text-[11px] text-white overflow-hidden border shadow transition-all hover:brightness-110"
                style={{
                  top: 28,
                  height: 44,
                  left: clip.startTime * pixelsPerSecond,
                  width: Math.max((clip.endTime - clip.startTime) * pixelsPerSecond, 12),
                  background: "linear-gradient(135deg, rgba(39,39,42,0.85), rgba(24,24,27,0.95))",
                  borderColor: "rgba(113,113,122,0.6)",
                }}
                title={`${clip.name}: ${formatTime(clip.startTime)} – ${formatTime(clip.endTime)}`}
              >
                <span className="truncate font-semibold tracking-tight text-zinc-100">{clip.name}</span>
                <span className="text-[9px] font-mono text-zinc-400 hidden sm:inline-block ml-2">{formatTime(clip.endTime - clip.startTime)}</span>
              </div>
            ))}

            {/* Trim Handles */}
            <div
              className="absolute top-26 h-12 w-2 bg-zinc-300 cursor-col-resize hover:bg-white transition-colors rounded-sm z-20 shadow flex items-center justify-center -translate-y-full"
              style={{ left: trimStart * pixelsPerSecond - 1 }}
              onMouseDown={(e) => handleMouseDown(e, "trim-start")}
              title="Drag Start Trim"
            >
              <div className="w-0.5 h-5 bg-zinc-800 rounded-full" />
            </div>
            <div
              className="absolute top-26 h-12 w-2 bg-zinc-300 cursor-col-resize hover:bg-white transition-colors rounded-sm z-20 shadow flex items-center justify-center -translate-y-full"
              style={{ left: trimEnd * pixelsPerSecond - 1 }}
              onMouseDown={(e) => handleMouseDown(e, "trim-end")}
              title="Drag End Trim"
            >
              <div className="w-0.5 h-5 bg-zinc-800 rounded-full" />
            </div>

            {/* ── 3. Layers Track (Optional 76px – 108px) ── */}
            {hasLayers && layers.map((layer) => {
              const startSec = layer.startTime;
              const endSec = layer.endTime;
              const widthPx = Math.max((endSec - startSec) * pixelsPerSecond, 8);
              const isActive = currentTime >= startSec && currentTime <= endSec;
              return (
                <div
                  key={layer.id}
                  className="absolute rounded flex items-center px-2 text-[10px] overflow-hidden border cursor-pointer transition-colors"
                  style={{
                    top: 80,
                    height: 24,
                    left: startSec * pixelsPerSecond,
                    width: widthPx,
                    background: isActive ? "rgba(39,39,42,0.9)" : "rgba(24,24,27,0.6)",
                    borderColor: isActive ? "rgba(161,161,170,0.8)" : "rgba(82,82,91,0.4)",
                  }}
                  title={`${layer.name} (${layer.type})`}
                  onClick={(e) => { e.stopPropagation(); onSeek(startSec); }}
                >
                  <span className="truncate font-medium text-zinc-300">{layer.name}</span>
                </div>
              );
            })}

            {/* ── 4. Captions Track ── */}
            {hasCaptions && captions.map((cap) => {
              const startSec = cap.startTime / 1000;
              const endSec = cap.endTime / 1000;
              const widthPx = Math.max((endSec - startSec) * pixelsPerSecond, 6);
              const isActive = currentTime >= startSec && currentTime <= endSec;
              const topPos = hasLayers ? 112 : 80;
              return (
                <div
                  key={cap.id}
                  className="absolute rounded flex items-center px-2 text-[9px] overflow-hidden border cursor-pointer transition-colors"
                  style={{
                    top: topPos,
                    height: 22,
                    left: startSec * pixelsPerSecond,
                    width: widthPx,
                    background: isActive ? "rgba(234,179,8,0.25)" : "rgba(234,179,8,0.08)",
                    borderColor: isActive ? "rgba(234,179,8,0.8)" : "rgba(234,179,8,0.3)",
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
                className="absolute top-0 bottom-0 w-px bg-zinc-500 pointer-events-none z-15 border-r border-dashed border-zinc-600"
                style={{ left: hoverTime * pixelsPerSecond }}
              />
            )}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-30"
              style={{ left: currentTime * pixelsPerSecond }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow border border-white -translate-y-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

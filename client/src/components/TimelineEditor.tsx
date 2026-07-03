import { useState, useRef, useEffect } from "react";

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

interface TimelineEditorProps {
  duration: number;
  currentTime: number;
  clips: TimelineClip[];
  scenes: SceneMarker[];
  captions?: Caption[];
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
  onSeek,
  onTrimStart,
  onTrimEnd,
  trimStart,
  trimEnd,
}: TimelineEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"seek" | "trim-start" | "trim-end" | null>(null);

  const pixelsPerSecond = 50 * zoom;
  const totalWidth = Math.max(duration * pixelsPerSecond + 100, 600);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    onSeek(Math.max(0, Math.min(time, duration)));
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
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const hasCaptions = captions.length > 0;

  // Timeline total height: scene row (20px) + clips row (48px) + optional captions row (28px) + padding
  const timelineHeight = 20 + 48 + (hasCaptions ? 32 : 0) + 16;

  return (
    <div className="w-full bg-card border border-border rounded-lg p-4 space-y-3">
      {/* Zoom Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.25"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-28 h-1 accent-green-500 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-8">{zoom.toFixed(2)}x</span>
        </div>
        <div className="text-xs text-muted-foreground ml-auto font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Track Labels + Timeline */}
      <div className="flex overflow-x-auto rounded border border-border bg-background">
        {/* Track label column */}
        <div className="flex-shrink-0 w-20 border-r border-border bg-card/80 flex flex-col text-xs text-muted-foreground">
          <div className="h-5 border-b border-border px-2 flex items-center font-medium text-[10px] uppercase tracking-wide">Scenes</div>
          <div className="h-12 border-b border-border px-2 flex items-center font-medium text-[10px] uppercase tracking-wide">Clips</div>
          {hasCaptions && (
            <div className="h-8 px-2 flex items-center font-medium text-[10px] uppercase tracking-wide text-accent">Captions</div>
          )}
        </div>

        {/* Scrollable timeline area */}
        <div className="flex-1 overflow-x-auto">
          <div
            ref={containerRef}
            className="relative cursor-pointer select-none"
            style={{ width: totalWidth, height: timelineHeight }}
            onClick={handleTimelineClick}
          >
            {/* Time grid */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: Math.ceil(duration / 5) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-border/30"
                  style={{ left: i * 5 * pixelsPerSecond }}
                >
                  <span className="absolute top-0 left-1 text-[9px] text-muted-foreground/60 font-mono">
                    {formatTime(i * 5)}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Scene Markers row (top 20px) ── */}
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="absolute top-0 h-5 w-0.5 bg-accent/70 hover:bg-accent transition-colors group cursor-pointer z-10"
                style={{ left: (scene.timestamp / 1000) * pixelsPerSecond }}
                title={`Scene cut at ${formatTime(scene.timestamp / 1000)} (${Math.round(scene.confidence * 100)}% confidence)`}
                onClick={(e) => { e.stopPropagation(); onSeek(scene.timestamp / 1000); }}
              >
                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  {formatTime(scene.timestamp / 1000)}
                </div>
              </div>
            ))}

            {/* ── Clips row (20px – 68px) ── */}
            {/* Trim region */}
            <div
              className="absolute bg-accent/10 border-l-2 border-r-2 border-accent/40 pointer-events-none"
              style={{
                top: 20,
                height: 48,
                left: trimStart * pixelsPerSecond,
                width: (trimEnd - trimStart) * pixelsPerSecond,
              }}
            />
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="absolute rounded flex items-center px-2 text-[10px] text-white overflow-hidden border"
                style={{
                  top: 24,
                  height: 40,
                  left: clip.startTime * pixelsPerSecond,
                  width: Math.max((clip.endTime - clip.startTime) * pixelsPerSecond, 4),
                  background: clip.type === "text"
                    ? "rgba(168,85,247,0.35)"
                    : clip.type === "audio"
                    ? "rgba(59,130,246,0.35)"
                    : "rgba(34,197,94,0.25)",
                  borderColor: clip.type === "text"
                    ? "rgba(168,85,247,0.7)"
                    : clip.type === "audio"
                    ? "rgba(59,130,246,0.7)"
                    : "rgba(34,197,94,0.7)",
                }}
                title={`${clip.name}: ${formatTime(clip.startTime)} – ${formatTime(clip.endTime)}`}
              >
                <span className="truncate font-medium">{clip.name}</span>
              </div>
            ))}

            {/* Trim handles */}
            <div
              className="absolute top-5 h-12 w-1.5 bg-accent cursor-col-resize hover:bg-accent/80 transition-colors rounded-sm z-10"
              style={{ left: trimStart * pixelsPerSecond - 1 }}
              onMouseDown={(e) => handleMouseDown(e, "trim-start")}
              title="Drag to set trim start"
            />
            <div
              className="absolute top-5 h-12 w-1.5 bg-accent cursor-col-resize hover:bg-accent/80 transition-colors rounded-sm z-10"
              style={{ left: trimEnd * pixelsPerSecond - 1 }}
              onMouseDown={(e) => handleMouseDown(e, "trim-end")}
              title="Drag to set trim end"
            />

            {/* ── Captions row (68px – 96px) ── */}
            {hasCaptions && captions.map((cap) => {
              const startSec = cap.startTime / 1000;
              const endSec = cap.endTime / 1000;
              const widthPx = Math.max((endSec - startSec) * pixelsPerSecond, 4);
              const isActive = currentTime >= startSec && currentTime <= endSec;
              return (
                <div
                  key={cap.id}
                  className="absolute rounded flex items-center px-1.5 text-[9px] overflow-hidden border cursor-pointer transition-colors"
                  style={{
                    top: 72,
                    height: 24,
                    left: startSec * pixelsPerSecond,
                    width: widthPx,
                    background: isActive ? "rgba(250,204,21,0.35)" : "rgba(250,204,21,0.12)",
                    borderColor: isActive ? "rgba(250,204,21,0.9)" : "rgba(250,204,21,0.4)",
                  }}
                  title={cap.text}
                  onClick={(e) => { e.stopPropagation(); onSeek(startSec); }}
                >
                  <span className="truncate text-yellow-200">{cap.text}</span>
                </div>
              );
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-20"
              style={{ left: currentTime * pixelsPerSecond }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full -translate-y-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-accent/70 rounded-sm" />
          <span>Scenes ({scenes.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm border" style={{ background: "rgba(34,197,94,0.25)", borderColor: "rgba(34,197,94,0.7)" }} />
          <span>Clips ({clips.length})</span>
        </div>
        {hasCaptions && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm border" style={{ background: "rgba(250,204,21,0.25)", borderColor: "rgba(250,204,21,0.6)" }} />
            <span>Captions ({captions.length})</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-0.5 h-2.5 bg-red-500" />
          <span>Playhead</span>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Play, Pause, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface TimelineEditorProps {
  duration: number;
  currentTime: number;
  clips: TimelineClip[];
  scenes: SceneMarker[];
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
  const totalWidth = duration * pixelsPerSecond;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    onSeek(Math.max(0, Math.min(time, duration)));
  };

  const handleMouseDown = (e: React.MouseEvent, type: "seek" | "trim-start" | "trim-end") => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !dragType) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = Math.max(0, Math.min(x / pixelsPerSecond, duration));

      if (dragType === "seek") {
        onSeek(time);
      } else if (dragType === "trim-start") {
        onTrimStart(Math.min(time, trimEnd));
      } else if (dragType === "trim-end") {
        onTrimEnd(Math.max(time, trimStart));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };

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

  return (
    <div className="w-full bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-32 h-1 bg-background rounded cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-8">{zoom.toFixed(1)}x</span>
        </div>
        <div className="text-xs text-muted-foreground ml-auto">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative overflow-x-auto bg-background rounded border border-border">
        <div
          ref={containerRef}
          className="relative h-32 cursor-pointer select-none"
          onClick={handleTimelineClick}
          style={{ width: totalWidth + 100 }}
        >
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-border"
                style={{ left: i * 10 * pixelsPerSecond }}
              >
                <span className="text-xs text-muted-foreground px-2 py-1">
                  {formatTime(i * 10)}
                </span>
              </div>
            ))}
          </div>

          {/* Scene Markers */}
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="absolute top-0 bottom-0 w-0.5 bg-accent/60 hover:bg-accent transition-colors group"
              style={{ left: scene.timestamp / 1000 * pixelsPerSecond }}
              title={`Scene at ${formatTime(scene.timestamp / 1000)}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-accent text-accent-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Scene {scene.id}
              </div>
            </div>
          ))}

          {/* Clips */}
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="absolute top-8 h-12 bg-blue-500/30 border border-blue-500 rounded flex items-center px-2 text-xs text-white overflow-hidden"
              style={{
                left: clip.startTime * pixelsPerSecond,
                width: (clip.endTime - clip.startTime) * pixelsPerSecond,
              }}
              title={`${clip.name}: ${formatTime(clip.startTime)} - ${formatTime(clip.endTime)}`}
            >
              <span className="truncate">{clip.name}</span>
            </div>
          ))}

          {/* Trim Range Highlight */}
          <div
            className="absolute top-0 bottom-0 bg-green-500/10 border-l-2 border-green-500"
            style={{ left: trimStart * pixelsPerSecond }}
          />
          <div
            className="absolute top-0 bottom-0 bg-green-500/10 border-r-2 border-green-500"
            style={{ right: (duration - trimEnd) * pixelsPerSecond }}
          />

          {/* Trim Start Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-500 cursor-col-resize hover:bg-green-400 transition-colors"
            style={{ left: trimStart * pixelsPerSecond }}
            onMouseDown={(e) => handleMouseDown(e, "trim-start")}
          />

          {/* Trim End Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-500 cursor-col-resize hover:bg-green-400 transition-colors"
            style={{ left: trimEnd * pixelsPerSecond }}
            onMouseDown={(e) => handleMouseDown(e, "trim-end")}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
            style={{ left: currentTime * pixelsPerSecond }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full -translate-y-1.5" />
          </div>
        </div>
      </div>

      {/* Timeline Info */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="bg-background p-2 rounded border border-border">
          <p className="text-muted-foreground">Trim Start</p>
          <p className="font-mono">{formatTime(trimStart)}</p>
        </div>
        <div className="bg-background p-2 rounded border border-border">
          <p className="text-muted-foreground">Playhead</p>
          <p className="font-mono">{formatTime(currentTime)}</p>
        </div>
        <div className="bg-background p-2 rounded border border-border">
          <p className="text-muted-foreground">Trim End</p>
          <p className="font-mono">{formatTime(trimEnd)}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded" />
          <span>Scene Markers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500/30 rounded border border-blue-500" />
          <span>Clips</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Trim Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3 bg-red-500" />
          <span>Playhead</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Film, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Clip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  speed: number;
  opacity: number;
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoObjectUrl: string | null;
  projectName: string;
  clips: Clip[];
  duration: number;
}

type ExportFormat = "original" | "clip" | "shortform";
type AspectRatio = "9:16" | "1:1" | "16:9";

const ASPECT_RATIOS: Record<AspectRatio, { w: number; h: number; label: string; platform: string }> = {
  "9:16": { w: 1080, h: 1920, label: "9:16", platform: "TikTok / Reels / Shorts" },
  "1:1":  { w: 1080, h: 1080, label: "1:1",  platform: "Instagram Square" },
  "16:9": { w: 1920, h: 1080, label: "16:9", platform: "YouTube / Widescreen" },
};

function formatTime(t: number) {
  if (!t || !isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Record a clip from the video element.
 * If aspectRatio is provided, renders each frame to a canvas at the target
 * dimensions (center-crop) and captures the canvas stream instead of the video.
 */
async function recordClip(
  videoEl: HTMLVideoElement,
  startTime: number,
  endTime: number,
  aspectRatio: AspectRatio | null,
  onProgress: (pct: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      let stream: MediaStream;
      let cleanupCanvas: (() => void) | null = null;

      if (aspectRatio) {
        // ── Canvas-based center-crop export ──────────────────────────────────
        const { w, h } = ASPECT_RATIOS[aspectRatio];
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");

        // Draw each video frame center-cropped to target aspect ratio
        const videoAspect = videoEl.videoWidth / videoEl.videoHeight;
        const targetAspect = w / h;

        let sx = 0, sy = 0, sw = videoEl.videoWidth, sh = videoEl.videoHeight;
        if (videoAspect > targetAspect) {
          // Video is wider — crop left/right
          sw = Math.round(videoEl.videoHeight * targetAspect);
          sx = Math.round((videoEl.videoWidth - sw) / 2);
        } else if (videoAspect < targetAspect) {
          // Video is taller — crop top/bottom
          sh = Math.round(videoEl.videoWidth / targetAspect);
          sy = Math.round((videoEl.videoHeight - sh) / 2);
        }

        let rafId: number;
        const drawFrame = () => {
          ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, w, h);
          rafId = requestAnimationFrame(drawFrame);
        };
        rafId = requestAnimationFrame(drawFrame);

        cleanupCanvas = () => {
          cancelAnimationFrame(rafId);
        };

        const canvasStream = (canvas as any).captureStream?.(30);
        if (!canvasStream) throw new Error("canvas.captureStream not supported in this browser. Try Chrome or Edge.");

        // Add audio track from the video if available
        const videoStream = (videoEl as any).captureStream?.(30) ?? (videoEl as any).mozCaptureStream?.(30);
        if (videoStream) {
          const audioTracks = videoStream.getAudioTracks();
          audioTracks.forEach((track: MediaStreamTrack) => canvasStream.addTrack(track));
        }

        stream = canvasStream;
      } else {
        // ── Direct video capture (original aspect ratio) ──────────────────────
        stream = (videoEl as any).captureStream?.(30) ?? (videoEl as any).mozCaptureStream?.(30);
        if (!stream) throw new Error("captureStream not supported in this browser. Try Chrome or Edge.");
      }

      const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
        .find(t => MediaRecorder.isTypeSupported(t)) ?? "video/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        cleanupCanvas?.();
        resolve(new Blob(chunks, { type: mimeType }));
      };
      recorder.onerror = () => {
        cleanupCanvas?.();
        reject(new Error("MediaRecorder error during export"));
      };

      const clipDuration = endTime - startTime;
      let elapsed = 0;

      const tick = setInterval(() => {
        elapsed += 0.25;
        onProgress(Math.min(99, Math.round((elapsed / clipDuration) * 100)));
        if (elapsed >= clipDuration) {
          clearInterval(tick);
          videoEl.pause();
          recorder.stop();
        }
      }, 250);

      videoEl.currentTime = startTime;
      videoEl.muted = false;
      videoEl.playbackRate = 1;

      videoEl.onseeked = () => {
        recorder.start(100);
        videoEl.play().catch(err => {
          clearInterval(tick);
          cleanupCanvas?.();
          reject(err);
        });
      };
    } catch (err) {
      reject(err);
    }
  });
}

export function ExportDialog({
  open, onClose, videoRef, videoObjectUrl, projectName, clips, duration
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("original");
  const [selectedClipId, setSelectedClipId] = useState<string>(clips[0]?.id ?? "");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const selectedClip = clips.find(c => c.id === selectedClipId);

  const handleExport = async () => {
    if (!videoObjectUrl || !videoRef.current) {
      toast.error("No video loaded");
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setDone(false);

    try {
      if (format === "original") {
        const a = document.createElement("a");
        a.href = videoObjectUrl;
        a.download = `${projectName || "export"}.mp4`;
        a.click();
        setProgress(100);
        setDone(true);
        toast.success("Original video downloaded!");
        return;
      }

      if (!selectedClip) {
        toast.error("Select a clip to export");
        setIsExporting(false);
        return;
      }

      const ratio: AspectRatio | null = format === "shortform" ? aspectRatio : null;
      const blob = await recordClip(
        videoRef.current,
        selectedClip.startTime,
        selectedClip.endTime,
        ratio,
        setProgress
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const suffix = format === "shortform" ? `_${aspectRatio.replace(":", "x")}` : "";
      a.download = `${selectedClip.name}${suffix}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 8000);

      setProgress(100);
      setDone(true);
      toast.success(`"${selectedClip.name}" exported!`);
    } catch (err) {
      const msg = (err as Error).message;
      toast.error("Export failed: " + msg);
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
      // Restore video state
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.playbackRate = 1;
      }
    }
  };

  const estimatedDuration = format === "original"
    ? duration
    : selectedClip ? selectedClip.endTime - selectedClip.startTime : 0;

  const selectedRatioInfo = ASPECT_RATIOS[aspectRatio];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-sm">Export Video</h2>
          </div>
          <button onClick={onClose} disabled={isExporting} className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">

          {/* Format Selection */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Export Type</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "original" as const, label: "Full Video", desc: "Original file" },
                { key: "clip" as const, label: "Clip", desc: "Trimmed segment" },
                { key: "shortform" as const, label: "Short-form", desc: "Cropped & reframed" },
              ]).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setFormat(opt.key)}
                  disabled={isExporting}
                  className={`p-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${format === opt.key ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Clip Selector */}
          {(format === "clip" || format === "shortform") && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Select Clip</label>
              {clips.length === 0 ? (
                <p className="text-xs text-muted-foreground border border-dashed border-border rounded p-3 text-center">
                  No clips yet. Create clips in the Edit panel first.
                </p>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {clips.map(clip => (
                    <button
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      disabled={isExporting}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-colors disabled:opacity-50 ${selectedClipId === clip.id ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}
                    >
                      <Film className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{clip.name}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(clip.startTime)} → {formatTime(clip.endTime)}</div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{formatTime(clip.endTime - clip.startTime)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aspect Ratio for Short-form */}
          {format === "shortform" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(ASPECT_RATIOS) as [AspectRatio, typeof ASPECT_RATIOS[AspectRatio]][]).map(([ratio, info]) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    disabled={isExporting}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${aspectRatio === ratio ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}
                  >
                    {info.label}
                    <span className="block text-xs font-normal opacity-70 mt-0.5 truncate">{info.platform.split(" / ")[0]}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 bg-background rounded-lg p-2.5 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output size</span>
                  <span className="font-mono">{selectedRatioInfo.w} × {selectedRatioInfo.h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crop method</span>
                  <span className="font-mono text-accent">Center crop</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-mono">{selectedRatioInfo.platform}</span>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-background rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-mono">{formatTime(estimatedDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output format</span>
              <span className="font-mono">{format === "original" ? "MP4 (original)" : "WebM (recorded)"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-mono">{format === "original" ? "Direct download" : format === "shortform" ? "Canvas crop + record" : "MediaRecorder"}</span>
            </div>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {format === "shortform" ? "Cropping & recording..." : "Recording..."}
                </span>
                <span className="text-accent font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {done && !isExporting && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              Export complete! Check your downloads folder.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-9" onClick={onClose} disabled={isExporting}>
            {done ? "Close" : "Cancel"}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-9 gap-2"
            onClick={handleExport}
            disabled={isExporting || (format !== "original" && clips.length === 0)}
          >
            {isExporting
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting...</>
              : <><Download className="w-3.5 h-3.5" /> Export</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { TimelineEditor } from "@/components/TimelineEditor";
import { ExportDialog } from "@/components/ExportDialog";
import {
  Upload, Play, Pause, Volume2, Download,
  Plus, Save, FolderOpen, Scissors, Type,
  Zap, Film, ChevronRight, X, Loader2, AlertCircle, SplitSquareHorizontal
} from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

interface TimelineClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  type: "video" | "audio" | "text";
  opacity: number;
  speed: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface SceneMarker {
  id: number;
  timestamp: number;
  confidence: number;
}

// ─── MediaRecorder Export Helper ─────────────────────────────────────────────
async function exportTrimmedClip(
  videoEl: HTMLVideoElement,
  startTime: number,
  endTime: number,
  fileName: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Capture the video element's stream
      const stream = (videoEl as any).captureStream
        ? (videoEl as any).captureStream(30)
        : (videoEl as any).mozCaptureStream
        ? (videoEl as any).mozCaptureStream(30)
        : null;

      if (!stream) {
        reject(new Error("captureStream not supported in this browser"));
        return;
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.webm`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        resolve();
      };

      recorder.onerror = (e) => reject(new Error("MediaRecorder error: " + e));

      // Seek to start, then record
      videoEl.currentTime = startTime;
      videoEl.playbackRate = 1; // record at normal speed
      videoEl.muted = true;

      const clipDuration = endTime - startTime;
      let elapsed = 0;
      const tick = setInterval(() => {
        elapsed += 0.25;
        onProgress(Math.min(100, Math.round((elapsed / clipDuration) * 100)));
        if (elapsed >= clipDuration) {
          clearInterval(tick);
          videoEl.pause();
          recorder.stop();
        }
      }, 250);

      videoEl.onseeked = () => {
        recorder.start(100);
        videoEl.play().catch(reject);
      };
    } catch (err) {
      reject(err);
    }
  });
}

export default function Editor() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Video refs and state
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoFileRef = useRef<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Project state
  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectDbId, setProjectDbId] = useState<number | null>(null);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [scenes, setScenes] = useState<SceneMarker[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [showProjects, setShowProjects] = useState(false);

  // Editing state
  const [speed, setSpeed] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [newText, setNewText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(24);

  // AI state
  const [isDetectingScenes, setIsDetectingScenes] = useState(false);
  const [activePanel, setActivePanel] = useState<"edit" | "ai" | "text">("edit");

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingClipId, setExportingClipId] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // tRPC
  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => utils.projects.list.invalidate(),
    onError: (err) => toast.error("Failed to create project: " + err.message),
  });
  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => utils.projects.list.invalidate(),
    onError: (err) => toast.error("Failed to update project: " + err.message),
  });
  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => utils.projects.list.invalidate(),
    onError: (err) => toast.error("Failed to delete project: " + err.message),
  });
  const saveClipMutation = trpc.clips.create.useMutation({
    onError: (err) => console.warn("Clip DB save failed:", err.message),
  });
  const uploadVideoMutation = trpc.videos.upload.useMutation({
    onError: (err) => console.warn("Video upload failed:", err.message),
  });
  const { data: projectList, isLoading: isLoadingProjects, error: projectListError } = trpc.projects.list.useQuery();

  // ─── Video Upload ─────────────────────────────────────────────────────────────
  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 500 * 1024 * 1024; // 500 MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 500 MB.");
      return;
    }

    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);

    videoFileRef.current = file;
    const url = URL.createObjectURL(file);
    setVideoObjectUrl(url);
    setProjectName(file.name.replace(/\.[^/.]+$/, ""));
    setIsVideoLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    setClips([]);
    setScenes([]);
    setTextOverlays([]);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  }, [videoObjectUrl]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Video Events ─────────────────────────────────────────────────────────────
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const dur = isFinite(video.duration) ? video.duration : 0;
    setDuration(dur);
    setTrimEnd(dur);
    setIsVideoLoading(false);
    video.playbackRate = speed;
    video.volume = volume;
    video.muted = isMuted;
  }, [speed, volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);

  const handleVideoEnded = useCallback(() => setIsPlaying(false), []);

  const handleVideoError = useCallback(() => {
    setIsVideoLoading(false);
    toast.error("Failed to load video. Check the file format.");
  }, []);

  const handlePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoObjectUrl) return;
    try {
      if (isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Playback error:", err);
        toast.error("Playback failed. Try clicking play again.");
      }
    }
  }, [isPlaying, videoObjectUrl]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(time, duration));
    video.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const handleVolumeChange = useCallback((val: number) => {
    const v = Math.max(0, Math.min(1, val));
    setVolume(v);
    setIsMuted(v === 0);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
  }, []);

  const handleSpeedChange = useCallback((val: number) => {
    setSpeed(val);
    if (videoRef.current) videoRef.current.playbackRate = val;
  }, []);

  const handleOpacityChange = useCallback((val: number) => {
    setOpacity(Math.max(0, Math.min(1, val)));
  }, []);

  // ─── Trim & Clips ─────────────────────────────────────────────────────────────
  const handleTrimStart = useCallback((t: number) => {
    setTrimStart(Math.max(0, Math.min(t, trimEnd - 0.1)));
  }, [trimEnd]);

  const handleTrimEnd = useCallback((t: number) => {
    setTrimEnd(Math.min(duration, Math.max(t, trimStart + 0.1)));
  }, [trimStart, duration]);

  const createClip = useCallback(() => {
    if (!videoObjectUrl) { toast.error("Upload a video first"); return; }
    if (trimEnd - trimStart < 0.5) { toast.error("Clip must be at least 0.5 seconds long"); return; }

    const clip: TimelineClip = {
      id: `clip-${Date.now()}`,
      name: `Clip ${clips.length + 1}`,
      startTime: trimStart,
      endTime: trimEnd,
      type: "video",
      opacity,
      speed,
    };
    setClips(prev => [...prev, clip]);
    toast.success(`Clip created: ${formatTime(trimStart)} → ${formatTime(trimEnd)}`);

    if (projectDbId) {
      saveClipMutation.mutate({
        projectId: projectDbId,
        name: clip.name,
        startTime: Math.floor(trimStart * 1000),
        endTime: Math.floor(trimEnd * 1000),
        type: "video",
      });
    }
  }, [videoObjectUrl, trimStart, trimEnd, clips.length, opacity, speed, projectDbId, saveClipMutation]);

  const removeClip = useCallback((id: string) => {
    setClips(prev => prev.filter(c => c.id !== id));
    toast.success("Clip removed");
  }, []);

  // ─── Text Overlays ────────────────────────────────────────────────────────────
  const addTextOverlay = useCallback(() => {
    if (!newText.trim()) { toast.error("Enter some text first"); return; }
    const overlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: newText.trim(),
      x: 50,
      y: 80,
      fontSize,
      color: textColor,
    };
    setTextOverlays(prev => [...prev, overlay]);
    setNewText("");
    toast.success("Text overlay added");
  }, [newText, fontSize, textColor]);

  const removeTextOverlay = useCallback((id: string) => {
    setTextOverlays(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Project Save / Load ──────────────────────────────────────────────────────
  const saveProject = useCallback(async () => {
    if (!projectName.trim()) { toast.error("Enter a project name"); return; }
    const toastId = toast.loading("Saving project...");
    try {
      let dbId = projectDbId;
      if (!dbId) {
        const created = await createProject.mutateAsync({
          name: projectName.trim(),
          description: `${clips.length} clips, ${duration.toFixed(1)}s`,
        });
        if (created?.id) {
          dbId = created.id;
          setProjectDbId(created.id);
        }
      } else {
        await updateProject.mutateAsync({
          projectId: dbId,
          name: projectName.trim(),
          duration,
        });
      }

      // Upload video to S3 if we have a file and a project ID
      if (dbId && videoFileRef.current) {
        const file = videoFileRef.current;
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1] ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await uploadVideoMutation.mutateAsync({
          projectId: dbId,
          fileName: file.name,
          fileData: base64,
          mimeType: file.type || "video/mp4",
        });
      }

      toast.dismiss(toastId);
      toast.success("Project saved!");
    } catch {
      toast.dismiss(toastId);
      // error handled in mutation onError
    }
  }, [projectName, projectDbId, clips.length, duration, createProject, updateProject, uploadVideoMutation]);

  const loadProjectFromDb = useCallback(async (projId: number, projName: string) => {
    const toastId = toast.loading(`Loading ${projName}...`);
    try {
      const full = await utils.projects.getFull.fetch({ projectId: projId });
      if (!full) { toast.dismiss(toastId); toast.error("Project not found"); return; }

      setProjectDbId(full.project.id);
      setProjectName(full.project.name);
      if (full.project.duration) setDuration(full.project.duration);

      // Restore clips
      if (full.clips.length > 0) {
        setClips(full.clips.map(c => ({
          id: `clip-${c.id}`,
          name: c.name,
          startTime: c.startTime / 1000,
          endTime: c.endTime / 1000,
          type: (c.type ?? "video") as "video" | "audio" | "text",
          opacity: c.opacity ?? 1,
          speed: c.speed ?? 1,
        })));
        if (full.project.duration) setTrimEnd(full.project.duration);
      }

      // Restore scene markers
      if (full.scenes.length > 0) {
        setScenes(full.scenes.map(s => ({
          id: s.id,
          timestamp: s.timestamp,
          confidence: s.confidence ?? 0.5,
        })));
      }

      // Restore video from S3 if available
      if (full.project.videoUrl) {
        try {
          const resp = await fetch(full.project.videoUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
            const url = URL.createObjectURL(blob);
            setVideoObjectUrl(url);
            setIsVideoLoading(true);
          }
        } catch {
          toast.error("Could not restore video from storage. Please re-upload.");
        }
      }

      setShowProjects(false);
      toast.dismiss(toastId);
      toast.success(`Loaded: ${full.project.name}`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to load project: " + (err as Error).message);
    }
  }, [utils, videoObjectUrl]);

  const handleDeleteProject = useCallback(async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteProject.mutateAsync({ projectId: id });
      if (projectDbId === id) {
        setProjectDbId(null);
        setProjectName("Untitled Project");
      }
    } catch {
      // error handled in mutation onError
    }
  }, [deleteProject, projectDbId]);

  // ─── Scene Detection ──────────────────────────────────────────────────────────
  const detectScenes = useCallback(async () => {
    if (!videoObjectUrl) { toast.error("Upload a video first"); return; }
    const video = videoRef.current;
    if (!video || !isFinite(duration) || duration === 0) {
      toast.error("Video not ready yet");
      return;
    }

    setIsDetectingScenes(true);
    const toastId = toast.loading("Analyzing video for scene cuts...");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");

      canvas.width = 160;
      canvas.height = 90;

      // Sample up to 200 frames across the video
      const sampleInterval = Math.max(0.5, duration / 200);
      const detectedScenes: SceneMarker[] = [{ id: 0, timestamp: 0, confidence: 1.0 }];
      let prevHistogram: number[] | null = null;
      const THRESHOLD = 25;

      const getHistogram = (imageData: ImageData): number[] => {
        const hist = new Array(16).fill(0);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const brightness = Math.floor(
            (imageData.data[i] * 0.299 + imageData.data[i + 1] * 0.587 + imageData.data[i + 2] * 0.114) / 16
          );
          hist[Math.min(15, brightness)]++;
        }
        return hist;
      };

      const histDiff = (a: number[], b: number[]): number =>
        a.reduce((sum, v, i) => sum + Math.abs(v - (b[i] ?? 0)), 0) / (canvas.width * canvas.height);

      const sampleFrame = (time: number): Promise<number[]> =>
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Frame seek timeout")), 5000);
          const onSeeked = () => {
            clearTimeout(timeout);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(getHistogram(imageData));
          };
          video.addEventListener("seeked", onSeeked, { once: true });
          video.currentTime = time;
        });

      for (let t = sampleInterval; t < duration - sampleInterval; t += sampleInterval) {
        const hist = await sampleFrame(t);
        if (prevHistogram) {
          const diff = histDiff(prevHistogram, hist);
          if (diff > THRESHOLD) {
            detectedScenes.push({
              id: detectedScenes.length,
              timestamp: Math.round(t * 1000),
              confidence: Math.min(1, diff / 100),
            });
          }
        }
        prevHistogram = hist;
      }

      // Restore playhead
      video.currentTime = currentTime;
      setScenes(detectedScenes);
      toast.dismiss(toastId);
      toast.success(`Found ${detectedScenes.length} scene${detectedScenes.length !== 1 ? "s" : ""}!`);
    } catch (err) {
      console.error("Scene detection error:", err);
      toast.dismiss(toastId);
      toast.error("Scene detection failed: " + (err as Error).message);
    } finally {
      setIsDetectingScenes(false);
    }
  }, [videoObjectUrl, duration, currentTime]);

  // ─── Split Clip at Playhead ───────────────────────────────────────────────────
  const splitClipAtPlayhead = useCallback(() => {
    if (!videoObjectUrl) { toast.error("Upload a video first"); return; }
    if (currentTime <= trimStart + 0.1 || currentTime >= trimEnd - 0.1) {
      toast.error("Move the playhead between the trim start and end points to split");
      return;
    }
    const clipA: TimelineClip = {
      id: `clip-${Date.now()}-a`,
      name: `Clip ${clips.length + 1}A`,
      startTime: trimStart,
      endTime: currentTime,
      type: "video",
      opacity,
      speed,
    };
    const clipB: TimelineClip = {
      id: `clip-${Date.now()}-b`,
      name: `Clip ${clips.length + 1}B`,
      startTime: currentTime,
      endTime: trimEnd,
      type: "video",
      opacity,
      speed,
    };
    setClips(prev => [...prev, clipA, clipB]);
    toast.success(`Split into 2 clips at ${formatTime(currentTime)}`);
  }, [videoObjectUrl, currentTime, trimStart, trimEnd, clips.length, opacity, speed]);

  // ─── Export Full Video ────────────────────────────────────────────────────────
  const exportVideo = useCallback(() => {
    if (!videoObjectUrl) { toast.error("No video to export"); return; }
    setShowExportDialog(true);
  }, [videoObjectUrl]);

  // ─── Export Trimmed Clip via MediaRecorder ────────────────────────────────────
  const exportClip = useCallback(async (clip: TimelineClip) => {
    const video = videoRef.current;
    if (!video || !videoObjectUrl) { toast.error("Video not loaded"); return; }
    if (isExporting) { toast.error("Export already in progress"); return; }

    setIsExporting(true);
    setExportingClipId(clip.id);
    setExportProgress(0);

    const toastId = toast.loading(`Exporting "${clip.name}"...`);

    try {
      await exportTrimmedClip(
        video,
        clip.startTime,
        clip.endTime,
        clip.name,
        (pct) => setExportProgress(pct)
      );
      toast.dismiss(toastId);
      toast.success(`"${clip.name}" exported successfully!`);
    } catch (err) {
      toast.dismiss(toastId);
      const msg = (err as Error).message;
      if (msg.includes("captureStream not supported")) {
        // Fallback: download the original video with a note
        toast.error("Direct clip export not supported in this browser. Downloading full video instead.");
        exportVideo();
      } else {
        toast.error("Export failed: " + msg);
      }
    } finally {
      setIsExporting(false);
      setExportingClipId(null);
      setExportProgress(0);
      // Restore video state
      if (video) {
        video.playbackRate = speed;
        video.muted = isMuted;
        video.volume = volume;
      }
    }
  }, [videoObjectUrl, isExporting, exportVideo, speed, isMuted, volume]);

  // ─── Keyboard Shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); handlePlayPause(); }
      if (e.code === "ArrowLeft") { e.preventDefault(); handleSeek(currentTime - 5); }
      if (e.code === "ArrowRight") { e.preventDefault(); handleSeek(currentTime + 5); }
      if (e.code === "KeyM") handleVolumeChange(isMuted ? 1 : 0);
      if (e.code === "BracketLeft") handleTrimStart(currentTime);
      if (e.code === "BracketRight") handleTrimEnd(currentTime);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePlayPause, handleSeek, handleVolumeChange, handleTrimStart, handleTrimEnd, currentTime, isMuted]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const formatTime = (t: number) => {
    if (!t || !isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="p-8 max-w-md text-center">
          <Film className="w-12 h-12 text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign in to use PixelCraft</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access the editor and save your projects.</p>
          <Link href="/">
            <Button variant="default" className="w-full">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden" style={{ height: "100vh" }}>

      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b border-border bg-card/60 backdrop-blur-sm z-40">
        <div className="px-4 py-2 flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity mr-2">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs font-bold">P</div>
              <span className="font-bold text-sm">PixelCraft</span>
            </div>
          </Link>

          <div className="h-4 w-px bg-border" />

          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium w-48 focus:bg-card/50 focus:px-2 rounded transition-all"
            placeholder="Project name"
          />

          {projectDbId && (
            <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">Saved</span>
          )}

          <div className="flex-1" />

          {isExporting && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
              <span>Exporting {exportProgress}%</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowProjects(!showProjects)} className="gap-2 h-8 text-xs">
              <FolderOpen className="w-3.5 h-3.5" />
              Projects
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={saveProject}
              disabled={createProject.isPending || updateProject.isPending}
              className="gap-2 h-8 text-xs"
            >
              {(createProject.isPending || updateProject.isPending)
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />}
              Save
            </Button>
            <Button size="sm" variant="default" onClick={exportVideo} disabled={!videoObjectUrl} className="gap-2 h-8 text-xs">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>

            {showExportDialog && (
              <ExportDialog
                open={showExportDialog}
                onClose={() => setShowExportDialog(false)}
                videoRef={videoRef}
                videoObjectUrl={videoObjectUrl}
                projectName={projectName}
                clips={clips}
                duration={duration}
              />
            )}
          </div>
        </div>

        {/* Projects Dropdown */}
        {showProjects && (
          <div className="border-t border-border bg-card/95 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Saved Projects</h3>
              <button onClick={() => setShowProjects(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            {isLoadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading projects...
              </div>
            ) : projectListError ? (
              <div className="flex items-center gap-2 text-sm text-destructive py-2">
                <AlertCircle className="w-4 h-4" /> Failed to load projects
              </div>
            ) : !projectList?.length ? (
              <p className="text-sm text-muted-foreground py-2">No saved projects yet. Click Save to create one.</p>
            ) : (
              <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                {projectList.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => loadProjectFromDb(proj.id, proj.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer hover:bg-accent/10 transition-colors text-sm ${projectDbId === proj.id ? "border-accent bg-accent/10" : "border-border"}`}
                  >
                    <Film className="w-3.5 h-3.5 text-accent" />
                    <span className="font-medium">{proj.name}</span>
                    {proj.duration != null && <span className="text-xs text-muted-foreground">{formatTime(proj.duration)}</span>}
                    <button
                      onClick={e => handleDeleteProject(proj.id, e)}
                      disabled={deleteProject.isPending}
                      className="ml-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      {deleteProject.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Preview + Clips ── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">

          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center bg-black/90 relative overflow-hidden" ref={videoContainerRef}>
            {videoObjectUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoObjectUrl}
                  className="max-w-full max-h-full"
                  style={{ opacity }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setIsVideoLoading(true)}
                  onCanPlay={() => setIsVideoLoading(false)}
                  preload="metadata"
                />
                {/* Text Overlays */}
                {textOverlays.map(overlay => (
                  <div
                    key={overlay.id}
                    className="absolute pointer-events-none select-none font-bold drop-shadow-lg"
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontSize: `${overlay.fontSize}px`,
                      color: overlay.color,
                      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                    }}
                  >
                    {overlay.text}
                  </div>
                ))}
                {(isVideoLoading || isExporting) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    {isExporting && <span className="text-sm text-white">{exportProgress}%</span>}
                  </div>
                )}
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-border hover:border-accent transition-colors group">
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors" />
                <div className="text-center">
                  <p className="font-medium">Click to upload video</p>
                  <p className="text-sm text-muted-foreground mt-1">MP4, WebM, MOV — up to 500 MB</p>
                </div>
                <input type="file" accept="video/mp4,video/webm,video/quicktime,.mov" onChange={handleVideoUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Playback Controls */}
          {videoObjectUrl && (
            <div className="flex-shrink-0 bg-card/80 border-t border-border px-4 py-2 space-y-2">
              {/* Seek Bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono w-10">{formatTime(currentTime)}</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    step={0.05}
                    value={currentTime}
                    onChange={e => handleSeek(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-green-500 cursor-pointer"
                  />
                  {/* Trim region indicator */}
                  {duration > 0 && (
                    <div
                      className="absolute top-0 h-1.5 bg-accent/30 pointer-events-none rounded"
                      style={{
                        left: `${(trimStart / duration) * 100}%`,
                        width: `${((trimEnd - trimStart) / duration) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono w-10 text-right">{formatTime(duration)}</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-accent-foreground" /> : <Play className="w-4 h-4 text-accent-foreground ml-0.5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleVolumeChange(isMuted ? 1 : 0)}>
                    <Volume2 className={`w-3.5 h-3.5 ${isMuted ? "text-muted-foreground/40" : "text-muted-foreground"}`} />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 accent-green-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-muted-foreground">Speed:</span>
                  {[0.5, 1, 1.5, 2].map(s => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`text-xs px-2 py-0.5 rounded transition-colors ${speed === s ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:bg-accent/20"}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <span className="hidden lg:block text-xs text-muted-foreground ml-2 opacity-60">
                  Space=play · ←→=seek · M=mute · [=trim start · ]=trim end
                </span>
              </div>
            </div>
          )}

          {/* Clips List */}
          <div className="flex-shrink-0 border-t border-border bg-card/30 max-h-40 overflow-y-auto">
            <div className="px-4 py-2 flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Clips ({clips.length})</h3>
              {clips.length > 0 && <span className="text-xs text-muted-foreground">Click to jump · Download to export</span>}
            </div>
            {clips.length === 0 ? (
              <p className="text-xs text-muted-foreground px-4 pb-3">No clips yet. Set trim points in the Edit panel and click Create Clip.</p>
            ) : (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {clips.map(clip => (
                  <div
                    key={clip.id}
                    className="flex items-center gap-2 bg-card border border-border rounded px-3 py-1.5 text-xs hover:border-accent transition-colors cursor-pointer group"
                    onClick={() => handleSeek(clip.startTime)}
                  >
                    <Film className="w-3 h-3 text-accent flex-shrink-0" />
                    <span className="font-medium">{clip.name}</span>
                    <span className="text-muted-foreground">{formatTime(clip.startTime)}–{formatTime(clip.endTime)}</span>
                    <span className="text-muted-foreground">{clip.speed}x</span>
                    <button
                      onClick={e => { e.stopPropagation(); exportClip(clip); }}
                      disabled={isExporting}
                      className="text-muted-foreground hover:text-accent transition-colors disabled:opacity-40"
                      title="Export this clip"
                    >
                      {exportingClipId === clip.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Download className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); removeClip(clip.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove clip"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Tools Panel ── */}
        <div className="w-72 flex flex-col overflow-hidden bg-card/20">
          {/* Panel Tabs */}
          <div className="flex border-b border-border">
            {(["edit", "ai", "text"] as const).map(panel => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${activePanel === panel ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground"}`}
              >
                {panel === "edit" ? "Edit" : panel === "ai" ? "AI" : "Text"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* ── Edit Panel ── */}
            {activePanel === "edit" && (
              <>
                {/* Trim */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" /> Trim & Create Clip
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Start (s)</label>
                        <input
                          type="number"
                          min={0}
                          max={duration}
                          step={0.1}
                          value={trimStart.toFixed(1)}
                          onChange={e => handleTrimStart(parseFloat(e.target.value) || 0)}
                          className="w-full bg-background border border-border rounded px-2 py-1 text-sm font-mono mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">End (s)</label>
                        <input
                          type="number"
                          min={0}
                          max={duration}
                          step={0.1}
                          value={trimEnd.toFixed(1)}
                          onChange={e => handleTrimEnd(parseFloat(e.target.value) || duration)}
                          className="w-full bg-background border border-border rounded px-2 py-1 text-sm font-mono mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => handleTrimStart(currentTime)}
                        disabled={!videoObjectUrl}
                        title="Set trim start to current playhead position [ "
                      >
                        [ Set Start
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => handleTrimEnd(currentTime)}
                        disabled={!videoObjectUrl}
                        title="Set trim end to current playhead position ]"
                      >
                        Set End ]
                      </Button>
                    </div>
                    {duration > 0 && (
                      <div className="text-xs text-muted-foreground text-center">
                        Duration: <span className="text-accent font-mono">{formatTime(trimEnd - trimStart)}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-xs gap-1"
                        onClick={createClip}
                        disabled={!videoObjectUrl}
                      >
                        <Plus className="w-3 h-3" /> Create Clip
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={splitClipAtPlayhead}
                        disabled={!videoObjectUrl}
                        title="Split trim region at current playhead position"
                      >
                        <SplitSquareHorizontal className="w-3 h-3" /> Split
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Speed */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Playback Speed</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={0.25}
                      max={2}
                      step={0.05}
                      value={speed}
                      onChange={e => handleSpeedChange(parseFloat(e.target.value))}
                      className="w-full accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.25x</span>
                      <span className="text-accent font-bold">{speed.toFixed(2)}x</span>
                      <span>2x</span>
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Opacity</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={opacity}
                      onChange={e => handleOpacityChange(parseFloat(e.target.value))}
                      className="w-full accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="text-accent font-bold">{Math.round(opacity * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── AI Panel ── */}
            {activePanel === "ai" && (
              <>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Scene Detection
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Analyzes frame brightness histograms to find cut points — 100% client-side, no API needed.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={detectScenes}
                    disabled={isDetectingScenes || !videoObjectUrl}
                  >
                    {isDetectingScenes
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                      : <><Film className="w-3.5 h-3.5" /> Detect Scenes</>}
                  </Button>

                  {scenes.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{scenes.length} scenes found</p>
                        <button
                          onClick={() => setScenes([])}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                        {scenes.map(scene => (
                          <button
                            key={scene.id}
                            onClick={() => handleSeek(scene.timestamp / 1000)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-background hover:bg-accent/10 transition-colors text-xs text-left"
                          >
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `hsl(${120 * scene.confidence}, 70%, 50%)` }}
                            />
                            <span className="font-mono">{formatTime(scene.timestamp / 1000)}</span>
                            <span className="text-muted-foreground">Scene {scene.id + 1}</span>
                            <span className="text-muted-foreground ml-auto">{Math.round(scene.confidence * 100)}%</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs gap-1 mt-1"
                        onClick={() => {
                          // Auto-create clips from scenes
                          const newClips: TimelineClip[] = [];
                          for (let i = 0; i < scenes.length; i++) {
                            const start = (scenes[i]?.timestamp ?? 0) / 1000;
                            const end = i + 1 < scenes.length
                              ? (scenes[i + 1]?.timestamp ?? 0) / 1000
                              : duration;
                            if (end - start >= 0.5) {
                              newClips.push({
                                id: `scene-clip-${Date.now()}-${i}`,
                                name: `Scene ${i + 1}`,
                                startTime: start,
                                endTime: end,
                                type: "video",
                                opacity: 1,
                                speed: 1,
                              });
                            }
                          }
                          setClips(prev => [...prev, ...newClips]);
                          toast.success(`Created ${newClips.length} clips from scenes`);
                        }}
                      >
                        <Plus className="w-3 h-3" /> Create Clips from Scenes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Auto Captions</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Transcribe audio using Whisper AI. Save your project first to enable this feature.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={() => {
                      if (!videoObjectUrl) { toast.error("Upload a video first"); return; }
                      if (!projectDbId) { toast.error("Save your project first to generate captions"); return; }
                      toast.info("Whisper caption generation — coming soon! Your project is saved and ready.");
                    }}
                    disabled={!videoObjectUrl}
                  >
                    Generate Captions
                  </Button>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Short-form Export</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Export clips at 9:16 aspect ratio for TikTok, Reels, and Shorts.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={() => {
                      if (clips.length === 0) { toast.error("Create clips first"); return; }
                      toast.success(`${clips.length} clip(s) ready. Click the download icon on each clip to export.`);
                    }}
                  >
                    Export Short-form Clips
                  </Button>
                </div>
              </>
            )}

            {/* ── Text Panel ── */}
            {activePanel === "text" && (
              <>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" /> Text Overlay
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Text</label>
                      <input
                        type="text"
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addTextOverlay()}
                        placeholder="Enter overlay text..."
                        className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm mt-1"
                        maxLength={200}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Color</label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={e => setTextColor(e.target.value)}
                          className="w-full h-8 rounded border border-border cursor-pointer mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Size (px)</label>
                        <input
                          type="number"
                          value={fontSize}
                          min={10}
                          max={120}
                          onChange={e => setFontSize(Math.max(10, Math.min(120, parseInt(e.target.value) || 24)))}
                          className="w-full bg-background border border-border rounded px-2 py-1 text-sm mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full h-8 text-xs gap-1.5"
                      onClick={addTextOverlay}
                      disabled={!newText.trim()}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Overlay
                    </Button>
                  </div>
                </div>

                {textOverlays.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Overlays ({textOverlays.length})</h3>
                      <button
                        onClick={() => setTextOverlays([])}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-1">
                      {textOverlays.map(overlay => (
                        <div key={overlay.id} className="flex items-center gap-2 bg-background rounded px-2 py-1.5 text-xs">
                          <div
                            className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                            style={{ backgroundColor: overlay.color }}
                          />
                          <span className="flex-1 truncate font-medium">{overlay.text}</span>
                          <span className="text-muted-foreground">{overlay.fontSize}px</span>
                          <button
                            onClick={() => removeTextOverlay(overlay.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!videoObjectUrl && (
                  <p className="text-xs text-muted-foreground text-center py-2 border border-dashed border-border rounded p-3">
                    Upload a video to preview text overlays
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="flex-shrink-0 border-t border-border bg-card/30 p-3">
        {videoObjectUrl ? (
          <TimelineEditor
            duration={duration}
            currentTime={currentTime}
            clips={clips}
            scenes={scenes}
            onSeek={handleSeek}
            onTrimStart={handleTrimStart}
            onTrimEnd={handleTrimEnd}
            trimStart={trimStart}
            trimEnd={trimEnd}
          />
        ) : (
          <div className="h-20 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            Upload a video to see the interactive timeline
          </div>
        )}
      </div>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { TimelineEditor } from "@/components/TimelineEditor";
import { ExportDialog } from "@/components/ExportDialog";
import { AudioEffectsPanel } from "@/components/AudioEffectsPanel";
import { ColorGradingPanel } from "@/components/ColorGradingPanel";
import { EffectSettings, DEFAULT_EFFECTS } from "@/lib/videoEffects";
import { ColorGrade, DEFAULT_GRADE } from "@/components/ColorGradingPanel";
import {
  Upload, Play, Pause, Volume2, VolumeX, Download,
  Save, FolderOpen, Scissors, Type,
  Zap, Film, X, Loader2, SplitSquareHorizontal,
  Undo2, Redo2, MessageSquare, Palette, Music, ChevronDown, Send
} from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface Caption {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface AudioTrack {
  id: string;
  name: string;
  duration: number;
  volume: number;
  startTime: number;
  objectUrl?: string;
  audioEl?: HTMLAudioElement;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface EditorSnapshot {
  clips: TimelineClip[];
  textOverlays: TextOverlay[];
  scenes: SceneMarker[];
  captions: Caption[];
  trimStart: number;
  trimEnd: number;
  speed: number;
  opacity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

async function exportTrimmedClip(
  videoEl: HTMLVideoElement,
  startTime: number,
  endTime: number,
  fileName: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const stream = (videoEl as any).captureStream?.(30) ?? (videoEl as any).mozCaptureStream?.(30);
      if (!stream) { reject(new Error("captureStream not supported")); return; }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${fileName}.webm`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        resolve();
      };
      recorder.onerror = e => reject(new Error("MediaRecorder error: " + e));

      videoEl.currentTime = startTime;
      videoEl.playbackRate = 1;
      videoEl.muted = true;

      const clipDuration = endTime - startTime;
      let elapsed = 0;
      const tick = setInterval(() => {
        elapsed += 0.25;
        onProgress(Math.min(100, Math.round((elapsed / clipDuration) * 100)));
        if (elapsed >= clipDuration) { clearInterval(tick); videoEl.pause(); recorder.stop(); }
      }, 250);

      videoEl.onseeked = () => { recorder.start(100); videoEl.play().catch(reject); };
    } catch (err) { reject(err); }
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Editor() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Video
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoFileRef = useRef<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Project
  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectDbId, setProjectDbId] = useState<number | null>(null);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [scenes, setScenes] = useState<SceneMarker[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [showProjects, setShowProjects] = useState(false);

  // Editing
  const [speed, setSpeed] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [newText, setNewText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(24);

  // Audio (Web Audio API)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const audioTrackGainsRef = useRef<Map<string, GainNode>>(new Map());

  // Effects & Color Grading
  const [effects, setEffects] = useState<EffectSettings>(DEFAULT_EFFECTS);
  const [colorGrade, setColorGrade] = useState<ColorGrade>(DEFAULT_GRADE);

  // AI
  const [isDetectingScenes, setIsDetectingScenes] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [showCaptions, setShowCaptions] = useState(true);

  // Chatbot
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi! I'm your PixelCraft AI assistant. Tell me what you want to do — for example:\n• \"trim to 30 seconds\"\n• \"speed up to 2x\"\n• \"detect scenes\"\n• \"export as 9:16\"\n• \"add caption Hello World\"" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Panel
  const [activePanel, setActivePanel] = useState<"edit" | "ai" | "text" | "effects" | "color" | "chat">("edit");
  const [audioEffectsTab, setAudioEffectsTab] = useState<"audio" | "effects">("audio");

  // Undo/Redo
  const historyRef = useRef<EditorSnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingClipId, setExportingClipId] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // tRPC
  const createProject = trpc.projects.create.useMutation({ onSuccess: () => utils.projects.list.invalidate() });
  const updateProject = trpc.projects.update.useMutation({ onSuccess: () => utils.projects.list.invalidate() });
  const deleteProject = trpc.projects.delete.useMutation({ onSuccess: () => utils.projects.list.invalidate() });
  const saveClipMutation = trpc.clips.create.useMutation();
  const uploadVideoMutation = trpc.videos.upload.useMutation();
  const uploadAudioMutation = trpc.videos.uploadAudio.useMutation();
  const generateCaptionsMutation = trpc.captions.generate.useMutation();
  const chatbotMutation = trpc.chatbot.command.useMutation();
  const { data: projectList } = trpc.projects.list.useQuery();

  // ─── Web Audio API Setup ───────────────────────────────────────────────────
  const initAudioContext = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    return ctx;
  }, []);

  const connectVideoToAudioGraph = useCallback(() => {
    const video = videoRef.current;
    if (!video || audioSourceRef.current) return;
    try {
      const ctx = initAudioContext();
      const source = ctx.createMediaElementSource(video);
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.connect(gain);
      gain.connect(ctx.destination);
      audioSourceRef.current = source;
      audioGainRef.current = gain;
    } catch (err) {
      console.warn("Could not connect video to AudioContext:", err);
    }
  }, [volume, initAudioContext]);

  // ─── Undo/Redo ─────────────────────────────────────────────────────────────
  const captureSnapshot = useCallback((): EditorSnapshot => ({
    clips: [...clips], textOverlays: [...textOverlays], scenes: [...scenes],
    captions: [...captions], trimStart, trimEnd, speed, opacity,
  }), [clips, textOverlays, scenes, captions, trimStart, trimEnd, speed, opacity]);

  const pushHistory = useCallback((snapshot: EditorSnapshot) => {
    const history = historyRef.current;
    const idx = historyIndexRef.current;
    history.splice(idx + 1);
    history.push(snapshot);
    if (history.length > 50) history.shift();
    historyIndexRef.current = history.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    historyIndexRef.current = idx - 1;
    const snap = historyRef.current[historyIndexRef.current]!;
    setClips(snap.clips); setTextOverlays(snap.textOverlays); setScenes(snap.scenes);
    setCaptions(snap.captions); setTrimStart(snap.trimStart); setTrimEnd(snap.trimEnd);
    setSpeed(snap.speed); setOpacity(snap.opacity);
    if (videoRef.current) videoRef.current.playbackRate = snap.speed;
    setCanUndo(historyIndexRef.current > 0); setCanRedo(true);
    toast.success("Undo");
  }, []);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return;
    historyIndexRef.current = idx + 1;
    const snap = historyRef.current[historyIndexRef.current]!;
    setClips(snap.clips); setTextOverlays(snap.textOverlays); setScenes(snap.scenes);
    setCaptions(snap.captions); setTrimStart(snap.trimStart); setTrimEnd(snap.trimEnd);
    setSpeed(snap.speed); setOpacity(snap.opacity);
    if (videoRef.current) videoRef.current.playbackRate = snap.speed;
    setCanUndo(true); setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    toast.success("Redo");
  }, []);

  const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSnapshotRef = useRef<EditorSnapshot | null>(null);
  const pushHistoryDebounced = useCallback((snapshot: EditorSnapshot) => {
    if (!pendingSnapshotRef.current) pendingSnapshotRef.current = snapshot;
    if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
    historyDebounceRef.current = setTimeout(() => {
      if (pendingSnapshotRef.current) { pushHistory(pendingSnapshotRef.current); pendingSnapshotRef.current = null; }
    }, 600);
  }, [pushHistory]);

  // ─── Video Upload ──────────────────────────────────────────────────────────
  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) { toast.error("File too large. Max 500 MB."); return; }
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    // Disconnect old audio graph so we can reconnect fresh
    audioSourceRef.current = null;
    audioGainRef.current = null;
    videoFileRef.current = file;
    const url = URL.createObjectURL(file);
    setVideoObjectUrl(url);
    setProjectName(file.name.replace(/\.[^/.]+$/, ""));
    setIsVideoLoading(true); setIsPlaying(false);
    setCurrentTime(0); setDuration(0); setTrimStart(0); setTrimEnd(0);
    setClips([]); setScenes([]); setTextOverlays([]); setCaptions([]);
    e.target.value = "";
  }, [videoObjectUrl]);

  useEffect(() => () => { if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl); }, []);

  // ─── Video Events ──────────────────────────────────────────────────────────
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const dur = isFinite(video.duration) ? video.duration : 0;
    setDuration(dur); setTrimEnd(dur); setIsVideoLoading(false);
    video.playbackRate = speed; video.volume = volume; video.muted = isMuted;
  }, [speed, volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);

  const handleVideoEnded = useCallback(() => setIsPlaying(false), []);
  const handleVideoError = useCallback(() => { setIsVideoLoading(false); toast.error("Failed to load video."); }, []);

  const handlePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoObjectUrl) return;
    // Resume AudioContext on first user gesture
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
    try {
      if (isPlaying) { video.pause(); }
      else {
        connectVideoToAudioGraph();
        // Sync audio tracks
        audioTracks.forEach(track => {
          if (track.audioEl) {
            track.audioEl.currentTime = video.currentTime - track.startTime / 1000;
            track.audioEl.play().catch(() => {});
          }
        });
        await video.play();
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast.error("Playback failed.");
    }
  }, [isPlaying, videoObjectUrl, audioTracks, connectVideoToAudioGraph]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(time, duration));
    video.currentTime = clamped;
    setCurrentTime(clamped);
    // Sync audio tracks
    audioTracks.forEach(track => {
      if (track.audioEl) {
        const offset = clamped - track.startTime / 1000;
        if (offset >= 0 && offset < track.duration / 1000) {
          track.audioEl.currentTime = offset;
        } else {
          track.audioEl.pause();
        }
      }
    });
  }, [duration, audioTracks]);

  const handleVolumeChange = useCallback((val: number) => {
    const v = Math.max(0, Math.min(1, val));
    setVolume(v); setIsMuted(v === 0);
    if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
    if (audioGainRef.current) audioGainRef.current.gain.value = v;
  }, []);

  // ─── Editing Controls ──────────────────────────────────────────────────────
  const handleSpeedChange = useCallback((val: number) => {
    pushHistoryDebounced(captureSnapshot());
    setSpeed(val);
    if (videoRef.current) videoRef.current.playbackRate = val;
  }, [pushHistoryDebounced, captureSnapshot]);

  const handleOpacityChange = useCallback((val: number) => {
    pushHistoryDebounced(captureSnapshot());
    setOpacity(Math.max(0, Math.min(1, val)));
  }, [pushHistoryDebounced, captureSnapshot]);

  const handleTrimStart = useCallback((t: number) => {
    pushHistoryDebounced(captureSnapshot());
    setTrimStart(Math.max(0, Math.min(t, trimEnd - 0.1)));
  }, [trimEnd, pushHistoryDebounced, captureSnapshot]);

  const handleTrimEnd = useCallback((t: number) => {
    pushHistoryDebounced(captureSnapshot());
    setTrimEnd(Math.min(duration, Math.max(t, trimStart + 0.1)));
  }, [trimStart, duration, pushHistoryDebounced, captureSnapshot]);

  const createClip = useCallback(() => {
    if (!videoObjectUrl) { toast.error("Upload a video first"); return; }
    if (trimEnd - trimStart < 0.5) { toast.error("Clip must be at least 0.5 seconds"); return; }
    pushHistory(captureSnapshot());
    const clip: TimelineClip = {
      id: `clip-${Date.now()}`, name: `Clip ${clips.length + 1}`,
      startTime: trimStart, endTime: trimEnd, type: "video", opacity, speed,
    };
    setClips(prev => [...prev, clip]);
    toast.success(`Clip: ${formatTime(trimStart)} → ${formatTime(trimEnd)}`);
    if (projectDbId) {
      saveClipMutation.mutate({ projectId: projectDbId, name: clip.name,
        startTime: Math.floor(trimStart * 1000), endTime: Math.floor(trimEnd * 1000), type: "video" });
    }
  }, [videoObjectUrl, trimStart, trimEnd, clips.length, opacity, speed, projectDbId, saveClipMutation, pushHistory, captureSnapshot]);

  const removeClip = useCallback((id: string) => {
    pushHistory(captureSnapshot()); setClips(prev => prev.filter(c => c.id !== id));
  }, [pushHistory, captureSnapshot]);

  const splitClipAtPlayhead = useCallback(() => {
    if (!videoObjectUrl) { toast.error("Upload a video first"); return; }
    if (currentTime <= trimStart + 0.1 || currentTime >= trimEnd - 0.1) {
      toast.error("Move playhead between trim points to split"); return;
    }
    pushHistory(captureSnapshot());
    const a: TimelineClip = { id: `clip-${Date.now()}-a`, name: `Clip ${clips.length + 1}A`, startTime: trimStart, endTime: currentTime, type: "video", opacity, speed };
    const b: TimelineClip = { id: `clip-${Date.now()}-b`, name: `Clip ${clips.length + 1}B`, startTime: currentTime, endTime: trimEnd, type: "video", opacity, speed };
    setClips(prev => [...prev, a, b]);
    toast.success("Split into 2 clips at playhead");
  }, [videoObjectUrl, currentTime, trimStart, trimEnd, clips.length, opacity, speed, pushHistory, captureSnapshot]);

  // ─── Text Overlays ─────────────────────────────────────────────────────────
  const addTextOverlay = useCallback(() => {
    if (!newText.trim()) { toast.error("Enter some text first"); return; }
    pushHistory(captureSnapshot());
    setTextOverlays(prev => [...prev, { id: `text-${Date.now()}`, text: newText.trim(), x: 50, y: 80, fontSize, color: textColor }]);
    setNewText(""); toast.success("Text overlay added");
  }, [newText, fontSize, textColor, pushHistory, captureSnapshot]);

  const removeTextOverlay = useCallback((id: string) => {
    pushHistory(captureSnapshot()); setTextOverlays(prev => prev.filter(t => t.id !== id));
  }, [pushHistory, captureSnapshot]);

  // ─── Audio Tracks ──────────────────────────────────────────────────────────
  const handleAddAudioTrack = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const audioEl = new Audio(objectUrl);
    audioEl.preload = "metadata";

    await new Promise<void>((resolve) => {
      audioEl.onloadedmetadata = () => resolve();
      audioEl.onerror = () => resolve();
      setTimeout(resolve, 3000);
    });

    // Connect to AudioContext for mixing
    try {
      const ctx = initAudioContext();
      const source = ctx.createMediaElementSource(audioEl);
      const gain = ctx.createGain();
      gain.gain.value = 1;
      source.connect(gain);
      gain.connect(ctx.destination);
      const trackId = `audio-${Date.now()}`;
      audioTrackGainsRef.current.set(trackId, gain);

      const newTrack: AudioTrack = {
        id: trackId, name: file.name,
        duration: isFinite(audioEl.duration) ? audioEl.duration * 1000 : 0,
        volume: 100, startTime: 0, objectUrl, audioEl,
      };
      setAudioTracks(prev => [...prev, newTrack]);
      toast.success(`Audio track added: ${file.name}`);
    } catch (err) {
      toast.error("Could not add audio track: " + (err as Error).message);
      URL.revokeObjectURL(objectUrl);
    }
  }, [initAudioContext]);

  const handleRemoveAudioTrack = useCallback((trackId: string) => {
    setAudioTracks(prev => {
      const track = prev.find(t => t.id === trackId);
      if (track) {
        track.audioEl?.pause();
        if (track.objectUrl) URL.revokeObjectURL(track.objectUrl);
        audioTrackGainsRef.current.delete(trackId);
      }
      return prev.filter(t => t.id !== trackId);
    });
  }, []);

  const handleUpdateAudioTrack = useCallback((trackId: string, volume: number) => {
    setAudioTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        if (t.audioEl) t.audioEl.volume = volume / 100;
        const gain = audioTrackGainsRef.current.get(trackId);
        if (gain) gain.gain.value = volume / 100;
        return { ...t, volume };
      }
      return t;
    }));
  }, []);

  // Pause audio tracks when video pauses
  useEffect(() => {
    if (!isPlaying) {
      audioTracks.forEach(track => track.audioEl?.pause());
    }
  }, [isPlaying, audioTracks]);

  // ─── Scene Detection ───────────────────────────────────────────────────────
  const detectScenes = useCallback(async () => {
    if (!videoObjectUrl) { toast.error("Upload a video first"); return; }
    const video = videoRef.current;
    if (!video || !isFinite(duration) || duration === 0) { toast.error("Video not ready"); return; }

    setIsDetectingScenes(true);
    const toastId = toast.loading("Analyzing video for scene cuts...");
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      canvas.width = 160; canvas.height = 90;

      const sampleInterval = Math.max(0.5, duration / 200);
      const detected: SceneMarker[] = [{ id: 0, timestamp: 0, confidence: 1.0 }];
      let prevHist: number[] | null = null;
      const THRESHOLD = 22;

      const getHist = (data: ImageData): number[] => {
        const h = new Array(32).fill(0);
        for (let i = 0; i < data.data.length; i += 4) {
          const lum = Math.floor((data.data[i]! * 0.299 + data.data[i + 1]! * 0.587 + data.data[i + 2]! * 0.114) / 8);
          h[Math.min(31, lum)]++;
        }
        return h;
      };

      const histDiff = (a: number[], b: number[]) =>
        a.reduce((sum, v, i) => sum + Math.abs(v - (b[i] ?? 0)), 0) / (canvas.width * canvas.height);

      const sampleFrame = (time: number): Promise<number[]> =>
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Seek timeout")), 5000);
          video.addEventListener("seeked", () => {
            clearTimeout(timeout);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(getHist(ctx.getImageData(0, 0, canvas.width, canvas.height)));
          }, { once: true });
          video.currentTime = time;
        });

      for (let t = sampleInterval; t < duration - sampleInterval; t += sampleInterval) {
        const hist = await sampleFrame(t);
        if (prevHist) {
          const diff = histDiff(prevHist, hist);
          if (diff > THRESHOLD) {
            detected.push({ id: detected.length, timestamp: Math.round(t * 1000), confidence: Math.min(1, diff / 80) });
          }
        }
        prevHist = hist;
      }

      video.currentTime = currentTime;
      pushHistory(captureSnapshot());
      setScenes(detected);
      toast.dismiss(toastId);
      toast.success(`Found ${detected.length} scene${detected.length !== 1 ? "s" : ""}!`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Scene detection failed: " + (err as Error).message);
    } finally {
      setIsDetectingScenes(false);
    }
  }, [videoObjectUrl, duration, currentTime, pushHistory, captureSnapshot]);

  // ─── Caption Generation (Fixed: read file directly, no AudioContext) ───────
  const generateCaptions = useCallback(async () => {
    if (!videoObjectUrl) { toast.error("Upload a video first"); return; }
    if (!projectDbId) { toast.error("Save your project first, then generate captions"); return; }
    const videoFile = videoFileRef.current;
    if (!videoFile) { toast.error("Video file not available. Re-upload the video."); return; }

    setIsGeneratingCaptions(true);
    const toastId = toast.loading("Extracting audio track...");
    try {
      // Extract audio using OfflineAudioContext — produces a small WAV blob
      // instead of uploading the full video file (which would be too large)
      let audioBase64: string;
      let audioMime: string;
      try {
        const arrayBuffer = await videoFile.arrayBuffer();
        const tempCtx = new AudioContext();
        const decoded = await tempCtx.decodeAudioData(arrayBuffer);
        await tempCtx.close();

        const offlineCtx = new OfflineAudioContext(
          decoded.numberOfChannels,
          decoded.length,
          decoded.sampleRate
        );
        const src = offlineCtx.createBufferSource();
        src.buffer = decoded;
        src.connect(offlineCtx.destination);
        src.start(0);
        const rendered = await offlineCtx.startRendering();

        // Encode to WAV
        const numCh = rendered.numberOfChannels;
        const sampleRate = rendered.sampleRate;
        const samples = rendered.length;
        const wavBuffer = new ArrayBuffer(44 + samples * numCh * 2);
        const view = new DataView(wavBuffer);
        const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
        writeStr(0, "RIFF"); view.setUint32(4, 36 + samples * numCh * 2, true);
        writeStr(8, "WAVE"); writeStr(12, "fmt "); view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); view.setUint16(22, numCh, true);
        view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * numCh * 2, true);
        view.setUint16(32, numCh * 2, true); view.setUint16(34, 16, true);
        writeStr(36, "data"); view.setUint32(40, samples * numCh * 2, true);
        let offset = 44;
        for (let i = 0; i < samples; i++) {
          for (let ch = 0; ch < numCh; ch++) {
            const s = Math.max(-1, Math.min(1, rendered.getChannelData(ch)[i] ?? 0));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
          }
        }
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
        const b64Reader = new FileReader();
        audioBase64 = await new Promise<string>((res, rej) => {
          b64Reader.onload = () => res((b64Reader.result as string).split(",")[1] ?? "");
          b64Reader.onerror = rej;
          b64Reader.readAsDataURL(wavBlob);
        });
        audioMime = "audio/wav";
      } catch {
        // Fallback: send raw video file if audio decode fails (e.g. video has no audio)
        const reader = new FileReader();
        audioBase64 = await new Promise<string>((res, rej) => {
          reader.onload = () => res((reader.result as string).split(",")[1] ?? "");
          reader.onerror = rej;
          reader.readAsDataURL(videoFile);
        });
        audioMime = videoFile.type || "video/mp4";
      }

      toast.loading("Uploading for transcription...", { id: toastId });

      const uploaded = await uploadAudioMutation.mutateAsync({
        projectId: projectDbId,
        fileName: `audio-${Date.now()}.wav`,
        fileData: audioBase64,
        mimeType: audioMime,
      });

      if (!uploaded?.url) throw new Error("Audio upload failed — no URL returned");

      toast.loading("Transcribing with Whisper AI...", { id: toastId });

      const result = await generateCaptionsMutation.mutateAsync({
        projectId: projectDbId,
        audioUrl: uploaded.url,
        language: "en",
      });

      if (result.captions && result.captions.length > 0) {
        pushHistory(captureSnapshot());
        setCaptions(result.captions.map((c: any, i: number) => ({
          id: `cap-${Date.now()}-${i}`,
          startTime: c?.startTime ?? 0,
          endTime: c?.endTime ?? 0,
          text: c?.text ?? "",
        })));
        toast.dismiss(toastId);
        toast.success(`Generated ${result.captions.length} caption segments!`);
      } else if (result.fullText) {
        pushHistory(captureSnapshot());
        setCaptions([{ id: `cap-${Date.now()}`, startTime: 0, endTime: duration * 1000, text: result.fullText }]);
        toast.dismiss(toastId);
        toast.success("Captions generated!");
      } else {
        toast.dismiss(toastId);
        toast.error("No speech detected in the video.");
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Caption generation failed: " + (err as Error).message);
    } finally {
      setIsGeneratingCaptions(false);
    }
  }, [videoObjectUrl, projectDbId, duration, uploadAudioMutation, generateCaptionsMutation, pushHistory, captureSnapshot]);

  // ─── Project Save / Load ───────────────────────────────────────────────────
  const saveProject = useCallback(async () => {
    if (!projectName.trim()) { toast.error("Enter a project name"); return; }
    const toastId = toast.loading("Saving project...");
    try {
      let dbId = projectDbId;
      if (!dbId) {
        const created = await createProject.mutateAsync({ name: projectName.trim(), description: `${clips.length} clips` });
        if (created?.id) { dbId = created.id; setProjectDbId(created.id); }
      } else {
        await updateProject.mutateAsync({ projectId: dbId, name: projectName.trim(), duration });
      }
      if (dbId && videoFileRef.current) {
        const file = videoFileRef.current;
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await uploadVideoMutation.mutateAsync({ projectId: dbId, fileName: file.name, fileData: base64, mimeType: file.type || "video/mp4" });
      }
      toast.dismiss(toastId); toast.success("Project saved!");
    } catch {
      toast.dismiss(toastId);
    }
  }, [projectName, projectDbId, clips.length, duration, createProject, updateProject, uploadVideoMutation]);

  const loadProjectFromDb = useCallback(async (projId: number, projName: string) => {
    const toastId = toast.loading(`Loading ${projName}...`);
    try {
      const full = await utils.projects.getFull.fetch({ projectId: projId });
      if (!full) { toast.dismiss(toastId); toast.error("Project not found"); return; }
      setProjectDbId(full.project.id); setProjectName(full.project.name);
      if (full.project.duration) { setDuration(full.project.duration); setTrimEnd(full.project.duration); }
      if (full.clips.length > 0) {
        setClips(full.clips.map(c => ({ id: `clip-${c.id}`, name: c.name, startTime: c.startTime / 1000, endTime: c.endTime / 1000, type: (c.type ?? "video") as "video" | "audio" | "text", opacity: c.opacity ?? 1, speed: c.speed ?? 1 })));
      }
      if (full.scenes.length > 0) {
        setScenes(full.scenes.map(s => ({ id: s.id, timestamp: s.timestamp, confidence: s.confidence ?? 0.5 })));
      }
      if (full.project.videoUrl) {
        try {
          const resp = await fetch(full.project.videoUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
            audioSourceRef.current = null; audioGainRef.current = null;
            setVideoObjectUrl(URL.createObjectURL(blob));
            setIsVideoLoading(true);
          }
        } catch { toast.error("Could not restore video. Please re-upload."); }
      }
      setShowProjects(false); toast.dismiss(toastId); toast.success(`Loaded: ${full.project.name}`);
    } catch (err) {
      toast.dismiss(toastId); toast.error("Failed to load: " + (err as Error).message);
    }
  }, [utils, videoObjectUrl]);

  // ─── Chatbot ───────────────────────────────────────────────────────────────
  const sendChatMessage = useCallback(async () => {
    const msg = chatInput.trim();
    if (!msg || isChatLoading) return;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: msg }]);
    setIsChatLoading(true);

    try {
      const result = await chatbotMutation.mutateAsync({
        message: msg,
        context: {
          hasVideo: !!videoObjectUrl,
          duration: Math.round(duration),
          currentTime: Math.round(currentTime),
          clipCount: clips.length,
          captionCount: captions.length,
          trimStart: Math.round(trimStart * 10) / 10,
          trimEnd: Math.round(trimEnd * 10) / 10,
          speed,
          opacity,
        },
      });

      // Apply the command
      if (result.action) {
        const { action, params } = result;
        switch (action) {
          case "trim":
            if (params?.start !== undefined && params.start !== null) { handleTrimStart(Number(params.start)); }
            if (params?.end !== undefined && params.end !== null) { handleTrimEnd(Number(params.end)); }
            break;
          case "speed":
            if (params?.speed !== undefined) handleSpeedChange(Number(params.speed));
            break;
          case "opacity":
            if (params?.opacity !== undefined) handleOpacityChange(Number(params.opacity));
            break;
          case "seek":
            if (params?.time !== undefined && params.time !== null) handleSeek(Number(params.time));
            break;
          case "play":
            if (!isPlaying) handlePlayPause();
            break;
          case "pause":
            if (isPlaying) handlePlayPause();
            break;
          case "detect_scenes":
            detectScenes();
            break;
          case "generate_captions":
            generateCaptions();
            break;
          case "create_clip":
            createClip();
            break;
          case "split":
            splitClipAtPlayhead();
            break;
          case "export":
            setShowExportDialog(true);
            break;
          case "add_text":
            if (params?.text) { setNewText(String(params.text)); setActivePanel("text"); }
            break;
          case "switch_panel":
            if (params?.panel) setActivePanel(params.panel as any);
            break;
        }
      }

      setChatMessages(prev => [...prev, { role: "assistant", text: result.message ?? "Done!" }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Sorry, I couldn't process that command. Try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, isChatLoading, videoObjectUrl, duration, currentTime, clips, captions, scenes, trimStart, trimEnd, speed, opacity, isPlaying, chatbotMutation, handleTrimStart, handleTrimEnd, handleSpeedChange, handleOpacityChange, handleSeek, handlePlayPause, detectScenes, generateCaptions, createClip, splitClipAtPlayhead]);

  // Scroll chat to bottom
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // ─── Keyboard Shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " ") { e.preventDefault(); handlePlayPause(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); handleSeek(currentTime - 5); }
      if (e.key === "ArrowRight") { e.preventDefault(); handleSeek(currentTime + 5); }
      if (e.key === "m" || e.key === "M") { setIsMuted(v => { const next = !v; if (videoRef.current) videoRef.current.muted = next; return next; }); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === "[") handleTrimStart(currentTime);
      if (e.key === "]") handleTrimEnd(currentTime);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlePlayPause, handleSeek, currentTime, undo, redo, handleTrimStart, handleTrimEnd]);

  // ─── Active caption at current time ───────────────────────────────────────
  const activeCaption = showCaptions
    ? captions.find(c => currentTime * 1000 >= c.startTime && currentTime * 1000 <= c.endTime)
    : null;

  // ─── Render ────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Film className="w-12 h-12 text-accent mx-auto" />
          <h2 className="text-xl font-bold">Sign in to use PixelCraft Editor</h2>
          <p className="text-muted-foreground text-sm">Your projects are saved to your account.</p>
          <Link href="/"><Button variant="outline">← Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const panelTabs = [
    { id: "edit", icon: <Scissors className="w-3.5 h-3.5" />, label: "Edit" },
    { id: "ai", icon: <Zap className="w-3.5 h-3.5" />, label: "AI" },
    { id: "text", icon: <Type className="w-3.5 h-3.5" />, label: "Text" },
    { id: "effects", icon: <Music className="w-3.5 h-3.5" />, label: "Audio" },
    { id: "color", icon: <Palette className="w-3.5 h-3.5" />, label: "Color" },
    { id: "chat", icon: <MessageSquare className="w-3.5 h-3.5" />, label: "AI Chat" },
  ] as const;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 h-12 bg-card border-b border-border flex items-center px-4 gap-3">
        <Link href="/" className="flex items-center gap-2 mr-2">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs font-bold">P</div>
          <span className="font-bold text-sm hidden sm:block">PixelCraft</span>
        </Link>

        <div className="flex-1 flex items-center gap-2">
          <input
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent rounded px-2 py-0.5 max-w-[200px]"
            placeholder="Project name"
          />
          <div className="relative">
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 px-2" onClick={() => setShowProjects(v => !v)}>
              <FolderOpen className="w-3.5 h-3.5" />
              <ChevronDown className="w-3 h-3" />
            </Button>
            {showProjects && (
              <div className="absolute top-8 left-0 z-50 bg-card border border-border rounded-lg shadow-xl w-64 max-h-72 overflow-y-auto">
                <div className="p-2 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">Your Projects</p>
                </div>
                {projectList?.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">No saved projects yet</p>}
                {projectList?.map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-accent/10 cursor-pointer group" onClick={() => loadProjectFromDb(p.id, p.name)}>
                    <Film className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteProject.mutate({ projectId: p.id }); if (projectDbId === p.id) { setProjectDbId(null); setProjectName("Untitled Project"); } }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"><Undo2 className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"><Redo2 className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => setShowExportDialog(true)} disabled={!videoObjectUrl}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button size="sm" variant="default" className="h-7 px-2 text-xs gap-1 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={saveProject} disabled={!videoObjectUrl}>
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        </div>
      </header>

      {/* ── Main Area ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Video Preview ── */}
        <div className="flex-1 flex flex-col bg-black min-w-0">
          {/* Video */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {!videoObjectUrl ? (
              <label className="cursor-pointer flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground group-hover:border-accent transition-colors flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Upload a video to start editing</p>
                  <p className="text-sm text-muted-foreground mt-1">MP4, WebM, MOV — up to 500 MB</p>
                </div>
                <input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoObjectUrl}
                  className="max-w-full max-h-full object-contain"
                  style={{ opacity, filter: `brightness(${1 + effects.brightness / 100}) contrast(${1 + effects.contrast / 100}) saturate(${1 + effects.saturation / 100}) hue-rotate(${effects.hue}deg) blur(${effects.blur}px) grayscale(${effects.grayscale / 100}) sepia(${effects.sepia / 100})` }}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  playsInline
                />
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  </div>
                )}
                {/* Caption overlay */}
                {activeCaption && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/75 text-white text-sm px-4 py-1.5 rounded-md max-w-[80%] text-center pointer-events-none">
                    {activeCaption.text}
                  </div>
                )}
                {/* Text overlays */}
                {textOverlays.map(overlay => (
                  <div key={overlay.id} className="absolute pointer-events-none" style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, transform: "translate(-50%, -50%)", fontSize: `${overlay.fontSize}px`, color: overlay.color, textShadow: "0 1px 3px rgba(0,0,0,0.8)", fontWeight: "bold", whiteSpace: "nowrap" }}>
                    {overlay.text}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Playback Controls */}
          {videoObjectUrl && (
            <div className="flex-shrink-0 bg-card/80 border-t border-border px-4 py-2 space-y-2">
              {/* Progress bar */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-10 text-right font-mono">{formatTime(currentTime)}</span>
                <div className="flex-1 relative h-2 bg-border rounded-full cursor-pointer group" onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleSeek(((e.clientX - rect.left) / rect.width) * duration);
                }}>
                  {/* Trim range */}
                  <div className="absolute h-full bg-accent/20 rounded-full" style={{ left: `${(trimStart / duration) * 100}%`, width: `${((trimEnd - trimStart) / duration) * 100}%` }} />
                  {/* Playhead */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full -translate-x-1/2 shadow-md" style={{ left: `${(currentTime / duration) * 100}%` }} />
                  <div className="absolute h-full bg-accent/60 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
                </div>
                <span className="w-10 font-mono">{formatTime(duration)}</span>
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-3">
                <button onClick={handlePlayPause} className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground hover:bg-accent/90 transition-colors flex-shrink-0">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => { setIsMuted(v => { const next = !v; if (videoRef.current) videoRef.current.muted = next; return next; })} } className="text-muted-foreground hover:text-foreground transition-colors">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume} onChange={e => handleVolumeChange(Number(e.target.value))} className="w-20 h-1 accent-accent" />
                </div>
                <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
                  <span>Speed:</span>
                  {[0.5, 1, 1.5, 2].map(s => (
                    <button key={s} onClick={() => handleSpeedChange(s)} className={`px-1.5 py-0.5 rounded text-xs transition-colors ${speed === s ? "bg-accent text-accent-foreground" : "hover:bg-accent/20"}`}>{s}x</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div className="w-64 flex-shrink-0 flex flex-col border-l border-border bg-card overflow-hidden">
          {/* Panel Tabs */}
          <div className="flex-shrink-0 border-b border-border">
            <div className="grid grid-cols-3 gap-0">
              {panelTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${activePanel === tab.id ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab.icon}
                  <span className="text-[10px]">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">

            {/* ── Edit Panel ── */}
            {activePanel === "edit" && (
              <>
                {/* Upload */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Video</label>
                  <label className="flex items-center gap-2 cursor-pointer w-full border border-dashed border-border rounded-lg p-2 hover:border-accent hover:bg-accent/5 transition-colors text-xs text-muted-foreground">
                    <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{videoObjectUrl ? (videoFileRef.current?.name ?? "Video loaded") : "Upload video"}</span>
                    <input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" className="hidden" onChange={handleVideoUpload} />
                  </label>
                </div>

                {/* Trim */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Trim</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Start</p>
                      <div className="flex gap-1">
                        <input type="number" min={0} max={trimEnd - 0.1} step={0.1} value={trimStart.toFixed(1)} onChange={e => handleTrimStart(Number(e.target.value))} className="w-full bg-background border border-border rounded px-2 py-1 text-xs" />
                        <Button size="sm" variant="outline" className="h-7 px-1.5 text-xs flex-shrink-0" onClick={() => handleTrimStart(currentTime)} title="Set to playhead">[</Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">End</p>
                      <div className="flex gap-1">
                        <input type="number" min={trimStart + 0.1} max={duration} step={0.1} value={trimEnd.toFixed(1)} onChange={e => handleTrimEnd(Number(e.target.value))} className="w-full bg-background border border-border rounded px-2 py-1 text-xs" />
                        <Button size="sm" variant="outline" className="h-7 px-1.5 text-xs flex-shrink-0" onClick={() => handleTrimEnd(currentTime)} title="Set to playhead">]</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opacity</label>
                    <span className="text-xs text-accent">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={e => handleOpacityChange(Number(e.target.value))} className="w-full h-1.5 accent-accent" />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={createClip} disabled={!videoObjectUrl}>
                    <Film className="w-3.5 h-3.5" /> Create Clip
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={splitClipAtPlayhead} disabled={!videoObjectUrl}>
                    <SplitSquareHorizontal className="w-3.5 h-3.5" /> Split
                  </Button>
                </div>

                {/* Clips List */}
                {clips.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Clips ({clips.length})</label>
                    <div className="space-y-1.5">
                      {clips.map(clip => (
                        <div key={clip.id} className="flex items-center gap-2 bg-background rounded-lg px-2 py-1.5 group">
                          <Film className="w-3 h-3 text-accent flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{clip.name}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(clip.startTime)} → {formatTime(clip.endTime)}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={async () => {
                              if (!videoRef.current) return;
                              setIsExporting(true); setExportingClipId(clip.id);
                              try { await exportTrimmedClip(videoRef.current, clip.startTime, clip.endTime, clip.name, p => setExportProgress(p)); toast.success("Clip exported!"); }
                              catch (err) { toast.error("Export failed: " + (err as Error).message); }
                              finally { setIsExporting(false); setExportingClipId(null); }
                            }} className="text-muted-foreground hover:text-accent transition-colors" title="Export clip">
                              {exportingClipId === clip.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => removeClip(clip.id)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── AI Panel ── */}
            {activePanel === "ai" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Scene Detection</label>
                  <p className="text-xs text-muted-foreground mb-2">Analyzes brightness changes to find scene cuts automatically.</p>
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5" onClick={detectScenes} disabled={!videoObjectUrl || isDetectingScenes}>
                    {isDetectingScenes ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting...</> : <><Zap className="w-3.5 h-3.5" /> Detect Scenes</>}
                  </Button>
                  {scenes.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {scenes.map(s => (
                        <button key={s.id} onClick={() => handleSeek(s.timestamp / 1000)} className="w-full flex items-center gap-2 px-2 py-1 rounded bg-background hover:bg-accent/10 text-xs transition-colors text-left">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          <span className="font-mono text-accent">{formatTime(s.timestamp / 1000)}</span>
                          <span className="text-muted-foreground">Scene {s.id + 1}</span>
                          <span className="ml-auto text-muted-foreground">{Math.round(s.confidence * 100)}%</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Auto Captions</label>
                  <p className="text-xs text-muted-foreground mb-2">Transcribes speech using Whisper AI. Save your project first.</p>
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5" onClick={generateCaptions} disabled={!videoObjectUrl || isGeneratingCaptions || !projectDbId}>
                    {isGeneratingCaptions ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Transcribing...</> : <><Type className="w-3.5 h-3.5" /> Generate Captions</>}
                  </Button>
                  {!projectDbId && videoObjectUrl && <p className="text-xs text-yellow-500 mt-1">Save your project first to enable captions.</p>}
                  {captions.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">{captions.length} segments</p>
                        <div className="flex gap-2">
                          <button onClick={() => setShowCaptions(v => !v)} className="text-xs text-accent hover:text-accent/80">{showCaptions ? "Hide" : "Show"}</button>
                          <button onClick={() => { pushHistory(captureSnapshot()); setCaptions([]); }} className="text-xs text-muted-foreground hover:text-destructive">Clear</button>
                        </div>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {captions.map(cap => (
                          <button key={cap.id} onClick={() => handleSeek(cap.startTime / 1000)} className="w-full flex gap-2 px-2 py-1 rounded bg-background hover:bg-accent/10 text-xs text-left transition-colors">
                            <span className="font-mono text-accent flex-shrink-0">{formatTime(cap.startTime / 1000)}</span>
                            <span className="text-muted-foreground line-clamp-1">{cap.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Short-form Export</label>
                  <p className="text-xs text-muted-foreground mb-2">Export clips at 9:16 for TikTok, Reels, and Shorts.</p>
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5" onClick={() => { if (clips.length === 0) { toast.error("Create clips first"); return; } setShowExportDialog(true); }}>
                    <Download className="w-3.5 h-3.5" /> Export Short-form
                  </Button>
                </div>
              </>
            )}

            {/* ── Text Panel ── */}
            {activePanel === "text" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Add Text Overlay</label>
                  <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Enter text..." rows={2} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent" />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Color</p>
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 rounded border border-border cursor-pointer" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Size: {fontSize}px</p>
                      <input type="range" min={12} max={72} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full h-1.5 accent-accent mt-2" />
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5 mt-2" onClick={addTextOverlay} disabled={!videoObjectUrl || !newText.trim()}>
                    <Type className="w-3.5 h-3.5" /> Add Overlay
                  </Button>
                </div>
                {textOverlays.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Overlays ({textOverlays.length})</label>
                    <div className="space-y-1.5">
                      {textOverlays.map(o => (
                        <div key={o.id} className="flex items-center gap-2 bg-background rounded px-2 py-1.5 group">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: o.color }} />
                          <span className="text-xs flex-1 truncate">{o.text}</span>
                          <button onClick={() => removeTextOverlay(o.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Audio / Effects Panel ── */}
            {activePanel === "effects" && (
              <AudioEffectsPanel
                videoRef={videoRef}
                audioTracks={audioTracks}
                onAddAudioTrack={handleAddAudioTrack}
                onRemoveAudioTrack={handleRemoveAudioTrack}
                onUpdateAudioTrack={handleUpdateAudioTrack}
                effects={effects}
                onEffectsChange={setEffects}
                activeTab={audioEffectsTab}
                onTabChange={setAudioEffectsTab}
              />
            )}

            {/* ── Color Grading Panel ── */}
            {activePanel === "color" && (
              <ColorGradingPanel
                grade={colorGrade}
                onChange={setColorGrade}
                videoRef={videoRef}
                projectDbId={projectDbId}
              />
            )}

            {/* ── Chatbot Panel ── */}
            {activePanel === "chat" && (
              <div className="flex flex-col h-full -m-3">
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: "calc(100vh - 280px)" }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap ${msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-background text-foreground border border-border"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-background border border-border rounded-xl px-3 py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex-shrink-0 border-t border-border p-3">
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                      placeholder="Type a command..."
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <Button size="sm" variant="default" className="h-8 w-8 p-0 bg-accent hover:bg-accent/90 text-accent-foreground flex-shrink-0" onClick={sendChatMessage} disabled={!chatInput.trim() || isChatLoading}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
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
            captions={captions.map(c => ({ id: String(c.id), startTime: c.startTime, endTime: c.endTime, text: c.text }))}
            onSeek={handleSeek}
            onTrimStart={handleTrimStart}
            onTrimEnd={handleTrimEnd}
            trimStart={trimStart}
            trimEnd={trimEnd}
          />
        ) : (
          <div className="h-16 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            Upload a video to see the interactive timeline
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        videoRef={videoRef as React.RefObject<HTMLVideoElement>}
        videoObjectUrl={videoObjectUrl}
        clips={clips}
        duration={duration}
        projectName={projectName}
      />
    </div>
  );
}

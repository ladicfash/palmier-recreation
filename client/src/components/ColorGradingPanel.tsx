import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Sparkles, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ColorGrade {
  // Primary corrections
  brightness: number;    // -100 to 100
  contrast: number;      // -100 to 100
  saturation: number;    // -100 to 100
  hue: number;           // -180 to 180
  temperature: number;   // -100 to 100 (cool to warm)
  tint: number;          // -100 to 100 (green to magenta)
  // Lift/Gamma/Gain (shadows/midtones/highlights)
  liftR: number; liftG: number; liftB: number;
  gammaR: number; gammaG: number; gammaB: number;
  gainR: number; gainG: number; gainB: number;
  // Curves (0-255 input → 0-255 output, stored as 5 control points)
  curveMaster: [number, number][];
  curveR: [number, number][];
  curveG: [number, number][];
  curveB: [number, number][];
  // Vignette
  vignetteStrength: number; // 0 to 100
  // Preset name if applied
  preset: string;
}

export const DEFAULT_GRADE: ColorGrade = {
  brightness: 0, contrast: 0, saturation: 0, hue: 0,
  temperature: 0, tint: 0,
  liftR: 0, liftG: 0, liftB: 0,
  gammaR: 0, gammaG: 0, gammaB: 0,
  gainR: 0, gainG: 0, gainB: 0,
  curveMaster: [[0,0],[64,64],[128,128],[192,192],[255,255]],
  curveR: [[0,0],[128,128],[255,255]],
  curveG: [[0,0],[128,128],[255,255]],
  curveB: [[0,0],[128,128],[255,255]],
  vignetteStrength: 0,
  preset: "none",
};

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS: Record<string, Partial<ColorGrade>> = {
  none: {},
  cinematic: {
    contrast: 20, saturation: -15, temperature: -10,
    liftR: -5, liftG: -5, liftB: 10,
    gainR: 10, gainG: 5, gainB: -5,
    vignetteStrength: 30,
    curveMaster: [[0,10],[64,60],[128,128],[192,200],[255,245]],
  },
  warm: {
    temperature: 35, saturation: 15, brightness: 5,
    gainR: 15, gainG: 5, gainB: -10,
    liftR: 5, liftG: 0, liftB: -5,
  },
  cool: {
    temperature: -30, saturation: 10,
    gainR: -10, gainG: 0, gainB: 15,
    liftR: -5, liftG: 0, liftB: 10,
  },
  vintage: {
    saturation: -25, contrast: 15, brightness: -5,
    liftR: 15, liftG: 10, liftB: 5,
    gainR: 5, gainG: 0, gainB: -10,
    vignetteStrength: 50,
    curveMaster: [[0,20],[128,128],[255,235]],
  },
  dramatic: {
    contrast: 40, saturation: -20, brightness: -10,
    vignetteStrength: 60,
    curveMaster: [[0,0],[64,45],[128,128],[192,210],[255,255]],
  },
  matte: {
    contrast: -20, brightness: 5, saturation: -10,
    liftR: 20, liftG: 18, liftB: 15,
    gainR: -10, gainG: -10, gainB: -10,
  },
  golden_hour: {
    temperature: 50, saturation: 20, brightness: 5,
    gainR: 20, gainG: 10, gainB: -15,
    liftR: 10, liftG: 5, liftB: -5,
    vignetteStrength: 20,
  },
  teal_orange: {
    liftR: -5, liftG: 5, liftB: 10,
    gainR: 15, gainG: 5, gainB: -10,
    saturation: 20, contrast: 10,
  },
};

// ─── CSS Filter Generator ─────────────────────────────────────────────────────
export function gradeToCSS(grade: ColorGrade): string {
  const brightness = 1 + grade.brightness / 100;
  const contrast = 1 + grade.contrast / 100;
  const saturate = 1 + grade.saturation / 100;
  const hueRotate = grade.hue;
  // Temperature: shift sepia for warmth, invert-hue for cool
  const tempSepia = Math.max(0, grade.temperature) / 200;
  const filters = [
    `brightness(${brightness.toFixed(3)})`,
    `contrast(${contrast.toFixed(3)})`,
    `saturate(${saturate.toFixed(3)})`,
    `hue-rotate(${hueRotate}deg)`,
  ];
  if (tempSepia > 0) filters.push(`sepia(${tempSepia.toFixed(3)})`);
  return filters.join(" ");
}

// ─── Color Wheel Component ────────────────────────────────────────────────────
function ColorWheel({
  label, r, g, b, onChange
}: {
  label: string;
  r: number; g: number; b: number;
  onChange: (r: number, g: number, b: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
      <div className="w-full space-y-1">
        {(["R", "G", "B"] as const).map((ch) => {
          const val = ch === "R" ? r : ch === "G" ? g : b;
          const setter = ch === "R" ? (v: number) => onChange(v, g, b)
            : ch === "G" ? (v: number) => onChange(r, v, b)
            : (v: number) => onChange(r, g, v);
          return (
          <div key={ch as string} className="flex items-center gap-1.5">
            <span className="text-[10px] w-3 text-muted-foreground">{ch as string}</span>
            <Slider
              min={-50} max={50} step={1}
              value={[val as number]}
              onValueChange={([v]) => (setter as (v: number) => void)(v)}
              className="flex-1 h-1"
            />
            <span className="text-[10px] w-6 text-right text-muted-foreground">{(val as number) > 0 ? `+${val}` : val}</span>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Curves Editor ────────────────────────────────────────────────────────────
function CurvesEditor({
  points, onChange, color = "#22c55e"
}: {
  points: [number, number][];
  onChange: (pts: [number, number][]) => void;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(W * i / 4, 0); ctx.lineTo(W * i / 4, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, H * i / 4); ctx.lineTo(W, H * i / 4); ctx.stroke();
    }

    // Diagonal reference
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, 0); ctx.stroke();

    // Curve
    if (points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sorted = [...points].sort((a, b) => a[0] - b[0]);
    sorted.forEach(([x, y], i) => {
      const px = (x / 255) * W;
      const py = H - (y / 255) * H;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Control points
    sorted.forEach(([x, y]) => {
      const px = (x / 255) * W;
      const py = H - (y / 255) * H;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.stroke();
    });
  }, [points, color]);

  useEffect(() => { draw(); }, [draw]);

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 255);
    const y = Math.round((1 - (e.clientY - rect.top) / rect.height) * 255);
    return [Math.max(0, Math.min(255, x)), Math.max(0, Math.min(255, y))] as [number, number];
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const [mx, my] = getPoint(e);
    const sorted = [...points].sort((a, b) => a[0] - b[0]);
    // Find closest point
    let closest = -1, minDist = 20;
    sorted.forEach(([x, y], i) => {
      const d = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
      if (d < minDist) { minDist = d; closest = i; }
    });
    if (closest >= 0) {
      setDragging(closest);
    } else {
      // Add new point
      const newPts: [number, number][] = [...points, [mx, my]];
      onChange(newPts);
      setDragging(newPts.length - 1);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging === null) return;
    const [mx, my] = getPoint(e);
    const newPts = points.map((p, i) => i === dragging ? [mx, my] as [number, number] : p);
    onChange(newPts);
  };

  return (
    <canvas
      ref={canvasRef}
      width={200} height={150}
      className="w-full rounded border border-border cursor-crosshair bg-black/40"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={() => setDragging(null)}
      onMouseLeave={() => setDragging(null)}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ColorGradingPanelProps {
  grade: ColorGrade;
  onChange: (grade: ColorGrade) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  projectDbId: number | null;
}

export function ColorGradingPanel({ grade, onChange, videoRef, projectDbId }: ColorGradingPanelProps) {
  const [activeCurve, setActiveCurve] = useState<"master" | "r" | "g" | "b">("master");
  const [showWheels, setShowWheels] = useState(true);
  const [showCurves, setShowCurves] = useState(false);
  const [showPrimary, setShowPrimary] = useState(true);
  const [isGettingAISuggestion, setIsGettingAISuggestion] = useState(false);

  // AI suggestion via direct fetch (colorGrading router added to server separately)
  const callAISuggest = async (frameData: string, currentGrade: ColorGrade): Promise<{grade?: Partial<ColorGrade>; description?: string}> => {
    const res = await fetch("/api/trpc/colorGrading.suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ json: { frameData, currentGrade } }),
    });
    if (!res.ok) throw new Error("AI suggestion request failed");
    const json = await res.json();
    return json?.result?.data?.json ?? json;
  };

  const set = (key: keyof ColorGrade, val: number | string | [number, number][]) =>
    onChange({ ...grade, [key]: val });

  const applyPreset = (name: string) => {
    const preset = PRESETS[name];
    if (!preset) return;
    onChange({ ...DEFAULT_GRADE, ...preset, preset: name });
    toast.success(`Applied preset: ${name.replace(/_/g, " ")}`);
  };

  const reset = () => {
    onChange({ ...DEFAULT_GRADE });
    toast.info("Color grade reset");
  };

  const getAISuggestion = async () => {
    if (!videoRef.current) { toast.error("No video loaded"); return; }
    if (videoRef.current.videoWidth <= 0 || videoRef.current.videoHeight <= 0) {
      toast.error("Video dimensions not ready yet"); return;
    }
    setIsGettingAISuggestion(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 320; canvas.height = 180;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.drawImage(videoRef.current, 0, 0, 320, 180);
      const frameData = canvas.toDataURL("image/jpeg", 0.7);
      const data = await callAISuggest(frameData, grade);
      if (data?.grade) {
        onChange({ ...grade, ...data.grade });
        toast.success(`AI suggestion applied: ${data.description ?? "Custom grade"}`);
      }
    } catch (err: any) {
      toast.error("AI suggestion failed: " + (err.message || "Unknown error"));
    } finally {
      setIsGettingAISuggestion(false);
    }
  };

  const curveData = activeCurve === "master" ? grade.curveMaster
    : activeCurve === "r" ? grade.curveR
    : activeCurve === "g" ? grade.curveG
    : grade.curveB;

  const curveColor = activeCurve === "master" ? "#22c55e"
    : activeCurve === "r" ? "#ef4444"
    : activeCurve === "g" ? "#22c55e"
    : "#3b82f6";

  const setCurve = (pts: [number, number][]) => {
    const key = activeCurve === "master" ? "curveMaster"
      : activeCurve === "r" ? "curveR"
      : activeCurve === "g" ? "curveG"
      : "curveB";
    set(key as keyof ColorGrade, pts);
  };

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Color Grading</span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1"
            onClick={getAISuggestion} disabled={isGettingAISuggestion}>
            {isGettingAISuggestion ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            AI
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={reset}>
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Presets</p>
        <div className="grid grid-cols-4 gap-1">
          {Object.keys(PRESETS).map(name => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className={`px-1.5 py-1 rounded text-[10px] font-medium transition-colors border ${
                grade.preset === name
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {name === "none" ? "None" : name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Corrections */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3 py-2 bg-card/50 hover:bg-card/80 transition-colors"
          onClick={() => setShowPrimary(!showPrimary)}
        >
          <span className="font-medium text-xs">Primary Corrections</span>
          {showPrimary ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        {showPrimary && (
          <div className="p-3 space-y-2">
            {([
              ["Brightness", "brightness", -100, 100],
              ["Contrast", "contrast", -100, 100],
              ["Saturation", "saturation", -100, 100],
              ["Hue", "hue", -180, 180],
              ["Temperature", "temperature", -100, 100],
              ["Tint", "tint", -100, 100],
            ] as Array<[string, keyof ColorGrade, number, number]>).map(([label, key, min, max]) => (
              <div key={key as string} className="flex items-center gap-2">
                <span className="w-20 text-[10px] text-muted-foreground shrink-0">{label as string}</span>
                <Slider
                  min={min as number} max={max as number} step={1}
                  value={[grade[key as keyof ColorGrade] as number]}
                  onValueChange={([v]) => set(key as keyof ColorGrade, v)}
                  className="flex-1"
                />
                <span className="w-8 text-right text-[10px] text-muted-foreground">
                  {(grade[key as keyof ColorGrade] as number) > 0
                    ? `+${grade[key as keyof ColorGrade]}`
                    : grade[key as keyof ColorGrade]}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-20 text-[10px] text-muted-foreground shrink-0">Vignette</span>
              <Slider
                min={0} max={100} step={1}
                value={[grade.vignetteStrength]}
                onValueChange={([v]) => set("vignetteStrength", v)}
                className="flex-1"
              />
              <span className="w-8 text-right text-[10px] text-muted-foreground">{grade.vignetteStrength}</span>
            </div>
          </div>
        )}
      </div>

      {/* Color Wheels (Lift/Gamma/Gain) */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3 py-2 bg-card/50 hover:bg-card/80 transition-colors"
          onClick={() => setShowWheels(!showWheels)}
        >
          <span className="font-medium text-xs">Lift / Gamma / Gain</span>
          {showWheels ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        {showWheels && (
          <div className="p-3 space-y-4">
            <ColorWheel label="Lift (Shadows)"
              r={grade.liftR} g={grade.liftG} b={grade.liftB}
              onChange={(r, g, b) => onChange({ ...grade, liftR: r, liftG: g, liftB: b })}
            />
            <ColorWheel label="Gamma (Midtones)"
              r={grade.gammaR} g={grade.gammaG} b={grade.gammaB}
              onChange={(r, g, b) => onChange({ ...grade, gammaR: r, gammaG: g, gammaB: b })}
            />
            <ColorWheel label="Gain (Highlights)"
              r={grade.gainR} g={grade.gainG} b={grade.gainB}
              onChange={(r, g, b) => onChange({ ...grade, gainR: r, gainG: g, gainB: b })}
            />
          </div>
        )}
      </div>

      {/* Curves */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3 py-2 bg-card/50 hover:bg-card/80 transition-colors"
          onClick={() => setShowCurves(!showCurves)}
        >
          <span className="font-medium text-xs">Curves</span>
          {showCurves ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        {showCurves && (
          <div className="p-3 space-y-2">
            <div className="flex gap-1">
              {(["master", "r", "g", "b"] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setActiveCurve(ch)}
                  className={`flex-1 py-1 rounded text-[10px] font-medium border transition-colors ${
                    activeCurve === ch
                      ? ch === "master" ? "bg-accent text-accent-foreground border-accent"
                        : ch === "r" ? "bg-red-500/20 text-red-400 border-red-500/50"
                        : ch === "g" ? "bg-green-500/20 text-green-400 border-green-500/50"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {ch === "master" ? "All" : ch.toUpperCase()}
                </button>
              ))}
            </div>
            <CurvesEditor points={curveData} onChange={setCurve} color={curveColor} />
            <p className="text-[10px] text-muted-foreground text-center">
              Click to add points · Drag to adjust
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Volume2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EffectSettings, DEFAULT_EFFECTS, EFFECT_PRESETS, getEffectsCSSFilter } from "@/lib/videoEffects";

interface AudioTrack {
  id: string;
  name: string;
  duration: number;
  volume: number;
  startTime: number;
}

interface AudioEffectsPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioTracks: AudioTrack[];
  onAddAudioTrack: (file: File) => Promise<void>;
  onRemoveAudioTrack: (trackId: string) => void;
  onUpdateAudioTrack: (trackId: string, volume: number) => void;
  effects: EffectSettings;
  onEffectsChange: (effects: EffectSettings) => void;
  activeTab: "audio" | "effects";
  onTabChange: (tab: "audio" | "effects") => void;
  duckingEnabled?: boolean;
  onToggleDucking?: (enabled: boolean) => void;
  onExtractAudio?: () => void;
}

export function AudioEffectsPanel({
  videoRef,
  audioTracks,
  onAddAudioTrack,
  onRemoveAudioTrack,
  onUpdateAudioTrack,
  effects,
  onEffectsChange,
  activeTab,
  onTabChange,
  duckingEnabled,
  onToggleDucking,
  onExtractAudio,
}: AudioEffectsPanelProps) {
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    try {
      await onAddAudioTrack(file);
      toast.success("Audio track added");
    } catch (error) {
      toast.error("Failed to add audio track");
      console.error(error);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const updateEffect = (key: keyof EffectSettings, value: number) => {
    onEffectsChange({ ...effects, [key]: value });
  };

  const applyPreset = (presetName: keyof typeof EFFECT_PRESETS) => {
    onEffectsChange(EFFECT_PRESETS[presetName]);
    toast.success(`Applied ${presetName} preset`);
  };

  const resetEffects = () => {
    onEffectsChange(DEFAULT_EFFECTS);
    toast.success("Effects reset");
  };

  // Apply CSS filter to video element
  if (videoRef.current) {
    videoRef.current.style.filter = getEffectsCSSFilter(effects);
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Tabs */}
      <div className="flex border-b border-border bg-card/50">
        <button
          onClick={() => onTabChange("audio")}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "audio"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Audio Tracks
        </button>
        <button
          onClick={() => onTabChange("effects")}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "effects"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Effects
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "audio" ? (
          <>
            {/* Audio Upload */}
            <div>
              <label className="cursor-pointer flex items-center justify-center gap-2 p-3 rounded border-2 border-dashed border-border hover:border-accent transition-colors bg-card/50">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add audio track</span>
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,.mp3,.wav,.ogg,.m4a"
                  onChange={handleAudioUpload}
                  disabled={isUploadingAudio}
                  className="hidden"
                />
              </label>
            </div>

            {/* Studio Audio Tools */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 space-y-2.5 shadow">
              <label className="text-xs font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-green-400" /> Studio Audio Tools
              </label>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-300">Smart Ducking (-40% on speech)</span>
                <input
                  type="checkbox"
                  checked={duckingEnabled ?? false}
                  onChange={e => onToggleDucking?.(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-green-500 focus:ring-green-500 h-4 w-4 cursor-pointer"
                />
              </div>
              {onExtractAudio && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onExtractAudio}
                  className="w-full h-7 text-xs bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200 gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" /> Extract Audio from Video
                </Button>
              )}
            </div>

            {/* Audio Tracks List */}
            {audioTracks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No audio tracks added yet</p>
            ) : (
              <div className="space-y-3">
                {audioTracks.map((track) => (
                  <div key={track.id} className="bg-card/50 border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">{track.name}</span>
                      <button
                        onClick={() => onRemoveAudioTrack(track.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={track.volume}
                        onChange={(e) => onUpdateAudioTrack(track.id, parseInt(e.target.value))}
                        className="flex-1 h-1 accent-accent cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{track.volume}%</span>
                    </div>

                    {/* Duration */}
                    <p className="text-xs text-muted-foreground">
                      Duration: {(track.duration / 1000).toFixed(1)}s
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Effects Controls */}
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground">Presets</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(EFFECT_PRESETS).map((preset) => (
                    <Button
                      key={preset}
                      size="sm"
                      variant="outline"
                      onClick={() => applyPreset(preset as keyof typeof EFFECT_PRESETS)}
                      className="text-xs capitalize"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetEffects}
                  className="w-full mt-2 text-xs"
                >
                  Reset All
                </Button>
              </div>

              {/* Brightness */}
              <div>
                <label className="text-xs font-medium flex items-center justify-between mb-1">
                  <span>Brightness</span>
                  <span className="text-muted-foreground">{effects.brightness > 0 ? "+" : ""}{effects.brightness}</span>
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={effects.brightness}
                  onChange={(e) => updateEffect("brightness", parseInt(e.target.value))}
                  className="w-full h-1.5 accent-accent cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <label className="text-xs font-medium flex items-center justify-between mb-1">
                  <span>Contrast</span>
                  <span className="text-muted-foreground">{effects.contrast > 0 ? "+" : ""}{effects.contrast}</span>
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={effects.contrast}
                  onChange={(e) => updateEffect("contrast", parseInt(e.target.value))}
                  className="w-full h-1.5 accent-accent cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <label className="text-xs font-medium flex items-center justify-between mb-1">
                  <span>Saturation</span>
                  <span className="text-muted-foreground">{effects.saturation > 0 ? "+" : ""}{effects.saturation}</span>
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={effects.saturation}
                  onChange={(e) => updateEffect("saturation", parseInt(e.target.value))}
                  className="w-full h-1.5 accent-accent cursor-pointer"
                />
              </div>

              {/* Hue */}
              <div>
                <label className="text-xs font-medium flex items-center justify-between mb-1">
                  <span>Hue Shift</span>
                  <span className="text-muted-foreground">{effects.hue > 0 ? "+" : ""}{effects.hue}°</span>
                </label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={effects.hue}
                  onChange={(e) => updateEffect("hue", parseInt(e.target.value))}
                  className="w-full h-1.5 accent-accent cursor-pointer"
                />
              </div>

              {/* Blur */}
              <div>
                <label className="text-xs font-medium flex items-center justify-between mb-1">
                  <span>Blur</span>
                  <span className="text-muted-foreground">{effects.blur}px</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={effects.blur}
                  onChange={(e) => updateEffect("blur", parseInt(e.target.value))}
                  className="w-full h-1.5 accent-accent cursor-pointer"
                />
              </div>

              {/* Grayscale */}
              <div>
                <label className="text-xs font-medium flex items-center justify-between mb-1">
                  <span>Grayscale</span>
                  <span className="text-muted-foreground">{effects.grayscale}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={effects.grayscale}
                  onChange={(e) => updateEffect("grayscale", parseInt(e.target.value))}
                  className="w-full h-1.5 accent-accent cursor-pointer"
                />
              </div>

              {/* Sepia */}
              <div>
                <label className="text-xs font-medium flex items-center justify-between mb-1">
                  <span>Sepia</span>
                  <span className="text-muted-foreground">{effects.sepia}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={effects.sepia}
                  onChange={(e) => updateEffect("sepia", parseInt(e.target.value))}
                  className="w-full h-1.5 accent-accent cursor-pointer"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

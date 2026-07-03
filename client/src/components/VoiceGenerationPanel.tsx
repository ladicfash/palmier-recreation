/**
 * VoiceGenerationPanel — Generate AI voices and add to layers
 *
 * Uses Google Cloud Text-to-Speech API (free tier: 1M chars/month)
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { createLayer } from "@/lib/layers";

interface VoiceGenerationPanelProps {
  onAddAudioLayer: (src: string, name: string) => void;
}

export default function VoiceGenerationPanel({ onAddAudioLayer }: VoiceGenerationPanelProps) {
  const [text, setText] = useState("Welcome to PixelCraft, the video editor built for creators.");
  const [voiceName, setVoiceName] = useState("en-US-Neural2-A");
  const [speakingRate, setSpeakingRate] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: voices, isLoading: voicesLoading } = trpc.voice.listVoices.useQuery();
  const generateMutation = trpc.voice.generate.useMutation();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        text,
        voiceName,
        speakingRate,
        pitch,
      });
      toast.success("Voice generated!");
      onAddAudioLayer(result.url, `Voice: ${text.slice(0, 30)}...`);
    } catch (err) {
      toast.error(`Generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold">AI Voice Generation</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">Google Cloud TTS (Free)</span>
      </div>

      {/* Text input */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Text to speak</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={5000}
          className="w-full h-20 px-2 py-1.5 rounded bg-background border border-border text-xs resize-none"
          placeholder="Enter text to generate speech from..."
        />
        <div className="text-[10px] text-muted-foreground mt-1">{text.length} / 5000 characters</div>
      </div>

      {/* Voice selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Voice</label>
        {voicesLoading ? (
          <div className="h-7 bg-background border border-border rounded flex items-center justify-center text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin mr-1" /> Loading voices...
          </div>
        ) : (
          <select
            value={voiceName}
            onChange={e => setVoiceName(e.target.value)}
            className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
          >
            {voices?.map(v => (
              <option key={v.name} value={v.name}>
                {v.displayName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Speaking rate */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          Speaking Rate: {speakingRate.toFixed(1)}x
        </label>
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.25}
          value={speakingRate}
          onChange={e => setSpeakingRate(Number(e.target.value))}
          className="w-full h-1 accent-[var(--accent)] cursor-pointer"
        />
      </div>

      {/* Pitch */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          Pitch: {pitch > 0 ? "+" : ""}{pitch}
        </label>
        <input
          type="range"
          min={-20}
          max={20}
          step={1}
          value={pitch}
          onChange={e => setPitch(Number(e.target.value))}
          className="w-full h-1 accent-[var(--accent)] cursor-pointer"
        />
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !text.trim()}
        className="w-full gap-2"
        variant="default"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            Generate Voice
          </>
        )}
      </Button>

      <p className="text-[10px] text-muted-foreground">
        Free tier: 1M characters/month. Generated audio will be added as an audio layer.
      </p>
    </div>
  );
}

/**
 * VoiceGenerationPanel — Generate AI voices using Puter.js
 *
 * Free, unlimited text-to-speech (no API keys, no backend needed)
 * Supports: Standard, Neural, Generative engines
 * Languages: 8+ languages supported
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import {
  generateSpeech,
  audioElementToBlob,
  isPuterLoaded,
  ensurePuterLoaded,
  VOICE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/puterTTS";
import { trpc } from "@/lib/trpc";



interface VoiceGenerationPanelProps {
  onAddAudioLayer: (src: string, name: string) => void;
}

export default function VoiceGenerationPanel({ onAddAudioLayer }: VoiceGenerationPanelProps) {
  const [text, setText] = useState("Welcome to PixelCraft, the video editor built for creators.");
  const [engine, setEngine] = useState("neural");
  const [language, setLanguage] = useState("en-US");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPuterReady, setIsPuterReady] = useState(isPuterLoaded());

  const storageMutation = trpc.videos.uploadAudio.useMutation();

  // Ensure Puter.js is loaded on mount
  useEffect(() => {
    ensurePuterLoaded()
      .then(() => setIsPuterReady(true))
      .catch(err => {
        console.error("Failed to load Puter.js:", err);
        toast.error("Failed to load voice generation. Please refresh the page.");
      });
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    if (!isPuterReady) {
      toast.error("Voice generation is not ready. Please refresh the page.");
      return;
    }

    setIsGenerating(true);
    try {
      // Generate speech
      const audioElement = await generateSpeech(text, {
        language,
        engine: engine as "standard" | "neural" | "generative",
      });

      // Convert to blob and then to base64 for upload
      const blob = await audioElementToBlob(audioElement);
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let base64 = "";
      for (let i = 0; i < uint8Array.length; i++) {
        base64 += String.fromCharCode(uint8Array[i]);
      }
      base64 = btoa(base64);

      // Upload to storage (using uploadAudio endpoint)
      const result = await storageMutation.mutateAsync({
        projectId: 0, // Not used for generated audio, but required by endpoint
        fileName: `voice-${Date.now()}.mp3`,
        fileData: base64,
        mimeType: "audio/mpeg",
      });

      if (result.url) {
        toast.success("Voice generated and added!");
        onAddAudioLayer(result.url, `Voice: ${text.slice(0, 30)}...`);
        setText(""); // Clear input after success
      }
    } catch (err) {
      console.error("Voice generation error:", err);
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
        <span className="text-[10px] text-muted-foreground ml-auto">Puter.js (Free)</span>
      </div>

      {!isPuterReady && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-600">
          Loading voice generation... please wait.
        </div>
      )}

      {/* Text input */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Text to speak</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={3000}
          disabled={isGenerating}
          className="w-full h-20 px-2 py-1.5 rounded bg-background border border-border text-xs resize-none disabled:opacity-50"
          placeholder="Enter text to generate speech from..."
        />
        <div className="text-[10px] text-muted-foreground mt-1">{text.length} / 3000 characters</div>
      </div>

      {/* Engine selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Voice Quality</label>
        <select
          value={engine}
          onChange={e => setEngine(e.target.value)}
          disabled={isGenerating}
          className="w-full h-7 px-2 rounded bg-background border border-border text-xs disabled:opacity-50"
        >
          {VOICE_OPTIONS.map(v => (
            <option key={v.name} value={v.name}>
              {v.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Language selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Language</label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          disabled={isGenerating}
          className="w-full h-7 px-2 rounded bg-background border border-border text-xs disabled:opacity-50"
        >
          {LANGUAGE_OPTIONS.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !text.trim() || !isPuterReady}
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
        Powered by Puter.js. Free, unlimited text-to-speech. No API keys required. Generated audio will be added as an audio layer.
      </p>
    </div>
  );
}

/**
 * Puter.js Text-to-Speech Integration
 *
 * Free, unlimited TTS via Puter.js (no API keys, no backend needed).
 * Supports multiple providers: Standard, Neural, Generative, Gemini, xAI.
 *
 * Usage:
 * const audio = await generateSpeech("Hello world", { engine: "neural" });
 * audio.play();
 */

declare global {
  interface Window {
    puter: {
      ai: {
        txt2speech: (text: string, options?: any) => Promise<HTMLAudioElement>;
      };
    };
  }
}

export interface TTSOptions {
  language?: string;
  engine?: "standard" | "neural" | "generative";
  provider?: "default" | "gemini" | "xai";
  voice?: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // -20 to 20
}

const VOICE_OPTIONS = [
  { name: "standard", displayName: "Standard Engine", engine: "standard" },
  { name: "neural", displayName: "Neural Engine (Better Quality)", engine: "neural" },
  { name: "generative", displayName: "Generative Engine (Most Natural)", engine: "generative" },
];

const LANGUAGE_OPTIONS = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Spanish" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" },
  { code: "it-IT", name: "Italian" },
  { code: "ja-JP", name: "Japanese" },
  { code: "zh-CN", name: "Chinese (Mandarin)" },
];

/**
 * Check if Puter.js is loaded
 */
export function isPuterLoaded(): boolean {
  return typeof window !== "undefined" && !!window.puter?.ai?.txt2speech;
}

/**
 * Ensure Puter.js is loaded
 */
export async function ensurePuterLoaded(): Promise<void> {
  if (isPuterLoaded()) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.onload = () => {
      if (isPuterLoaded()) {
        resolve();
      } else {
        reject(new Error("Puter.js failed to load"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Puter.js"));
    document.head.appendChild(script);
  });
}

/**
 * Generate speech from text using Puter.js
 */
export async function generateSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<HTMLAudioElement> {
  if (!text.trim()) {
    throw new Error("Text cannot be empty");
  }

  if (text.length > 3000) {
    throw new Error("Text must be less than 3000 characters");
  }

  await ensurePuterLoaded();

  const {
    language = "en-US",
    engine = "neural",
    provider = "default",
  } = options;

  try {
    const audio = await window.puter.ai.txt2speech(text, {
      language,
      engine,
      provider,
    });

    if (!audio) {
      throw new Error("Failed to generate audio");
    }

    return audio;
  } catch (err) {
    throw new Error(`TTS generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}

/**
 * Convert audio element to blob (for saving/uploading)
 */
export async function audioElementToBlob(audio: HTMLAudioElement): Promise<Blob> {
  const src = audio.src;
  if (!src) {
    throw new Error("Audio element has no src");
  }

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }
    return await response.blob();
  } catch (err) {
    throw new Error(`Failed to convert audio to blob: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}

export { VOICE_OPTIONS, LANGUAGE_OPTIONS };

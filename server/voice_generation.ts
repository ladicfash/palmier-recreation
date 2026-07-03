/**
 * Google Cloud Text-to-Speech Integration
 *
 * Generates speech audio from text using Google Cloud TTS API.
 * Free tier: 1M characters/month.
 *
 * Setup:
 * 1. Create Google Cloud project
 * 2. Enable Text-to-Speech API
 * 3. Create service account key (JSON)
 * 4. Set GOOGLE_CLOUD_TTS_KEY env var to the JSON key content
 */

import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import * as fs from "fs";
import * as path from "path";
import { tmpdir } from "os";

let ttsClient: TextToSpeechClient | null = null;

function getClient(): TextToSpeechClient | null {
  if (ttsClient) return ttsClient;

  const keyContent = process.env.GOOGLE_CLOUD_TTS_KEY;
  if (!keyContent) {
    console.warn("GOOGLE_CLOUD_TTS_KEY not set. Voice generation disabled.");
    return null;
  }

  try {
    const keyPath = path.join(tmpdir(), `gcloud-tts-key-${Date.now()}.json`);
    fs.writeFileSync(keyPath, keyContent);
    ttsClient = new TextToSpeechClient({ keyFilename: keyPath });
    return ttsClient;
  } catch (err) {
    console.error("Failed to initialize TTS client:", err);
    return null;
  }
}

export interface VoiceOption {
  name: string;
  displayName: string;
  languageCode: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { name: "en-US-Neural2-A", displayName: "US English (Female)", languageCode: "en-US" },
  { name: "en-US-Neural2-C", displayName: "US English (Male)", languageCode: "en-US" },
  { name: "en-GB-Neural2-A", displayName: "UK English (Female)", languageCode: "en-GB" },
  { name: "en-GB-Neural2-B", displayName: "UK English (Male)", languageCode: "en-GB" },
  { name: "es-ES-Neural2-A", displayName: "Spanish (Female)", languageCode: "es-ES" },
  { name: "fr-FR-Neural2-A", displayName: "French (Female)", languageCode: "fr-FR" },
  { name: "de-DE-Neural2-A", displayName: "German (Female)", languageCode: "de-DE" },
  { name: "ja-JP-Neural2-B", displayName: "Japanese (Female)", languageCode: "ja-JP" },
];

function getLanguageCodeFromVoice(voiceName: string): string {
  const voice = VOICE_OPTIONS.find(v => v.name === voiceName);
  return voice?.languageCode || "en-US";
}

export async function generateSpeech(
  text: string,
  voiceName: string = "en-US-Neural2-A",
  speakingRate: number = 1.0,
  pitch: number = 0
): Promise<{ audioBuffer: Buffer; mimeType: string } | null> {
  const client = getClient();
  if (!client) {
    throw new Error("TTS client not initialized. Set GOOGLE_CLOUD_TTS_KEY env var.");
  }

  try {
    const request = {
      input: { text },
      voice: {
        languageCode: getLanguageCodeFromVoice(voiceName),
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: "MP3" as const,
        speakingRate,
        pitch,
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioBuffer = response.audioContent as Buffer;

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error("Empty audio response from TTS API");
    }

    return {
      audioBuffer,
      mimeType: "audio/mpeg",
    };
  } catch (err) {
    console.error("TTS generation error:", err);
    throw new Error(`Voice generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}

export function getAvailableVoices(): VoiceOption[] {
  return VOICE_OPTIONS;
}

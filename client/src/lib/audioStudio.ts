/**
 * Studio Audio Engine — Smart Ducking & Track Extraction
 *
 * Provides intelligent audio ducking (automatically lowering background music
 * volume when speech/voiceover is active) and extracts audio tracks from video blobs.
 */

export interface VoiceTrackInterval {
  startTime: number;
  endTime: number;
  muted: boolean;
  type: "video" | "audio" | "voice";
}

/**
 * Calculates the ducked gain volume for a background music track at a given timestamp.
 * If ducking is enabled and any voice track is currently speaking, volume drops by -40% (0.6x multiplier).
 */
export function calculateDuckedVolume(
  baseVolume: number,
  currentTime: number,
  voiceIntervals: VoiceTrackInterval[],
  duckingEnabled: boolean
): number {
  if (!duckingEnabled || baseVolume <= 0) {
    return baseVolume;
  }

  const isVoiceActive = voiceIntervals.some(
    v => !v.muted && currentTime >= v.startTime && currentTime <= v.endTime && (v.type === "voice" || v.type === "video")
  );

  if (isVoiceActive) {
    return Math.max(0, baseVolume * 0.4); // Duck to 40% of original gain
  }

  return baseVolume;
}

/**
 * Extracts the audio track from a video Blob into an independent WAV/Audio Blob URL using OfflineAudioContext.
 */
export async function extractAudioFromVideoBlob(videoBlob: Blob): Promise<string> {
  const arrayBuffer = await videoBlob.arrayBuffer();
  const tempContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await tempContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    tempContext.close();
    throw new Error("No readable audio stream found in this video file.");
  }

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  // Create WAV header & PCM data
  const buffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length * numChannels * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true);  // AudioFormat PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, "data");
  view.setUint32(40, length * numChannels * 2, true);

  // Pre-fetch channel data arrays to avoid method call overhead in loop
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(audioBuffer.getChannelData(ch));
  }

  let offset = 44;
  const CHUNK_SIZE = 50000;
  for (let i = 0; i < length; i += CHUNK_SIZE) {
    const end = Math.min(length, i + CHUNK_SIZE);
    for (let j = i; j < end; j++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = channelData[ch][j];
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    // Yield to main event loop to prevent UI freezing on long videos
    if (i + CHUNK_SIZE < length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  tempContext.close();
  const wavBlob = new Blob([buffer], { type: "audio/wav" });
  return URL.createObjectURL(wavBlob);
}

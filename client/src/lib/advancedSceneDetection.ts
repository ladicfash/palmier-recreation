/**
 * Advanced Scene Detection - Browser-based
 * Combines histogram, motion, and audio analysis for smarter scene detection
 */

export interface SceneMarker {
  id: number;
  timestamp: number;
  confidence: number;
  reason?: string;
}

/**
 * Detect scenes using histogram + motion + audio analysis
 */
export async function detectScenesAdvanced(
  videoRef: HTMLVideoElement,
  duration: number,
  onProgress?: (progress: number) => void
): Promise<SceneMarker[]> {
  if (!videoRef || !isFinite(duration) || duration === 0) {
    throw new Error("Video not ready");
  }

  const scenes: SceneMarker[] = [{ id: 0, timestamp: 0, confidence: 1.0, reason: "start" }];
  const sampleInterval = Math.max(0.5, duration / 200);
  
  // 1. Histogram-based detection
  const histogramScenes = await detectHistogramScenes(videoRef, duration, sampleInterval, onProgress);
  scenes.push(...histogramScenes);

  // 2. Motion-based detection (optional, lighter weight)
  const motionScenes = await detectMotionScenes(videoRef, duration, sampleInterval, onProgress);
  scenes.push(...motionScenes);

  // 3. Audio-based detection (silence/speech changes)
  const audioScenes = await detectAudioScenes(videoRef, duration, onProgress);
  scenes.push(...audioScenes);

  // Deduplicate and sort by timestamp
  const uniqueScenes = deduplicateScenes(scenes);
  uniqueScenes.sort((a, b) => a.timestamp - b.timestamp);

  // Renumber IDs
  return uniqueScenes.map((s, i) => ({ ...s, id: i }));
}

/**
 * Histogram-based scene detection (original method, improved)
 */
async function detectHistogramScenes(
  videoRef: HTMLVideoElement,
  duration: number,
  sampleInterval: number,
  onProgress?: (progress: number) => void
): Promise<SceneMarker[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  
  canvas.width = 160;
  canvas.height = 90;

  const detected: SceneMarker[] = [];
  let prevHist: number[] | null = null;
  const THRESHOLD = 20; // Slightly lower for better sensitivity

  const getHist = (data: ImageData): number[] => {
    const h = new Array(32).fill(0);
    for (let i = 0; i < data.data.length; i += 4) {
      const lum = Math.floor((data.data[i]! * 0.299 + data.data[i + 1]! * 0.587 + data.data[i + 2]! * 0.114) / 8);
      h[Math.min(31, lum)]++;
    }
    return h;
  };

  const histDiff = (a: number[], b: number[]): number =>
    a.reduce((sum, v, i) => sum + Math.abs(v - (b[i] ?? 0)), 0) / (canvas.width * canvas.height);

  const sampleFrame = (time: number): Promise<number[]> =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Seek timeout")), 5000);
      const handler = () => {
        clearTimeout(timeout);
        videoRef.removeEventListener("seeked", handler);
        ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
        resolve(getHist(ctx.getImageData(0, 0, canvas.width, canvas.height)));
      };
      videoRef.addEventListener("seeked", handler, { once: true });
      videoRef.currentTime = time;
    });

  let samplesProcessed = 0;
  const totalSamples = Math.ceil(duration / sampleInterval);

  for (let t = sampleInterval; t < duration - sampleInterval; t += sampleInterval) {
    const hist = await sampleFrame(t);
    if (prevHist) {
      const diff = histDiff(prevHist, hist);
      if (diff > THRESHOLD) {
        detected.push({
          id: detected.length,
          timestamp: Math.round(t * 1000),
          confidence: Math.min(1, diff / 60),
          reason: "histogram",
        });
      }
    }
    prevHist = hist;
    
    samplesProcessed++;
    if (onProgress) onProgress(samplesProcessed / totalSamples * 0.33); // 33% for histogram
  }

  return detected;
}

/**
 * Motion-based scene detection using frame difference
 */
async function detectMotionScenes(
  videoRef: HTMLVideoElement,
  duration: number,
  sampleInterval: number,
  onProgress?: (progress: number) => void
): Promise<SceneMarker[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  canvas.width = 80;
  canvas.height = 45;

  const detected: SceneMarker[] = [];
  let prevFrame: ImageData | null = null;
  const MOTION_THRESHOLD = 15; // Percentage of pixels that changed significantly

  const getFrameData = (time: number): Promise<ImageData> =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Seek timeout")), 5000);
      const handler = () => {
        clearTimeout(timeout);
        videoRef.removeEventListener("seeked", handler);
        ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      };
      videoRef.addEventListener("seeked", handler, { once: true });
      videoRef.currentTime = time;
    });

  const frameDiff = (a: ImageData, b: ImageData): number => {
    let changedPixels = 0;
    for (let i = 0; i < a.data.length; i += 4) {
      const dr = Math.abs((a.data[i] ?? 0) - (b.data[i] ?? 0));
      const dg = Math.abs((a.data[i + 1] ?? 0) - (b.data[i + 1] ?? 0));
      const db = Math.abs((a.data[i + 2] ?? 0) - (b.data[i + 2] ?? 0));
      if (dr + dg + db > 50) changedPixels++;
    }
    return (changedPixels / (canvas.width * canvas.height)) * 100;
  };

  let samplesProcessed = 0;
  const totalSamples = Math.ceil(duration / sampleInterval);

  for (let t = sampleInterval * 2; t < duration - sampleInterval; t += sampleInterval * 2) {
    const frame = await getFrameData(t);
    if (prevFrame) {
      const motion = frameDiff(prevFrame, frame);
      if (motion > MOTION_THRESHOLD) {
        detected.push({
          id: detected.length,
          timestamp: Math.round(t * 1000),
          confidence: Math.min(1, motion / 50),
          reason: "motion",
        });
      }
    }
    prevFrame = frame;

    samplesProcessed++;
    if (onProgress) onProgress(0.33 + (samplesProcessed / totalSamples) * 0.33); // 33-66%
  }

  return detected;
}

/**
 * Audio-based scene detection (silence/speech changes)
 */
async function detectAudioScenes(
  videoRef: HTMLVideoElement,
  duration: number,
  onProgress?: (progress: number) => void
): Promise<SceneMarker[]> {
  const detected: SceneMarker[] = [];

  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    // Create media element audio source
    const source = audioContext.createMediaElementSource(videoRef);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const SILENCE_THRESHOLD = 20;
    const SPEECH_CHANGE_THRESHOLD = 40;
    let prevEnergy = 0;
    let wasSilent = false;

    // Sample audio at key points
    const samplePoints = Math.floor(duration / 0.5); // Every 0.5 seconds
    for (let i = 0; i < samplePoints; i++) {
      const t = (i / samplePoints) * duration;
      videoRef.currentTime = t;

      // Wait a bit for audio to be available
      await new Promise((resolve) => setTimeout(resolve, 100));

      analyser.getByteFrequencyData(dataArray);
      const energy = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

      const isSilent = energy < SILENCE_THRESHOLD;
      const energyChange = Math.abs(energy - prevEnergy);

      // Detect silence/speech transitions
      if (isSilent !== wasSilent || energyChange > SPEECH_CHANGE_THRESHOLD) {
        detected.push({
          id: detected.length,
          timestamp: Math.round(t * 1000),
          confidence: Math.min(1, energyChange / 100),
          reason: isSilent ? "silence" : "speech",
        });
      }

      prevEnergy = energy;
      wasSilent = isSilent;

      if (onProgress) onProgress(0.66 + (i / samplePoints) * 0.34); // 66-100%
    }
  } catch (error) {
    console.warn("Audio analysis failed (non-critical):", error);
  }

  return detected;
}

/**
 * Deduplicate scenes within 500ms window
 */
function deduplicateScenes(scenes: SceneMarker[]): SceneMarker[] {
  const unique: SceneMarker[] = [];
  const DEDUP_WINDOW = 500; // 500ms

  for (const scene of scenes) {
    const isDuplicate = unique.some(
      (s) => Math.abs(s.timestamp - scene.timestamp) < DEDUP_WINDOW
    );

    if (!isDuplicate) {
      unique.push(scene);
    }
  }

  return unique;
}

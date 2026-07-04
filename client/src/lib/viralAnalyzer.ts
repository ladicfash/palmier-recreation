/**
 * Viral Hook & Engagement Analyzer
 *
 * Evaluates video timeline metrics (pacing density, hook strength, visual variety,
 * caption presence, and audio dynamics) to calculate an AI Virality Score (0-100)
 * and provide technical recommendations for social media engagement.
 */

export interface ViralAnalysisInput {
  videoDuration: number;
  clipCount: number;
  sceneCount: number;
  hasCaptions: boolean;
  hasTextOverlays: boolean;
  hasAudioTracks: boolean;
  hasLayers: boolean;
  activeEffectsCount: number;
}

export interface ViralMetric {
  name: string;
  score: number; // 0-100
  label: "Needs Improvement" | "Fair" | "Good" | "Viral Ready";
  color: string;
  advice: string;
}

export interface ViralAnalysisResult {
  overallScore: number;
  verdict: string;
  metrics: ViralMetric[];
  tips: string[];
}

export function analyzeViralPotential(input: ViralAnalysisInput): ViralAnalysisResult {
  const dur = Math.max(1, input.videoDuration || 10);
  const totalCuts = Math.max(input.clipCount, input.sceneCount);
  const cutsPerMinute = (totalCuts / dur) * 60;

  // 1. Hook Strength Score
  let hookScore = 40;
  let hookAdvice = "Missing visual hook in 0-3s window. Add text overlay or caption.";
  if (input.hasTextOverlays || input.hasCaptions) {
    hookScore += 35;
    hookAdvice = "Text overlay / caption detected in opening hook window.";
  }
  if (input.hasLayers) {
    hookScore += 15;
    hookAdvice = "Multi-layer visual elements active in opening hook window.";
  }
  if (input.activeEffectsCount > 0) {
    hookScore += 10;
  }
  hookScore = Math.min(100, Math.max(10, hookScore));

  // 2. Pacing Density Score
  let pacingScore = 50;
  let pacingAdvice = `Current velocity: ${cutsPerMinute.toFixed(1)} cuts/min (Target: 10-15 cuts/min).`;
  if (cutsPerMinute >= 8 && cutsPerMinute <= 25) {
    pacingScore = 95;
    pacingAdvice = `Optimal pacing velocity: ${cutsPerMinute.toFixed(1)} cuts/min.`;
  } else if (cutsPerMinute >= 4 && cutsPerMinute < 8) {
    pacingScore = 75;
    pacingAdvice = `Moderate pacing velocity: ${cutsPerMinute.toFixed(1)} cuts/min. Consider trimming dead air.`;
  } else if (cutsPerMinute > 25) {
    pacingScore = 80;
    pacingAdvice = `High velocity: ${cutsPerMinute.toFixed(1)} cuts/min. Ensure cuts synchronize with audio beat.`;
  }
  pacingScore = Math.min(100, Math.max(10, pacingScore));

  // 3. Visual & Audio Retention
  let retentionScore = 30;
  const tips: string[] = [];

  if (input.hasCaptions) {
    retentionScore += 30;
  } else {
    tips.push("Generate auto-captions via Whisper API to improve mute retention.");
  }

  if (input.hasTextOverlays || input.hasLayers) {
    retentionScore += 25;
  } else {
    tips.push("Add lower-third graphics or call-to-action overlays to increase visual retention.");
  }

  if (input.hasAudioTracks) {
    retentionScore += 15;
  } else {
    tips.push("Add background audio track to support pacing and emotional cadence.");
  }

  retentionScore = Math.min(100, Math.max(10, retentionScore));

  if (tips.length === 0) {
    tips.push("Timeline meets studio engagement benchmarks for short-form retention.");
    tips.push("Test export in both 9:16 (Shorts/Reels) and 1:1 (Feed) aspect ratios.");
  }

  // Calculate Weighted Overall Score
  const overallScore = Math.round(hookScore * 0.35 + pacingScore * 0.35 + retentionScore * 0.30);

  let verdict = "Standard";
  if (overallScore >= 85) verdict = "Studio Ready";
  else if (overallScore >= 70) verdict = "High Potential";
  else if (overallScore >= 50) verdict = "Moderate";
  else verdict = "Needs Optimization";

  const getLabel = (s: number): ViralMetric["label"] => {
    if (s >= 85) return "Viral Ready";
    if (s >= 70) return "Good";
    if (s >= 50) return "Fair";
    return "Needs Improvement";
  };

  const getColor = (s: number): string => {
    if (s >= 85) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (s >= 70) return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    if (s >= 50) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  return {
    overallScore,
    verdict,
    metrics: [
      {
        name: "Hook Strength (0-3s)",
        score: hookScore,
        label: getLabel(hookScore),
        color: getColor(hookScore),
        advice: hookAdvice,
      },
      {
        name: "Pacing Velocity",
        score: pacingScore,
        label: getLabel(pacingScore),
        color: getColor(pacingScore),
        advice: pacingAdvice,
      },
      {
        name: "Retention Elements",
        score: retentionScore,
        label: getLabel(retentionScore),
        color: getColor(retentionScore),
        advice: input.hasCaptions && input.hasLayers ? "All primary retention elements active." : "Missing retention graphics or captions.",
      },
    ],
    tips,
  };
}

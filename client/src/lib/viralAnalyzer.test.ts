import { describe, it, expect } from "vitest";
import { analyzeViralPotential } from "./viralAnalyzer";

describe("Viral Hook & Engagement Analyzer", () => {
  it("computes baseline score for empty/basic timeline", () => {
    const res = analyzeViralPotential({
      videoDuration: 60,
      clipCount: 1,
      sceneCount: 1,
      hasCaptions: false,
      hasTextOverlays: false,
      hasAudioTracks: false,
      hasLayers: false,
      activeEffectsCount: 0,
    });

    expect(res.overallScore).toBeGreaterThan(0);
    expect(res.overallScore).toBeLessThanOrEqual(100);
    expect(res.verdict).toBe("Needs Optimization");
    expect(res.tips.length).toBeGreaterThan(0);
  });

  it("assigns high virality score to fully featured short-form studio clip", () => {
    const res = analyzeViralPotential({
      videoDuration: 30, // 30s TikTok
      clipCount: 6,      // 12 cuts/min (optimal)
      sceneCount: 6,
      hasCaptions: true,
      hasTextOverlays: true,
      hasAudioTracks: true,
      hasLayers: true,
      activeEffectsCount: 2,
    });

    expect(res.overallScore).toBeGreaterThanOrEqual(85);
    expect(res.verdict).toBe("Studio Ready");
    expect(res.metrics[0].label).toBe("Viral Ready");
    expect(res.metrics[1].label).toBe("Viral Ready");
  });

  it("provides specific advice when pacing is too slow", () => {
    const res = analyzeViralPotential({
      videoDuration: 120,
      clipCount: 2,
      sceneCount: 2,
      hasCaptions: true,
      hasTextOverlays: false,
      hasAudioTracks: false,
      hasLayers: false,
      activeEffectsCount: 0,
    });

    const pacingMetric = res.metrics.find(m => m.name === "Pacing Velocity");
    expect(pacingMetric).toBeDefined();
    expect(pacingMetric?.advice).toContain("Target: 10-15 cuts/min");
  });
});

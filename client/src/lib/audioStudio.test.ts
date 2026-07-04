import { describe, it, expect } from "vitest";
import { calculateDuckedVolume, VoiceTrackInterval } from "./audioStudio";

describe("Studio Audio Engine — Smart Ducking", () => {
  it("returns baseVolume when ducking is disabled", () => {
    const intervals: VoiceTrackInterval[] = [
      { startTime: 0, endTime: 10, muted: false, type: "voice" },
    ];
    const vol = calculateDuckedVolume(0.8, 5, intervals, false);
    expect(vol).toBe(0.8);
  });

  it("ducks volume by 60% (returns 0.4x) when speech is active", () => {
    const intervals: VoiceTrackInterval[] = [
      { startTime: 2, endTime: 8, muted: false, type: "voice" },
    ];
    const vol = calculateDuckedVolume(1.0, 5, intervals, true);
    expect(vol).toBeCloseTo(0.4, 2);
  });

  it("does not duck when speech interval is muted", () => {
    const intervals: VoiceTrackInterval[] = [
      { startTime: 2, endTime: 8, muted: true, type: "voice" },
    ];
    const vol = calculateDuckedVolume(1.0, 5, intervals, true);
    expect(vol).toBe(1.0);
  });

  it("restores full volume outside speech intervals", () => {
    const intervals: VoiceTrackInterval[] = [
      { startTime: 2, endTime: 8, muted: false, type: "voice" },
    ];
    const vol = calculateDuckedVolume(0.7, 9, intervals, true);
    expect(vol).toBe(0.7);
  });
});

import { describe, it, expect } from "vitest";
import { createLayer, getContinuousAnimationTransform } from "./layers";

describe("Layer Continuous Animations (Motion Graphics)", () => {
  it("returns default values when animationContinuous is none", () => {
    const layer = createLayer("image", { animationContinuous: "none", startTime: 0, endTime: 10 });
    const res = getContinuousAnimationTransform(layer, 5);
    expect(res.scaleMultiplier).toBe(1);
    expect(res.rotationOffset).toBe(0);
    expect(res.translateXOffset).toBe(0);
    expect(res.translateYOffset).toBe(0);
    expect(res.filterAddon).toBe("");
  });

  it("calculates Ken Burns Zoom In scale accurately over time", () => {
    const layer = createLayer("image", { animationContinuous: "ken-burns-in", startTime: 0, endTime: 10 });
    const startRes = getContinuousAnimationTransform(layer, 0);
    const midRes = getContinuousAnimationTransform(layer, 5);
    const endRes = getContinuousAnimationTransform(layer, 10);

    expect(startRes.scaleMultiplier).toBe(1.0);
    expect(midRes.scaleMultiplier).toBeCloseTo(1.125, 2);
    expect(endRes.scaleMultiplier).toBeCloseTo(1.25, 2);
  });

  it("calculates Float vertical oscillation", () => {
    const layer = createLayer("image", { animationContinuous: "float", startTime: 0, endTime: 10 });
    const res = getContinuousAnimationTransform(layer, 1);
    expect(res.translateYOffset).not.toBe(0);
  });

  it("calculates Spin continuous rotation", () => {
    const layer = createLayer("image", { animationContinuous: "spin", startTime: 0, endTime: 10 });
    const res = getContinuousAnimationTransform(layer, 2); // 2 seconds * 45 deg/sec = 90 deg
    expect(res.rotationOffset).toBe(90);
  });

  it("generates Neon Glow drop-shadow filter", () => {
    const layer = createLayer("image", { animationContinuous: "neon-pulse", startTime: 0, endTime: 10 });
    const res = getContinuousAnimationTransform(layer, 1);
    expect(res.filterAddon).toContain("drop-shadow");
  });
});

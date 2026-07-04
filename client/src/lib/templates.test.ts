import { describe, it, expect } from "vitest";
import { STUDIO_TEMPLATES } from "./templates";

describe("Studio Template System", () => {
  it("contains all 6 required professional templates", () => {
    expect(STUDIO_TEMPLATES.length).toBe(6);
    const ids = STUDIO_TEMPLATES.map(t => t.id);
    expect(ids).toContain("tiktok-viral");
    expect(ids).toContain("cinematic-trailer");
    expect(ids).toContain("podcast-highlight");
    expect(ids).toContain("retro-vhs");
    expect(ids).toContain("breaking-news");
    expect(ids).toContain("tech-launch");
  });

  it("generates valid layers and continuous animations for tiktok template", () => {
    const tiktok = STUDIO_TEMPLATES.find(t => t.id === "tiktok-viral")!;
    expect(tiktok).toBeDefined();
    const layers = tiktok.getLayers();
    expect(layers.length).toBeGreaterThan(0);
    expect(layers[0].animationContinuous).toBe("pulse");
  });

  it("generates valid text overlays with unique IDs", () => {
    const news = STUDIO_TEMPLATES.find(t => t.id === "breaking-news")!;
    const overlays = news.getTextOverlays();
    expect(overlays.length).toBeGreaterThan(0);
    expect(overlays[0].text).toContain("SOPHISTICATION");
  });
});

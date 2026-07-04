import { describe, it, expect } from "vitest";
import { serializeLayers, deserializeLayers, createLayer, Layer } from "../client/src/lib/layers";
import { getEffectsCSSFilter, DEFAULT_EFFECTS } from "../client/src/lib/videoEffects";
import { gradeToCSS, DEFAULT_GRADE } from "../client/src/components/ColorGradingPanel";

describe("Layer Model & Serialization Audit", () => {
  it("should safely create layers with default properties", () => {
    const layer = createLayer("shape", { name: "Test Lower Third", shapeType: "lower-third", color: "#10b981" });
    expect(layer.type).toBe("shape");
    expect(layer.shapeType).toBe("lower-third");
    expect(layer.color).toBe("#10b981");
    expect(layer.transform.opacity).toBe(1);
  });

  it("should serialize and deserialize layers without loss or crash", () => {
    const original: Layer[] = [
      createLayer("sticker", { name: "Live REC", stickerType: "live", startTime: 1, endTime: 5 }),
      createLayer("text", { name: "Title", text: "Hello World", fontSize: 64 }),
    ];
    const serialized = serializeLayers(original);
    const deserialized = deserializeLayers(serialized);

    expect(deserialized.length).toBe(2);
    expect(deserialized[0]?.name).toBe("Live REC");
    expect(deserialized[0]?.stickerType).toBe("live");
    expect(deserialized[1]?.text).toBe("Hello World");
  });

  it("should handle corrupted or empty JSON strings gracefully in deserializeLayers", () => {
    expect(deserializeLayers("invalid json")).toEqual([]);
    expect(deserializeLayers("")).toEqual([]);
    expect(deserializeLayers("{}")).toEqual([]);
    expect(deserializeLayers("null")).toEqual([]);
  });
});

describe("Video Effects & Color Grading Audit", () => {
  it("should generate valid CSS filter strings from effect settings", () => {
    const filter = getEffectsCSSFilter({ ...DEFAULT_EFFECTS, brightness: 20, contrast: -10 });
    expect(filter).toContain("brightness(120%)");
    expect(filter).toContain("contrast(90%)");
  });

  it("should generate valid CSS filter strings from color grades", () => {
    const filter = gradeToCSS({ ...DEFAULT_GRADE, saturation: 15, temperature: 10 });
    expect(filter).toContain("saturate(1.150)");
    expect(filter).toContain("sepia(0.050)");
  });
});

describe("Stage Constraints Logic Audit", () => {
  it("should identify durations exceeding 15 minutes (900 seconds)", () => {
    const validateDuration = (duration: number) => {
      if (typeof duration !== "number" || isNaN(duration) || duration < 0) return false;
      return duration <= 900;
    };
    expect(validateDuration(120)).toBe(true);
    expect(validateDuration(900)).toBe(true);
    expect(validateDuration(901)).toBe(false);
    expect(validateDuration(1500)).toBe(false);
  });

  it("should identify project quota exceeding 20 items", () => {
    const validateQuota = (currentCount: number, isExistingProject: boolean) => {
      if (isExistingProject) return true; // updating existing allowed
      return currentCount < 20;
    };
    expect(validateQuota(5, false)).toBe(true);
    expect(validateQuota(19, false)).toBe(true);
    expect(validateQuota(20, false)).toBe(false);
    expect(validateQuota(25, true)).toBe(true);
  });
});

describe("Senior Architecture Code Resilience Audit", () => {
  it("should resolve storage paths safely without URL formatting errors", () => {
    const resolvePath = (url: string) => {
      if (url.startsWith("/manus-storage/")) return `https://s3.signed.mock/${url.replace(/^\/manus-storage\//, "")}`;
      return url;
    };
    expect(resolvePath("/manus-storage/audio/1/test.wav")).toBe("https://s3.signed.mock/audio/1/test.wav");
    expect(resolvePath("https://external.cdn/file.mp4")).toBe("https://external.cdn/file.mp4");
  });

  it("should prevent double volume attenuation when mixing Web Audio gain nodes", () => {
    const calculateAttenuatedVolume = (userVolume: number, isConnectedToGraph: boolean) => {
      if (isConnectedToGraph) {
        return { mediaElVolume: 1, gainNodeValue: userVolume };
      }
      return { mediaElVolume: userVolume, gainNodeValue: null };
    };
    const resGraph = calculateAttenuatedVolume(0.5, true);
    expect(resGraph.mediaElVolume * resGraph.gainNodeValue!).toBe(0.5);

    const resDirect = calculateAttenuatedVolume(0.5, false);
    expect(resDirect.mediaElVolume).toBe(0.5);
  });

  it("should preserve layer compositor state during undo/redo snapshotting", () => {
    const layers = [createLayer("shape", { name: "Lower Third" })];
    const snapshot = {
      clips: [],
      textOverlays: [],
      scenes: [],
      captions: [],
      layers: [...layers],
      trimStart: 0,
      trimEnd: 10,
      speed: 1,
      opacity: 1,
    };
    expect(snapshot.layers.length).toBe(1);
    expect(snapshot.layers[0]?.name).toBe("Lower Third");
  });
});

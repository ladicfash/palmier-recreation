/**
 * Multi-Layer Editing — Layer Model (After Effects-style)
 *
 * Each layer is an independent element (video / audio / text / image) with its
 * own transforms, blend mode, and effects. Layers render in z-order (bottom
 * first) onto the composite preview.
 */

export type LayerType = "video" | "audio" | "text" | "image";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion";

export const BLEND_MODES: BlendMode[] = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion",
];

export interface LayerTransform {
  /** Position as percentage of composition (0-100, 50 = center) */
  x: number;
  y: number;
  /** Scale percentage (100 = original size) */
  scale: number;
  /** Rotation in degrees */
  rotation: number;
  /** Opacity 0-1 */
  opacity: number;
}

export interface LayerEffects {
  brightness: number; // 100 = normal
  contrast: number;   // 100 = normal
  saturation: number; // 100 = normal
  blur: number;       // px, 0 = none
  hueRotate: number;  // degrees
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  muted: boolean; // audio/video only
  volume: number; // 0-1, audio/video only
  blendMode: BlendMode;
  transform: LayerTransform;
  effects: LayerEffects;
  /** Timing on the composition timeline (seconds) */
  startTime: number;
  endTime: number;
  /** Source content */
  src?: string;        // object URL or remote URL (video/audio/image)
  text?: string;       // text layers
  fontSize?: number;   // text layers, px
  color?: string;      // text layers
  fontFamily?: string; // text layers
}

export const DEFAULT_TRANSFORM: LayerTransform = {
  x: 50,
  y: 50,
  scale: 100,
  rotation: 0,
  opacity: 1,
};

export const DEFAULT_EFFECTS: LayerEffects = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  hueRotate: 0,
};

let layerCounter = 0;

export function createLayer(type: LayerType, partial: Partial<Layer> = {}): Layer {
  layerCounter += 1;
  return {
    id: `layer-${Date.now()}-${layerCounter}`,
    name: partial.name ?? `${type.charAt(0).toUpperCase() + type.slice(1)} Layer ${layerCounter}`,
    type,
    visible: true,
    locked: false,
    muted: false,
    volume: 1,
    blendMode: "normal",
    transform: { ...DEFAULT_TRANSFORM },
    effects: { ...DEFAULT_EFFECTS },
    startTime: 0,
    endTime: 10,
    fontSize: 48,
    color: "#ffffff",
    fontFamily: "sans-serif",
    ...partial,
    // Ensure nested objects are not overwritten with partials that lose keys
    ...(partial.transform ? { transform: { ...DEFAULT_TRANSFORM, ...partial.transform } } : {}),
    ...(partial.effects ? { effects: { ...DEFAULT_EFFECTS, ...partial.effects } } : {}),
  };
}

/** Build the CSS filter string for a layer's effects */
export function layerEffectsToCSSFilter(fx: LayerEffects): string {
  const parts: string[] = [];
  if (fx.brightness !== 100) parts.push(`brightness(${fx.brightness}%)`);
  if (fx.contrast !== 100) parts.push(`contrast(${fx.contrast}%)`);
  if (fx.saturation !== 100) parts.push(`saturate(${fx.saturation}%)`);
  if (fx.blur > 0) parts.push(`blur(${fx.blur}px)`);
  if (fx.hueRotate !== 0) parts.push(`hue-rotate(${fx.hueRotate}deg)`);
  return parts.length > 0 ? parts.join(" ") : "none";
}

/** Whether the layer should be shown at the given composition time */
export function isLayerActiveAt(layer: Layer, time: number): boolean {
  return layer.visible && time >= layer.startTime && time <= layer.endTime;
}

/** Serialize layers for project persistence */
export function serializeLayers(layers: Layer[]): string {
  // Strip object URLs — they don't survive reloads; keep remote URLs
  return JSON.stringify(layers.map(l => ({
    ...l,
    src: l.src?.startsWith("blob:") ? undefined : l.src,
  })));
}

export function deserializeLayers(json: string): Layer[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((l: Partial<Layer>) => createLayer(l.type ?? "video", l));
  } catch {
    return [];
  }
}

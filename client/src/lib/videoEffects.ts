/**
 * Video Effects Library
 * Canvas-based real-time video effects processing
 */

export interface EffectSettings {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  blur: number; // 0 to 50 (pixels)
  grayscale: number; // 0 to 100 (%)
  sepia: number; // 0 to 100 (%)
}

export const DEFAULT_EFFECTS: EffectSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
};

/**
 * Apply effects to a canvas by manipulating image data
 */
export function applyEffectsToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  effects: EffectSettings
): void {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Apply effects to pixel data
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]!;
    let g = data[i + 1]!;
    let b = data[i + 2]!;
    const a = data[i + 3]!;

    // Apply brightness
    if (effects.brightness !== 0) {
      const factor = 1 + effects.brightness / 100;
      r = Math.min(255, r * factor);
      g = Math.min(255, g * factor);
      b = Math.min(255, b * factor);
    }

    // Apply contrast
    if (effects.contrast !== 0) {
      const factor = (259 * (effects.contrast + 255)) / (255 * (259 - effects.contrast));
      r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
    }

    // Convert RGB to HSL for saturation and hue adjustments
    let [h, s, l] = rgbToHsl(r, g, b);

    // Apply saturation
    if (effects.saturation !== 0) {
      s = Math.min(100, Math.max(0, s + effects.saturation));
    }

    // Apply hue shift
    if (effects.hue !== 0) {
      h = (h + effects.hue + 360) % 360;
    }

    // Apply grayscale
    if (effects.grayscale > 0) {
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const factor = effects.grayscale / 100;
      r = Math.round(r * (1 - factor) + gray * factor);
      g = Math.round(g * (1 - factor) + gray * factor);
      b = Math.round(b * (1 - factor) + gray * factor);
    }

    // Apply sepia
    if (effects.sepia > 0) {
      const factor = effects.sepia / 100;
      const sr = r * (1 - factor) + (r * 0.393 + g * 0.769 + b * 0.189) * factor;
      const sg = r * (1 - factor) + (r * 0.349 + g * 0.686 + b * 0.168) * factor;
      const sb = r * (1 - factor) + (r * 0.272 + g * 0.534 + b * 0.131) * factor;
      r = Math.min(255, sr);
      g = Math.min(255, sg);
      b = Math.min(255, sb);
    }

    // Convert HSL back to RGB if hue/saturation were modified
    if (effects.hue !== 0 || effects.saturation !== 0) {
      [r, g, b] = hslToRgb(h, s, l);
    }

    data[i] = Math.round(r);
    data[i + 1] = Math.round(g);
    data[i + 2] = Math.round(b);
    data[i + 3] = a;
  }

  ctx.putImageData(imageData, 0, 0);

  // Apply blur using canvas filter
  if (effects.blur > 0) {
    ctx.filter = `blur(${effects.blur}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
  }
}

/**
 * Apply effects using CSS filters (faster, GPU-accelerated)
 */
export function getEffectsCSSFilter(effects: EffectSettings): string {
  const filters: string[] = [];

  if (effects.brightness !== 0) {
    filters.push(`brightness(${100 + effects.brightness}%)`);
  }

  if (effects.contrast !== 0) {
    filters.push(`contrast(${100 + effects.contrast}%)`);
  }

  if (effects.saturation !== 0) {
    filters.push(`saturate(${100 + effects.saturation}%)`);
  }

  if (effects.hue !== 0) {
    filters.push(`hue-rotate(${effects.hue}deg)`);
  }

  if (effects.blur > 0) {
    filters.push(`blur(${effects.blur}px)`);
  }

  if (effects.grayscale > 0) {
    filters.push(`grayscale(${effects.grayscale}%)`);
  }

  if (effects.sepia > 0) {
    filters.push(`sepia(${effects.sepia}%)`);
  }

  return filters.join(" ") || "none";
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

/**
 * Preset effects
 */
export const EFFECT_PRESETS = {
  vintage: {
    brightness: 10,
    contrast: -20,
    saturation: -30,
    hue: 15,
    blur: 0,
    grayscale: 0,
    sepia: 40,
  } as EffectSettings,
  cinematic: {
    brightness: -5,
    contrast: 20,
    saturation: 10,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  } as EffectSettings,
  warm: {
    brightness: 5,
    contrast: 10,
    saturation: 15,
    hue: 15,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  } as EffectSettings,
  cool: {
    brightness: 0,
    contrast: 10,
    saturation: 10,
    hue: -30,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  } as EffectSettings,
  dramatic: {
    brightness: -10,
    contrast: 40,
    saturation: 20,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  } as EffectSettings,
};

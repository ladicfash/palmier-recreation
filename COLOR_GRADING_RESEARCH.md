# Color Grading Research for PixelCraft

## Free Color Grading Approaches for Web

### 1. **Canvas-based Color Correction (FREE, NO API)**
- **Brightness/Contrast/Saturation/Hue** — Pure JavaScript with canvas pixel manipulation
- **Curves adjustment** — Bezier curve implementation (like Photoshop curves)
- **Color wheels** — Shadows/Midtones/Highlights (like DaVinci Resolve)
- **Presets** — Cinematic, Warm, Cool, Vintage, Grayscale, Sepia
- **LUT Support** — Load .cube files and apply via WebGL
- **Cost:** $0 (all client-side)

### 2. **AI Color Grading Suggestions**
**Option A: Built-in LLM (Manus)**
- Use Manus LLM to analyze video frame and suggest color grading adjustments
- Prompt: "Analyze this video frame and suggest color grading (brightness, saturation, temperature) for a cinematic look"
- Cost: $0 (included in Manus)
- Limitation: LLM sees only one frame, not temporal consistency

**Option B: Histogram Analysis (FREE)**
- Analyze video histogram to suggest auto-levels, auto-white-balance
- Detect if video is too dark/bright/saturated and suggest corrections
- Cost: $0 (client-side)
- Benefit: Fast, instant feedback

**Option C: Neural LUT Generation (PAID)**
- Colourlab.ai, Imagen Video, fylm.ai — all paid
- Not suitable for free tier

### 3. **Recommended Implementation**
1. **Core Color Grading** — Canvas-based curves, color wheels, presets (100% free)
2. **AI Suggestions** — Histogram analysis + optional LLM prompts for creative suggestions
3. **LUT Support** — Load free LUTs from community (Cinema LUT, Classic Chrome, etc.)
4. **Presets** — 5-10 built-in cinematic presets

## SpeedGrade-like UI
- **Left panel:** Curves, Levels, Color Wheels (Shadows/Midtones/Highlights)
- **Center:** Video preview with real-time color adjustments
- **Right panel:** Presets, LUT library, AI suggestions
- **Timeline:** Show color grade keyframes for per-clip grading

## Free LUT Resources
- Cinema LUT (free)
- Classic Chrome (free)
- Color 400 (free)
- Lots of free LUTs on YouTube and GitHub

## Implementation Path
1. Canvas-based color correction (brightness, contrast, saturation, hue, curves)
2. Color wheels (shadows/midtones/highlights)
3. Presets (5-10 cinematic looks)
4. LUT support (.cube file loading)
5. AI suggestions (histogram analysis + LLM optional)
6. Per-clip color grading (keyframes on timeline)

**Total Cost: $0 (all free/built-in)**

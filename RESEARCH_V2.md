# PixelCraft - Phase 2 Research Findings

## 1. Audio Fix Strategy
**Root cause:** `blob://` URLs are browser-only and cannot be fetched server-side.
**Fix:** 
- For captions: Use `canvas + MediaRecorder` to extract audio from video as a Blob, then upload to S3 via the existing `videos.uploadAudio` endpoint, then pass the S3 URL to Whisper.
- For audio playback: Use Web Audio API `AudioContext` to create a proper audio graph:
  - `createMediaElementSource(videoElement)` → connects video audio to AudioContext
  - `createBufferSource()` per audio track → each track gets its own GainNode for volume
  - All sources merge into a single `destination`

## 2. Color Grading Strategy (FREE, $0)
**Approach: CSS Filters + Canvas pixel manipulation**

### CSS Filters (instant, live preview):
- `brightness()`, `contrast()`, `saturate()`, `hue-rotate()`, `blur()`, `grayscale()`, `sepia()`
- Applied directly to `<video>` element style

### Canvas-based (more precise, for export):
- Draw video frame to canvas, manipulate pixel data via `ImageData`
- RGB curves: map input → output per channel using lookup tables
- Color wheels (Lift/Gamma/Gain): shift shadows/midtones/highlights independently

### LUT Support:
- Parse `.cube` files (3D LUT format) in browser
- Apply via canvas pixel mapping or WebGL shader
- Free LUT sources: Lutify.me, Color Grading Central (100 free LUTs)

### Presets (built-in, no download needed):
- Cinematic: high contrast, slight blue shadows, warm highlights
- Warm: +hue +saturation, orange/yellow push
- Cool: blue/teal push, desaturate slightly
- Vintage: sepia + fade + vignette
- Dramatic: high contrast, desaturate midtones
- Matte: lift blacks, reduce contrast

### AI Color Suggestions:
- Analyze video frame histogram (brightness distribution)
- Use built-in LLM to suggest grading based on scene type
- Prompt: "Given a video frame with histogram [data], suggest color grading adjustments"

## 3. Chatbot Command Interface
**Approach: Built-in LLM with structured JSON output**

### Command parsing flow:
1. User types natural language: "trim to 30 seconds" or "make it 2x speed"
2. Send to LLM with system prompt defining available commands + JSON schema
3. LLM returns structured JSON: `{ "action": "setSpeed", "value": 2 }`
4. Frontend executes the command on the editor state

### Commands to support:
- `trim(start, end)` - set trim points
- `setSpeed(multiplier)` - change playback speed  
- `setOpacity(value)` - change opacity
- `detectScenes()` - run scene detection
- `generateCaptions(language)` - generate captions
- `addText(text, x, y, size, color)` - add text overlay
- `exportVideo(format, aspectRatio)` - open export dialog
- `splitAtPlayhead()` - split current clip
- `createClip(name)` - create clip from current trim
- `seekTo(time)` - seek to timestamp
- `saveProject(name)` - save current project

### LLM: Use built-in Forge API (free, already configured)
- Model: fastest available (gpt-4o-mini equivalent)
- Structured JSON output mode
- System prompt with editor context (current time, duration, clips, etc.)

## 4. Advanced Scene Detection (PySceneDetect)
**Approach: Python HTTP microservice running alongside Express**

### Implementation:
- Flask microservice on port 3001 that accepts video file path
- Uses PySceneDetect with ContentDetector (most accurate for cuts)
- Returns JSON: `[{ timestamp_ms, confidence, frame_number }]`
- Express calls this microservice when scene detection is triggered
- Video must be saved to temp file first (from S3 URL or upload)

### Detection methods:
- `ContentDetector` - detects hard cuts based on content change (best for most videos)
- `AdaptiveDetector` - adaptive threshold, good for gradual transitions  
- `ThresholdDetector` - detects fades to/from black

### Already installed: `scenedetect[opencv]`

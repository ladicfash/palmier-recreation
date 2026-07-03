# PixelCraft Research: Free Libraries & APIs

## Scene Detection Research

### Best Free Options (No Cost)

#### 1. **PySceneDetect** (Python-based, Open Source)
- **Cost:** FREE - Open source on GitHub (Breakthrough/PySceneDetect)
- **Algorithm:** Histogram-based scene detection using Y channel in YCbCr color space
- **Detection Methods:**
  - ThresholdDetector: Detects fade-to-black transitions
  - ContentDetector: Content-aware detection (best for cuts)
  - AdaptiveDetector: Handles fast camera movement
- **Pros:** Highly accurate, industry-used, well-documented
- **Cons:** Python-based (needs backend processing), not browser-native
- **Best For:** Server-side scene detection pipeline

#### 2. **FFmpeg.wasm** (Browser-based, Open Source)
- **Cost:** FREE - Pure WebAssembly port of FFmpeg
- **Capabilities:** Frame extraction, video processing in browser
- **Pros:** No server needed, runs entirely in browser, free
- **Cons:** Large library (~30MB), slower than native
- **Use Case:** Extract frames for client-side analysis

#### 3. **OpenCV.js** (Browser-based, Open Source)
- **Cost:** FREE - JavaScript binding of OpenCV
- **Capabilities:** Frame differencing, histogram analysis, edge detection
- **Pros:** Powerful computer vision, browser-native
- **Cons:** Large file size, steep learning curve
- **Algorithm:** Can implement histogram-based detection manually

#### 4. **MediaPipe** (Google's Framework, Open Source)
- **Cost:** FREE - Google's open-source framework
- **Capabilities:** Real-time video analysis, pose detection, hand tracking
- **Pros:** Optimized, cross-platform, well-maintained
- **Cons:** Not specifically designed for scene detection
- **Potential:** Could use for motion/activity detection as proxy

### Recommended Approach for PixelCraft

**Hybrid Strategy (Zero Cost):**
1. **Browser-side (Client):** Use FFmpeg.wasm to extract key frames
2. **Backend (Server):** Use PySceneDetect with Python for accurate histogram-based detection
3. **Fallback (Client):** Simple frame-differencing algorithm in JavaScript if server unavailable

**Implementation Plan:**
- Extract frames at regular intervals (every 0.5s or 1s)
- Send to backend for PySceneDetect analysis
- Return scene boundaries with confidence scores
- Display on timeline in editor

---

## Project Persistence Research

### Best Free Options (No Cost)

#### 1. **Built-in Manus Database** (Already Available)
- **Cost:** FREE - Included with project
- **What We Have:** MySQL/TiDB database with Drizzle ORM
- **Schema:** Already created (projects, clips, captions, sceneDetections tables)
- **Pros:** Already integrated, no setup needed, full control
- **Status:** ✅ READY TO USE - Just need to wire up tRPC endpoints

#### 2. **IndexedDB** (Browser API, Free)
- **Cost:** FREE - Native browser API
- **Capacity:** 50MB+ per domain (browser-dependent)
- **Pros:** No server needed, offline-first, fast
- **Cons:** Client-side only, not synced across devices
- **Use Case:** Local project caching for offline editing

#### 3. **LocalStorage** (Browser API, Free)
- **Cost:** FREE - Native browser API
- **Capacity:** 5-10MB per domain
- **Pros:** Simple, synchronous
- **Cons:** Limited size, slower than IndexedDB
- **Use Case:** Small project metadata only

### Recommended Approach for PixelCraft

**Primary:** Use Manus Database (Already Built)
- ✅ Projects table (userId, name, duration, videoUrl, videoKey)
- ✅ Clips table (projectId, startTime, endTime, type, opacity, speed)
- ✅ Captions table (projectId, startTime, endTime, text)
- ✅ SceneDetections table (projectId, timestamp, confidence)

**Secondary:** IndexedDB for Caching
- Cache project data locally for faster UI
- Sync on save/load
- Enable offline editing

**Implementation Status:**
- ✅ Database schema created
- ✅ Query helpers written (db.ts)
- ✅ tRPC endpoints defined (routers.ts)
- ⏳ Frontend UI to trigger save/load (TODO)

---

## Cost Breakdown

| Component | Solution | Cost | Status |
|-----------|----------|------|--------|
| Scene Detection | PySceneDetect (backend) + FFmpeg.wasm (client) | $0 | Ready |
| Project Storage | Manus Database | $0 | Ready |
| Video Processing | FFmpeg.wasm | $0 | Ready |
| Captions | Whisper API (via Manus) | $0 | Ready |
| **Total** | | **$0** | ✅ |

---

## Implementation Roadmap

### Phase 4: Scene Detection (Priority 2)
1. Install PySceneDetect on backend
2. Create backend endpoint: `sceneDetection.detect`
3. Extract frames using FFmpeg.wasm
4. Send to backend for analysis
5. Return scene boundaries to frontend
6. Display on timeline

### Phase 3: Project Persistence (Priority 1)
1. ✅ Database schema ready
2. ✅ Query helpers ready
3. ✅ tRPC endpoints ready
4. Create frontend UI for save/load
5. Wire up "Save Project" button
6. Wire up project list/load
7. Test persistence

---

## Key Findings

1. **No paid APIs needed** - Everything can be done with free/open-source tools
2. **PySceneDetect is industry-standard** - Used by professionals, highly accurate
3. **Manus database is perfect** - Already set up, no additional cost
4. **Browser-first approach** - Use FFmpeg.wasm for client-side processing
5. **Hybrid model works best** - Client for UI, server for heavy lifting

---

## References

- PySceneDetect: https://www.scenedetect.com/
- FFmpeg.wasm: https://github.com/ffmpegwasm/ffmpeg.wasm
- MediaPipe: https://mediapipe.org/
- OpenCV.js: https://docs.opencv.org/4.5.2/d5/d10/tutorial_js_root.html
- IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

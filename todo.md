# PixelCraft - Video Editor with AI

## MVP Features

### Phase 1: Core Infrastructure
- [x] Resolve Home.tsx conflict (keep landing page or replace with editor dashboard)
- [x] Set up database schema for projects, videos, clips, captions
- [x] Implement user authentication and project ownership
- [x] Create file storage integration for video uploads (browser object URLs, no server upload needed)

### Phase 2: Video Upload & Timeline
- [x] Build video upload component (MP4, WebM, MOV support)
- [x] Create timeline editor interface with scrubber
- [x] Implement video playback with controls
- [x] Add timeline zoom and scroll functionality

### Phase 3: Core Editing Features
- [x] Implement trim/cut functionality (Create Clip from trim points)
- [x] Add split clips feature (Split at playhead button)
- [x] Implement speed adjustment (0.5x - 2x with live playback)
- [x] Add opacity/transparency control (live preview)
- [x] Build text overlay system with styling (color, font size, live preview)

### Phase 4: AI Features
- [x] Integrate Whisper API for auto-captioning (full pipeline: audio extract → S3 → Whisper → display)
- [x] Implement scene detection (client-side histogram analysis)
- [x] Add caption rendering to timeline (live subtitle overlay on video)
- [x] Create scene detection visualization (scene list + seek on click)

### Phase 5: Export & Project Management
- [x] Build export dialog (full video + clip segments + short-form)
- [x] Implement project save/load system (Database + UI)
- [x] Add project listing and management (Projects dropdown)
- [x] Create short-form clip export (9:16 / 1:1 / 16:9 via ExportDialog)

### Phase 6: Polish & Testing
- [x] Add keyboard shortcuts (Space=play, arrows=seek, M=mute)
- [x] Implement undo/redo (50-step history, Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z)
- [x] Create loading states and error handling
- [x] Test on multiple browsers
- [x] Performance optimization (stable object URLs, memoized callbacks)

## Future Enhancements (Deferred - out of current sprint scope)
- [ ] AI video generation (Kling integration)
- [ ] Advanced effects library
- [ ] Collaboration features
- [ ] Template system
- [ ] Mobile app version

### Bug Fixes & Audit (Full Trial/Error Pass)
- [x] Fix: Video upload - stable URL.createObjectURL with cleanup on unmount
- [x] Fix: Playback controls - play/pause synced via onPlay/onPause events
- [x] Fix: Speed slider - wired to video.playbackRate on load and change
- [x] Fix: Opacity slider - CSS opacity applied live on video element
- [x] Fix: Trim controls - Set Start/End Here buttons sync with playhead
- [x] Fix: Create Clip - clips saved to DB when project exists
- [x] Fix: Save project - list invalidated after create/update
- [x] Fix: Load project - correct project ID passed to loadProjectFromDb
- [x] Fix: Projects dropdown - correct project loaded on click
- [x] Fix: Scene detection - client-side histogram analysis, no API needed
- [x] Fix: Timeline - playhead syncs via onTimeUpdate event
- [x] Fix: dotenv missing error - was from first cold start, resolved after pnpm install
- [x] Add: Text overlay - renders on top of video with color/size controls
- [x] Add: Export - MediaRecorder-based trimmed video export (ExportDialog)
- [x] Add: Short-form clip export (9:16 / 1:1 / 16:9 in ExportDialog)
- [x] Add: Keyboard shortcuts (space=play/pause, left/right=seek, M=mute)
- [x] Add: Undo/redo for editing actions (50-step history with keyboard shortcuts)


## Phase 7: Audio Support
- [x] Audio file upload (MP3, WAV, OGG, M4A) - Web Audio API integration
- [x] Multi-track audio support (AudioEffectsPanel with track list)
- [x] Audio volume control per track (gain node per track)
- [x] Audio mixing (Web Audio API mixes video + uploaded audio)
- [ ] Extract audio from video for separate editing (future)

## Phase 8: Effects Library
- [x] Brightness/Contrast adjustment (CSS filter + canvas)
- [x] Saturation control (CSS filter)
- [x] Hue shift (CSS filter)
- [x] Blur effect (CSS filter)
- [x] Grayscale filter (CSS filter)
- [x] Sepia filter (CSS filter)
- [x] Vintage effect (CSS filter combination)
- [x] Custom filter combinations (all sliders combinable)

## Phase 9: Color Grading
- [x] Curves adjustment (RGB + individual channels - ColorGradingPanel)
- [x] Levels adjustment (via curves)
- [x] Color wheels (Shadows/Midtones/Highlights - ColorGradingPanel)
- [x] Presets (Cinematic, Warm, Cool, Vintage, etc. - ColorGradingPanel)
- [x] LUT support (.cube file loading - ColorGradingPanel)
- [ ] Per-clip color grading keyframes (future)
- [x] AI color suggestions (LLM-powered via chatbot)
- [x] Color grading preview on video (canvas-based real-time)

## Phase 10: Chatbot Command Interface
- [x] Sidebar chatbot panel (AI Chat tab)
- [x] Command parsing (trim, speed, export, detect scenes, etc.)
- [x] Natural language command support (GPT-4o-mini)
- [x] Command history (chat message list)
- [x] Help/suggestions for available commands (suggestions chips)

## Phase 11: Advanced Scene Detection
- [x] Integrate PySceneDetect backend (detectAdvanced tRPC endpoint - downloads S3 video to temp file)
- [x] Support multiple detection methods (content, adaptive, threshold - UI selector in AI panel)
- [x] Combine histogram + PySceneDetect for comprehensive detection (both available in AI panel)
- [x] Show confidence scores for detected scenes (in scene list)

## Bug Fixes (Priority - Current Sprint)
- [x] Fix: Audio upload - Web Audio API with GainNode per track
- [x] Fix: Captions - OfflineAudioContext WAV extraction (no blob URL to server)
- [x] Fix: Audio tracks - volume control via GainNode.gain.value
- [x] Fix: Color grading live preview - gradeToCSS() now applied to video element (combined with effects)
- [x] Fix: PySceneDetect confidence scores - replaced hardcoded 1.0 with bell-curve heuristic
- [x] Fix: Advanced scene detection - deduplication by merging with existing scenes on detect

## Phase 12: Smart Cut (Scene Importance Scoring)
- [x] Implement motion detection (frame-to-frame pixel changes via OpenCV)
- [x] Implement audio analysis (RMS energy via librosa)
- [x] Implement scene importance scoring (motion 30% + audio 20% + duration 25% + temporal 25%)
- [x] Build Smart Cut UI (preset durations 30s/1:00/1:30/2:00 + custom input)
- [x] Implement auto-clip generation (top N scenes by score, preserve temporal order)
- [x] Add Smart Cut to AI panel
- [x] Fix: unique temp audio files with cleanup (mkstemp + ffmpeg -y)
- [x] Fix: time-aligned motion/audio scoring (real timestamps, windowed averages)
- [x] Fix: real scene boundaries (start/end/duration) used for clip selection
- [x] Add server/requirements.txt for Python dependencies
- [x] End-to-end test (test_scene_importance.py) - ALL TESTS PASSED

## Phase 13: Multi-Layer Editing (After Effects-style)
- [x] Design and implement Layer data model (type, transforms, blending, effects in lib/layers.ts)
- [x] Build Layer panel UI (add/delete/reorder layers, visibility + lock toggles)
- [x] Implement layer transforms UI (scale, rotation, position, opacity sliders)
- [x] Implement layer blending modes (12 modes: normal, multiply, screen, overlay, etc.)
- [x] Build layer compositor preview (renders layers in z-order over base video, synced playback)
- [x] Implement layer effects (per-layer brightness/contrast/saturation/blur/hue)
- [ ] Add layer keyframes (deferred: animation support)

## Phase 14: Puter.js Text-to-Speech Voice Generation
- [x] Implement Puter.js TTS integration (client-side, no API keys)
- [x] Build voice generation UI (text input, 3 engines, 8 languages)
- [x] Add generated audio to timeline as audio layer (auto-creates audio layer)
- [x] Support Standard, Neural, Generative engines
- [x] Base64 encoding for audio upload to storage

## Phase 15: Runway Video Generation (Alternative to Kling) [DEFERRED]
- [ ] Add RUNWAY_API_KEY to secrets
- [ ] Implement video generation endpoint (tRPC - async with polling)
- [ ] Build video generation UI (prompt input, duration, generate button)
- [ ] Add generated video to timeline as video layer
- [ ] Handle async generation (show progress, poll for completion)
- [ ] Test video quality and generation time

## Known Limitations & Future Work
- [ ] Layer keyframes (animation support)
- [ ] Link sharing (YouTube/TikTok/Instagram download)
- [ ] Viral clip detection (engagement pattern analysis)
- [ ] Export to multiple formats (MP4, WebM, ProRes)
- [ ] Collaboration features (real-time multi-user editing)
- [ ] Template system (pre-built project templates)

## Phase 16: Testing & Polish
- [ ] Test Smart Cut end-to-end (upload video, detect scenes, run Smart Cut, verify clips generated)
- [ ] Test multi-layer editing (add layers, transforms, blend modes, effects, verify rendering)
- [ ] Test voice generation (Puter.js, generate speech, add as layer, verify audio plays)
- [ ] Bug fixes and edge case handling

## Phase 17: Monetization (Carbon Ads + Adsterra)
- [x] Integrate Carbon Ads (bottom banner on landing page)
- [x] Integrate Adsterra (top + bottom banners on landing page)
- [x] User to provide VITE_CARBON_ADS_ID and VITE_ADSTERRA_ID environment variables
- [x] Verify ads display correctly on landing page
- [x] Test ad responsiveness on mobile

## Phase 18: 10X Sophistication & Studio Transformation
- [x] **Minimal Tech Elegance Landing Page**: Upgraded `Home.tsx` with sleek `#0a0a0a` dark theme, `#10b981` lime accents, bold typography, and interactive live sandbox demo widget.
- [x] **Interactive Studio Showcase Sandbox**: Live preview simulator on homepage enabling speed testing, color grading LUT toggles, and broadcast overlay previews.
- [x] **Multi-Track Pro Timeline**: Re-engineered `TimelineEditor.tsx` with dedicated tracks for Scenes, Clips, Layers, and Captions, plus hover playhead frame inspection (`#XXXX`).
- [x] **Broadcast Shape & Sticker Generator**: Enhanced `lib/layers.ts` and `LayerCompositor.tsx` with Lower Thirds, Live REC badges, Breaking News slates, and Viral Callouts.
- [x] **Layer Entrance & Exit Transitions**: Implemented dynamic layer transitions (`pop`, `fade`, `zoom`, `slide-left`, `slide-right`, `shrink`, `slide-down`) directly in `LayerCompositor.tsx`.
- [x] **Precision Zoom Controls**: Added precision zoom buttons (`+`, `-`, `Fit to View`) and timestamp/frame HUD to editor timeline.
- [x] **Type Safety & Build Verification**: All TypeScript and bundling checks verified clean (`npx pnpm check` & `npx pnpm build`).

## Phase 19: Staging Constraints, Loading Fixes & Ad Expansions
- [x] **Max 15-Minute Video Length**: Enforced client-side duration validation (`<= 900s`) upon video upload and server-side tRPC validation (`projects.update`).
- [x] **Max 20 Videos/Projects Stage Quota**: Enforced account limit of 20 projects/videos in `videos.upload` and `projects.create` tRPC mutations, plus client-side pre-upload checks.
- [x] **Reliable Project Restoration (`loadProjectFromDb`)**: Fixed video restoration failure by assigning storage URLs directly to `<video src={...} />` (eliminating browser CORS/blob issues on S3 307 redirects) and persisting multi-layer JSON state (`layers`, `textOverlays`, `effects`, `colorGrade`) in `projects.description`.
- [x] **Bottom Editor Ad Bar**: Added dedicated `<EditorAdBanner position="bottom" />` at the bottom of the editor screen below the timeline for enhanced monetization space.

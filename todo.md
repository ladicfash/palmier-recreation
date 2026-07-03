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

## Future Enhancements
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


## Phase 7: Audio Support (CURRENT)
- [ ] Audio file upload (MP3, WAV, OGG, M4A)
- [ ] Multi-track audio support (add audio tracks to timeline)
- [ ] Audio volume control per track
- [ ] Audio mixing (combine video audio + uploaded audio)
- [ ] Extract audio from video for separate editing

## Phase 8: Effects Library (CURRENT)
- [ ] Brightness/Contrast adjustment
- [ ] Saturation control
- [ ] Hue shift
- [ ] Blur effect
- [ ] Grayscale filter
- [ ] Sepia filter
- [ ] Vintage effect
- [ ] Custom filter combinations

## Phase 9: Color Grading (NEXT)
- [ ] Curves adjustment (RGB, individual channels)
- [ ] Levels adjustment
- [ ] Color wheels (Shadows/Midtones/Highlights)
- [ ] Presets (Cinematic, Warm, Cool, Vintage, etc.)
- [ ] LUT support (.cube file loading)
- [ ] Per-clip color grading (keyframes on timeline)
- [ ] AI color suggestions (histogram analysis + LLM)
- [ ] Color grading preview on timeline

## Phase 10: Chatbot Command Interface (NEXT)
- [ ] Sidebar chatbot panel
- [ ] Command parsing (trim, speed, export, detect scenes, add caption, etc.)
- [ ] Natural language command support
- [ ] Command history
- [ ] Help/suggestions for available commands

## Phase 11: Advanced Scene Detection (FUTURE)
- [ ] Integrate PySceneDetect backend (more accurate than histogram)
- [ ] Support multiple detection methods (content, adaptive, threshold)
- [ ] Combine histogram + PySceneDetect for comprehensive detection
- [ ] Show confidence scores for detected scenes

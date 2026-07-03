# PixelCraft - Video Editor with AI

## MVP Features

### Phase 1: Core Infrastructure
- [x] Resolve Home.tsx conflict (keep landing page or replace with editor dashboard)
- [x] Set up database schema for projects, videos, clips, captions
- [x] Implement user authentication and project ownership
- [ ] Create file storage integration for video uploads

### Phase 2: Video Upload & Timeline
- [x] Build video upload component (MP4, WebM, MOV support)
- [x] Create timeline editor interface with scrubber
- [x] Implement video playback with controls
- [x] Add timeline zoom and scroll functionality

### Phase 3: Core Editing Features
- [x] Implement trim/cut functionality (Create Clip from trim points)
- [ ] Add split clips feature
- [x] Implement speed adjustment (0.5x - 2x with live playback)
- [x] Add opacity/transparency control (live preview)
- [ ] Build text overlay system with styling

### Phase 4: AI Features
- [ ] Integrate Whisper API for auto-captioning (backend ready)
- [x] Implement scene detection (PySceneDetect backend)
- [ ] Add caption rendering to timeline
- [x] Create scene detection visualization (backend ready)

### Phase 5: Export & Project Management
- [ ] Build export dialog (full video + clip segments)
- [x] Implement project save/load system (Database + UI)
- [x] Add project listing and management (Projects dropdown)
- [ ] Create short-form clip export (TikTok/Reels dimensions)

### Phase 6: Polish & Testing
- [x] Add keyboard shortcuts (Space=play, arrows=seek, M=mute)
- [ ] Implement undo/redo
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
- [ ] Add: Export - MediaRecorder-based trimmed video export
- [ ] Add: Short-form clip export (9:16 aspect ratio)
- [x] Add: Keyboard shortcuts (space=play/pause, left/right=seek, M=mute)
- [ ] Add: Undo/redo for editing actions

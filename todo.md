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
- [ ] Add timeline zoom and scroll functionality

### Phase 3: Core Editing Features
- [x] Implement trim/cut functionality (Create Clip from trim points)
- [ ] Add split clips feature
- [x] Implement speed adjustment (0.5x - 2x with live playback)
- [x] Add opacity/transparency control (live preview)
- [ ] Build text overlay system with styling

### Phase 4: AI Features
- [ ] Integrate Whisper API for auto-captioning
- [ ] Implement scene detection (TensorFlow.js)
- [ ] Add caption rendering to timeline
- [ ] Create scene detection visualization

### Phase 5: Export & Project Management
- [ ] Build export dialog (full video + clip segments)
- [x] Implement project save/load system (Database + UI)
- [x] Add project listing and management (Projects dropdown)
- [ ] Create short-form clip export (TikTok/Reels dimensions)

### Phase 6: Polish & Testing
- [ ] Add keyboard shortcuts
- [ ] Implement undo/redo
- [ ] Create loading states and error handling
- [ ] Test on multiple browsers
- [ ] Performance optimization

## Future Enhancements
- [ ] AI video generation (Kling integration)
- [ ] Advanced effects library
- [ ] Collaboration features
- [ ] Template system
- [ ] Mobile app version

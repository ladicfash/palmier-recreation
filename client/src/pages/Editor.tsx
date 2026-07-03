import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimelineEditor } from "@/components/TimelineEditor";
import { Upload, Play, Pause, Volume2, Settings, Download, Plus, Trash2, Save, FolderOpen } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

interface TimelineClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  type: 'video' | 'audio' | 'text';
  opacity: number;
  speed: number;
}

interface Project {
  id: string;
  name: string;
  videoFile?: File;
  videoUrl?: string;
  videoKey?: string;
  clips: TimelineClip[];
  duration: number;
  speed: number;
  opacity: number;
  trimStart: number;
  trimEnd: number;
  dbId?: number;
}

/**
 * PixelCraft Video Editor
 * 
 * Main editor interface with:
 * - Video upload and preview
 * - Timeline scrubber
 * - Core editing controls (FUNCTIONAL)
 * - Project management with database persistence
 */

export default function Editor() {
  const { user, isAuthenticated } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [project, setProject] = useState<Project>({
    id: "project-1",
    name: "Untitled Project",
    clips: [],
    duration: 0,
    speed: 1,
    opacity: 1,
    trimStart: 0,
    trimEnd: 0,
  });

  // tRPC mutations and queries
  const createProjectMutation = trpc.projects.create.useMutation();
  const updateProjectMutation = trpc.projects.update.useMutation();
  const listProjectsQuery = trpc.projects.list.useQuery();
  const getProjectQuery = trpc.projects.getById.useQuery(
    { projectId: project.dbId || 0 },
    { enabled: !!project.dbId }
  );

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please log in to access the editor.</p>
          <Link href="/">
            <Button variant="default" className="w-full">Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProject(prev => ({
        ...prev,
        videoFile: file,
        name: file.name.replace(/\.[^/.]+$/, ""),
      }));
      setProjectName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setProject(prev => ({
        ...prev,
        duration: videoRef.current?.duration || 0,
        trimEnd: videoRef.current?.duration || 0,
      }));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setProject(prev => ({ ...prev, speed: newSpeed }));
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    setProject(prev => ({ ...prev, opacity: newOpacity }));
  };

  const handleTrimStart = (startTime: number) => {
    setProject(prev => ({ ...prev, trimStart: startTime }));
  };

  const handleTrimEnd = (endTime: number) => {
    setProject(prev => ({ ...prev, trimEnd: endTime }));
  };

  const applyTrim = () => {
    if (videoRef.current && project.trimStart < project.trimEnd) {
      videoRef.current.currentTime = project.trimStart;
      const trimClip: TimelineClip = {
        id: `clip-${Date.now()}`,
        name: `Trimmed Clip ${project.clips.length + 1}`,
        startTime: project.trimStart,
        endTime: project.trimEnd,
        type: 'video',
        opacity: project.opacity,
        speed: project.speed,
      };
      setProject(prev => ({
        ...prev,
        clips: [...prev.clips, trimClip],
      }));
      toast.success("Clip created!");
    }
  };

  const saveProject = async () => {
    try {
      if (!project.name.trim()) {
        toast.error("Project name cannot be empty");
        return;
      }

      // If project doesn't have a database ID, create it
      if (!project.dbId) {
        const newProject = await createProjectMutation.mutateAsync({
          name: project.name,
          description: `Video duration: ${duration}s, ${project.clips.length} clips`,
        });
        
        if (newProject) {
          setProject(prev => ({
            ...prev,
            dbId: newProject.id,
          }));
        }
        
        toast.success("Project created!");
      } else {
        // Update existing project
        await updateProjectMutation.mutateAsync({
          projectId: project.dbId,
          name: project.name,
          duration: duration,
        });
        
        toast.success("Project saved!");
      }

      // Save to localStorage as backup
      localStorage.setItem(`pixelcraft-project-${project.id}`, JSON.stringify({
        ...project,
        videoFile: null, // Don't save file object
      }));
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save project");
    }
  };

  const loadProject = async (projectId: number) => {
    try {
      const dbProject = await getProjectQuery.refetch();
      if (dbProject.data) {
        const proj = dbProject.data;
        setProject(prev => ({
          ...prev,
          name: proj.name,
          duration: proj.duration || 0,
          dbId: proj.id,
        }));
        toast.success("Project loaded!");
      }
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load project");
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const videoUrl = project.videoFile ? URL.createObjectURL(project.videoFile) : project.videoUrl;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-accent-foreground text-sm font-bold">
                P
              </div>
              <span className="font-bold">PixelCraft</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="bg-background border border-border rounded px-3 py-1 text-sm max-w-xs"
              placeholder="Project name"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={saveProject}
              disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowProjectDialog(!showProjectDialog)}
              className="flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Projects
            </Button>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Projects Dialog */}
        {showProjectDialog && (
          <div className="border-t border-border bg-card/30 p-4">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-sm font-semibold mb-3">Your Projects</h3>
              {listProjectsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading projects...</p>
              ) : listProjectsQuery.data && listProjectsQuery.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {listProjectsQuery.data.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => loadProject(proj.id)}
                      className="text-left p-3 rounded border border-border hover:bg-card/50 transition-colors"
                    >
                      <p className="text-sm font-medium">{proj.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {proj.duration ? `${proj.duration.toFixed(1)}s` : "No duration"}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No projects yet. Create one by saving!</p>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Preview */}
        <div className="flex-1 flex flex-col border-r border-border p-4 overflow-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            
            {videoUrl ? (
              <div className="bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full aspect-video bg-black"
                  style={{
                    opacity: project.opacity,
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
              </div>
            ) : (
              <div className="bg-card border-2 border-dashed border-border rounded-lg aspect-video flex items-center justify-center mb-4">
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload video</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Playback Controls */}
            {videoUrl && (
              <div className="space-y-4">
                {/* Time Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-10">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                      const time = parseFloat(e.target.value);
                      setCurrentTime(time);
                      if (videoRef.current) {
                        videoRef.current.currentTime = time;
                      }
                    }}
                    className="flex-1 h-1 bg-card rounded cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePlayPause}
                    className="flex-1"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-card rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clips Panel */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Clips ({project.clips.length})
            </h3>
            {project.clips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clips yet. Use trim controls to create clips.</p>
            ) : (
              <div className="space-y-2">
                {project.clips.map((clip) => (
                  <div key={clip.id} className="bg-card border border-border rounded p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{clip.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)} ({clip.speed.toFixed(1)}x, {Math.round(clip.opacity * 100)}%)
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setProject(prev => ({
                          ...prev,
                          clips: prev.clips.filter(c => c.id !== clip.id),
                        }));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Tools */}
        <div className="w-64 border-l border-border bg-card/30 p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Editing Tools
          </h2>

          <div className="space-y-6">
            {/* Trim Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Trim & Create Clip</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">Start Time (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={project.trimStart}
                    onChange={(e) => handleTrimStart(parseFloat(e.target.value))}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End Time (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={project.trimEnd || duration}
                    onChange={(e) => handleTrimEnd(parseFloat(e.target.value))}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                  />
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={applyTrim}>
                  Create Clip
                </Button>
              </div>
            </div>

            {/* Speed Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Playback Speed</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={project.speed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground text-center">{project.speed.toFixed(1)}x</p>
              </div>
            </div>

            {/* Opacity Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Opacity</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={project.opacity}
                  onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground text-center">{Math.round(project.opacity * 100)}%</p>
              </div>
            </div>

            {/* Text Overlay Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Add Text</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                />
                <Button size="sm" variant="outline" className="w-full">Add Text Overlay</Button>
              </div>
            </div>

            {/* AI Features Section */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold mb-3">AI Features</h3>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (!videoUrl) {
                      toast.error("Please upload a video first");
                      return;
                    }
                    toast.info("Scene detection started...");
                    // Scene detection will be triggered here
                  }}
                >
                  Detect Scenes
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  Generate Captions
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  Create Clips
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border-t border-border bg-card/50 p-4">
        <h3 className="text-sm font-semibold mb-4">Timeline</h3>
        {videoUrl ? (
          <TimelineEditor
            duration={duration}
            currentTime={currentTime}
            clips={project.clips}
            scenes={[]}
            onSeek={(time) => {
              setCurrentTime(time);
              if (videoRef.current) {
                videoRef.current.currentTime = time;
              }
            }}
            onTrimStart={handleTrimStart}
            onTrimEnd={handleTrimEnd}
            trimStart={project.trimStart}
            trimEnd={project.trimEnd}
          />
        ) : (
          <div className="bg-background rounded border border-border h-32 flex items-center justify-center text-sm text-muted-foreground">
            Upload a video to see the timeline
          </div>
        )}
      </div>
    </div>
  );
}

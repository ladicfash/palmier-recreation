import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Film, Scissors, Zap, Type, Download, ChevronDown,
  Play, Github, Twitter, Youtube, ArrowRight, Check,
  Layers, Volume2, Palette, Sliders, ShieldCheck, Video,
  Cpu, HardDrive, Sparkles, Terminal, BarChart3, Globe
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import AdBanner from "@/components/AdBanner";
import DismissibleAdPopup from "@/components/DismissibleAdPopup";

const faqs = [
  {
    q: "Is PixelCraft completely free to use?",
    a: "Yes. The core video editor — upload, trim, split, speed, opacity, multi-layer compositing, lower thirds, and interactive timeline — is 100% free. AI features like scene detection run locally in your browser at zero cost."
  },
  {
    q: "What video formats and file limits are supported?",
    a: "PixelCraft supports MP4, WebM, and MOV files up to 15 minutes in duration and up to 500 MB per clip. All editing takes place in local browser memory."
  },
  {
    q: "How does AI scene detection and Smart Cut work?",
    a: "Our hybrid detection runs histogram-based frame analysis entirely in your browser using WebGL / Canvas API, plus optional PySceneDetect content analysis on the backend for precision hard cuts."
  },
  {
    q: "Can I create short-form clips for TikTok or Reels?",
    a: "Yes. Use our Smart Cut AI tool to automatically extract top engagement scenes, or manually frame center-cropped 9:16 vertical exports with one click."
  },
  {
    q: "Do I need an account to edit videos?",
    a: "No. You can launch the studio immediately to try editing tools. Signing in lets you save multi-track projects to cloud storage and reload your complete editing history anytime."
  },
  {
    q: "What is Multi-Layer Editing?",
    a: "Just like After Effects or Premiere Pro, you can stack video, audio tracks, text titles, custom lower thirds, and callout slates with 12 blending modes and keyframe transitions."
  },
];

type ProductTab = "featured" | "ai" | "compositing" | "audio";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ProductTab>("featured");

  // Interactive Sandbox State
  const [demoSpeed, setDemoSpeed] = useState(1);
  const [demoFilter, setDemoFilter] = useState<"none" | "cinematic" | "monochrome" | "vintage">("none");
  const [demoLayer, setDemoLayer] = useState<"none" | "lower-third" | "slate">("lower-third");

  const getDemoFilterStyle = () => {
    switch (demoFilter) {
      case "cinematic": return "contrast(1.2) saturate(1.1) brightness(0.95)";
      case "monochrome": return "grayscale(1) contrast(1.15)";
      case "vintage": return "sepia(0.25) contrast(1.05) brightness(0.95)";
      default: return "none";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 selection:bg-emerald-600 selection:text-white overflow-x-hidden font-sans">
      <DismissibleAdPopup />
      {/* Adsterra Top Banner */}
      <AdBanner type="adsterra" position="top" />

      {/* ── Microsoft Azure Enterprise Header Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b0c10]/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/manus-storage/pixelcraft-logo_fb926e8a.png"
                alt="PixelCraft"
                className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-base tracking-tight text-zinc-100">
                PixelCraft Cloud
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-zinc-400">
              <a href="#products" className="hover:text-zinc-100 transition-colors">Products & Suite</a>
              <a href="#solutions" className="hover:text-zinc-100 transition-colors">Solutions</a>
              <a href="#sandbox" className="hover:text-zinc-100 transition-colors">Console Sandbox</a>
              <a href="#architecture" className="hover:text-zinc-100 transition-colors">Architecture</a>
              <a href="#faq" className="hover:text-zinc-100 transition-colors">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/editor">
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 rounded-md shadow-sm">
                  <Film className="w-3.5 h-3.5" /> Go to Studio Console
                </Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()} className="text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors px-2">Sign in</a>
                <Link href="/editor">
                  <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4.5 rounded-md shadow-sm transition-colors">
                    Try Studio Free <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Azure-Style 2-Column Hero Section ── */}
      <section className="pt-32 pb-20 px-6 border-b border-zinc-800 bg-[#0e1015]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs font-semibold px-3 py-1 rounded-md">
              <Terminal className="w-3.5 h-3.5" />
              Cloud-Native Video Engine v2.0
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-zinc-100">
              Invent, composite, and scale video workflows in the browser.
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Bring broadcast post-production to the web. PixelCraft provides multi-track After Effects compositing, zero-latency WebGL frame rendering, and neural speech synthesis without desktop installations.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/editor">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-5 rounded-md shadow">
                  <Film className="w-4 h-4" /> Start Editing Free
                </Button>
              </Link>
              <a href="#products">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200 font-semibold text-sm px-6 py-5 rounded-md">
                  Explore Products & Capabilities
                </Button>
              </a>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> No Credit Card</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 100% Client-Side Render</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 15m Clip Limit</span>
            </div>
          </div>

          {/* Right Column: Azure Console Sandbox Preview */}
          <div id="sandbox" className="lg:col-span-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="ml-2 text-zinc-300 font-semibold">pixelcraft-studio-console</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  WebGL Active
                </div>
              </div>

              {/* Console Canvas Preview */}
              <div className="relative h-64 sm:h-72 bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800">
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 transition-all duration-300 flex items-center justify-center"
                  style={{ filter: getDemoFilterStyle() }}
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow">
                      <Play className="w-5 h-5 text-zinc-300 ml-0.5" />
                    </div>
                    <p className="text-xs font-mono text-zinc-400 tracking-wider">SAMPLE 4K FOOTAGE ({demoSpeed}X SPEED)</p>
                    <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-widest font-semibold">LUT: {demoFilter}</p>
                  </div>
                </div>

                {demoLayer === "lower-third" && (
                  <div className="absolute bottom-5 left-5 bg-zinc-900/95 border-l-2 border-emerald-500 px-4 py-2 rounded-r shadow-lg border border-zinc-800">
                    <p className="text-xs font-bold text-zinc-100 tracking-wide">ELENA ROSTOVA</p>
                    <p className="text-[10px] text-zinc-400 font-mono">Principal Video Architect</p>
                  </div>
                )}
                {demoLayer === "slate" && (
                  <div className="absolute top-5 left-5 bg-zinc-900/90 text-zinc-200 border border-zinc-800 px-3 py-1 rounded text-xs font-mono">
                    REC [00:14:22:08]
                  </div>
                )}
              </div>

              {/* Console Parameters Bar */}
              <div className="p-4 bg-zinc-900/60 space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Playback Rate</span>
                    <div className="grid grid-cols-2 gap-1">
                      {[1, 1.5].map(s => (
                        <button
                          key={s}
                          onClick={() => setDemoSpeed(s)}
                          className={`py-1 rounded font-mono text-center border transition-colors ${demoSpeed === s ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Color Grade</span>
                    <div className="grid grid-cols-2 gap-1">
                      {(["none", "cinematic"] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setDemoFilter(f)}
                          className={`py-1 rounded capitalize text-center border transition-colors ${demoFilter === f ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Slate Element</span>
                    <div className="grid grid-cols-2 gap-1">
                      {([
                        { id: "lower-third", label: "Title" },
                        { id: "slate", label: "Time" }
                      ] as const).map(l => (
                        <button
                          key={l.id}
                          onClick={() => setDemoLayer(l.id)}
                          className={`py-1 rounded text-center border transition-colors ${demoLayer === l.id ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-3 flex items-center justify-between font-mono text-[11px] text-zinc-400">
                  <span>Engine: WebAudio + WebGL 2.0</span>
                  <Link href="/editor">
                    <span className="text-emerald-400 font-semibold hover:underline cursor-pointer">Launch Studio Console -&gt;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise Scale Metrics Strip ── */}
      <section className="py-12 px-6 border-b border-zinc-800 bg-[#0b0c10]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          <div className="space-y-1 border-l-2 border-emerald-600 pl-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono">100% Client-Side</div>
            <div className="text-xs text-zinc-400">All media decoding & canvas compositing runs locally in browser memory.</div>
          </div>
          <div className="space-y-1 border-l-2 border-emerald-600 pl-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono">0ms Latency</div>
            <div className="text-xs text-zinc-400">Zero cloud upload bottleneck for scrubbing, trimming, and scene preview.</div>
          </div>
          <div className="space-y-1 border-l-2 border-emerald-600 pl-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono">15m Stage Limit</div>
            <div className="text-xs text-zinc-400">Generous 15-minute video duration quota per clip for staging workflows.</div>
          </div>
          <div className="space-y-1 border-l-2 border-emerald-600 pl-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono">12 Blend Modes</div>
            <div className="text-xs text-zinc-400">Professional multi-layer After Effects mixing, curves, and keyframe transitions.</div>
          </div>
        </div>
      </section>

      {/* ── Azure-Style Tabbed Product Explorer Grid ── */}
      <section id="products" className="py-24 px-6 bg-[#0e1015]">
        <div className="max-w-7xl mx-auto">
          <div className="text-left max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100 mb-3">Explore PixelCraft products and services</h2>
            <p className="text-sm text-zinc-400">Comprehensive video tools engineered for high-throughput creator and developer teams.</p>
          </div>

          {/* Horizontal Category Navigation */}
          <div className="flex flex-wrap border-b border-zinc-800 mb-8 gap-2">
            {([
              { id: "featured", label: "Featured Suite" },
              { id: "ai", label: "AI Scene & Smart Cut" },
              { id: "compositing", label: "Multi-Layer Compositing" },
              { id: "audio", label: "Neural Speech & Audio" },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-zinc-100 bg-zinc-900/80"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {activeTab === "featured" && (
              <>
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center mb-5 text-emerald-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Layer Compositor</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      Stack unlimited video tracks, audio stems, typography slates, and vector shapes with 12 hardware-accelerated blending modes.
                    </p>
                  </div>
                  <Link href="/editor">
                    <span className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
                      Launch Compositor -&gt;
                    </span>
                  </Link>
                </div>

                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center mb-5 text-emerald-400">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Smart Cut AI Engine</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      Automate short-form highlight creation. Evaluates motion variance and audio energy to construct high-retention 9:16 vertical cuts.
                    </p>
                  </div>
                  <Link href="/editor">
                    <span className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
                      Explore Smart Cut -&gt;
                    </span>
                  </Link>
                </div>

                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center mb-5 text-emerald-400">
                      <Palette className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Color Wheels & Curves</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      Independent Lift, Gamma, and Gain color correction wheels paired with interactive master RGB spline curve editors.
                    </p>
                  </div>
                  <Link href="/editor">
                    <span className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
                      Open Color Suite -&gt;
                    </span>
                  </Link>
                </div>
              </>
            )}

            {activeTab === "ai" && (
              <>
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center mb-5 text-zinc-300">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Browser Histogram Detection</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      Analyze frame-to-frame luminance differences via WebGL Canvas buffers to mark cut points instantaneously.
                    </p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">Detect Scenes -&gt;</span></Link>
                </div>

                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center mb-5 text-zinc-300">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">PySceneDetect Verification</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      Server-side content, adaptive, and threshold detection methods running alongside Python microservices for studio precision.
                    </p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">Try Advanced AI -&gt;</span></Link>
                </div>

                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center mb-5 text-zinc-300">
                      <Type className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Whisper Auto-Captions</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      Extract audio tracks directly in the browser via OfflineAudioContext and transcribe speech with time-aligned subtitle markers.
                    </p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">Generate Subtitles -&gt;</span></Link>
                </div>
              </>
            )}

            {activeTab === "compositing" && (
              <>
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Transform Positioning</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">Fine-tune layer X/Y coordinates, scaling, rotation, and opacity directly inside visual inspector docks.</p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">Open Inspector -&gt;</span></Link>
                </div>
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Lower Thirds & Slates</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">Built-in broadcast lower thirds, timecode slates, Live REC indicators, and callout banners.</p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">View Elements -&gt;</span></Link>
                </div>
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Dynamic Entrance Animations</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">Apply hardware-calculated entrance and exit animations (Pop Scale, Slide Left, Zoom Bounce, Fade).</p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">Test Transitions -&gt;</span></Link>
                </div>
              </>
            )}

            {activeTab === "audio" && (
              <>
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Puter.js Neural Voices</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">Unlimited, API-key-free neural speech synthesis across 8 languages with Standard, Neural, and Generative engines.</p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">Generate Narration -&gt;</span></Link>
                </div>
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Multi-Track Audio Mixing</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">Import MP3, WAV, or OGG background stems with independent Web Audio API gain node volume attenuation.</p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">Mix Audio Stems -&gt;</span></Link>
                </div>
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">Audio Effects Suite</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">Adjust equalization, bass response, and vocal clarity presets right inside the timeline mixer.</p>
                  </div>
                  <Link href="/editor"><span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer">Apply Audio Presets -&gt;</span></Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Azure-Style Architecture / Solutions Section ── */}
      <section id="solutions" className="py-24 px-6 border-t border-zinc-800 bg-[#0b0c10]">
        <div className="max-w-7xl mx-auto">
          <div className="text-left max-w-3xl mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 mb-3">Architected for high-performance creative pipelines</h2>
            <p className="text-sm text-zinc-400">See how PixelCraft delivers cloud-scale reliability with zero client-side installation friction.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Local Memory Ingestion",
                desc: "When media is dropped into the console, object URLs bind directly to browser memory buffers. Videos never stream over public networks during preliminary cutting."
              },
              {
                step: "02",
                title: "WebGL & PySceneDetect Hybrid",
                desc: "Client-side Canvas 2D frame differentials run instantly during scrubbing, while background Python workers execute precision threshold verification."
              },
              {
                step: "03",
                title: "Hardware-Accelerated Export",
                desc: "Rendered compositions stream through browser MediaRecorder pipelines to output crisp MP4 and WebM packages directly to user storage."
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-lg border border-zinc-800/80 bg-zinc-900/40 relative">
                <div className="text-xs font-mono font-bold text-emerald-500 mb-3">PHASE {item.step}</div>
                <h3 className="text-base font-bold mb-2 text-zinc-100">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-24 px-6 border-t border-zinc-800 bg-[#0e1015]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-zinc-100 text-left">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div key={idx} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/60">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-900 transition-colors text-left"
                >
                  <span className="font-semibold text-xs sm:text-sm text-zinc-200">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0 ml-4 ${expandedFaq === idx ? "rotate-180 text-emerald-400" : ""}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-400 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad Space ── */}
      <section className="py-12 px-6 border-t border-zinc-800 bg-[#0b0c10]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-36 bg-zinc-900/80 rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs font-mono gap-1">
            <span>[ SPONSORED PLACEMENT ]</span>
            <span className="text-[10px] text-zinc-600">728x90 Partner Leaderboard</span>
          </div>
          <div className="h-36 bg-zinc-900/80 rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs font-mono gap-1">
            <span>[ SPONSORED PLACEMENT ]</span>
            <span className="text-[10px] text-zinc-600">300x250 Medium Rectangle</span>
          </div>
        </div>
      </section>

      {/* ── Microsoft Azure Style Enterprise Footer ── */}
      <footer className="border-t border-zinc-800 py-14 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/manus-storage/pixelcraft-logo_fb926e8a.png"
                  alt="PixelCraft"
                  className="w-6 h-6 object-contain"
                />
                <span className="font-bold text-sm text-zinc-100">PixelCraft Cloud</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">High-performance browser post-production platform.</p>
            </div>
            <div>
              <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider mb-3.5">Products & Suite</h3>
              <ul className="space-y-2.5 text-xs text-zinc-500">
                <li><Link href="/editor" className="hover:text-zinc-300 transition-colors">Editor Console</Link></li>
                <li><a href="#products" className="hover:text-zinc-300 transition-colors">Compositor Suite</a></li>
                <li><a href="#sandbox" className="hover:text-zinc-300 transition-colors">Console Sandbox</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider mb-3.5">Cloud Resources</h3>
              <ul className="space-y-2.5 text-xs text-zinc-500">
                <li><a href={getLoginUrl()} className="hover:text-zinc-300 transition-colors">Portal Sign in</a></li>
                <li><Link href="/editor" className="hover:text-zinc-300 transition-colors">Active Projects</Link></li>
                <li><a href="#architecture" className="hover:text-zinc-300 transition-colors">Architecture</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider mb-3.5">Legal & Compliance</h3>
              <ul className="space-y-2.5 text-xs text-zinc-500">
                <li><Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Privacy Statement</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p className="font-mono">© 2026 PixelCraft Cloud. Built for modern video engineering.</p>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-zinc-300 transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="hover:text-zinc-300 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-zinc-300 transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Banners */}
      <AdBanner type="carbon" position="bottom" />
      <AdBanner type="adsterra" position="bottom" />
    </div>
  );
}

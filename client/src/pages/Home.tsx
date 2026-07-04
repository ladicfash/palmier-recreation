import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Film, Scissors, Zap, Type, Download, ChevronDown,
  Play, Github, Twitter, Youtube, ArrowRight, Check,
  Layers, Volume2, Palette, Sliders, ShieldCheck, Video
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
    q: "What video formats are supported?",
    a: "PixelCraft supports MP4, WebM, and MOV files. You can upload directly from your device up to 500 MB and edit in the browser without installing heavy desktop software."
  },
  {
    q: "How does AI scene detection work?",
    a: "Our hybrid detection runs histogram-based frame analysis entirely in your browser using WebGL / Canvas API, plus optional PySceneDetect content analysis on the backend for precision hard cuts."
  },
  {
    q: "Can I create short-form clips for TikTok or Reels?",
    a: "Yes! Use our Smart Cut AI tool to automatically extract top engagement scenes, or manually frame center-cropped 9:16 vertical exports with 1 click."
  },
  {
    q: "Do I need an account to edit videos?",
    a: "No! You can open the editor immediately to try tools. Signing in lets you save multi-track projects to cloud storage and reload your complete editing history anytime."
  },
  {
    q: "What is Multi-Layer Editing?",
    a: "Just like After Effects or Premiere Pro, you can stack video, audio tracks, text titles, custom lower thirds, and callout slates with 12 blending modes and keyframe transitions."
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Interactive Demo State
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100 overflow-x-hidden font-sans">
      <DismissibleAdPopup />
      {/* Adsterra Top Banner */}
      <AdBanner type="adsterra" position="top" />

      {/* ── Refined Studio Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/manus-storage/pixelcraft-logo_fb926e8a.png"
              alt="PixelCraft"
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-bold text-base tracking-tight text-zinc-100">
              PixelCraft
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#demo" className="hover:text-zinc-100 transition-colors">Sandbox</a>
            <a href="#features" className="hover:text-zinc-100 transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-zinc-100 transition-colors">Workflow</a>
            <a href="#faq" className="hover:text-zinc-100 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/editor">
                <Button size="sm" variant="default" className="gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-4">
                  <Film className="w-4 h-4" /> Open Editor
                </Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()} className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors px-2">Sign in</a>
                <Link href="/editor">
                  <Button size="sm" className="gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-4.5">
                    Launch Studio <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-300 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8 border border-zinc-800">
            <Video className="w-3.5 h-3.5 text-zinc-400" />
            Zero-latency browser video editing engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.08] tracking-tight mb-6 text-zinc-100">
            Professional post-production.<br />
            <span className="text-zinc-400 font-normal">Entirely in your browser.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Multi-track timeline, non-destructive layer compositing, high-speed trim cuts, and client-side AI scene detection. No desktop software required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
            <Link href="/editor">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-7 py-5.5 rounded-lg shadow-sm">
                <Film className="w-4 h-4" /> Open Editor Free
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-sm font-medium border-zinc-800 hover:bg-zinc-900 text-zinc-300 px-6 py-5.5 rounded-lg transition-colors">
                <Sliders className="w-4 h-4 text-zinc-400" /> Test Interactive Sandbox
              </Button>
            </a>
          </div>

          {/* ── Interactive Live Studio Showcase Sandbox ── */}
          <div id="demo" className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-2xl max-w-4xl mx-auto text-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/90">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="text-xs font-mono text-zinc-400 ml-2">pixelcraft-engine — live sandbox</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-400" />
                60 FPS WebGL / Canvas
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
              {/* Simulated Canvas */}
              <div className="lg:col-span-2 relative h-72 sm:h-80 bg-zinc-950 flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 transition-all duration-300 flex items-center justify-center"
                  style={{ filter: getDemoFilterStyle() }}
                >
                  <div className="text-center space-y-2.5">
                    <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-sm">
                      <Play className="w-6 h-6 text-zinc-300 ml-0.5" />
                    </div>
                    <p className="text-xs font-mono text-zinc-500 tracking-wider">SAMPLE 4K MEDIA ({demoSpeed}X SPEED)</p>
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">GRADE: {demoFilter}</p>
                  </div>
                </div>

                {/* Simulated Overlay */}
                {demoLayer === "lower-third" && (
                  <div className="absolute bottom-6 left-6 bg-zinc-900/95 border-l-2 border-zinc-400 px-4 py-2.5 rounded-r-md shadow-lg border border-zinc-800">
                    <p className="text-xs font-bold text-zinc-100 tracking-wide">ELENA ROSTOVA</p>
                    <p className="text-[11px] text-zinc-400 font-normal">Lead Post-Production Editor</p>
                  </div>
                )}
                {demoLayer === "slate" && (
                  <div className="absolute top-6 left-6 bg-zinc-900/90 text-zinc-200 border border-zinc-800 px-3 py-1.5 rounded text-xs font-mono">
                    REC [00:14:22:08]
                  </div>
                )}
              </div>

              {/* Sandbox Inspector Controls */}
              <div className="p-5 space-y-5 bg-zinc-900/40 flex flex-col justify-between text-xs">
                <div className="space-y-5">
                  <h3 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-zinc-400" /> Sandbox Parameters
                  </h3>

                  {/* Speed */}
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1.5">
                      <span>Playback Rate</span>
                      <span className="font-mono text-zinc-200 font-medium">{demoSpeed}x</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[0.5, 1, 1.5, 2].map(s => (
                        <button
                          key={s}
                          onClick={() => setDemoSpeed(s)}
                          className={`py-1 rounded font-mono transition-colors border ${demoSpeed === s ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-medium" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Grade */}
                  <div>
                    <span className="text-zinc-400 block mb-1.5">Color Profile</span>
                    <div className="grid grid-cols-2 gap-1">
                      {(["none", "cinematic", "monochrome", "vintage"] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setDemoFilter(f)}
                          className={`py-1.5 px-2 rounded capitalize transition-colors border text-left ${demoFilter === f ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-medium" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Graphic Slate */}
                  <div>
                    <span className="text-zinc-400 block mb-1.5">Slate Element</span>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { id: "lower-third", label: "Title" },
                        { id: "slate", label: "Timecode" },
                        { id: "none", label: "None" }
                      ] as const).map(l => (
                        <button
                          key={l.id}
                          onClick={() => setDemoLayer(l.id)}
                          className={`py-1.5 px-2 rounded transition-colors border text-center ${demoLayer === l.id ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-medium" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <Link href="/editor">
                    <Button className="w-full gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs py-4.5">
                      Launch Full Studio <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Timeline bar preview */}
            <div className="border-t border-zinc-800/80 bg-zinc-900/90 px-4 py-2.5 flex items-center gap-3 text-xs">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Track 01</span>
              <div className="flex-1 h-2.5 bg-zinc-950 rounded-full overflow-hidden flex gap-1 p-0.5 border border-zinc-800">
                <div className="w-1/4 h-full bg-zinc-600 rounded-sm" />
                <div className="w-1/3 h-full bg-zinc-500 rounded-sm" />
                <div className="w-1/5 h-full bg-zinc-700 rounded-sm" />
                <div className="flex-1 h-full bg-zinc-400 rounded-sm" />
              </div>
              <span className="text-[10px] font-mono text-zinc-400">01:30.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Features Grid ── */}
      <section id="features" className="py-24 px-6 border-t border-zinc-800/80 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-zinc-100">Professional capabilities, simplified.</h2>
            <p className="text-zinc-400 text-sm">Every tool designed with clean keyboard accessibility and real-time canvas feedback.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Layers className="w-5 h-5 text-zinc-300" />,
                title: "Layer Compositor",
                desc: "Stack multiple video tracks, background scores, typography layers, and custom slates with non-destructive blending modes."
              },
              {
                icon: <Scissors className="w-5 h-5 text-zinc-300" />,
                title: "Smart Cut AI Engine",
                desc: "Analyze frame motion variance and audio cadence to extract concise short-form sequences automatically."
              },
              {
                icon: <Zap className="w-5 h-5 text-zinc-300" />,
                title: "Scene Boundary Detection",
                desc: "Run instant frame differential histograms client-side or execute backend PySceneDetect algorithms."
              },
              {
                icon: <Volume2 className="w-5 h-5 text-zinc-300" />,
                title: "Neural Speech Synthesis",
                desc: "Generate professional voiceover audio directly to timeline tracks across 8 international languages."
              },
              {
                icon: <Palette className="w-5 h-5 text-zinc-300" />,
                title: "Color Wheels & Curves",
                desc: "Perform primary color adjustments with independent Lift/Gamma/Gain wheels and master RGB curve mapping."
              },
              {
                icon: <Download className="w-5 h-5 text-zinc-300" />,
                title: "Adaptive Reframing",
                desc: "Export full widescreen projects or package center-cropped 9:16 vertical segments for modern mobile distribution."
              },
            ].map((f, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                <div className="w-10 h-10 rounded-md bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold mb-2 text-zinc-100">{f.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow Step Section ── */}
      <section id="workflow" className="py-24 px-6 border-t border-zinc-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">Three-step workflow.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Import Media", desc: "Instantly load MP4, MOV, or WebM video files up to 15 minutes without uploading to third-party transcoding servers." },
              { step: "02", title: "Edit & Composite", desc: "Trim segments, stack audio tracks, apply color curves, and generate neural speech narration." },
              { step: "03", title: "Render & Download", desc: "Package high-resolution MP4 or WebM files directly to your local storage ready for publishing." },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
                <div className="text-3xl font-bold text-zinc-600 font-mono mb-3">{item.step}</div>
                <h3 className="text-base font-semibold mb-2 text-zinc-100">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-20 px-6 border-t border-zinc-800/80 bg-zinc-900/30">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-5 h-5 text-zinc-300" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-zinc-100">Open web standards. Client-first processing.</h2>
          <p className="text-zinc-400 text-sm mb-8">PixelCraft runs entirely inside modern web browsers using WebGL, Web Audio, and WebAssembly.</p>

          <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/80 text-left max-w-md mx-auto">
            <ul className="space-y-3">
              {[
                "Unlimited video uploads (up to 15m per clip)",
                "Multi-layer After Effects composition",
                "Client-side AI scene cut detection",
                "Free neural speech synthesis via Puter.js",
                "Color grading curves & preset LUTs",
                "Instant short-form vertical cropping",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-medium text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <Link href="/editor">
                <Button size="default" className="w-full gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs py-5">
                  <Film className="w-4 h-4" /> Open Editor Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-20 px-6 border-t border-zinc-800/80">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-zinc-100">Frequently Asked Questions</h2>
          <div className="space-y-2.5">
            {faqs.map((item, idx) => (
              <div key={idx} className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-900/40">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-zinc-900 transition-colors text-left"
                >
                  <span className="font-medium text-xs text-zinc-200">{item.q}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform flex-shrink-0 ml-4 ${expandedFaq === idx ? "rotate-180 text-zinc-100" : ""}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-5 py-3.5 bg-zinc-900/80 border-t border-zinc-800 text-xs text-zinc-400 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad Space ── */}
      <section className="py-12 px-6 border-t border-zinc-800/80 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-36 bg-zinc-900/60 rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs font-mono gap-1">
            <span>[ SPONSORED PLACEMENT ]</span>
            <span className="text-[10px] text-zinc-600">728x90 Leaderboard Placement</span>
          </div>
          <div className="h-36 bg-zinc-900/60 rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs font-mono gap-1">
            <span>[ SPONSORED PLACEMENT ]</span>
            <span className="text-[10px] text-zinc-600">300x250 Medium Rectangle</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/80 py-12 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <img
                  src="/manus-storage/pixelcraft-logo_fb926e8a.png"
                  alt="PixelCraft"
                  className="w-6 h-6 object-contain"
                />
                <span className="font-bold text-sm text-zinc-100">PixelCraft</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">Browser-native video editing and compositing engine.</p>
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-300 mb-3">Navigation</h3>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><Link href="/editor" className="hover:text-zinc-300 transition-colors">Editor Studio</Link></li>
                <li><a href="#demo" className="hover:text-zinc-300 transition-colors">Sandbox</a></li>
                <li><a href="#features" className="hover:text-zinc-300 transition-colors">Capabilities</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-300 mb-3">Workspace</h3>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><a href={getLoginUrl()} className="hover:text-zinc-300 transition-colors">Sign in</a></li>
                <li><Link href="/editor" className="hover:text-zinc-300 transition-colors">Cloud Projects</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-300 mb-3">Legal</h3>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">© 2026 PixelCraft. All rights reserved.</p>
            <div className="flex items-center gap-4 text-zinc-500">
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

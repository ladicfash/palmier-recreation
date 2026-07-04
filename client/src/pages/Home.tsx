import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Film, Scissors, Zap, Type, Download, ChevronDown,
  Play, Github, Twitter, Youtube, ArrowRight, Check,
  Sparkles, Layers, Volume2, Palette, Sliders, ShieldCheck
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
    a: "Just like After Effects or Premiere Pro, you can stack video, audio tracks, text titles, custom lower thirds, and animated callout badges with 12 blending modes and keyframe transitions."
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Interactive Demo State
  const [demoSpeed, setDemoSpeed] = useState(1);
  const [demoFilter, setDemoFilter] = useState<"none" | "cinematic" | "cyberpunk" | "vintage">("none");
  const [demoLayer, setDemoLayer] = useState<"none" | "lower-third" | "breaking" | "live">("lower-third");

  const getDemoFilterStyle = () => {
    switch (demoFilter) {
      case "cinematic": return "contrast(1.25) saturate(1.1) hue-rotate(-10deg)";
      case "cyberpunk": return "contrast(1.4) saturate(1.8) hue-rotate(45deg)";
      case "vintage": return "sepia(0.35) contrast(1.1) brightness(0.9)";
      default: return "none";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#10b981] selection:text-black overflow-x-hidden font-sans">
      <DismissibleAdPopup />
      {/* Adsterra Top Banner */}
      <AdBanner type="adsterra" position="top" />

      {/* ── Minimal Tech Elegance Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center font-black text-black text-base shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              PixelCraft Pro
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#demo" className="hover:text-[#10b981] transition-colors">Interactive Demo</a>
            <a href="#features" className="hover:text-[#10b981] transition-colors">Pro Suite</a>
            <a href="#workflow" className="hover:text-[#10b981] transition-colors">Workflow</a>
            <a href="#faq" className="hover:text-[#10b981] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3.5">
            {isAuthenticated ? (
              <Link href="/editor">
                <Button size="sm" className="gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                  <Film className="w-4 h-4" /> Open Studio
                </Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()} className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2">Sign in</a>
                <Link href="/editor">
                  <Button size="sm" className="gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold px-5 py-2 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all">
                    Launch Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="pt-40 pb-24 px-6 relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#10b981]/15 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2.5 bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-4 py-2 rounded-full mb-8 border border-[#10b981]/30 shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Native Browser Video Editor — Multi-Layer Compositing & Smart Cuts
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.03] tracking-tight mb-8">
            Video editing built<br />
            for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#6ee7b7]">AI efficiency.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-normal">
            Multi-track timelines, After Effects-style layers, AI beat sync, voice generation, and instant 9:16 short-form clipping — zero downloads required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/editor">
              <Button size="lg" className="w-full sm:w-auto gap-2.5 text-base font-extrabold bg-[#10b981] hover:bg-[#059669] text-black px-9 py-6 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform hover:scale-[1.02]">
                <Film className="w-5 h-5" /> Launch Editor Studio
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2.5 text-base font-semibold border-white/20 hover:bg-white/10 text-white px-8 py-6 rounded-xl transition-all">
                <Sliders className="w-4 h-4 text-[#10b981]" /> Try Live Interactive Demo
              </Button>
            </a>
          </div>

          {/* ── Interactive Live Studio Showcase Demo ── */}
          <div id="demo" className="rounded-2xl border border-white/15 bg-[#121212] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-w-4xl mx-auto text-left">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#161616]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-white/50 ml-3">pixelcraft-studio-engine — live sandbox</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-[#10b981]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                60 FPS Hardware Render
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              {/* Simulated Canvas */}
              <div className="lg:col-span-2 relative h-72 sm:h-80 bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                {/* Background visual simulation */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-emerald-950/40 to-slate-900 transition-all duration-500 flex items-center justify-center"
                  style={{ filter: getDemoFilterStyle() }}
                >
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center mx-auto shadow-xl">
                      <Play className="w-8 h-8 text-[#10b981] ml-1" />
                    </div>
                    <p className="text-xs font-mono text-white/60 tracking-wider">SAMPLE 4K FOOTAGE ({demoSpeed}X SPEED)</p>
                    <p className="text-[11px] text-[#10b981] font-semibold uppercase tracking-widest">GRADE: {demoFilter}</p>
                  </div>
                </div>

                {/* Simulated Overlay */}
                {demoLayer === "lower-third" && (
                  <div className="absolute bottom-6 left-6 bg-black/85 border-l-4 border-[#10b981] px-5 py-3 rounded-r-xl shadow-2xl animate-fade-in">
                    <p className="text-sm font-extrabold text-white tracking-wide">ELENA ROSTOVA</p>
                    <p className="text-xs text-[#10b981] font-semibold">Chief AI Video Architect</p>
                  </div>
                )}
                {demoLayer === "breaking" && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black px-6 py-2 rounded shadow-2xl border-y-2 border-yellow-400 text-sm tracking-widest uppercase flex items-center gap-2 animate-bounce">
                    ⚡ BREAKING: AI SMART CUTS DEPLOYED ⚡
                  </div>
                )}
                {demoLayer === "live" && (
                  <div className="absolute top-6 right-6 bg-black/80 text-white font-bold px-3 py-1.5 rounded border border-red-500/50 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-red-500 uppercase">LIVE REC</span>
                  </div>
                )}
              </div>

              {/* Sandbox Inspector Controls */}
              <div className="p-6 space-y-6 bg-[#141414] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#10b981]" /> Sandbox Controls
                  </h3>

                  {/* Speed */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/60 font-medium">Playback Rate</span>
                      <span className="font-mono text-[#10b981] font-bold">{demoSpeed}x</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0.5, 1, 1.5, 2].map(s => (
                        <button
                          key={s}
                          onClick={() => setDemoSpeed(s)}
                          className={`py-1.5 rounded text-xs font-mono transition-all border ${demoSpeed === s ? "bg-[#10b981] text-black border-[#10b981] font-bold" : "bg-black/50 border-white/10 text-white/70 hover:border-white/30"}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Grade */}
                  <div className="mb-5">
                    <span className="text-xs text-white/60 font-medium block mb-1.5">Color Grading LUT</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["none", "cinematic", "cyberpunk", "vintage"] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setDemoFilter(f)}
                          className={`py-1.5 px-2 rounded text-xs capitalize font-medium transition-all border ${demoFilter === f ? "bg-[#10b981] text-black border-[#10b981] font-bold" : "bg-black/50 border-white/10 text-white/70 hover:border-white/30"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Graphic Slate */}
                  <div>
                    <span className="text-xs text-white/60 font-medium block mb-1.5">Broadcast Overlay</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { id: "lower-third", label: "Lower Third" },
                        { id: "breaking", label: "Breaking Banner" },
                        { id: "live", label: "Live REC Badge" },
                        { id: "none", label: "Hidden" }
                      ] as const).map(l => (
                        <button
                          key={l.id}
                          onClick={() => setDemoLayer(l.id)}
                          className={`py-1.5 px-2 rounded text-xs font-medium transition-all border ${demoLayer === l.id ? "bg-[#10b981] text-black border-[#10b981] font-bold" : "bg-black/50 border-white/10 text-white/70 hover:border-white/30"}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link href="/editor">
                    <Button className="w-full gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-xs py-5">
                      Launch Full Studio <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Timeline bar preview */}
            <div className="border-t border-white/10 bg-[#111] px-5 py-3 flex items-center gap-3">
              <span className="text-[10px] font-mono text-white/40 uppercase">Timeline Track</span>
              <div className="flex-1 h-3 bg-black/80 rounded-full overflow-hidden flex gap-1 p-0.5 border border-white/10">
                <div className="w-1/4 h-full bg-[#10b981]/60 rounded-sm" />
                <div className="w-1/3 h-full bg-blue-500/60 rounded-sm" />
                <div className="w-1/5 h-full bg-purple-500/60 rounded-sm" />
                <div className="flex-1 h-full bg-yellow-500/60 rounded-sm" />
              </div>
              <span className="text-[10px] font-mono text-white/60">01:30.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Features Grid ── */}
      <section id="features" className="py-28 px-6 border-t border-white/10 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-xs font-bold text-[#10b981] uppercase tracking-widest mb-3">Enterprise Grade</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">A complete post-production studio in your browser.</h2>
            <p className="text-white/60 text-base">Engineered with modern WebAudio, Canvas 2D compositing, and serverless AI microservices.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Layers className="w-6 h-6 text-[#10b981]" />,
                title: "After Effects Layer Stack",
                desc: "Full multi-layer compositing with 12 blending modes (Multiply, Screen, Overlay, Exclusion), keyframe transitions, and custom transform positioning."
              },
              {
                icon: <Scissors className="w-6 h-6 text-[#10b981]" />,
                title: "Smart Cut AI Engine",
                desc: "Analyzes video motion velocity, audio RMS energy, and temporal cadence to automatically select and sequence top high-retention clips."
              },
              {
                icon: <Zap className="w-6 h-6 text-[#10b981]" />,
                title: "Hybrid Scene Cut Detector",
                desc: "Client-side histogram differential analysis runs instantly at 0ms latency, backed by PySceneDetect threshold verification."
              },
              {
                icon: <Volume2 className="w-6 h-6 text-[#10b981]" />,
                title: "Puter.js Neural Voices",
                desc: "Unlimited free text-to-speech voiceovers across 8+ international languages with Standard, Neural, and Generative speech synthesis."
              },
              {
                icon: <Palette className="w-6 h-6 text-[#10b981]" />,
                title: "3D LUTs & Color Grading",
                desc: "Primary color wheels (Lift/Gamma/Gain), master RGB curve manipulation, cinematic presets, and LLM-powered frame grading suggestions."
              },
              {
                icon: <Download className="w-6 h-6 text-[#10b981]" />,
                title: "Multi-Format Export Suite",
                desc: "Export full source projects, individual trimmed segments, or automated center-cropped 9:16 vertical shorts for TikTok and Instagram Reels."
              },
            ].map((f, idx) => (
              <div key={idx} className="p-7 rounded-2xl border border-white/10 bg-[#131313] hover:border-[#10b981]/50 hover:bg-[#181818] transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 border border-[#10b981]/25 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow Step Section ── */}
      <section id="workflow" className="py-28 px-6 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-xs font-bold text-[#10b981] uppercase tracking-widest mb-3">Seamless Process</p>
            <h2 className="text-4xl font-extrabold tracking-tight">Three steps to broadcast-ready video.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Upload or Drop Footage", desc: "Instantly load MP4, MOV, or WebM clips up to 500MB directly into browser memory." },
              { step: "02", title: "Composite & Enhance with AI", desc: "Stack lower third shapes, generate neural voiceovers, detect scene boundaries, and color grade." },
              { step: "03", title: "Export & Package for Socials", desc: "Render high-definition MP4 clips or package 9:16 short-form highlights ready for viral distribution." },
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-2xl border border-white/10 bg-[#121212]">
                <div className="text-5xl font-black text-[#10b981]/20 font-mono mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Zero Cost Trust Section ── */}
      <section className="py-24 px-6 border-t border-white/10 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-6 h-6 text-[#10b981]" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4">100% Free. Built on Open Standards.</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto">No subscriptions, no hidden watermarks, and no monthly export caps. PixelCraft Pro runs client-first on modern web technologies.</p>

          <div className="border border-[#10b981]/30 rounded-2xl p-8 bg-[#10b981]/5 text-left max-w-md mx-auto shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <div className="flex items-end gap-3 mb-6 border-b border-white/10 pb-6">
              <span className="text-6xl font-black text-white">$0</span>
              <span className="text-white/60 mb-2 font-mono uppercase text-xs">/ Forever Unlimited</span>
            </div>
            <ul className="space-y-3.5 mb-8">
              {[
                "Unlimited 4K & HD video uploads",
                "After Effects multi-layer compositor",
                "AI Smart Cut & PySceneDetect engine",
                "Puter.js Neural Voice generation",
                "Color Wheels & 3D LUT curve grading",
                "Interactive multi-track timeline",
                "Instant short-form 9:16 vertical framing",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/80">
                  <Check className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/editor">
              <Button size="lg" className="w-full gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-extrabold py-6 rounded-xl shadow-lg">
                <Film className="w-5 h-5" /> Open Studio Free Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-24 px-6 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-[#10b981] uppercase tracking-widest mb-3">Knowledge Base</p>
          <h2 className="text-4xl font-extrabold mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3.5">
            {faqs.map((item, idx) => (
              <div key={idx} className="border border-white/10 rounded-xl overflow-hidden bg-[#121212]">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <span className="font-bold text-sm text-white/90">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/50 transition-transform flex-shrink-0 ml-4 ${expandedFaq === idx ? "rotate-180 text-[#10b981]" : ""}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-[#161616] border-t border-white/10 text-sm text-white/70 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad Space ── */}
      <section className="py-16 px-6 border-t border-white/10 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 bg-[#141414] rounded-xl border border-white/10 flex flex-col items-center justify-center text-white/40 text-xs font-mono gap-1">
            <span>[ SPONSORED PLACEMENT SPACE ]</span>
            <span className="text-[10px] text-white/20">728x90 Leaderboard / Partner Banner</span>
          </div>
          <div className="h-44 bg-[#141414] rounded-xl border border-white/10 flex flex-col items-center justify-center text-white/40 text-xs font-mono gap-1">
            <span>[ SPONSORED PLACEMENT SPACE ]</span>
            <span className="text-[10px] text-white/20">300x250 Medium Rectangle / Partner Banner</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-14 px-6 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-[#10b981] rounded-md flex items-center justify-center font-black text-black text-xs">P</div>
                <span className="font-extrabold text-base tracking-tight">PixelCraft Pro</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">The AI-native browser video editor for professional creators, marketers, and developers.</p>
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-3.5">Product Suite</h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><Link href="/editor" className="hover:text-[#10b981] transition-colors">Editor Studio</Link></li>
                <li><a href="#demo" className="hover:text-[#10b981] transition-colors">Interactive Demo</a></li>
                <li><a href="#features" className="hover:text-[#10b981] transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-3.5">Workspace</h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><a href={getLoginUrl()} className="hover:text-[#10b981] transition-colors">Sign in</a></li>
                <li><Link href="/editor" className="hover:text-[#10b981] transition-colors">My Cloud Projects</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-3.5">Legal & Privacy</h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><Link href="/terms" className="hover:text-[#10b981] transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-[#10b981] transition-colors">Client-Side Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40 font-mono">© 2026 PixelCraft Pro Studio. Engineered for high-speed AI video workflows.</p>
            <div className="flex items-center gap-4 text-white/60">
              <a href="#" className="hover:text-[#10b981] transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#10b981] transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#10b981] transition-colors"><Youtube className="w-4 h-4" /></a>
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

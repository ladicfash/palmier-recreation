import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Film, Scissors, Zap, Type, Download, ChevronDown,
  Play, Github, Twitter, Youtube, ArrowRight, Check
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import AdBanner from "@/components/AdBanner";

const faqs = [
  {
    q: "Is PixelCraft completely free to use?",
    a: "Yes. The core video editor — upload, trim, split, speed, opacity, text overlays, and timeline — is 100% free. AI features like scene detection run locally in your browser at no cost."
  },
  {
    q: "What video formats are supported?",
    a: "PixelCraft supports MP4, WebM, and MOV files. You can upload directly from your device and edit in the browser without any installation."
  },
  {
    q: "How does scene detection work?",
    a: "Scene detection uses histogram-based frame analysis running entirely in your browser via the Canvas API. No video is ever uploaded to a server for this feature — it's 100% private and free."
  },
  {
    q: "Can I create short-form clips for TikTok or Reels?",
    a: "Yes. Use the Trim controls to set start and end points, then click Create Clip. The AI panel also has a short-form export option that packages your clips at 9:16 aspect ratio."
  },
  {
    q: "Do I need an account to use the editor?",
    a: "You need to sign in to save and load projects. The editor itself is accessible after a quick OAuth login — no credit card or subscription required."
  },
  {
    q: "How do I add text overlays?",
    a: "Open the Text tab in the right panel, type your text, choose a color and font size, then click Add Overlay. The text appears centered on the video preview in real time."
  },
  {
    q: "Can I export my edited video?",
    a: "Yes. Click the Export button in the header to download the source video. Clip metadata is saved to your project. Full FFmpeg-based trim export is on the roadmap."
  },
  {
    q: "Is my video data private?",
    a: "All video processing happens locally in your browser. Your video files are never uploaded to any server. Only project metadata (names, clip timestamps) is stored in the database."
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Adsterra Top Banner */}
      <AdBanner type="adsterra" position="top" />

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center text-accent-foreground font-bold text-sm">P</div>
            <span className="font-bold text-base tracking-tight">PixelCraft</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/editor">
                <Button size="sm" variant="default" className="gap-1.5">
                  <Film className="w-3.5 h-3.5" /> Open Editor
                </Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</a>
                <Link href="/editor">
                  <Button size="sm" variant="default">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-accent/20">
            <Zap className="w-3 h-3" />
            AI-powered scene detection — runs in your browser, free forever
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            The video editor<br />
            <span className="text-accent">built for creators.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Trim, cut, add text, detect scenes, and export clips — all in your browser. No installs, no subscriptions, no limits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/editor">
              <Button size="lg" variant="default" className="gap-2 text-base px-8">
                <Film className="w-5 h-5" /> Open Editor Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-base px-8" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              <Play className="w-4 h-4" /> See Features
            </Button>
          </div>

          {/* Editor Preview Card */}
          <div className="rounded-xl border border-border bg-card/50 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/80">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-xs text-muted-foreground ml-2 font-mono">pixelcraft — editor</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border h-48">
              <div className="col-span-2 bg-black/60 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto mb-3">
                    <Play className="w-5 h-5 text-accent ml-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground">Video Preview</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-2 bg-accent/30 rounded-full w-3/4" />
                <div className="h-2 bg-border rounded-full w-full" />
                <div className="h-2 bg-border rounded-full w-2/3" />
                <div className="h-6 bg-accent/20 rounded border border-accent/30 mt-4" />
                <div className="h-6 bg-border/50 rounded" />
              </div>
            </div>
            <div className="border-t border-border bg-card/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 bg-accent rounded-full" style={{ width: "35%" }} />
                <div className="h-1.5 bg-border rounded-full flex-1" />
                <div className="flex gap-1 ml-2">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-6 rounded bg-blue-500/30 border border-blue-500/50" style={{ width: `${40 + i * 20}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-semibold">Everything you need</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-16 max-w-2xl">Professional editing tools, zero cost.</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Scissors className="w-5 h-5" />,
                title: "Trim & Cut",
                desc: "Set precise start and end points with \"Set Start Here\" / \"Set End Here\" buttons that snap to the current playhead position."
              },
              {
                icon: <Film className="w-5 h-5" />,
                title: "Interactive Timeline",
                desc: "Drag the playhead, trim handles, and zoom from 0.5x to 3x. Scene markers and clips are visualized in real time."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "AI Scene Detection",
                desc: "Histogram-based scene detection runs entirely in your browser using the Canvas API. No API keys, no cost, fully private."
              },
              {
                icon: <Type className="w-5 h-5" />,
                title: "Text Overlays",
                desc: "Add styled text on top of your video with custom color, font size, and positioning. Overlays render live in the preview."
              },
              {
                icon: <Play className="w-5 h-5" />,
                title: "Speed & Opacity",
                desc: "Change playback speed from 0.25x to 2x with instant feedback. Adjust opacity from 0–100% with live preview."
              },
              {
                icon: <Download className="w-5 h-5" />,
                title: "Export & Save",
                desc: "Export your video directly from the browser. Save projects to the cloud and reload them anytime with full clip history."
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card/30 hover:bg-card/60 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 group-hover:bg-accent/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 border-t border-border bg-card/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-semibold">Workflow</p>
          <h2 className="text-4xl font-bold mb-16">Edit in three steps.</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload your video", desc: "Drag and drop or click to upload MP4, WebM, or MOV. Your file never leaves your browser." },
              { step: "02", title: "Edit on the timeline", desc: "Trim clips, adjust speed, add text overlays, and detect scenes automatically with AI." },
              { step: "03", title: "Export & share", desc: "Download your video or save the project to your account to continue editing later." },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-black text-accent/20 mb-4 font-mono">{item.step}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute top-12 -right-4 w-5 h-5 text-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-semibold">Pricing</p>
          <h2 className="text-4xl font-bold mb-4">Free. Always.</h2>
          <p className="text-muted-foreground mb-12">PixelCraft is built on open-source libraries and browser APIs. There's nothing to pay for.</p>

          <div className="border border-accent/40 rounded-2xl p-8 bg-accent/5 text-left max-w-md mx-auto">
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black">$0</span>
              <span className="text-muted-foreground mb-2">/ forever</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited video uploads",
                "Trim, cut, speed, opacity",
                "Text overlays",
                "AI scene detection (browser-local)",
                "Interactive timeline",
                "Project save & load",
                "Export & download",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/editor">
              <Button variant="default" size="lg" className="w-full gap-2">
                <Film className="w-4 h-4" /> Start Editing Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 border-t border-border bg-card/20">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-semibold">FAQ</p>
          <h2 className="text-4xl font-bold mb-12">Common questions.</h2>
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div key={idx} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-card/50 transition-colors text-left"
                >
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${expandedFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-card/30 border-t border-border text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 border-t border-border text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Start editing today.</h2>
          <p className="text-muted-foreground mb-10">No account required to try. Sign in to save your projects.</p>
          <Link href="/editor">
            <Button size="lg" variant="default" className="gap-2 text-base px-10">
              <Film className="w-5 h-5" /> Open PixelCraft Editor
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs font-bold">P</div>
                <span className="font-bold text-sm">PixelCraft</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">The video editor built for creators. Free, browser-based, AI-powered.</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/editor" className="hover:text-foreground transition-colors">Editor</Link></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Account</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href={getLoginUrl()} className="hover:text-foreground transition-colors">Sign in</a></li>
                <li><Link href="/editor" className="hover:text-foreground transition-colors">My Projects</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 PixelCraft. The video editor built for creators.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Carbon Ads + Adsterra Bottom Banner */}
      <AdBanner type="carbon" position="bottom" />
      <AdBanner type="adsterra" position="bottom" />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { ChevronDown, Github, Linkedin, Twitter, Instagram, Youtube, Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * Palmier Pro Landing Page Recreation
 * 
 * Design: Minimal Tech Elegance
 * - Dark theme with white text
 * - Bold typography hierarchy
 * - Generous whitespace
 * - Green accent color for CTAs
 * - Smooth animations and interactions
 */

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqItems = [
    {
      q: "How is Palmier Pro different from CapCut and Premiere Pro?",
      a: "Palmier Pro introduces AI directly into the timeline: AI media generation and AI agents capable of helping you brainstorm ideas, generate media, and edit your video."
    },
    {
      q: "How is this different from Higgsfield, Runway, and Artlist?",
      a: "Runway, Higgsfield, and Artlist are generation platforms. Palmier Pro is a video editor where generation lives on the timeline. You generate, iterate, trim, and finish the cut in one project instead of downloading clips and rebuilding edits elsewhere."
    },
    {
      q: "What do credits cover?",
      a: "Credits pay for AI generation: video, image, audio, upscaling, and Palmier chat. The video editor without AI is free."
    },
    {
      q: "How does MCP work?",
      a: "Palmier Pro exposes an MCP server so Claude Desktop, Cursor, and Codex can read your project and make edits on the timeline. Enable it in settings and connect from your agent."
    },
    {
      q: "Can I use footage alongside AI-generated clips?",
      a: "Yes. Import your own media, mix it with generated clips on the same timeline, and export a finished cut."
    },
    {
      q: "Do you train AI models on my videos or project data?",
      a: "No. We do not use customer content to train Palmier or third-party AI models."
    },
    {
      q: "What can I export?",
      a: "MP4 (H.264, H.265, ProRes) and NLE XML for Premiere Pro and DaVinci Resolve."
    },
    {
      q: "Do you offer team or enterprise plans?",
      a: "We provide custom credits and plans. We are working on security. Book a demo for more details."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold">
              P
            </div>
            <span className="font-bold text-lg">Palmier</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm hover:text-accent transition-colors">Work</a>
            <a href="#" className="text-sm hover:text-accent transition-colors">Pricing</a>
            <a href="#" className="text-sm hover:text-accent transition-colors">Docs</a>
            <a href="#" className="text-sm hover:text-accent transition-colors">Blog</a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-sm hover:text-accent transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <Button size="sm" variant="default">Book a demo</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="flex flex-col gap-4 p-4">
              <a href="#" className="text-sm hover:text-accent transition-colors">Work</a>
              <a href="#" className="text-sm hover:text-accent transition-colors">Pricing</a>
              <a href="#" className="text-sm hover:text-accent transition-colors">Docs</a>
              <a href="#" className="text-sm hover:text-accent transition-colors">Blog</a>
              <Button size="sm" variant="default" className="w-full">Book a demo</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 inline-block">
            <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
              Limited-time launch pricing
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Palmier Pro is the video editor built for AI.
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Generate, edit, and export production-ready AI videos without leaving your timeline.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button size="lg" variant="default">
              Download for macOS
            </Button>
            <Button size="lg" variant="outline">
              Book a demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Minimum macOS 26 (Tahoe)
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="aspect-video bg-card rounded-lg border border-border flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 rounded-lg" />
            <button className="w-16 h-16 bg-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-accent-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Backed by Section */}
      <section className="py-12 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Backed by</span>
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs font-bold">
              Y
            </div>
            <span>Combinator</span>
          </div>
        </div>
      </section>

      {/* Integrated Models Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground mb-8">Integrated with leading models</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="font-semibold mb-1">Kling V3</div>
              <div className="text-sm text-muted-foreground">Kling AI</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Seedance 2.0</div>
              <div className="text-sm text-muted-foreground">ByteDance</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Veo 3.1</div>
              <div className="text-sm text-muted-foreground">Google</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Grok Imagine</div>
              <div className="text-sm text-muted-foreground">xAI</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-8">and more</p>
        </div>
      </section>

      {/* Features Section 1 */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Generate without leaving the editor
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop generating on the web, downloading, and importing into your editor. Generate AI images, videos, and audio directly in the timeline using Palmier Pro.
              </p>
              <a href="#" className="text-accent hover:text-accent/80 transition-colors flex items-center gap-2">
                Learn more <span>→</span>
              </a>
            </div>
            <div className="aspect-square bg-card rounded-lg border border-border" />
          </div>
        </div>
      </section>

      {/* Features Section 2 */}
      <section className="py-16 md:py-24 border-b border-border bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-card rounded-lg border border-border order-2 md:order-1" />
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                A professional video editor
              </h2>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Multi-track video, audio, image, and text</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Trim, split, speed, opacity, and transform</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Your footage and AI clips on the same timeline</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Export to Premiere and DaVinci when you need to</span>
                </li>
              </ul>
              <a href="#" className="text-accent hover:text-accent/80 transition-colors flex items-center gap-2">
                Learn more <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MCP Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Connect your agents
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Via MCP, have your existing agents generate media and work directly in your project's timeline.
          </p>
          <a href="#" className="text-accent hover:text-accent/80 transition-colors flex items-center gap-2">
            Learn how it works <span>→</span>
          </a>
        </div>
      </section>

      {/* Careers Section */}
      <section className="py-16 md:py-24 border-b border-border bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Palmier is building the future of video editing.
          </h2>
          <a href="#" className="text-accent hover:text-accent/80 transition-colors flex items-center gap-2">
            Join us <span>→</span>
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Common questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-card/50 transition-colors text-left"
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-card/30 border-t border-border text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Try Palmier Pro now.</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default">
              Download for macOS
            </Button>
            <Button size="lg" variant="outline">
              Book a demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Minimum macOS 26 (Tahoe)
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/30 border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Open source</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Work</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2026 Palmier, Inc. The video editor built for AI
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

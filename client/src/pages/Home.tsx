import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronDown, Github, Twitter, Instagram, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

/**
 * PixelCraft Landing Page
 * 
 * Design: Minimal Tech Elegance
 * - Dark theme with white text
 * - Bold typography hierarchy
 * - Generous whitespace
 * - Green accent color for CTAs
 * - Smooth animations and interactions
 */

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqItems = [
    {
      q: "What video formats does PixelCraft support?",
      a: "PixelCraft supports MP4, WebM, and MOV formats. You can upload and edit any of these formats seamlessly."
    },
    {
      q: "How does the AI scene detection work?",
      a: "Our AI analyzes your video to automatically detect scene changes and suggest natural cut points, making it easier to create short-form clips."
    },
    {
      q: "Can I add text and captions to my videos?",
      a: "Yes! PixelCraft includes a full text overlay system with customizable styling, plus automatic caption generation via AI."
    },
    {
      q: "What export options are available?",
      a: "You can export your full edited video or create short-form clips optimized for TikTok and Instagram Reels dimensions."
    },
    {
      q: "Do you offer auto-captioning?",
      a: "Yes, PixelCraft uses AI to automatically transcribe your audio and generate captions that sync with your video."
    },
    {
      q: "Can I save my projects?",
      a: "Absolutely. All your projects are saved to your account and can be accessed anytime. You can also manage multiple projects."
    },
    {
      q: "Is there a free trial?",
      a: "Yes, create an account to get started with PixelCraft for free. Premium features are available with a subscription."
    },
    {
      q: "What editing features are included?",
      a: "PixelCraft includes trim, cut, split, speed adjustment, opacity control, text overlays, and more."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold">
                P
              </div>
              <span className="font-bold text-lg">PixelCraft</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-accent transition-colors">Features</a>
            <a href="#faq" className="text-sm hover:text-accent transition-colors">FAQ</a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/editor">
                <Button size="sm" variant="default">Go to Editor</Button>
              </Link>
            ) : (
              <Button size="sm" variant="default">Get Started</Button>
            )}
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
              <a href="#features" className="text-sm hover:text-accent transition-colors">Features</a>
              <a href="#faq" className="text-sm hover:text-accent transition-colors">FAQ</a>
              {isAuthenticated ? (
                <Link href="/editor">
                  <Button size="sm" variant="default" className="w-full">Go to Editor</Button>
                </Link>
              ) : (
                <Button size="sm" variant="default" className="w-full">Get Started</Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 inline-block">
            <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
              Professional video editing, simplified
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Create stunning videos with AI-powered editing.
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Edit videos faster with automatic scene detection, AI captions, and powerful tools. No experience required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            {isAuthenticated ? (
              <Link href="/editor">
                <Button size="lg" variant="default">
                  Open Editor
                </Button>
              </Link>
            ) : (
              <Button size="lg" variant="default">
                Start Editing Free
              </Button>
            )}
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
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

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Powerful editing tools</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-4">AI-Powered Scene Detection</h3>
              <p className="text-lg text-muted-foreground mb-4">
                Automatically detect scene changes and get suggestions for natural cut points. Perfect for creating short-form content.
              </p>
              <a href="#" className="text-accent hover:text-accent/80 transition-colors flex items-center gap-2">
                Learn more <span>→</span>
              </a>
            </div>
            <div className="aspect-square bg-card rounded-lg border border-border" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-card rounded-lg border border-border order-2 md:order-1" />
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold mb-4">Complete Editing Suite</h3>
              <ul className="space-y-3 text-lg text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Trim, cut, and split clips</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Speed adjustment and opacity control</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Add text overlays with custom styling</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Auto-generated captions and transcription</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Frequently asked questions</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to create?</h2>
          {isAuthenticated ? (
            <Link href="/editor">
              <Button size="lg" variant="default">
                Open Editor
              </Button>
            </Link>
          ) : (
            <Button size="lg" variant="default">
              Start Free
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/30 border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
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
              © 2026 PixelCraft. Professional video editing for everyone.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

# Palmier Pro Landing Page - Design Specification

## Design Philosophy: Minimal Tech Elegance

**Theme Name:** Minimal Tech Elegance  
**Aesthetic:** Premium SaaS landing page with dark theme, bold typography, and clean whitespace. Emphasizes product focus with minimal decoration and maximum clarity.

## Core Design Principles

1. **Dark Sophistication** - Deep dark background (#0a0a0a or similar) with white/light text creates premium, tech-forward aesthetic
2. **Typography-Driven** - Large, bold headlines paired with readable body text; hierarchy through size and weight, not color
3. **Generous Whitespace** - Ample padding and spacing between sections; breathing room for content
4. **Semantic Clarity** - Every section has a clear purpose; no decorative elements without function
5. **Subtle Motion** - Minimal animations; focus on content over flashiness

## Color Philosophy

- **Primary Background:** Dark charcoal/near-black (`oklch(0.141 0.005 285.823)`)
- **Text:** White/off-white (`oklch(0.85 0.005 65)`)
- **Accents:** Green/lime for CTAs and highlights (brand color)
- **Surfaces:** Slightly lighter dark for cards/sections (`oklch(0.21 0.006 285.885)`)
- **Borders:** Subtle light borders for structure (`oklch(1 0 0 / 10%)`)

## Layout Paradigm

- **Hero-First:** Bold hero section dominates viewport
- **Vertical Flow:** Single-column layout with full-width sections
- **Section Rhythm:** Alternating background colors (dark → slightly lighter → dark)
- **Content Centering:** Max-width container (1280px) centered with responsive padding

## Signature Elements

1. **Large Bold Headlines** - 48-64px headlines in bold weight
2. **Feature Cards** - Minimal cards with icon, title, description
3. **Video Embeds** - Full-width video sections with play button overlay
4. **Model Showcase** - Grid of AI model logos/names
5. **Accordion FAQ** - Expandable questions with smooth animations

## Interaction Philosophy

- **Hover States:** Subtle opacity/scale changes on interactive elements
- **Smooth Transitions:** 200-300ms ease-out for all interactions
- **Focus States:** Clear focus rings for keyboard navigation
- **No Bloat:** Interactions serve purpose, not decoration

## Animation Guidelines

- **Button Hover:** Scale 1.02 + opacity 0.9 on hover
- **Link Underline:** Smooth underline reveal on hover
- **Accordion:** Smooth height expansion/collapse (300ms)
- **Scroll Reveals:** Fade-in on scroll (optional, subtle)
- **Video Play:** Smooth fade-in of play button on hover

## Typography System

- **Display Font:** System font (SF Pro Display, -apple-system) for headlines
- **Body Font:** System font for body text
- **Sizes:**
  - H1: 48-64px (hero)
  - H2: 32-40px (section headers)
  - H3: 24-28px (subsections)
  - Body: 16px (default)
  - Small: 14px (meta, labels)

## Brand Essence

**One-liner:** "The AI-native video editor for creators and developers"  
**Personality:** Professional, innovative, approachable, technical

**Personality Adjectives:**
1. Cutting-edge (AI-first, modern)
2. Focused (no bloat, purposeful)
3. Accessible (for creators and developers)

## Brand Voice

**Headlines:** Direct, benefit-focused, no hype
- ✅ "Palmier Pro is the video editor built for AI"
- ❌ "Welcome to the future of video editing"

**CTAs:** Action-oriented, clear value
- ✅ "Download for macOS"
- ✅ "Book a demo"
- ❌ "Get started today"

**Microcopy:** Technical but friendly
- ✅ "Generate AI images, videos, and audio directly in the timeline"
- ❌ "Amazing AI-powered features"

## Wordmark & Logo

**Concept:** Bold, geometric mark (not text-based)
- Simple icon: stylized "P" or film reel symbol
- Solid black/white, works at any size
- Used in header and favicon

## Signature Brand Color

**Primary Green:** `oklch(0.7 0.2 142)` (vibrant lime/green)
- Used for CTA buttons, accents, highlights
- Creates visual pop against dark background
- Unmistakably Palmier

## Style Decisions

- **Button Style:** Solid green for primary, transparent with border for secondary
- **Card Style:** Minimal borders, subtle shadows
- **Spacing:** 16px base unit (4, 8, 12, 16, 24, 32, 48, 64px)
- **Border Radius:** 8-12px for cards, 4-6px for buttons
- **Shadows:** Subtle (0 4px 12px rgba(0,0,0,0.3))

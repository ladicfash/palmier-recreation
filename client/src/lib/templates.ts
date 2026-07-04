/**
 * Pre-Built Studio Template System
 *
 * Provides ready-to-use professional video production presets (TikTok Viral Hook,
 * Cinematic Trailer, Podcast Highlight, Retro VHS, Breaking News, Tech Launch)
 * that instantly configure timeline layers, color grading, effects, and aspect ratios.
 */

import { Layer, createLayer } from "./layers";
import { ColorGrade, DEFAULT_GRADE } from "@/components/ColorGradingPanel";
import { EffectSettings, DEFAULT_EFFECTS } from "@/lib/videoEffects";

export interface StudioTemplate {
  id: string;
  name: string;
  description: string;
  category: "Social Viral" | "Cinematic" | "Broadcast" | "Podcast" | "Retro";
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3";
  colorGrade: ColorGrade;
  videoEffects: EffectSettings;
  getLayers: () => Layer[];
  getTextOverlays: () => { id: string; text: string; x: number; y: number; fontSize: number; color: string }[];
}

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    id: "tiktok-viral",
    name: "TikTok / Shorts Viral Hook",
    description: "High-retention 9:16 setup with bold captions, viral fire badges, and animated subscribe calls to action.",
    category: "Social Viral",
    aspectRatio: "9:16",
    colorGrade: {
      ...DEFAULT_GRADE,
      preset: "warm",
      saturation: 120,
      contrast: 110,
    },
    videoEffects: {
      ...DEFAULT_EFFECTS,
      saturation: 115,
      contrast: 105,
    },
    getLayers: () => [
      createLayer("sticker", {
        name: "Viral Fire Badge",
        stickerType: "fire",
        startTime: 0,
        endTime: 15,
        transform: { x: 50, y: 15, scale: 110, rotation: -2, opacity: 1 },
        animationIn: "pop",
        animationContinuous: "pulse",
      }),
      createLayer("sticker", {
        name: "Subscribe CTA",
        stickerType: "subscribe",
        startTime: 2,
        endTime: 15,
        transform: { x: 50, y: 85, scale: 100, rotation: 0, opacity: 1 },
        animationIn: "zoom",
        animationContinuous: "float",
      }),
    ],
    getTextOverlays: () => [
      {
        id: `text-${Date.now()}-1`,
        text: "WAIT FOR THE END 😱🔥",
        x: 50,
        y: 28,
        fontSize: 36,
        color: "#facc15",
      },
    ],
  },
  {
    id: "cinematic-trailer",
    name: "Cinematic Documentary Trailer",
    description: "Moody teal & orange grading, 16:9 widescreen letterboxing, and Ken Burns slow zoom.",
    category: "Cinematic",
    aspectRatio: "16:9",
    colorGrade: {
      ...DEFAULT_GRADE,
      preset: "cinematic",
      contrast: 125,
      brightness: 95,
      liftB: 10,
      gainR: 10,
    },
    videoEffects: {
      ...DEFAULT_EFFECTS,
      contrast: 115,
      brightness: 95,
    },
    getLayers: () => [
      createLayer("shape", {
        name: "Widescreen Frame",
        shapeType: "frame",
        color: "#000000",
        startTime: 0,
        endTime: 30,
        transform: { x: 50, y: 50, scale: 120, rotation: 0, opacity: 0.8 },
        animationContinuous: "ken-burns-in",
      }),
      createLayer("shape", {
        name: "Director Banner",
        shapeType: "lower-third",
        text: "DIRECTED BY STUDIO AI // OFFICIAL TRAILER",
        color: "#38bdf8",
        startTime: 1,
        endTime: 10,
        transform: { x: 25, y: 85, scale: 95, rotation: 0, opacity: 0.95 },
        animationIn: "slide-left",
      }),
    ],
    getTextOverlays: () => [
      {
        id: `text-${Date.now()}-2`,
        text: "IN A WORLD OF LIMITLESS CREATIVITY",
        x: 50,
        y: 50,
        fontSize: 42,
        color: "#ffffff",
      },
    ],
  },
  {
    id: "podcast-highlight",
    name: "Podcast / Vodcast Highlight",
    description: "Clean 1:1 format for LinkedIn and Instagram with guest lower-third tags and live recording indicator.",
    category: "Podcast",
    aspectRatio: "1:1",
    colorGrade: {
      ...DEFAULT_GRADE,
      preset: "warm",
      contrast: 105,
    },
    videoEffects: {
      ...DEFAULT_EFFECTS,
    },
    getLayers: () => [
      createLayer("sticker", {
        name: "Live REC Indicator",
        stickerType: "live",
        startTime: 0,
        endTime: 30,
        transform: { x: 15, y: 10, scale: 90, rotation: 0, opacity: 1 },
        animationIn: "fade",
      }),
      createLayer("shape", {
        name: "Guest Lower Third - ALEX HORMOZI",
        shapeType: "lower-third",
        text: "Scaling to $100M with AI Tools",
        color: "#10b981",
        startTime: 0,
        endTime: 20,
        transform: { x: 30, y: 85, scale: 100, rotation: 0, opacity: 1 },
        animationIn: "slide-left",
      }),
    ],
    getTextOverlays: () => [],
  },
  {
    id: "retro-vhs",
    name: "Retro 90s VHS Camcorder",
    description: "Nostalgic 4:3 camcorder aesthetic with system override glitches, sepia tone, and vintage contrast.",
    category: "Retro",
    aspectRatio: "4:3",
    colorGrade: {
      ...DEFAULT_GRADE,
      preset: "vintage",
      saturation: 85,
      contrast: 110,
    },
    videoEffects: {
      ...DEFAULT_EFFECTS,
      sepia: 40,
      contrast: 110,
    },
    getLayers: () => [
      createLayer("sticker", {
        name: "System Glitch Overlay",
        stickerType: "glitch",
        startTime: 0,
        endTime: 30,
        transform: { x: 80, y: 12, scale: 95, rotation: 0, opacity: 0.9 },
        animationContinuous: "shake",
      }),
      createLayer("sticker", {
        name: "Camcorder Live",
        stickerType: "live",
        startTime: 0,
        endTime: 30,
        transform: { x: 15, y: 12, scale: 100, rotation: 0, opacity: 1 },
      }),
    ],
    getTextOverlays: () => [
      {
        id: `text-${Date.now()}-3`,
        text: "PLAY  ▶  SEP 1998",
        x: 20,
        y: 90,
        fontSize: 28,
        color: "#22c55e",
      },
    ],
  },
  {
    id: "breaking-news",
    name: "Breaking News Broadcast",
    description: "High-urgency broadcast layout with red alert banner, animated arrows, and sharp studio contrast.",
    category: "Broadcast",
    aspectRatio: "16:9",
    colorGrade: {
      ...DEFAULT_GRADE,
      contrast: 115,
      saturation: 110,
    },
    videoEffects: {
      ...DEFAULT_EFFECTS,
      contrast: 110,
    },
    getLayers: () => [
      createLayer("sticker", {
        name: "Breaking News Header",
        stickerType: "breaking",
        startTime: 0,
        endTime: 30,
        transform: { x: 50, y: 12, scale: 115, rotation: 0, opacity: 1 },
        animationIn: "fade",
        animationContinuous: "pulse",
      }),
      createLayer("sticker", {
        name: "Look Here Arrow",
        stickerType: "arrow",
        startTime: 1,
        endTime: 15,
        transform: { x: 85, y: 50, scale: 100, rotation: -15, opacity: 1 },
        animationContinuous: "float",
      }),
    ],
    getTextOverlays: () => [
      {
        id: `text-${Date.now()}-4`,
        text: "AI VIDEO EDITING REACHES 10X SOPHISTICATION",
        x: 50,
        y: 88,
        fontSize: 32,
        color: "#ffffff",
      },
    ],
  },
  {
    id: "tech-launch",
    name: "Tech Product Launch Demo",
    description: "Sleek dark-mode aesthetic with neon glow pulses, floating status pills, and cool modern grading.",
    category: "Social Viral",
    aspectRatio: "16:9",
    colorGrade: {
      ...DEFAULT_GRADE,
      preset: "cool",
      contrast: 110,
    },
    videoEffects: {
      ...DEFAULT_EFFECTS,
      contrast: 105,
    },
    getLayers: () => [
      createLayer("shape", {
        name: "Featured Badge",
        shapeType: "badge",
        text: "VERSION 2.0 // POWERED BY MANUS AI",
        color: "#6366f1",
        startTime: 0,
        endTime: 25,
        transform: { x: 50, y: 15, scale: 110, rotation: 0, opacity: 1 },
        animationIn: "pop",
        animationContinuous: "neon-pulse",
      }),
    ],
    getTextOverlays: () => [
      {
        id: `text-${Date.now()}-5`,
        text: "THE NEXT GENERATION OF CREATION",
        x: 50,
        y: 50,
        fontSize: 48,
        color: "#38bdf8",
      },
    ],
  },
];

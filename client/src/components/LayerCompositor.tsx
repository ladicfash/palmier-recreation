/**
 * LayerCompositor — renders all visual layers over the base video preview.
 * Supports Video, Audio, Text, Image, Shape, and Sticker layers with entrance/exit transitions.
 */

import { useEffect, useRef } from "react";
import { Layer, layerEffectsToCSSFilter, isLayerActiveAt } from "@/lib/layers";

interface LayerCompositorProps {
  layers: Layer[];
  currentTime: number;
  isPlaying: boolean;
  selectedLayerId: string | null;
  onSelectLayer?: (id: string) => void;
}

function VideoLayerEl({ layer, currentTime, isPlaying }: { layer: Layer; currentTime: number; isPlaying: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = isLayerActiveAt(layer, currentTime);
    if (active && isPlaying) {
      if (el.paused) el.play().catch(() => {});
    } else {
      if (!el.paused) el.pause();
    }
  }, [isPlaying, currentTime, layer]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const localTime = currentTime - layer.startTime;
    if (localTime >= 0 && Math.abs(el.currentTime - localTime) > 0.35) {
      el.currentTime = localTime;
    }
  }, [currentTime, layer.startTime]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = layer.muted ? 0 : layer.volume;
  }, [layer.muted, layer.volume]);

  if (!layer.src) return null;
  return <video ref={ref} src={layer.src} className="w-full h-full object-contain rounded-lg shadow-xl" playsInline />;
}

function AudioLayerEl({ layer, currentTime, isPlaying }: { layer: Layer; currentTime: number; isPlaying: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = isLayerActiveAt(layer, currentTime);
    if (active && isPlaying && !layer.muted) {
      if (el.paused) el.play().catch(() => {});
    } else {
      if (!el.paused) el.pause();
    }
  }, [isPlaying, currentTime, layer]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const localTime = currentTime - layer.startTime;
    if (localTime >= 0 && Math.abs(el.currentTime - localTime) > 0.35) {
      el.currentTime = localTime;
    }
  }, [currentTime, layer.startTime]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = layer.muted ? 0 : layer.volume;
  }, [layer.muted, layer.volume]);

  if (!layer.src) return null;
  return <audio ref={ref} src={layer.src} />;
}

function renderStickerContent(type: string = "subscribe") {
  switch (type) {
    case "subscribe":
      return (
        <div className="flex items-center gap-3 bg-red-600 text-white font-extrabold px-6 py-3 rounded-full shadow-2xl border-2 border-white/20 animate-pulse uppercase tracking-wider text-lg">
          <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-red-600 text-xs">▶</span>
          Subscribe Now
        </div>
      );
    case "live":
      return (
        <div className="flex items-center gap-2 bg-black/80 text-white font-bold px-4 py-1.5 rounded-md border border-red-500/50 shadow-lg text-sm">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          <span className="text-red-500 uppercase font-extrabold">LIVE</span>
          <span className="text-white/80 font-mono text-xs ml-1">REC</span>
        </div>
      );
    case "fire":
      return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black px-5 py-2.5 rounded-2xl shadow-xl text-xl rotate-[-2deg]">
          🔥 VIRAL MOMENT 🔥
        </div>
      );
    case "breaking":
      return (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white font-black px-6 py-2 rounded shadow-2xl border-y-2 border-yellow-400 text-base uppercase tracking-widest flex items-center gap-2">
          ⚡ BREAKING NEWS ⚡
        </div>
      );
    case "like":
      return (
        <div className="flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2 rounded-full shadow-xl text-md">
          👍 Like & Share
        </div>
      );
    case "glitch":
      return (
        <div className="bg-black/90 text-cyan-400 border border-pink-500 font-mono px-4 py-2 rounded text-sm shadow-2xl tracking-widest uppercase">
          [ SYSTEM OVERRIDE ]
        </div>
      );
    case "arrow":
      return (
        <div className="text-yellow-400 font-black text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-bounce">
          Look Here! ➔
        </div>
      );
    default:
      return <div className="bg-accent text-accent-foreground px-4 py-2 rounded font-bold shadow-lg">⭐ {type}</div>;
  }
}

function renderShapeContent(layer: Layer) {
  const shape = layer.shapeType ?? "rectangle";
  const color = layer.color ?? "#10b981";
  switch (shape) {
    case "circle":
      return <div className="w-32 h-32 rounded-full shadow-2xl border-4 border-white/20" style={{ backgroundColor: color }} />;
    case "lower-third":
      return (
        <div className="flex flex-col bg-black/85 backdrop-blur-md border-l-4 rounded-r-xl px-5 py-3 shadow-2xl min-w-[240px]" style={{ borderColor: color }}>
          <span className="text-sm font-extrabold text-white tracking-wide uppercase">{layer.name || "Presenter Name"}</span>
          <span className="text-xs font-medium" style={{ color }}>{layer.text || "Title / Role / Handle"}</span>
        </div>
      );
    case "badge":
      return (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider text-white shadow-xl border border-white/30" style={{ backgroundColor: color }}>
          ★ {layer.text || "Featured Badge"}
        </div>
      );
    case "frame":
      return <div className="w-64 h-40 border-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-transparent" style={{ borderColor: color }} />;
    case "rectangle":
    default:
      return <div className="w-48 h-24 rounded-lg shadow-xl border border-white/10" style={{ backgroundColor: color }} />;
  }
}

export default function LayerCompositor({
  layers, currentTime, isPlaying, selectedLayerId, onSelectLayer,
}: LayerCompositorProps) {
  return (
    <>
      {layers.map(layer => {
        const active = isLayerActiveAt(layer, currentTime);
        if (layer.type === "audio") {
          return <AudioLayerEl key={layer.id} layer={layer} currentTime={currentTime} isPlaying={isPlaying} />;
        }
        if (!active) return null;

        const t = layer.transform;
        
        // Calculate entrance/exit transitions
        const elapsed = currentTime - layer.startTime;
        const remaining = layer.endTime - currentTime;
        let transitionScale = 1;
        let transitionOpacity = 1;
        let translateX = 0;
        let translateY = 0;

        // Entrance animation duration: 0.4s
        if (elapsed >= 0 && elapsed < 0.4) {
          const progress = elapsed / 0.4;
          if (layer.animationIn === "fade") transitionOpacity = progress;
          else if (layer.animationIn === "pop") transitionScale = 0.3 + progress * 0.7;
          else if (layer.animationIn === "zoom") transitionScale = progress;
          else if (layer.animationIn === "slide-left") translateX = -50 * (1 - progress);
          else if (layer.animationIn === "slide-right") translateX = 50 * (1 - progress);
        }

        // Exit animation duration: 0.4s
        if (remaining >= 0 && remaining < 0.4) {
          const progress = remaining / 0.4;
          if (layer.animationOut === "fade") transitionOpacity = progress;
          else if (layer.animationOut === "shrink") transitionScale = progress;
          else if (layer.animationOut === "slide-down") translateY = 50 * (1 - progress);
        }

        const finalScale = (t.scale / 100) * transitionScale;
        const finalOpacity = t.opacity * transitionOpacity;

        const style: React.CSSProperties = {
          position: "absolute",
          left: `${t.x}%`,
          top: `${t.y}%`,
          transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${finalScale}) rotate(${t.rotation}deg)`,
          opacity: finalOpacity,
          mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
          filter: layerEffectsToCSSFilter(layer.effects),
          pointerEvents: onSelectLayer ? "auto" : "none",
          cursor: onSelectLayer ? "pointer" : undefined,
          maxWidth: "90%",
          maxHeight: "90%",
          outline: selectedLayerId === layer.id ? "2px solid var(--accent, #10b981)" : undefined,
          outlineOffset: 4,
          transition: isPlaying ? "none" : "transform 0.15s ease-out, opacity 0.15s ease-out",
          zIndex: selectedLayerId === layer.id ? 30 : 10,
        };

        if (layer.type === "text") {
          return (
            <div
              key={layer.id}
              style={style}
              onClick={e => { e.stopPropagation(); onSelectLayer?.(layer.id); }}
              className="whitespace-pre-wrap text-center select-none"
            >
              <span style={{
                fontSize: `${layer.fontSize ?? 48}px`,
                color: layer.color ?? "#ffffff",
                fontFamily: layer.fontFamily ?? "sans-serif",
                textShadow: "0 4px 12px rgba(0,0,0,0.8)",
                fontWeight: 800,
                lineHeight: 1.15,
              }}>
                {layer.text || "Text Layer"}
              </span>
            </div>
          );
        }

        if (layer.type === "sticker") {
          return (
            <div
              key={layer.id}
              style={style}
              onClick={e => { e.stopPropagation(); onSelectLayer?.(layer.id); }}
              className="select-none"
            >
              {renderStickerContent(layer.stickerType)}
            </div>
          );
        }

        if (layer.type === "shape") {
          return (
            <div
              key={layer.id}
              style={style}
              onClick={e => { e.stopPropagation(); onSelectLayer?.(layer.id); }}
              className="select-none"
            >
              {renderShapeContent(layer)}
            </div>
          );
        }

        if (layer.type === "image") {
          if (!layer.src) return null;
          return (
            <div key={layer.id} style={{ ...style, width: "45%" }} onClick={e => { e.stopPropagation(); onSelectLayer?.(layer.id); }}>
              <img src={layer.src} alt={layer.name} className="w-full h-auto rounded-lg shadow-2xl border border-white/10" draggable={false} />
            </div>
          );
        }

        if (layer.type === "video") {
          if (!layer.src) return null;
          return (
            <div key={layer.id} style={{ ...style, width: "45%", aspectRatio: "16/9" }} onClick={e => { e.stopPropagation(); onSelectLayer?.(layer.id); }}>
              <VideoLayerEl layer={layer} currentTime={currentTime} isPlaying={isPlaying} />
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

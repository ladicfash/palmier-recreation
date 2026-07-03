/**
 * LayerCompositor — renders all visual layers over the base video preview.
 *
 * Layers render in array order (index 0 = back, last = front) as absolutely
 * positioned elements inside the video container. Video layers keep their
 * currentTime synced with the composition time. Audio layers are rendered as
 * hidden <audio> elements synced to composition playback.
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

  // Sync playback state
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

  // Sync time: layer-local time = composition time - layer start
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
  return <video ref={ref} src={layer.src} className="w-full h-full object-contain" playsInline />;
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

export default function LayerCompositor({
  layers, currentTime, isPlaying, selectedLayerId, onSelectLayer,
}: LayerCompositorProps) {
  return (
    <>
      {layers.map(layer => {
        const active = isLayerActiveAt(layer, currentTime);
        // Audio layers: render always (hidden) so playback can start promptly
        if (layer.type === "audio") {
          return <AudioLayerEl key={layer.id} layer={layer} currentTime={currentTime} isPlaying={isPlaying} />;
        }
        if (!active) return null;

        const t = layer.transform;
        const style: React.CSSProperties = {
          position: "absolute",
          left: `${t.x}%`,
          top: `${t.y}%`,
          transform: `translate(-50%, -50%) scale(${t.scale / 100}) rotate(${t.rotation}deg)`,
          opacity: t.opacity,
          mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
          filter: layerEffectsToCSSFilter(layer.effects),
          pointerEvents: onSelectLayer ? "auto" : "none",
          cursor: onSelectLayer ? "pointer" : undefined,
          maxWidth: "100%",
          maxHeight: "100%",
          outline: selectedLayerId === layer.id ? "1.5px dashed var(--accent, #22c55e)" : undefined,
          outlineOffset: 2,
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
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                fontWeight: 700,
                lineHeight: 1.2,
              }}>
                {layer.text || "Text Layer"}
              </span>
            </div>
          );
        }

        if (layer.type === "image") {
          if (!layer.src) return null;
          return (
            <div key={layer.id} style={{ ...style, width: "50%" }} onClick={e => { e.stopPropagation(); onSelectLayer?.(layer.id); }}>
              <img src={layer.src} alt={layer.name} className="w-full h-auto" draggable={false} />
            </div>
          );
        }

        if (layer.type === "video") {
          if (!layer.src) return null;
          return (
            <div key={layer.id} style={{ ...style, width: "50%", aspectRatio: "16/9" }} onClick={e => { e.stopPropagation(); onSelectLayer?.(layer.id); }}>
              <VideoLayerEl layer={layer} currentTime={currentTime} isPlaying={isPlaying} />
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

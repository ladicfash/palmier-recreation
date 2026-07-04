/**
 * LayerPanel — Studio After Effects-style multi-layer inspector & manager
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Layers, Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown,
  Video, Music, Type as TypeIcon, Image as ImageIcon, Plus, VolumeX, Volume2,
  Sparkles, Shapes, Smile, PlayCircle, StopCircle
} from "lucide-react";
import { Layer, LayerType, BlendMode, BLEND_MODES, ShapeType, StickerType } from "@/lib/layers";

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onAddLayer: (type: LayerType) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: "up" | "down") => void;
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void;
}

const LAYER_ICONS: Record<LayerType, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5 text-blue-400" />,
  audio: <Music className="w-3.5 h-3.5 text-green-400" />,
  text: <TypeIcon className="w-3.5 h-3.5 text-purple-400" />,
  image: <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />,
  shape: <Shapes className="w-3.5 h-3.5 text-emerald-400" />,
  sticker: <Smile className="w-3.5 h-3.5 text-orange-400" />,
};

const SHAPE_OPTIONS: { id: ShapeType; label: string }[] = [
  { id: "lower-third", label: "Lower Third Banner" },
  { id: "badge", label: "Status Pill / Badge" },
  { id: "rectangle", label: "Solid Rectangle" },
  { id: "circle", label: "Solid Circle" },
  { id: "frame", label: "Border Frame" },
];

const STICKER_OPTIONS: { id: StickerType; label: string }[] = [
  { id: "subscribe", label: "▶ Subscribe Now" },
  { id: "live", label: "🔴 LIVE REC" },
  { id: "breaking", label: "⚡ BREAKING NEWS" },
  { id: "fire", label: "🔥 Viral Moment" },
  { id: "like", label: "👍 Like & Share" },
  { id: "glitch", label: "💻 System Override" },
  { id: "arrow", label: "➔ Animated Arrow" },
];

function SliderRow({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1 accent-accent cursor-pointer"
      />
      <span className="text-[10px] font-mono text-muted-foreground w-12 text-right flex-shrink-0">
        {value}{unit}
      </span>
    </div>
  );
}

export default function LayerPanel({
  layers, selectedLayerId, onSelectLayer, onAddLayer, onDeleteLayer, onMoveLayer, onUpdateLayer,
}: LayerPanelProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const selected = layers.find(l => l.id === selectedLayerId) ?? null;

  // Layers render bottom-first; display top-first (like AE)
  const displayLayers = [...layers].reverse();

  return (
    <div className="space-y-3.5 text-xs">
      {/* Header + Add */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-accent" /> Layer Compositor ({layers.length})
        </label>
        <div className="relative">
          <Button size="sm" variant="default" className="h-7 px-3 text-xs gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" onClick={() => setShowAddMenu(v => !v)}>
            <Plus className="w-3.5 h-3.5" /> Add Layer
          </Button>
          {showAddMenu && (
            <div className="absolute right-0 top-8 z-30 bg-card text-card-foreground border border-border rounded-lg shadow-2xl py-1.5 w-44">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase">Create Elements</div>
              {(["shape", "sticker", "text"] as LayerType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { onAddLayer(t); setShowAddMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-accent/15 capitalize transition-colors"
                >
                  {LAYER_ICONS[t]} {t === "shape" ? "Shape / Lower Third" : t === "sticker" ? "Sticker / Badge" : "Text Title"}
                </button>
              ))}
              <div className="border-t border-border my-1" />
              <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase">Upload Media</div>
              {(["video", "audio", "image"] as LayerType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { onAddLayer(t); setShowAddMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-accent/15 capitalize transition-colors"
                >
                  {LAYER_ICONS[t]} {t} Media
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layer list */}
      {layers.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-border bg-card/40 text-center space-y-2">
          <Sparkles className="w-6 h-6 text-accent mx-auto opacity-75" />
          <p className="text-xs font-medium text-foreground">No custom layers added</p>
          <p className="text-[11px] text-muted-foreground">Add text titles, lower thirds, callout stickers, or B-roll media on top of your main video.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
          {displayLayers.map(layer => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(isSelected ? null : layer.id)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-all border ${
                  isSelected ? "bg-accent/15 border-accent shadow-sm" : "bg-card border-border hover:bg-accent/5"
                }`}
              >
                <button
                  onClick={e => { e.stopPropagation(); onUpdateLayer(layer.id, { visible: !layer.visible }); }}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  title={layer.visible ? "Hide" : "Show"}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5 text-accent" /> : <EyeOff className="w-3.5 h-3.5 opacity-40" />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onUpdateLayer(layer.id, { locked: !layer.locked }); }}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  title={layer.locked ? "Unlock" : "Lock"}
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5 text-yellow-500" /> : <Unlock className="w-3.5 h-3.5 opacity-30" />}
                </button>
                <span className="flex-shrink-0">{LAYER_ICONS[layer.type]}</span>
                <span className={`flex-1 truncate font-medium ${layer.visible ? "" : "opacity-40 line-through"}`}>{layer.name}</span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); onMoveLayer(layer.id, "up"); }}
                    className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-accent/20" title="Bring forward"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onMoveLayer(layer.id, "down"); }}
                    className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-accent/20" title="Send backward"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                    className="text-muted-foreground hover:text-destructive p-0.5 rounded hover:bg-destructive/20 ml-1" title="Delete layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected layer inspector */}
      {selected && !selected.locked && (
        <div className="border-t border-border pt-3.5 space-y-3.5 bg-card/60 p-3 rounded-xl border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              {LAYER_ICONS[selected.type]} Inspector: {selected.type}
            </span>
          </div>

          {/* Name */}
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1">Layer Label</span>
            <input
              value={selected.name}
              onChange={e => onUpdateLayer(selected.id, { name: e.target.value })}
              className="w-full h-7 px-2 rounded bg-background border border-border text-xs focus:ring-1 focus:ring-accent"
              placeholder="Layer name"
            />
          </div>

          {/* Shape Selection */}
          {selected.type === "shape" && (
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground block">Shape Template</span>
              <select
                value={selected.shapeType ?? "lower-third"}
                onChange={e => onUpdateLayer(selected.id, { shapeType: e.target.value as ShapeType })}
                className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
              >
                {SHAPE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
              {(selected.shapeType === "lower-third" || selected.shapeType === "badge") && (
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-1">Subtitle / Text</span>
                  <input
                    value={selected.text ?? ""}
                    onChange={e => onUpdateLayer(selected.id, { text: e.target.value })}
                    className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
                    placeholder="Enter subtitle text..."
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Accent Color</span>
                <input
                  type="color"
                  value={selected.color ?? "#10b981"}
                  onChange={e => onUpdateLayer(selected.id, { color: e.target.value })}
                  className="w-8 h-7 rounded border border-border cursor-pointer bg-transparent"
                />
              </div>
            </div>
          )}

          {/* Sticker Selection */}
          {selected.type === "sticker" && (
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground block">Callout Asset</span>
              <select
                value={selected.stickerType ?? "subscribe"}
                onChange={e => onUpdateLayer(selected.id, { stickerType: e.target.value as StickerType })}
                className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
              >
                {STICKER_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>
          )}

          {/* Text content (text layers) */}
          {selected.type === "text" && (
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground block">Title Content</span>
              <textarea
                value={selected.text ?? ""}
                onChange={e => onUpdateLayer(selected.id, { text: e.target.value })}
                className="w-full h-14 px-2 py-1.5 rounded bg-background border border-border text-xs resize-none"
                placeholder="Enter text..."
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selected.color ?? "#ffffff"}
                  onChange={e => onUpdateLayer(selected.id, { color: e.target.value })}
                  className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                />
                <SliderRow label="Size" value={selected.fontSize ?? 48} min={12} max={160} unit="px"
                  onChange={v => onUpdateLayer(selected.id, { fontSize: v })} />
              </div>
            </div>
          )}

          {/* Transitions */}
          <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 flex items-center gap-1"><PlayCircle className="w-3 h-3 text-green-400" /> Enter Anim</span>
              <select
                value={selected.animationIn ?? "pop"}
                onChange={e => onUpdateLayer(selected.id, { animationIn: e.target.value as any })}
                className="w-full h-7 px-1.5 rounded bg-background border border-border text-[11px]"
              >
                <option value="pop">Pop Scale</option>
                <option value="fade">Fade In</option>
                <option value="zoom">Zoom Bounce</option>
                <option value="slide-left">Slide from Left</option>
                <option value="slide-right">Slide from Right</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 flex items-center gap-1"><StopCircle className="w-3 h-3 text-red-400" /> Exit Anim</span>
              <select
                value={selected.animationOut ?? "fade"}
                onChange={e => onUpdateLayer(selected.id, { animationOut: e.target.value as any })}
                className="w-full h-7 px-1.5 rounded bg-background border border-border text-[11px]"
              >
                <option value="fade">Fade Out</option>
                <option value="shrink">Shrink Down</option>
                <option value="slide-down">Slide Down</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">Start Time (s)</span>
              <input
                type="number" min={0} step={0.1} value={selected.startTime}
                onChange={e => onUpdateLayer(selected.id, { startTime: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">End Time (s)</span>
              <input
                type="number" min={0} step={0.1} value={selected.endTime}
                onChange={e => onUpdateLayer(selected.id, { endTime: Math.max(selected.startTime + 0.1, Number(e.target.value) || 0) })}
                className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
              />
            </div>
          </div>

          {/* Transform */}
          <div className="space-y-1.5 border-t border-border/60 pt-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Transform Controls</span>
            <SliderRow label="Pos X" value={selected.transform.x} min={-20} max={120} unit="%"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, x: v } })} />
            <SliderRow label="Pos Y" value={selected.transform.y} min={-20} max={120} unit="%"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, y: v } })} />
            <SliderRow label="Scale" value={selected.transform.scale} min={10} max={300} unit="%"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, scale: v } })} />
            <SliderRow label="Rotate" value={selected.transform.rotation} min={-180} max={180} unit="°"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, rotation: v } })} />
            <SliderRow label="Opacity" value={Math.round(selected.transform.opacity * 100)} min={0} max={100} unit="%"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, opacity: v / 100 } })} />
          </div>

          {/* Blend mode */}
          {selected.type !== "audio" && (
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Blend Mode</span>
              <select
                value={selected.blendMode}
                onChange={e => onUpdateLayer(selected.id, { blendMode: e.target.value as BlendMode })}
                className="w-full h-7 px-1.5 rounded bg-background border border-border text-xs capitalize"
              >
                {BLEND_MODES.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

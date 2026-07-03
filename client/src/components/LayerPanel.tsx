/**
 * LayerPanel — After Effects-style layer management
 *
 * Layer list (top = front), add/delete/reorder, visibility & lock toggles,
 * per-layer transform controls (position, scale, rotation, opacity),
 * blend modes, and per-layer effects.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Layers, Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown,
  Video, Music, Type as TypeIcon, Image as ImageIcon, Plus, VolumeX, Volume2,
} from "lucide-react";
import { Layer, LayerType, BlendMode, BLEND_MODES } from "@/lib/layers";

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
  video: <Video className="w-3 h-3" />,
  audio: <Music className="w-3 h-3" />,
  text: <TypeIcon className="w-3 h-3" />,
  image: <ImageIcon className="w-3 h-3" />,
};

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
        className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
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
    <div className="space-y-3">
      {/* Header + Add */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Layers ({layers.length})
        </label>
        <div className="relative">
          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] gap-1" onClick={() => setShowAddMenu(v => !v)}>
            <Plus className="w-3 h-3" /> Add
          </Button>
          {showAddMenu && (
            <div className="absolute right-0 top-7 z-20 bg-popover text-popover-foreground border border-border rounded-md shadow-lg py-1 w-28">
              {(["video", "audio", "text", "image"] as LayerType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { onAddLayer(t); setShowAddMenu(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-accent/20 capitalize transition-colors"
                >
                  {LAYER_ICONS[t]} {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layer list */}
      {layers.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No layers yet. Add a layer to start compositing. The base video stays underneath all layers.</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
          {displayLayers.map(layer => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(isSelected ? null : layer.id)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors border ${
                  isSelected ? "bg-accent/15 border-accent/50" : "bg-background border-border hover:bg-accent/5"
                }`}
              >
                <button
                  onClick={e => { e.stopPropagation(); onUpdateLayer(layer.id, { visible: !layer.visible }); }}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  title={layer.visible ? "Hide" : "Show"}
                >
                  {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 opacity-50" />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onUpdateLayer(layer.id, { locked: !layer.locked }); }}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  title={layer.locked ? "Unlock" : "Lock"}
                >
                  {layer.locked ? <Lock className="w-3 h-3 text-yellow-500" /> : <Unlock className="w-3 h-3 opacity-40" />}
                </button>
                <span className="flex-shrink-0 text-muted-foreground">{LAYER_ICONS[layer.type]}</span>
                <span className={`flex-1 truncate ${layer.visible ? "" : "opacity-50"}`}>{layer.name}</span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); onMoveLayer(layer.id, "up"); }}
                    className="text-muted-foreground hover:text-foreground p-0.5" title="Bring forward"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onMoveLayer(layer.id, "down"); }}
                    className="text-muted-foreground hover:text-foreground p-0.5" title="Send backward"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                    className="text-muted-foreground hover:text-destructive p-0.5" title="Delete layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected layer inspector */}
      {selected && !selected.locked && (
        <div className="border-t border-border pt-3 space-y-3">
          {/* Name */}
          <input
            value={selected.name}
            onChange={e => onUpdateLayer(selected.id, { name: e.target.value })}
            className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
            placeholder="Layer name"
          />

          {/* Text content (text layers) */}
          {selected.type === "text" && (
            <div className="space-y-2">
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

          {/* Timing */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">Start (s)</span>
              <input
                type="number" min={0} step={0.1} value={selected.startTime}
                onChange={e => onUpdateLayer(selected.id, { startTime: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">End (s)</span>
              <input
                type="number" min={0} step={0.1} value={selected.endTime}
                onChange={e => onUpdateLayer(selected.id, { endTime: Math.max(selected.startTime + 0.1, Number(e.target.value) || 0) })}
                className="w-full h-7 px-2 rounded bg-background border border-border text-xs"
              />
            </div>
          </div>

          {/* Transform */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Transform</span>
            <SliderRow label="X" value={selected.transform.x} min={-50} max={150} unit="%"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, x: v } })} />
            <SliderRow label="Y" value={selected.transform.y} min={-50} max={150} unit="%"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, y: v } })} />
            <SliderRow label="Scale" value={selected.transform.scale} min={5} max={400} unit="%"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, scale: v } })} />
            <SliderRow label="Rotation" value={selected.transform.rotation} min={-180} max={180} unit="°"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, rotation: v } })} />
            <SliderRow label="Opacity" value={Math.round(selected.transform.opacity * 100)} min={0} max={100} unit="%"
              onChange={v => onUpdateLayer(selected.id, { transform: { ...selected.transform, opacity: v / 100 } })} />
          </div>

          {/* Blend mode (visual layers only) */}
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

          {/* Audio controls (audio/video layers) */}
          {(selected.type === "audio" || selected.type === "video") && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateLayer(selected.id, { muted: !selected.muted })}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                {selected.muted ? <VolumeX className="w-3.5 h-3.5 text-destructive" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <SliderRow label="Volume" value={Math.round(selected.volume * 100)} min={0} max={100} unit="%"
                onChange={v => onUpdateLayer(selected.id, { volume: v / 100 })} />
            </div>
          )}

          {/* Per-layer effects (visual layers only) */}
          {selected.type !== "audio" && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Layer Effects</span>
              <SliderRow label="Bright" value={selected.effects.brightness} min={0} max={200} unit="%"
                onChange={v => onUpdateLayer(selected.id, { effects: { ...selected.effects, brightness: v } })} />
              <SliderRow label="Contrast" value={selected.effects.contrast} min={0} max={200} unit="%"
                onChange={v => onUpdateLayer(selected.id, { effects: { ...selected.effects, contrast: v } })} />
              <SliderRow label="Saturate" value={selected.effects.saturation} min={0} max={200} unit="%"
                onChange={v => onUpdateLayer(selected.id, { effects: { ...selected.effects, saturation: v } })} />
              <SliderRow label="Blur" value={selected.effects.blur} min={0} max={20} step={0.5} unit="px"
                onChange={v => onUpdateLayer(selected.id, { effects: { ...selected.effects, blur: v } })} />
              <SliderRow label="Hue" value={selected.effects.hueRotate} min={-180} max={180} unit="°"
                onChange={v => onUpdateLayer(selected.id, { effects: { ...selected.effects, hueRotate: v } })} />
            </div>
          )}
        </div>
      )}
      {selected?.locked && (
        <p className="text-xs text-yellow-500 border-t border-border pt-3">This layer is locked. Unlock it to edit.</p>
      )}
    </div>
  );
}

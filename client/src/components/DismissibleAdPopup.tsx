import { useState } from "react";
import { X } from "lucide-react";

export default function DismissibleAdPopup() {
  const [isOpen, setIsOpen] = useState(true);
  const smartlink = import.meta.env.VITE_ADSTERRA_SMARTLINK || "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-lg mb-2">Support PixelCraft</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Keep PixelCraft free by viewing ads. No tracking, no spam.
        </p>

        {smartlink && (
          <iframe
            src={smartlink}
            style={{ width: "100%", height: "250px", border: "none", borderRadius: "8px" }}
            title="Ad"
          />
        )}

        <button
          onClick={() => setIsOpen(false)}
          className="w-full mt-4 px-4 py-2 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

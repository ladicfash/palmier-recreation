export default function EditorAdBanner() {
  const smartlink = import.meta.env.VITE_ADSTERRA_SMARTLINK || "";

  if (!smartlink) return null;

  return (
    <div className="h-20 bg-card border-b border-border flex items-center justify-center">
      <iframe
        src={smartlink}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Ad"
      />
    </div>
  );
}

export default function EditorAdBanner() {
  const publisherId = import.meta.env.VITE_ADSTERRA_ID || "";

  if (!publisherId) return null;

  return (
    <div className="h-20 bg-card border-b border-border flex items-center justify-center">
      <div
        data-adsterra-pub-id={publisherId}
        data-adsterra-placement="5892184"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

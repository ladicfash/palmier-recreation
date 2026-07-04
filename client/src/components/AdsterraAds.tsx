/**
 * Adsterra Ads Component
 * Bottom banner placement for non-intrusive monetization
 * 
 * To use: Get your Adsterra publisher ID from https://adsterra.com/
 * Then add it to environment variables as VITE_ADSTERRA_ID
 */

import { useEffect } from "react";

export default function AdsterraAds() {
  const adsterraId = import.meta.env.VITE_ADSTERRA_ID;

  useEffect(() => {
    if (!adsterraId) return;

    // Load Adsterra script
    const script = document.createElement("script");
    script.src = "//a.adsterra.com/s/js/160/uds.js";
    script.async = true;
    script.onload = () => {
      const win = window as any;
      if (win.AdsterraLoader) {
        win.AdsterraLoader.loadBanner(adsterraId);
      }
    };
    
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="//a.adsterra.com/s/js/160/uds.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [adsterraId]);

  if (!adsterraId) return null;

  return (
    <div 
      id="adsterra-banner"
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "8px 0",
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        minHeight: "60px",
      }}
    />
  );
}

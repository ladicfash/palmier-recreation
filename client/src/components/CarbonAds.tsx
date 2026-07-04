/**
 * Carbon Ads Component
 * Non-intrusive, developer-friendly ads
 * 
 * To use: Get your Carbon Ads ID from https://www.carbonads.com/
 * Then add it to environment variables as VITE_CARBON_ADS_ID
 */

import { useEffect } from "react";

export default function CarbonAds() {
  const carbonAdsId = import.meta.env.VITE_CARBON_ADS_ID;

  useEffect(() => {
    if (!carbonAdsId) return;

    // Load Carbon Ads script
    const script = document.createElement("script");
    script.src = `https://cdn.carbonads.com/carbon.js?serve=${carbonAdsId}&placement=pixelcraftio`;
    script.async = true;
    script.id = "_carbonads_js";
    
    const container = document.getElementById("carbon-ads-container");
    if (container) {
      container.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById("_carbonads_js");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [carbonAdsId]);

  if (!carbonAdsId) return null;

  return (
    <div 
      id="carbon-ads-container"
      className="carbon-ads-container"
      style={{
        padding: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
        marginBottom: "12px",
        fontSize: "12px",
      }}
    />
  );
}

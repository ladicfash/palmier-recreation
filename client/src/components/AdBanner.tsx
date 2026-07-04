/**
 * AdBanner Component
 * Non-intrusive ad placements using Carbon Ads and Adsterra
 */

import { useEffect } from "react";

interface AdBannerProps {
  type: "carbon" | "adsterra";
  position?: "top" | "bottom";
}

export default function AdBanner({ type, position = "bottom" }: AdBannerProps) {
  const carbonAdsId = import.meta.env.VITE_CARBON_ADS_ID;
  const adsterraSmartlink = import.meta.env.VITE_ADSTERRA_SMARTLINK;

  useEffect(() => {
    if (type === "carbon" && carbonAdsId) {
      const script = document.createElement("script");
      script.src = `https://cdn.carbonads.com/carbon.js?serve=${carbonAdsId}&placement=pixelcraft`;
      script.async = true;
      script.id = `_carbonads_js_${position}`;
      
      const container = document.getElementById(`carbon-ads-${position}`);
      if (container) {
        container.appendChild(script);
      }

      return () => {
        const existingScript = document.getElementById(`_carbonads_js_${position}`);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }

    if (type === "adsterra" && adsterraSmartlink) {
      // Embed Adsterra smartlink as an iframe
      const container = document.getElementById(`adsterra-${position}`);
      if (container && !container.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = adsterraSmartlink;
        iframe.style.width = '100%';
        iframe.style.height = '60px';
        iframe.style.border = 'none';
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        container.appendChild(iframe);
      }
    }
  }, [type, carbonAdsId, adsterraSmartlink, position]);

  if (type === "carbon" && !carbonAdsId) return null;
  if (type === "adsterra" && !adsterraSmartlink) return null;

  return (
    <div 
      id={type === "carbon" ? `carbon-ads-${position}` : `adsterra-${position}`}
      className={`flex justify-center ${type === "carbon" ? "py-2" : "py-1"}`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderTop: position === "top" ? "1px solid rgba(0, 0, 0, 0.1)" : "none",
        borderBottom: position === "bottom" ? "1px solid rgba(0, 0, 0, 0.1)" : "none",
        minHeight: type === "adsterra" ? "60px" : "auto",
      }}
    />
  );
}

import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  id: string; // This will be the Slot ID for AdSense or the Key for Adsterra
  format: '728x90' | '300x250' | '468x60' | '160x300' | '160x600' | '320x50' | 'adsense';
  className?: string;
  adClient?: string; // Optional: ca-pub-XXXX
}

const formatDimensions = {
  '728x90': { width: 728, height: 90 },
  '300x250': { width: 300, height: 250 },
  '468x60': { width: 468, height: 60 },
  '160x300': { width: 160, height: 300 },
  '160x600': { width: 160, height: 600 },
  '320x50': { width: 320, height: 50 },
  'adsense': { width: 0, height: 0 }
};

export const AdUnit: React.FC<AdUnitProps> = ({ id, format, className, adClient = "ca-pub-9842476646609926" }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;
    
    // AdSense Logic
    if (format === 'adsense') {
      try {
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', adClient);
        ins.setAttribute('data-ad-slot', id);
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        
        adRef.current.innerHTML = '';
        adRef.current.appendChild(ins);
        
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
      return;
    }

    // Adsterra Banner Logic (Banner formats)
    // We avoid popunder and social ads as requested, focusing on standard banner formats.
    const dimensions = formatDimensions[format];
    if (dimensions && id) {
      try {
        adRef.current.innerHTML = '';
        
        const confScript = document.createElement('script');
        confScript.type = 'text/javascript';
        confScript.innerHTML = `
          window.atOptions = {
            'key' : '${id}',
            'format' : 'iframe',
            'height' : ${dimensions.height},
            'width' : ${dimensions.width},
            'params' : {}
          };
        `;
        
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        // Cache busting to allow multiple loads of same script on same page
        invokeScript.src = `//www.highperformanceformat.com/${id}/invoke.js?t=${Date.now()}`;
        
        adRef.current.appendChild(confScript);
        adRef.current.appendChild(invokeScript);
      } catch (err) {
        console.error('Adsterra banner error:', err);
      }
    }
  }, [id, format]);

  const dimensions = formatDimensions[format];

  return (
    <div 
      ref={adRef} 
      className={`flex items-center justify-center overflow-hidden bg-surface/5 ${className}`}
      style={{ 
        minHeight: dimensions.height > 0 ? `${dimensions.height}px` : 'auto',
        minWidth: dimensions.width > 0 ? `${dimensions.width}px` : 'auto'
      }}
    />
  );
};

export const GlobalAds: React.FC = () => {
  useEffect(() => {
    // Global Scripts (e.g. AdSense Auto Ads) can be placed here.
    // Popunder and Social Bar scripts from Adsterra are EXCLUDED per user safety policy.
    const addAdSenseGlobal = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842476646609926";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    };

    addAdSenseGlobal();
  }, []);

  return null;
};

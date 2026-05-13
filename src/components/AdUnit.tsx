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

    // Existing Adsterra-like logic
    if (adRef.current.firstChild) return;

    const dimensions = formatDimensions[format];
      
      // We create an internal iframe to isolate the global atOptions for each unit
      const iframe = document.createElement('iframe');
      iframe.width = dimensions.width.toString();
      iframe.height = dimensions.height.toString();
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      
      adRef.current.innerHTML = ''; // Clear any previous attempts
      adRef.current.appendChild(iframe);
      
      const setupIframe = () => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; overflow: hidden; height: ${dimensions.height}px; }
                </style>
              </head>
              <body>
                <script type="text/javascript">
                  atOptions = {
                    'key' : '${id}',
                    'format' : 'iframe',
                    'height' : ${dimensions.height},
                    'width' : ${dimensions.width},
                    'params' : {}
                  };
                  document.write('<scr' + 'ipt type="text/javascript" src="https://www.highperformanceformat.com/${id}/invoke.js"></scr' + 'ipt>');
                </script>
              </body>
            </html>
          `);
          iframeDoc.close();
        }
      };

      // Use a small timeout to ensure iframe is fully inserted and contentWindow is available
      setTimeout(setupIframe, 50);
  }, [id, format]);

  const dimensions = formatDimensions[format];

  return (
    <div 
      ref={adRef} 
      className={`flex items-center justify-center overflow-hidden bg-surface/5 ${className}`}
      style={{ 
        minHeight: dimensions.height > 0 ? `${dimensions.height}px` : '100px',
        minWidth: dimensions.width > 0 ? `${dimensions.width}px` : 'auto'
      }}
    />
  );
};

export const GlobalAds: React.FC = () => {
  useEffect(() => {
    // Popunder and Social Bar disabled per user request to remove popups/suggestions
  }, []);

  return null;
};

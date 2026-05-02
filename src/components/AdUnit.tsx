import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  id: string;
  format: '728x90' | '300x250' | '468x60' | '160x300' | '160x600' | '320x50' | 'native';
  className?: string;
}

const formatDimensions = {
  '728x90': { width: 728, height: 90 },
  '300x250': { width: 300, height: 250 },
  '468x60': { width: 468, height: 60 },
  '160x300': { width: 160, height: 300 },
  '160x600': { width: 160, height: 600 },
  '320x50': { width: 320, height: 50 },
  'native': { width: 0, height: 0 } // Native handled differently usually, but we'll adapt
};

export const AdUnit: React.FC<AdUnitProps> = ({ id, format, className }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.firstChild) {
      if (format === 'native') {
        const script = document.createElement('script');
        script.src = `https://pl29314388.profitablecpmratenetwork.com/${id}/invoke.js`;
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        
        const container = document.createElement('div');
        container.id = `container-${id}`;
        
        adRef.current.appendChild(script);
        adRef.current.appendChild(container);
        return;
      }

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
    }
  }, [id, format]);

  return (
    <div 
      ref={adRef} 
      className={`flex items-center justify-center overflow-hidden bg-surface/5 min-h-[50px] ${className}`}
    />
  );
};

export const GlobalAds: React.FC = () => {
  useEffect(() => {
    // Prevent multiple injections
    if (document.getElementById('adsterra-social-bar')) return;

    // Social Bar (Active)
    const socialBar = document.createElement('script');
    socialBar.id = 'adsterra-social-bar';
    socialBar.src = 'https://pl29314389.profitablecpmratenetwork.com/b7/7d/e0/b77de04459ba8a2434cbfca7573c5395.js';
    socialBar.async = true;
    document.body.appendChild(socialBar);

    /* 
      Popunder (Anti-Adblock) - CURRENTLY DISABLED PER USER REQUEST
      const popunder = document.createElement('script');
      popunder.src = 'https://eternalwheeled.com/98/f8/23/98f82357b06f6ce777367f18e5f869fe.js';
      popunder.async = true;
      document.body.appendChild(popunder);
    */
  }, []);

  return null;
};

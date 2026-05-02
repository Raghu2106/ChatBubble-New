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
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key' : '${id}',
          'format' : 'iframe',
          'height' : ${dimensions.height},
          'width' : ${dimensions.width},
          'params' : {}
        };
      `;
      adRef.current.appendChild(configScript);
      
      const script = document.createElement('script');
      script.src = `https://www.highperformanceformat.com/${id}/invoke.js`;
      script.type = 'text/javascript';
      adRef.current.appendChild(script);
    }
  }, [id, format]);

  return (
    <div 
      ref={adRef} 
      className={`flex items-center justify-center overflow-hidden min-h-[50px] ${className}`}
    />
  );
};

export const GlobalAds: React.FC = () => {
  return null;
};

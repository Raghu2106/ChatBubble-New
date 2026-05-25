import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  id?: string; // Optional: If passed, overrides environmental keys
  format: '728x90' | '300x250' | '468x60' | '160x300' | '160x600' | '320x50' | 'adsense';
  className?: string;
  adClient?: string; // Optional: ca-pub-XXXX
  position?: 'left' | 'right' | 'header' | 'footer'; // Anchor position for matching env keys
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

export const AdUnit: React.FC<AdUnitProps> = ({ id, format, className, adClient = "ca-pub-9842476646609926", position }) => {
  const adRef = useRef<HTMLDivElement>(null);

  // Helper to extract clean 32-character Adsterra key from any pasted code or script tag
  const sanitizeAdKey = (rawKey: string): string => {
    if (!rawKey) return '';
    const trimmed = rawKey.trim();
    
    // 1. If it's already a 32-character hex key, return it directly
    if (/^[a-f0-9]{32}$/i.test(trimmed)) {
      return trimmed;
    }
    
    // 2. Look for 'key' or "key" option definition, e.g. 'key' : 'eef904e9c70811e5a59db06225ffdc78'
    const keyOptionMatch = trimmed.match(/['"]?key['"]?\s*:\s*['"]([a-f0-9]{32})['"]/i);
    if (keyOptionMatch && keyOptionMatch[1]) {
      return keyOptionMatch[1];
    }
    
    // 3. Look for the script invoke URL path, e.g. highperformanceformat.com/eef904e9c70811e5a59db06225ffdc78/invoke.js
    const pathMatch = trimmed.match(/\/([a-f0-9]{32})\/invoke\.js/i);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }

    // 4. Fallback search for any isolated 32-character hexadecimal string
    const genericHexMatch = trimmed.match(/\b([a-f0-9]{32})\b/i);
    if (genericHexMatch && genericHexMatch[1]) {
      return genericHexMatch[1];
    }

    // 5. If it contains some other string, remove quotes and clean it
    return trimmed.replace(/['";\s]/g, '');
  };

  // Resolve the key from props or env safely with cast to avoid Vite compiler errors
  const getAdKey = (): string => {
    if (id) return id;
    const winConfig = (window as any).__AD_CONFIG__ || {};
    const env = (import.meta as any).env || {};
    
    const getVal = (keyName: string): string => {
      try {
        return localStorage.getItem(keyName) || winConfig[keyName] || env[keyName] || '';
      } catch (e) {
        return winConfig[keyName] || env[keyName] || '';
      }
    };
    
    if (format === '728x90') {
      if (position === 'header') return getVal('VITE_ADSTERRA_KEY_HEADER_728X90') || getVal('VITE_ADSTERRA_KEY_728X90');
      if (position === 'footer') return getVal('VITE_ADSTERRA_KEY_FOOTER_728X90') || getVal('VITE_ADSTERRA_KEY_728X90');
      return getVal('VITE_ADSTERRA_KEY_728X90');
    }
    
    if (format === '320x50') {
      if (position === 'header') return getVal('VITE_ADSTERRA_KEY_HEADER_320X50') || getVal('VITE_ADSTERRA_KEY_320X50');
      if (position === 'footer') return getVal('VITE_ADSTERRA_KEY_FOOTER_320X50') || getVal('VITE_ADSTERRA_KEY_320X50');
      return getVal('VITE_ADSTERRA_KEY_320X50');
    }
    
    if (format === '160x600') {
      if (position === 'left') return getVal('VITE_ADSTERRA_KEY_LEFT_160X600') || getVal('VITE_ADSTERRA_KEY_160X600');
      if (position === 'right') return getVal('VITE_ADSTERRA_KEY_RIGHT_160X600') || getVal('VITE_ADSTERRA_KEY_160X600');
      return getVal('VITE_ADSTERRA_KEY_160X600');
    }
    
    if (format === '300x250') return getVal('VITE_ADSTERRA_KEY_300X250');
    if (format === '468x60') return getVal('VITE_ADSTERRA_KEY_468X60');
    
    return '';
  };

  const [dynamicKey, setDynamicKey] = React.useState<string>(getAdKey());

  useEffect(() => {
    setDynamicKey(getAdKey());
    const handleConfigLoaded = () => {
      setDynamicKey(getAdKey());
    };
    window.addEventListener('ad-config-loaded', handleConfigLoaded);
    return () => {
      window.removeEventListener('ad-config-loaded', handleConfigLoaded);
    };
  }, [position, format, id]);

  const rawKey = dynamicKey;
  
  const isHtmlString = (str: string): boolean => {
    if (!str) return false;
    const trimmed = str.trim();
    return trimmed.includes('<') && (
      trimmed.toLowerCase().includes('<script') ||
      trimmed.toLowerCase().includes('<div') ||
      trimmed.toLowerCase().includes('<ins') ||
      trimmed.toLowerCase().includes('<iframe') ||
      trimmed.toLowerCase().includes('<a href')
    );
  };

  const isHtml = isHtmlString(rawKey);
  const resolvedKey = isHtml ? rawKey : sanitizeAdKey(rawKey);
  const dimensions = formatDimensions[format];

  useEffect(() => {
    if (!adRef.current || !resolvedKey) return;
    
    // Direct raw HTML injection inside safe, un-sandboxed iframe (so script loads fine)
    if (isHtml) {
      const dimensions = formatDimensions[format];
      const iframe = document.createElement('iframe');
      iframe.width = dimensions.width > 0 ? dimensions.width.toString() : '100%';
      iframe.height = dimensions.height > 0 ? dimensions.height.toString() : '100px';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      
      adRef.current.innerHTML = '';
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
                  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; overflow: hidden; width: 100vw; height: 100vh; }
                </style>
              </head>
              <body>
                ${resolvedKey}
              </body>
            </html>
          `);
          iframeDoc.close();
        }
      };
      
      const timer = setTimeout(setupIframe, 40);
      return () => clearTimeout(timer);
    }
    
    // AdSense Logic
    if (format === 'adsense') {
      try {
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', adClient);
        ins.setAttribute('data-ad-slot', resolvedKey);
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

    // Existing Adsterra script loading logic inside isolated iframe
    const dimensions = formatDimensions[format];
    
    const iframe = document.createElement('iframe');
    iframe.width = dimensions.width.toString();
    iframe.height = dimensions.height.toString();
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    
    adRef.current.innerHTML = ''; // Clear fallback layout
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
                  'key' : '${resolvedKey}',
                  'format' : 'iframe',
                  'height' : ${dimensions.height},
                  'width' : ${dimensions.width},
                  'params' : {}
                };
                document.write('<scr' + 'ipt type="text/javascript" src="https://www.highperformanceformat.com/${resolvedKey}/invoke.js"></scr' + 'ipt>');
              </script>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    };

    // Tiny timeout to make sure IFrame mounts correctly
    const timer = setTimeout(setupIframe, 40);
    return () => clearTimeout(timer);
  }, [resolvedKey, format, adClient]);

  // If no key is set yet, render a beautiful and clean placeholder matching the exact slot dimension
  if (!resolvedKey && format !== 'adsense') {
    return (
      <div 
        className={`flex flex-col items-center justify-center border-2 border-dashed border-slate-200/80 bg-slate-50/60 text-[11px] text-slate-400 font-medium select-none ${className || ''}`}
        style={{ 
          height: `${dimensions.height}px`,
          width: `${dimensions.width}px`
        }}
      >
        <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-0.5">Adsterra Slot</div>
        <div className="font-mono text-[9px] text-brand/80 font-bold">{format} banner</div>
        {position && (
          <div className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono mt-1 uppercase tracking-wide">
            {position}
          </div>
        )}
        <div className="text-[8px] text-slate-400/80 mt-1 px-2 text-center leading-tight">
          Ready for key integration
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={adRef} 
      className={`flex items-center justify-center overflow-hidden bg-transparent ${className || ''}`}
      style={{ 
        minHeight: dimensions.height > 0 ? `${dimensions.height}px` : '100px',
        minWidth: dimensions.width > 0 ? `${dimensions.width}px` : 'auto'
      }}
    />
  );
};

export const GlobalAds: React.FC = () => {
  useEffect(() => {
    // Popunder and Social Bar disabled dynamically to protect user experience from intrusive popups and prompts.
  }, []);

  return null;
};

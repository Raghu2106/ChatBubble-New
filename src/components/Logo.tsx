import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', iconOnly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: { container: 'h-6', icon: 'w-6 h-6', text: 'text-base' },
    md: { container: 'h-8', icon: 'w-8 h-8', text: 'text-xl' },
    lg: { container: 'h-10', icon: 'w-10 h-10', text: 'text-2xl' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${currentSize.container} ${className}`}>
      <div className={`${currentSize.icon} relative flex items-center justify-center shrink-0`}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          {/* Main Bubble Shape */}
          <path 
            d="M50 15C31 15 15 28.5 15 45C15 54.5 21 62.5 30 68L28 85L45 75C46.6 74.5 48.3 75 50 75C69 75 85 61.5 85 45C85 28.5 69 15 50 15Z" 
            fill="url(#logo-gradient)" 
          />
          {/* Inner White Outline Circle */}
          <circle cx="50" cy="45" r="22" stroke="white" strokeWidth="6" opacity="0.4" />
          {/* Three Dots */}
          <circle cx="38" cy="45" r="4.5" fill="white" />
          <circle cx="50" cy="45" r="4.5" fill="white" />
          <circle cx="62" cy="45" r="4.5" fill="white" />
        </svg>
      </div>
      {!iconOnly && (
        <span className={`${currentSize.text} font-black tracking-tighter text-text`}>
          ChatBubble
        </span>
      )}
    </div>
  );
};

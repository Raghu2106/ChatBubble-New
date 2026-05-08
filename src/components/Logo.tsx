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
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          {/* Main Bubble Shape */}
          <rect x="20" y="20" width="60" height="60" rx="18" fill="url(#logo-gradient)" />
          {/* White icon lines */}
          <rect x="35" y="38" width="30" height="4" rx="2" fill="white" />
          <rect x="35" y="48" width="20" height="4" rx="2" fill="white" />
          <path d="M45 80 L55 80 L50 90 Z" fill="url(#logo-gradient)" />
        </svg>
      </div>
      {!iconOnly && (
        <span className={`${currentSize.text} font-black tracking-tighter text-text-highlight uppercase`}>
          ChatBubble
        </span>
      )}
    </div>
  );
};

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 32, text: 'text-lg' },
    lg: { icon: 44, text: 'text-2xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2 sm:gap-3 group">
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="40" height="40" rx="10" fill="url(#logo-gradient)" />
        <rect x="20" y="14" width="4" height="18" rx="1" fill="white" />
        <rect x="21" y="10" width="2" height="4" fill="white" />
        <rect x="21" y="32" width="2" height="4" fill="white" />
        <rect x="12" y="20" width="4" height="10" rx="1" fill="white" opacity="0.85" />
        <rect x="13" y="17" width="2" height="3" fill="white" opacity="0.85" />
        <rect x="13" y="30" width="2" height="3" fill="white" opacity="0.85" />
        <rect x="28" y="16" width="4" height="14" rx="1" fill="white" opacity="0.7" />
        <rect x="29" y="13" width="2" height="3" fill="white" opacity="0.7" />
        <rect x="29" y="30" width="2" height="3" fill="white" opacity="0.7" />
      </svg>
      {showText && (
        <span className={`font-bold tracking-tight ${text}`}>
          <span className="text-text-primary">Trade</span>
          <span className="gradient-text">Forge</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
import React from 'react';

interface WalletLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showContainer?: boolean;
  className?: string;
}

export const WalletLogo: React.FC<WalletLogoProps> = ({
  size = 'md',
  showContainer = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-12 h-12', svg: 'w-8 h-8', text: 'text-[6px]' },
    md: { box: 'w-20 h-20', svg: 'w-14 h-14', text: 'text-[8px]' },
    lg: { box: 'w-28 h-28', svg: 'w-20 h-20', text: 'text-[10px]' },
    xl: { box: 'w-36 h-36', svg: 'w-24 h-24', text: 'text-[12px]' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className="relative flex items-center justify-center select-none">
      <svg
        viewBox="0 0 120 120"
        className={`${currentSize.svg} drop-shadow-md`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Back banknotes */}
        <g transform="rotate(-12 55 50)">
          <rect
            x="32"
            y="28"
            width="54"
            height="32"
            rx="4"
            fill="#e2f5f3"
            stroke="#457885"
            strokeWidth="2.5"
          />
          <circle cx="59" cy="44" r="7" stroke="#457885" strokeWidth="2" fill="none" />
          <line x1="38" y1="44" x2="46" y2="44" stroke="#457885" strokeWidth="2" strokeLinecap="round" />
          <line x1="72" y1="44" x2="80" y2="44" stroke="#457885" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g transform="rotate(8 65 52)">
          <rect
            x="38"
            y="26"
            width="52"
            height="30"
            rx="4"
            fill="#d1ecea"
            stroke="#3a6974"
            strokeWidth="2.5"
          />
          <circle cx="64" cy="41" r="6" stroke="#3a6974" strokeWidth="2" fill="none" />
        </g>

        {/* Wallet Main Body */}
        <rect
          x="20"
          y="42"
          width="80"
          height="54"
          rx="10"
          fill="#3e6c78"
          stroke="#2d525c"
          strokeWidth="3"
        />

        {/* Stitching dashed line on wallet */}
        <rect
          x="24"
          y="46"
          width="72"
          height="46"
          rx="7"
          fill="none"
          stroke="#7ca9b4"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Wallet flap / clip */}
        <path
          d="M 72 58 L 94 58 C 98 58 101 61 101 65 L 101 73 C 101 77 98 80 94 80 L 72 80 Z"
          fill="#2d525c"
          stroke="#203d45"
          strokeWidth="2"
        />
        {/* Metal snap clasp */}
        <circle cx="92" cy="69" r="3.5" fill="#f8fafc" stroke="#203d45" strokeWidth="1.5" />

        {/* Text inside wallet: CATATAN KEUANGAN */}
        <text
          x="44"
          y="65"
          fill="#ffffff"
          fontSize="7.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="bold"
          letterSpacing="0.8"
          textAnchor="middle"
        >
          CATATAN
        </text>
        <text
          x="44"
          y="75"
          fill="#ffffff"
          fontSize="6.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="bold"
          letterSpacing="0.8"
          textAnchor="middle"
        >
          KEUANGAN
        </text>
      </svg>
    </div>
  );

  if (!showContainer) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={`${currentSize.box} rounded-2xl bg-white/95 p-2 shadow-xl border-2 border-teal-600/30 flex items-center justify-center backdrop-blur-sm ${className}`}
    >
      {content}
    </div>
  );
};

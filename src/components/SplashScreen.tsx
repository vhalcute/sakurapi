import React from 'react';
import { WalletLogo } from './WalletLogo';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onEnterApp?: () => void;
  isStandalone?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onEnterApp,
  isStandalone = false,
}) => {
  return (
    <div className="relative w-full h-full min-h-[580px] overflow-hidden bg-[#5a7380] flex flex-col items-center justify-between select-none">
      {/* Decorative Wave Shapes matching Screen 1 in the mockup */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 360 740"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft background wave 1 */}
        <path
          d="M 360 0 C 310 120 280 200 310 350 C 340 500 240 680 0 740 L 0 0 Z"
          fill="#4f6773"
          opacity="0.4"
        />
        {/* White curved swoop from bottom left to right */}
        <path
          d="M 0 450 C 60 520 80 620 60 740 L 0 740 Z"
          fill="#ffffff"
          opacity="0.95"
        />
        {/* White curved swoop from top right down */}
        <path
          d="M 360 120 C 300 200 270 320 300 480 C 320 600 360 680 360 740 Z"
          fill="#ffffff"
          opacity="0.95"
        />
        {/* Slate curve over the white wave */}
        <path
          d="M 28 540 C 90 620 160 680 200 740 L 40 740 Z"
          fill="#3c525d"
          opacity="0.8"
        />
      </svg>

      {/* Top spacing */}
      <div className="pt-16 z-10 text-center">
        <span className="text-white/60 text-xs tracking-widest uppercase font-semibold">
          Financial Organizer
        </span>
      </div>

      {/* Center Brand Badge matching mockup */}
      <div className="z-10 flex flex-col items-center">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <WalletLogo size="lg" showContainer={true} />
        </div>
        <h2 className="mt-5 text-xl font-extrabold text-white tracking-wider">
          CATATAN KEUANGAN
        </h2>
        <p className="text-xs text-white/80 mt-1 max-w-[200px] text-center font-medium">
          Kelola arus kas pribadi & harian dengan mudah
        </p>
      </div>

      {/* Bottom CTA / Action */}
      <div className="pb-12 z-10 w-full px-8 flex flex-col items-center">
        {onEnterApp && (
          <button
            id="btn-masuk-aplikasi"
            onClick={onEnterApp}
            className="w-full max-w-[240px] py-3 px-6 bg-white hover:bg-slate-50 text-[#3b535f] text-sm font-bold rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Buka Aplikasi</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
        <span className="text-[11px] text-white/60 mt-3 font-medium">
          Simpel • Akurat • Terorganisir
        </span>
      </div>
    </div>
  );
};

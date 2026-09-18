import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { WalletLogo } from './WalletLogo';

interface PinLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  correctPin,
  onUnlock,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [isError, setIsError] = useState(false);

  const handleKeyPress = (digit: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + digit;
      setEnteredPin(next);

      if (next.length === 4) {
        if (next === correctPin) {
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setIsError(true);
          setTimeout(() => {
            setEnteredPin('');
            setIsError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  return (
    <div className="w-full h-full min-h-[580px] bg-[#4c6674] flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="pt-8 flex flex-col items-center">
        <WalletLogo size="sm" showContainer={false} />
        <h2 className="text-white text-base font-bold mt-2">Catatan Keuangan</h2>
        <p className="text-xs text-white/70 mt-1">Masukkan 4-digit PIN Anda</p>

        {/* PIN Indicators */}
        <div className="flex items-center gap-3 mt-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < enteredPin.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isError
                    ? 'border-rose-400 bg-rose-400 animate-shake'
                    : isFilled
                    ? 'border-white bg-white scale-110'
                    : 'border-white/50 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {isError && (
          <p className="text-rose-300 text-xs mt-3 font-semibold animate-pulse">
            PIN Salah! Silakan coba lagi.
          </p>
        )}
      </div>

      {/* Number Pad */}
      <div className="w-full max-w-[260px] pb-6">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-14 h-14 mx-auto rounded-full bg-white/15 hover:bg-white/30 active:scale-90 text-white text-xl font-bold transition-all flex items-center justify-center backdrop-blur-sm"
            >
              {digit}
            </button>
          ))}

          <div />

          <button
            onClick={() => handleKeyPress('0')}
            className="w-14 h-14 mx-auto rounded-full bg-white/15 hover:bg-white/30 active:scale-90 text-white text-xl font-bold transition-all flex items-center justify-center backdrop-blur-sm"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-14 h-14 mx-auto rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white text-sm transition-all flex items-center justify-center"
            title="Hapus"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onUnlock}
            className="text-[11px] text-white/50 hover:text-white/80 transition-colors"
          >
            Lewati PIN (Mode Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

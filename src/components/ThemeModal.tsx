import React from 'react';
import { X, Palette, Check } from 'lucide-react';
import { ThemePreset } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const themes: { id: ThemePreset; name: string; desc: string; color: string; secondary: string }[] = [
    {
      id: 'slate',
      name: 'Abu-abu Slate (Asli Mockup)',
      desc: 'Warna standar sesuai desain visual mockup',
      color: '#506e7b',
      secondary: '#3d5562',
    },
    {
      id: 'teal',
      name: 'Toska Pinus (Forest Pine)',
      desc: 'Nuansa hijau toska yang segar dan tenang',
      color: '#2d6a4f',
      secondary: '#1b4332',
    },
    {
      id: 'ocean',
      name: 'Biru Samudra (Ocean Navy)',
      desc: 'Warna biru elegan dan profesional',
      color: '#27527a',
      secondary: '#1d3e5e',
    },
    {
      id: 'charcoal',
      name: 'Arang Gelap (Modern Charcoal)',
      desc: 'Nuansa gelap minimalis dengan kontras tinggi',
      color: '#374151',
      secondary: '#1f2937',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-800">Warna Tampilan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-3 mb-4">
          Pilih palet warna tema untuk latar belakang dan aksen utama aplikasi.
        </p>

        <div className="space-y-2.5">
          {themes.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-slate-800 bg-slate-50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <span
                      className="w-7 h-7 rounded-full shadow-xs border border-white"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span
                      className="w-7 h-7 rounded-full shadow-xs border border-white"
                      style={{ backgroundColor: theme.secondary }}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {theme.name}
                    </span>
                    <span className="text-[11px] text-slate-500">{theme.desc}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

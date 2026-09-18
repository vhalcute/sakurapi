import React from 'react';
import { X, HelpCircle, Shield, Sparkles, Heart } from 'lucide-react';
import { WalletLogo } from './WalletLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center -mt-2">
          <WalletLogo size="md" showContainer={true} />
        </div>

        <h2 className="text-lg font-bold text-slate-800 mt-3">Catatan Keuangan</h2>
        <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full mt-1">
          Versi 1.0.0 (Release Edition)
        </span>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed px-2">
          Aplikasi pencatatan keuangan harian yang dirancang dengan antarmuka yang bersih, cepat, dan mudah digunakan untuk mengawasi arus kas, saldo harian, dan grafik analitik.
        </p>

        <div className="my-4 text-left space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Privasi 100% Aman</span>
              <span className="text-[11px] text-slate-500">Semua data disimpan di penyimpanan lokal peramban Anda tanpa dikirim ke server luar.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Ekspor & Cadangan Data</span>
              <span className="text-[11px] text-slate-500">Dukungan unduh CSV untuk Microsoft Excel / Google Spreadsheet kapan saja.</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#4c6674] hover:bg-[#3d5562] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
};

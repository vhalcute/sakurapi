import React, { useState } from 'react';
import { X, RotateCcw, Database, AlertTriangle, Check, DollarSign } from 'lucide-react';
import { AppSettings } from '../types';

interface OtherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onResetToDemoData: () => void;
  onClearAllData: () => void;
}

export const OtherSettingsModal: React.FC<OtherSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetToDemoData,
  onClearAllData,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetDemo = () => {
    onResetToDemoData();
    setShowConfirmReset(false);
    setActionDone('Data berhasil dikembalikan ke data demo mockup!');
    setTimeout(() => setActionDone(null), 2500);
  };

  const handleClearAll = () => {
    onClearAllData();
    setShowConfirmClear(false);
    setActionDone('Semua riwayat transaksi telah dikosongkan.');
    setTimeout(() => setActionDone(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Setelan Lainnya</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionDone && (
          <div className="my-3 p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{actionDone}</span>
          </div>
        )}

        <div className="space-y-3 mt-4">
          {/* Format Mata Uang */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Format Mata Uang</span>
                <span className="text-[11px] text-slate-500">Mata uang bawaan aplikasi</span>
              </div>
              <span className="text-xs font-bold bg-white px-3 py-1 rounded-lg border border-slate-200 text-slate-700">
                IDR (Rupiah)
              </span>
            </div>
          </div>

          {/* Reset to Demo Data */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Muat Ulang Data Contoh</span>
                <span className="text-[11px] text-slate-500">Isi kembali transaksi contoh sesuai mockup gambar</span>
              </div>
            </div>
            {showConfirmReset ? (
              <div className="mt-3 pt-2 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetDemo}
                  className="flex-1 py-1.5 text-xs text-white bg-teal-700 rounded-lg hover:bg-teal-800 font-bold"
                >
                  Ya, Muat Data
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="mt-2.5 w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pulihkan Data Mockup</span>
              </button>
            )}
          </div>

          {/* Kosongkan Semua Data */}
          <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
            <div>
              <span className="text-xs font-bold text-rose-900 block">Kosongkan Semua Transaksi</span>
              <span className="text-[11px] text-rose-600">Hapus seluruh riwayat transaksi untuk mulai dari nol</span>
            </div>
            {showConfirmClear ? (
              <div className="mt-3 pt-2 border-t border-rose-200 flex gap-2">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-1.5 text-xs text-white bg-rose-600 rounded-lg hover:bg-rose-700 font-bold"
                >
                  Hapus Semua
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="mt-2.5 w-full py-2 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Hapus Seluruh Data</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

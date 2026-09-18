import React, { useState } from 'react';
import { X, Lock, Unlock, ShieldCheck, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onTriggerLock: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTriggerLock,
}) => {
  const [pinEnabled, setPinEnabled] = useState(settings.pinEnabled);
  const [pinCode, setPinCode] = useState(settings.pinCode || '1234');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length < 4) return;

    onUpdateSettings({
      pinEnabled,
      pinCode,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleLockNow = () => {
    onClose();
    onTriggerLock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-800">Pengaturan Kunci PIN</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Toggle PIN */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Kunci Aplikasi</span>
              <span className="text-[11px] text-slate-500">Minta PIN setiap membuka aplikasi</span>
            </div>
            <button
              type="button"
              onClick={() => setPinEnabled(!pinEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                pinEnabled ? 'bg-teal-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  pinEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* PIN Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Kode PIN (4 Digit Angka)
            </label>
            <input
              type="password"
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-full text-center tracking-[1em] text-lg font-bold py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
              disabled={!pinEnabled}
            />
            <p className="text-[11px] text-slate-400 text-center mt-1">
              Default PIN pengujian: <span className="font-mono font-bold text-slate-600">1234</span>
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center justify-center gap-1.5 font-medium">
              <Check className="w-4 h-4" />
              <span>Pengaturan PIN berhasil disimpan!</span>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#4c6674] hover:bg-[#3d5562] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Simpan PIN</span>
            </button>

            {pinEnabled && (
              <button
                type="button"
                onClick={handleLockNow}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kunci Aplikasi Sekarang</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

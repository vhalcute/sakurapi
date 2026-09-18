import React from 'react';
import {
  Edit3,
  FileText,
  Lock,
  Palette,
  HelpCircle,
  MoreHorizontal,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  ChevronRight,
  LogIn,
  User,
  Database,
} from 'lucide-react';
import { AppSettings } from '../types';
import { useAuth } from '../context/AuthContext';

interface SettingsTabProps {
  settings: AppSettings;
  onOpenCategoriesModal: () => void;
  onOpenExportModal: () => void;
  onOpenPinModal: () => void;
  onOpenThemeModal: () => void;
  onOpenAboutModal: () => void;
  onOpenOtherModal: () => void;
  onOpenFirebaseModal: () => void;
  onOpenSakurapiModal?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onOpenCategoriesModal,
  onOpenExportModal,
  onOpenPinModal,
  onOpenThemeModal,
  onOpenAboutModal,
  onOpenOtherModal,
  onOpenFirebaseModal,
  onOpenSakurapiModal,
}) => {
  const { user, isFirebaseConnected, isCustomConfig, activeConfig } = useAuth();

  const handleOpenSakurapi = () => {
    if (onOpenSakurapiModal) {
      onOpenSakurapiModal();
    } else {
      onOpenFirebaseModal();
    }
  };

  const menuItems = [
    {
      id: 'sakurapi-connect',
      label: 'Hubungkan Sakurapi Firebase',
      icon: Database,
      action: handleOpenSakurapi,
      badge: isCustomConfig ? (activeConfig?.projectId || 'Terhubung') : 'Hubungkan',
      isDanger: false,
    },
    {
      id: 'firebase-sync',
      label: isCustomConfig ? 'Akun & Sinkronisasi' : 'Akun & Cloud Sync',
      icon: Cloud,
      action: onOpenFirebaseModal,
      badge: user ? 'Aktif' : 'Tersedia',
      isDanger: false,
    },
    {
      id: 'edit-kategori',
      label: 'Edit Kategori',
      icon: Edit3,
      action: onOpenCategoriesModal,
      badge: null,
      isDanger: false,
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: FileText,
      action: onOpenExportModal,
      badge: 'CSV/JSON',
      isDanger: false,
    },
    {
      id: 'atur-pin',
      label: 'Atur PIN',
      icon: Lock,
      action: onOpenPinModal,
      badge: settings.pinEnabled ? 'Aktif' : null,
      isDanger: false,
    },
    {
      id: 'warna-tampilan',
      label: 'Warna Tampilan',
      icon: Palette,
      action: onOpenThemeModal,
      badge: settings.theme,
      isDanger: false,
    },
    {
      id: 'tentang',
      label: 'Tentang',
      icon: HelpCircle,
      action: onOpenAboutModal,
      badge: 'v1.0',
      isDanger: false,
    },
    {
      id: 'setelan-lainnya',
      label: 'Setelan Lainnya',
      icon: MoreHorizontal,
      action: onOpenOtherModal,
      badge: null,
      isDanger: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Header Section */}
      <div className="px-5 pt-3 pb-6">
        <h1 className="text-xl font-bold text-white tracking-wide mb-4">Pengaturan Aplikasi</h1>

        {/* Firebase Account Banner & Direct Login/Logout Action */}
        <div className="w-full mb-4 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-white/60 flex items-center justify-between text-left">
          <div
            onClick={onOpenFirebaseModal}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
          >
            {user ? (
              user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-xl border border-slate-200 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#4c6674] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {user ? user.displayName || user.email : 'Mode Tamu (Belum Masuk)'}
                </span>
                {user ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded-md">
                    Lokal
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {user ? user.email || 'Akun tersinkronisasi' : 'Klik untuk masuk & sinkronkan cloud'}
              </p>
            </div>
          </div>

          {/* Direct Quick Action Button */}
          <button
            id="btn-banner-auth-action"
            onClick={onOpenFirebaseModal}
            className={`ml-2 px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-xs shrink-0 ${
              user
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-[#4c6674] text-white hover:bg-[#3d5562]'
            }`}
          >
            {user ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Akun & Sync</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </div>

        {/* 2-column Grid matching Mockup Screen 3 */}
        <div className="grid grid-cols-2 gap-3.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`btn-menu-${item.id}`}
                onClick={item.action}
                className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 hover:border-slate-200 flex flex-col items-center justify-center text-center hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all group relative min-h-[110px]"
              >
                {item.badge && (
                  <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-semibold capitalize bg-slate-100 text-slate-600">
                    {item.badge}
                  </span>
                )}
                <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2.5 transition-colors bg-slate-50 group-hover:bg-slate-100">
                  <Icon className="w-5 h-5 stroke-[2.2] text-slate-700" />
                </div>
                <span className="text-xs font-semibold tracking-tight leading-tight text-slate-800">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Decorative lower panel for seamless aesthetic */}
      <div className="bg-white/10 rounded-t-[32px] p-5 flex-1 border-t border-white/20 flex flex-col items-center justify-center text-center mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>
            {user ? 'Data tersinkron aman di Firebase Firestore' : 'Data tersimpan di penyimpanan lokal'}
          </span>
        </div>
        <p className="text-[11px] text-white/60 mt-1">
          Catatan Keuangan • Firebase Connected (Enterprise)
        </p>
      </div>
    </div>
  );
};


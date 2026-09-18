import React from 'react';
import { SplashScreen } from './SplashScreen';
import { HomeTab } from './HomeTab';
import { SettingsTab } from './SettingsTab';
import { ReportTab } from './ReportTab';
import { Navigation } from './Navigation';
import { Transaction, AppSettings, ActiveTab } from '../types';
import { Eye, Smartphone } from 'lucide-react';

interface MockupShowcaseViewProps {
  transactions: Transaction[];
  settings: AppSettings;
  themeStyle: { bg: string };
  onSelectScreen: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const MockupShowcaseView: React.FC<MockupShowcaseViewProps> = ({
  transactions,
  settings,
  themeStyle,
  onSelectScreen,
  onOpenAddModal,
}) => {
  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-[#cbd5db] relative overflow-x-auto flex flex-col items-center">
      {/* Decorative organic background blobs matching the image backdrop */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#b8c6cd] blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#dfe7eb] blur-3xl opacity-60 pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 text-center mb-8 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-white/70 px-3 py-1 rounded-full shadow-xs">
          Tampilan Mockup 4 Layar Sesuai Gambar
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-2">
          Desain Antarmuka Catatan Keuangan
        </h1>
        <p className="text-xs md:text-sm text-slate-600 mt-1">
          Klik pada salah satu layar untuk berinteraksi langsung atau mengedit data secara real-time.
        </p>
      </div>

      {/* 4 Mockup Screens Row */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 max-w-7xl mx-auto pb-12">
        {/* Mockup 1: Splash Screen */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>1. Layar Pembuka (Splash)</span>
          </div>
          <div
            onClick={() => onSelectScreen('splash')}
            className="w-[280px] h-[580px] rounded-[36px] bg-[#506e7b] shadow-2xl overflow-hidden border-4 border-slate-300/80 cursor-pointer transform hover:-translate-y-2 hover:shadow-3xl transition-all duration-300 relative group"
          >
            <SplashScreen isStandalone={true} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-opacity">
                Buka Layar
              </span>
            </div>
          </div>
        </div>

        {/* Mockup 2: Beranda (Home) */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>2. Beranda (Home)</span>
          </div>
          <div
            onClick={() => onSelectScreen('beranda')}
            className="w-[280px] h-[580px] rounded-[36px] bg-[#506e7b] shadow-2xl overflow-hidden border-4 border-slate-300/80 flex flex-col cursor-pointer transform hover:-translate-y-2 hover:shadow-3xl transition-all duration-300 relative group"
            style={{ backgroundColor: themeStyle.bg }}
          >
            <Navigation activeTab="beranda" onTabChange={(tab) => onSelectScreen(tab)} />
            <div className="flex-1 overflow-y-auto no-scrollbar pointer-events-none">
              <HomeTab
                transactions={transactions}
                onOpenAddModal={onOpenAddModal}
                onEditTransaction={() => {}}
                onDeleteTransaction={() => {}}
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-opacity">
                Gunakan Beranda
              </span>
            </div>
          </div>
        </div>

        {/* Mockup 3: Setelan (Settings) */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>3. Pengaturan (Settings)</span>
          </div>
          <div
            onClick={() => onSelectScreen('setelan')}
            className="w-[280px] h-[580px] rounded-[36px] bg-[#506e7b] shadow-2xl overflow-hidden border-4 border-slate-300/80 flex flex-col cursor-pointer transform hover:-translate-y-2 hover:shadow-3xl transition-all duration-300 relative group"
            style={{ backgroundColor: themeStyle.bg }}
          >
            <Navigation activeTab="setelan" onTabChange={(tab) => onSelectScreen(tab)} />
            <div className="flex-1 overflow-y-auto no-scrollbar pointer-events-none">
              <SettingsTab
                settings={settings}
                onOpenCategoriesModal={() => {}}
                onOpenExportModal={() => {}}
                onOpenPinModal={() => {}}
                onOpenThemeModal={() => {}}
                onOpenAboutModal={() => {}}
                onOpenOtherModal={() => {}}
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-opacity">
                Buka Pengaturan
              </span>
            </div>
          </div>
        </div>

        {/* Mockup 4: Laporan (Report) */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>4. Laporan & Grafik</span>
          </div>
          <div
            onClick={() => onSelectScreen('laporan')}
            className="w-[280px] h-[580px] rounded-[36px] bg-[#506e7b] shadow-2xl overflow-hidden border-4 border-slate-300/80 flex flex-col cursor-pointer transform hover:-translate-y-2 hover:shadow-3xl transition-all duration-300 relative group"
            style={{ backgroundColor: themeStyle.bg }}
          >
            <Navigation activeTab="laporan" onTabChange={(tab) => onSelectScreen(tab)} />
            <div className="flex-1 overflow-y-auto no-scrollbar pointer-events-none">
              <ReportTab transactions={transactions} />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-opacity">
                Buka Laporan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

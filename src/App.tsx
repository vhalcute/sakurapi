/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  getInitialTransactions,
} from './data/initialData';
import {
  ActiveTab,
  AppSettings,
  Category,
  ThemePreset,
  Transaction,
} from './types';
import { Navigation } from './components/Navigation';
import { HomeTab } from './components/HomeTab';
import { ReportTab } from './components/ReportTab';
import { SettingsTab } from './components/SettingsTab';
import { SplashScreen } from './components/SplashScreen';
import { AddTransactionModal } from './components/AddTransactionModal';
import { CategoriesModal } from './components/CategoriesModal';
import { ExportModal } from './components/ExportModal';
import { PinModal } from './components/PinModal';
import { PinLockScreen } from './components/PinLockScreen';
import { ThemeModal } from './components/ThemeModal';
import { AboutModal } from './components/AboutModal';
import { OtherSettingsModal } from './components/OtherSettingsModal';
import { MockupShowcaseView } from './components/MockupShowcaseView';
import {
  Smartphone,
  LayoutGrid,
  Maximize2,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
  Cloud,
  CheckCircle2,
  LogIn,
  User,
  Database,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import {
  auth,
  subscribeUserTransactions,
  subscribeUserCategories,
  subscribeUserSettings,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveSettingsToFirestore,
  syncLocalDataToFirestore,
} from './lib/firebase';
import { FirebaseSyncModal } from './components/FirebaseSyncModal';

const STORAGE_KEYS = {
  TRANSACTIONS: 'catatan_keuangan_txs_v1',
  CATEGORIES: 'catatan_keuangan_cats_v1',
  SETTINGS: 'catatan_keuangan_settings_v1',
};

const THEME_COLORS: Record<ThemePreset, { bg: string; secondary: string }> = {
  slate: { bg: '#506e7b', secondary: '#3d5562' },
  teal: { bg: '#2d6a4f', secondary: '#1b4332' },
  ocean: { bg: '#27527a', secondary: '#1d3e5e' },
  charcoal: { bg: '#374151', secondary: '#1f2937' },
};

export default function App() {
  // Persistence state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialTransactions();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const { user, isFirebaseConnected, logout, isCustomConfig, activeConfig } = useAuth();

  // UI Navigation & View Modes
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [viewMode, setViewMode] = useState<'mobile' | 'showcase' | 'desktop'>('mobile');
  const [isLocked, setIsLocked] = useState<boolean>(() => settings.pinEnabled);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [firebaseModalInitialTab, setFirebaseModalInitialTab] = useState<'google' | 'email' | 'guest' | 'sakurapi'>('google');

  const isRealCloudUser = Boolean(
    auth.currentUser &&
    user &&
    auth.currentUser.uid === user.uid &&
    !user.uid.startsWith('tamu') &&
    !user.uid.startsWith('sakurapi') &&
    user.uid !== 'tamu_lokal' &&
    user.uid !== 'sakurapi_user'
  );

  // Real-time Firestore synchronization when authenticated
  useEffect(() => {
    if (!isRealCloudUser || !user || !auth.currentUser) return;

    // Sync initial local data to Firestore if cloud is empty
    syncLocalDataToFirestore(user.uid, transactions, categories, settings).catch((err) => {
      console.warn('Initial cloud sync notice:', err);
    });

    // Subscribe to transactions
    const unsubTx = subscribeUserTransactions(user.uid, (cloudTxs) => {
      if (cloudTxs.length > 0) {
        setTransactions(cloudTxs);
      }
    });

    // Subscribe to categories
    const unsubCats = subscribeUserCategories(user.uid, (cloudCats) => {
      if (cloudCats.length > 0) {
        setCategories(cloudCats);
      }
    });

    // Subscribe to settings
    const unsubSettings = subscribeUserSettings(user.uid, (cloudSettings) => {
      setSettings(cloudSettings);
    });

    return () => {
      unsubTx();
      unsubCats();
      unsubSettings();
    };
  }, [user, isRealCloudUser]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Transaction Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      const updatedTx: Transaction = {
        ...txData,
        id: editingId,
        createdAt: transactions.find((t) => t.id === editingId)?.createdAt || Date.now(),
      };
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingId ? updatedTx : t))
      );
      if (isRealCloudUser && user) {
        saveTransactionToFirestore(user.uid, updatedTx).catch(console.error);
      }
    } else {
      const newTx: Transaction = {
        ...txData,
        id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      if (isRealCloudUser && user) {
        saveTransactionToFirestore(user.uid, newTx).catch(console.error);
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isRealCloudUser && user) {
      deleteTransactionFromFirestore(user.uid, id).catch(console.error);
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTx(null);
    setIsAddModalOpen(true);
  };

  // Category Handlers
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const cat: Category = {
      ...newCat,
      id: 'cat-' + Date.now(),
    };
    setCategories((prev) => [...prev, cat]);
    if (isRealCloudUser && user) {
      saveCategoryToFirestore(user.uid, cat).catch(console.error);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (isRealCloudUser && user) {
      deleteCategoryFromFirestore(user.uid, id).catch(console.error);
    }
  };

  // Settings Handlers
  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    if (isRealCloudUser && user) {
      saveSettingsToFirestore(user.uid, updated).catch(console.error);
    }
  };

  const handleResetToDemo = () => {
    setTransactions(getInitialTransactions());
    setCategories(DEFAULT_CATEGORIES);
  };

  const handleClearAll = () => {
    setTransactions([]);
  };

  const currentTheme = THEME_COLORS[settings.theme] || THEME_COLORS.slate;

  // If in showcase mode, render the 4-mockup gallery
  if (viewMode === 'showcase') {
    return (
      <div className="min-h-screen flex flex-col bg-[#cbd5db]">
        {/* Top Control Bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Catatan Keuangan</span>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              Mode Mockup Showcase
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('mobile')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4c6674] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#3b535f] transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Kembali ke Mode Ponsel</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </header>

        <MockupShowcaseView
          transactions={transactions}
          settings={settings}
          themeStyle={currentTheme}
          onSelectScreen={(tab) => {
            setActiveTab(tab);
            setViewMode('mobile');
          }}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Global Modals */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTx(null);
          }}
          onSave={handleSaveTransaction}
          categories={categories}
          editingTransaction={editingTx}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Application Control Toolbar */}
      <header className="bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#4c6674] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            CK
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 tracking-tight block leading-none">
              Catatan Keuangan
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Sesuai Desain Mockup Gambar
            </span>
          </div>
          {/* Quick Login / Status Button in Header */}
          <button
            id="btn-header-auth"
            onClick={() => {
              setFirebaseModalInitialTab('google');
              setIsFirebaseModalOpen(true);
            }}
            className={`ml-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border shadow-2xs active:scale-95 ${
              user
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={user ? 'Kelola Akun Cloud Firebase' : 'Buka Menu Masuk (Login)'}
          >
            {user ? (
              <>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-4 h-4 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span className="hidden sm:inline font-bold">
                  {user.displayName ? user.displayName.split(' ')[0] : 'Akun'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold">Masuk / Login</span>
              </>
            )}
          </button>

          {/* Firebase Sakurapi / Database Indicator */}
          <button
            id="btn-header-sakurapi"
            onClick={() => {
              setFirebaseModalInitialTab('sakurapi');
              setIsFirebaseModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border shadow-2xs active:scale-95 ${
              isCustomConfig
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Kelola Koneksi Firebase Sakurapi"
          >
            <Database className={`w-3.5 h-3.5 ${isCustomConfig ? 'text-amber-600' : 'text-[#4c6674]'}`} />
            <span className="truncate max-w-[130px]">
              {isCustomConfig ? `Sakurapi: ${activeConfig?.projectId || 'Kustom'}` : 'Hubungkan Sakurapi'}
            </span>
          </button>
        </div>

        {/* Mode Switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            id="btn-view-mobile"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tampilan Smartphone (Mockup)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ponsel</span>
          </button>

          <button
            id="btn-view-desktop"
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tampilan Responsif Lebar"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layar Penuh</span>
          </button>

          <button
            id="btn-view-showcase"
            onClick={() => setViewMode('showcase')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-teal-800 bg-teal-50 hover:bg-teal-100 transition-all border border-teal-200/60"
            title="Lihat 4 Mockup Berdampingan"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="font-bold">4 Mockup</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Device Wrapper */}
        <div
          className={`transition-all duration-300 w-full ${
            viewMode === 'mobile'
              ? 'max-w-[390px] h-[780px] rounded-[44px] shadow-2xl border-[10px] border-slate-800/90 relative overflow-hidden flex flex-col'
              : 'max-w-2xl min-h-[640px] rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col'
          }`}
          style={{ backgroundColor: currentTheme.bg }}
        >
          {/* Mobile Speaker & Camera Notch (Only in mobile frame) */}
          {viewMode === 'mobile' && (
            <div className="w-full pt-2 flex justify-center z-40 select-none pointer-events-none">
              <div className="h-4 w-32 bg-slate-800/80 rounded-full flex items-center justify-center gap-2 px-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <div className="w-8 h-1 rounded-full bg-slate-700" />
              </div>
            </div>
          )}

          {/* Main App Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* If PIN is locked */}
            {isLocked ? (
              <PinLockScreen
                correctPin={settings.pinCode || '1234'}
                onUnlock={() => setIsLocked(false)}
              />
            ) : activeTab === 'splash' ? (
              <SplashScreen
                onEnterApp={() => setActiveTab('beranda')}
                isStandalone={false}
              />
            ) : (
              <>
                {/* Top Navigation Bar matching Mockup */}
                <Navigation
                  activeTab={activeTab}
                  onTabChange={(tab) => setActiveTab(tab)}
                />

                {/* Tab Views */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {activeTab === 'beranda' && (
                    <HomeTab
                      transactions={transactions}
                      onOpenAddModal={handleOpenAddModal}
                      onEditTransaction={handleEditTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                      onOpenAuthModal={() => {
                        setIsFirebaseModalOpen(true);
                      }}
                    />
                  )}

                  {activeTab === 'laporan' && (
                    <ReportTab transactions={transactions} />
                  )}

                  {activeTab === 'setelan' && (
                    <SettingsTab
                      settings={settings}
                      onOpenCategoriesModal={() => setIsCategoriesModalOpen(true)}
                      onOpenExportModal={() => setIsExportModalOpen(true)}
                      onOpenPinModal={() => setIsPinModalOpen(true)}
                      onOpenThemeModal={() => setIsThemeModalOpen(true)}
                      onOpenAboutModal={() => setIsAboutModalOpen(true)}
                      onOpenOtherModal={() => setIsOtherModalOpen(true)}
                      onOpenFirebaseModal={() => {
                        setFirebaseModalInitialTab('google');
                        setIsFirebaseModalOpen(true);
                      }}
                      onOpenSakurapiModal={() => {
                        setFirebaseModalInitialTab('sakurapi');
                        setIsFirebaseModalOpen(true);
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick Floating Action Button (Only in Beranda tab and when not locked) */}
          {!isLocked && activeTab === 'beranda' && (
            <div className="absolute bottom-5 right-5 z-20">
              <button
                id="btn-fab-tambah"
                onClick={handleOpenAddModal}
                className="w-12 h-12 rounded-full bg-[#3d5562] hover:bg-[#2c404b] text-white shadow-xl flex items-center justify-center active:scale-90 transition-all border-2 border-white/40"
                title="Catat Transaksi Cepat"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Interactive Modals */}
      <FirebaseSyncModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        transactions={transactions}
        categories={categories}
        settings={settings}
        initialTab={firebaseModalInitialTab}
      />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        editingTransaction={editingTx}
      />

      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
      />

      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onTriggerLock={() => setIsLocked(true)}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={settings.theme}
        onSelectTheme={(theme) => handleUpdateSettings({ theme })}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <OtherSettingsModal
        isOpen={isOtherModalOpen}
        onClose={() => setIsOtherModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetToDemoData={handleResetToDemo}
        onClearAllData={handleClearAll}
      />
    </div>
  );
}

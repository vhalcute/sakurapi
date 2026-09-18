import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  LogOut,
  LogIn,
  Database,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
  Copy,
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { syncLocalDataToFirestore, testConnection, FirebaseAppConfig } from '../lib/firebase';
import { AppSettings, Category, Transaction } from '../types';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  initialMode?: 'login' | 'logout' | 'sync';
  initialTab?: 'google' | 'email' | 'guest' | 'sakurapi';
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  settings,
  initialTab,
}) => {
  const {
    user,
    login,
    loginEmail,
    registerEmail,
    loginGuest,
    updateUserProfileName,
    logout,
    isFirebaseConnected,
    authError,
    clearError,
    activeConfig,
    isCustomConfig,
    applyCustomConfig,
    restoreDefaultConfig,
  } = useAuth();

  // Local states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  // Email & auth tab state
  const [authTab, setAuthTab] = useState<'google' | 'email' | 'guest' | 'sakurapi'>(initialTab || 'google');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatusText, setConnectionStatusText] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Sakurapi config state
  const [sakurapiInputMode, setSakurapiInputMode] = useState<'fields' | 'raw'>('fields');
  const [sakurapiProjectId, setSakurapiProjectId] = useState(
    isCustomConfig && activeConfig?.projectId ? activeConfig.projectId : 'sakurapi-8a40e'
  );
  const [sakurapiApiKey, setSakurapiApiKey] = useState(
    isCustomConfig && activeConfig?.apiKey ? activeConfig.apiKey : 'AIzaSyA_em8l2DOUvGrbtqUhRitGuNX2jvg6F7E'
  );
  const [sakurapiAuthDomain, setSakurapiAuthDomain] = useState(
    isCustomConfig && activeConfig?.authDomain ? activeConfig.authDomain : 'sakurapi-8a40e.firebaseapp.com'
  );
  const [sakurapiDatabaseId, setSakurapiDatabaseId] = useState(
    isCustomConfig && activeConfig?.firestoreDatabaseId ? activeConfig.firestoreDatabaseId : '(default)'
  );
  const [customConfigInput, setCustomConfigInput] = useState('');
  const [customConfigStatus, setCustomConfigStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setAuthTab(initialTab);
      clearError();
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await login();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsSubmitting(true);
      await loginGuest();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmailInput('demo@keuangan.id');
    setPasswordInput('demo123456');
    setNameInput('Pengguna Demo');
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;

    try {
      setIsSubmitting(true);
      if (isRegisterMode) {
        await registerEmail(emailInput, passwordInput, nameInput.trim() || 'Pengguna');
      } else {
        await loginEmail(emailInput, passwordInput);
      }
      setEmailInput('');
      setPasswordInput('');
      setNameInput('');
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSync = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      setSyncSuccessMessage(null);
      await syncLocalDataToFirestore(user.uid, transactions, categories, settings);
      setSyncSuccessMessage('Data berhasil disinkronkan ke cloud Firestore!');
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApplySakurapiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomConfigStatus(null);
    const raw = customConfigInput.trim();

    if (!raw) {
      setCustomConfigStatus({
        type: 'error',
        message: 'Harap masukkan konfigurasi Firebase (JSON atau kode sdk) dari proyek sakurapi.',
      });
      return;
    }

    const res = applyCustomConfig(raw);
    if (res.success) {
      setCustomConfigStatus({
        type: 'success',
        message: 'Berhasil! Mengalihkan ke Firebase Sakurapi...',
      });
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      setCustomConfigStatus({
        type: 'error',
        message: res.message,
      });
    }
  };

  const handleApplySakurapiFields = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomConfigStatus(null);
    const cleanProjectId = sakurapiProjectId.trim();
    const cleanApiKey = sakurapiApiKey.trim();

    if (!cleanProjectId) {
      setCustomConfigStatus({
        type: 'error',
        message: 'Project ID Firebase wajib diisi (contoh: sakurapi).',
      });
      return;
    }
    if (!cleanApiKey) {
      setCustomConfigStatus({
        type: 'error',
        message: 'Web API Key Firebase wajib diisi (contoh: AIzaSy...).',
      });
      return;
    }

    const payload: Partial<FirebaseAppConfig> = {
      projectId: cleanProjectId,
      apiKey: cleanApiKey,
      authDomain: sakurapiAuthDomain.trim() || `${cleanProjectId}.firebaseapp.com`,
      firestoreDatabaseId: sakurapiDatabaseId.trim() || '(default)',
      appId: `1:123456789:web:${cleanProjectId}`,
      storageBucket: `${cleanProjectId}.firebasestorage.app`,
    };

    const res = applyCustomConfig(payload);
    if (res.success) {
      setCustomConfigStatus({
        type: 'success',
        message: 'Berhasil! Menghubungkan ke Firebase Sakurapi...',
      });
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      setCustomConfigStatus({
        type: 'error',
        message: res.message,
      });
    }
  };

  const handleFillSakurapiPreset = () => {
    setSakurapiProjectId('sakurapi');
    setSakurapiAuthDomain('sakurapi.firebaseapp.com');
    setSakurapiDatabaseId('(default)');
    setCustomConfigStatus({
      type: 'success',
      message: 'Preset proyek Sakurapi dimuat. Masukkan API Key Anda lalu klik Sambungkan.',
    });
  };

  const handleResetToDefault = () => {
    restoreDefaultConfig();
    setCustomConfigStatus({
      type: 'success',
      message: 'Konfigurasi telah dikembalikan ke Firebase bawaan. Memuat ulang...',
    });
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const isOk = await testConnection();
      if (isOk) {
        setConnectionStatusText('Koneksi ke Firestore aktif & siap!');
      } else {
        setConnectionStatusText('Mode offline lokal (periksa jaringan/izin)');
      }
      setTimeout(() => setConnectionStatusText(null), 4000);
    } catch {
      setConnectionStatusText('Gagal memeriksa status koneksi');
      setTimeout(() => setConnectionStatusText(null), 4000);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleExecuteLogout = async () => {
    try {
      setIsSubmitting(true);
      await logout();
      setConfirmLogout(false);
      onClose();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4c6674] to-[#364c57] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 text-white/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              {user ? <User className="w-6 h-6 text-white" /> : <LogIn className="w-6 h-6 text-white" />}
            </div>
            <div className="min-w-0 pr-4">
              <h2 className="text-base font-bold leading-tight">
                {user ? 'Akun & Profil Pengguna' : 'Menu Masuk (Login)'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-200 font-medium truncate">
                  {isFirebaseConnected
                    ? isCustomConfig
                      ? `Firebase Sakurapi (${activeConfig?.projectId || 'Kustom'})`
                      : 'Cloud Firestore Terhubung'
                    : 'Firebase Siap'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {authError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-start justify-between gap-2 animate-in fade-in">
              <div className="flex items-start gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold text-amber-900 text-xs">Pemberitahuan Akun</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">{authError}</p>
                  {typeof window !== 'undefined' && authError.includes('Authorized') && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.hostname);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2500);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-[10px] font-semibold text-amber-900 hover:bg-amber-100 shadow-2xs transition-colors"
                      >
                        <Copy className="w-3 h-3 text-amber-700" />
                        <span>{copiedDomain ? 'Domain Tersalin!' : `Salin ${window.location.hostname}`}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="text-amber-600 hover:text-amber-800 p-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {syncSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {user ? (
            /* ================= LOGGED IN STATE ================= */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${user.isAnonymous || user.uid.startsWith('tamu') || user.uid.startsWith('sakurapi') ? 'bg-amber-600' : 'bg-[#4c6674]'} text-white flex items-center justify-center font-bold text-base shadow-sm`}>
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5 my-1">
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        placeholder="Nama tampilan Anda..."
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 w-full focus:outline-hidden focus:ring-1 focus:ring-[#4c6674]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (editNameValue.trim()) {
                            await updateUserProfileName(editNameValue.trim());
                          }
                          setIsEditingName(false);
                        }}
                        className="px-2 py-1 bg-[#4c6674] text-white text-[10px] font-bold rounded-lg hover:bg-[#364c57] shrink-0"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] rounded-lg shrink-0"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {user.displayName || (user.isAnonymous ? 'Pengguna Tamu' : 'Pengguna Sakurapi')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditNameValue(user.displayName || '');
                          setIsEditingName(true);
                        }}
                        className="text-[10px] text-[#4c6674] hover:text-[#32454f] font-semibold underline shrink-0"
                      >
                        Ubah Nama
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 truncate">{user.email || 'Sesi Aktif'}</p>
                  <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold ${
                    user.isAnonymous || user.uid.startsWith('tamu') || user.uid.startsWith('sakurapi')
                      ? 'text-emerald-800 bg-emerald-100/80'
                      : 'text-emerald-700 bg-emerald-100/70'
                  } px-2 py-0.5 rounded-full`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {user.isAnonymous || user.uid.startsWith('tamu') || user.uid.startsWith('sakurapi')
                      ? 'Sesi Sakurapi Aktif'
                      : 'Akun Google Terhubung'}
                  </span>
                </div>
              </div>

              {/* Status info box */}
              <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    Penyimpanan Data
                  </span>
                  <span className="font-semibold text-slate-700">
                    {user.isAnonymous || user.uid.startsWith('tamu') || user.uid.startsWith('sakurapi')
                      ? 'Lokal Perangkat (Offline)'
                      : 'Cloud Firestore Privat'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jumlah Transaksi:</span>
                  <span className="font-bold text-slate-800">{transactions.length} item</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status Sinkronisasi:</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user.isAnonymous || user.uid.startsWith('tamu') || user.uid.startsWith('sakurapi')
                      ? 'Tersimpan di Browser'
                      : 'Sinkron Cloud Otomatis'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {user.isAnonymous || user.uid.startsWith('tamu') || user.uid.startsWith('sakurapi') ? (
                  <div className="space-y-2.5">
                    <button
                      id="btn-link-google-account"
                      onClick={handleGoogleLogin}
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{isSubmitting ? 'Menghubungkan...' : 'Hubungkan Akun Google Anda'}</span>
                    </button>

                    {/* Vercel OAuth Domain Setup Guidance */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Globe className="w-3.5 h-3.5 text-[#4c6674]" />
                          <span>Google Sign-In di Vercel</span>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                          Perlu 1x Izin Domain
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Google memblokir login popup jika domain Vercel belum didaftarkan di Firebase Console demi keamanan akun.
                      </p>
                      <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-slate-700 truncate select-all">
                          {typeof window !== 'undefined' ? window.location.hostname : 'sakurapi.vercel.app'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              navigator.clipboard.writeText(window.location.hostname);
                              setCopiedDomain(true);
                              setTimeout(() => setCopiedDomain(false), 2500);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#4c6674] hover:bg-[#364c57] text-white text-[10px] font-bold rounded-lg shrink-0 transition-colors shadow-2xs"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedDomain ? 'Tersalin!' : 'Salin Domain'}</span>
                        </button>
                      </div>

                      <a
                        href={`https://console.firebase.google.com/project/${activeConfig?.projectId || 'sakurapi-8a40e'}/authentication/settings`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Pengaturan Firebase Console</span>
                      </a>

                      <div className="text-[10px] text-slate-500 space-y-1 pt-1.5 border-t border-slate-200/70">
                        <p className="font-semibold text-slate-600">Langkah 1 Menit:</p>
                        <p>1. Klik tombol hijau di atas untuk buka Firebase Console</p>
                        <p>2. Di tab <b>Authorized domains</b>, klik <b>Add domain</b></p>
                        <p>3. Tempel <b>{typeof window !== 'undefined' ? window.location.hostname : 'sakurapi.vercel.app'}</b> & klik Simpan</p>
                      </div>
                    </div>

                    {/* Email login alternative */}
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        setAuthTab('email');
                      }}
                      className="w-full py-2 px-3 text-[11px] text-[#4c6674] hover:text-[#364c57] font-semibold flex items-center justify-center gap-1.5 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Atau Masuk / Buat Akun dengan Email</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="w-full py-2.5 px-4 bg-[#4c6674] hover:bg-[#3d5562] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Ulang Cloud'}</span>
                    </button>

                    <button
                      onClick={handleGoogleLogin}
                      disabled={isSubmitting}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Ganti Akun Google</span>
                    </button>
                  </>
                )}

                {/* Logout Trigger or Confirmation Prompt */}
                {confirmLogout ? (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 animate-in fade-in">
                    <p className="text-xs font-bold text-rose-800 text-center">
                      Konfirmasi Keluar (Logout)?
                    </p>
                    <p className="text-[11px] text-rose-600 text-center leading-relaxed">
                      Catatan keuangan Anda tetap tersimpan aman di perangkat ini.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmLogout(false)}
                        className="flex-1 py-1.5 text-xs font-semibold bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteLogout}
                        disabled={isSubmitting}
                        className="flex-1 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs"
                      >
                        {isSubmitting ? 'Keluar...' : 'Ya, Keluar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id="btn-trigger-logout"
                    onClick={() => setConfirmLogout(true)}
                    className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:border-rose-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{user.uid === 'tamu_lokal' ? 'Keluar Mode Tamu' : 'Keluar Akun (Logout)'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ================= NOT LOGGED IN STATE ================= */
            <div className="space-y-3.5">
              {/* Tabs: Google, Email, Guest, Sakurapi */}
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => { setAuthTab('google'); clearError(); }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    authTab === 'google'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('email'); clearError(); }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    authTab === 'email'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('guest'); clearError(); }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    authTab === 'guest'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Zap className="w-3 h-3 text-emerald-500" />
                  <span>Instan</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('sakurapi'); clearError(); }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    authTab === 'sakurapi'
                      ? 'bg-[#4c6674] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-3 h-3 text-amber-300" />
                  <span>Sakurapi</span>
                </button>
              </div>

              {authTab === 'google' ? (
                /* Google 1-Click Login */
                <div className="space-y-4 text-center py-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Masuk dengan Akun Google
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Satu klik untuk mengaktifkan sinkronisasi cloud Firebase otomatis lintas perangkat.
                    </p>
                  </div>

                  <button
                    id="btn-google-login"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isSubmitting ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
                  </button>

                  <div className="relative flex py-0.5 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-medium uppercase">Atau</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    id="btn-fast-instant-login"
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-[#4c6674] hover:bg-[#3d5562] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>{isSubmitting ? 'Menghubungkan...' : 'Masuk Langsung (Sesi Sakurapi)'}</span>
                  </button>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Privasi & Keamanan:
                    </p>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Data keuangan Anda dienkripsi secara privat dan hanya dapat diakses oleh akun Anda.
                    </p>
                  </div>
                </div>
              ) : authTab === 'guest' ? (
                /* Instant Guest Mode */
                <div className="space-y-4 text-center py-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Mode Instan (Cloud Siap Pakai)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Langsung terhubung ke Cloud Firestore tanpa kata sandi atau whitelist domain Vercel.
                    </p>
                  </div>

                  <button
                    id="btn-guest-login"
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{isSubmitting ? 'Menghubungkan...' : 'Mulai Sekarang (Mode Instan)'}</span>
                  </button>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-left text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Kelebihan Mode Instan:
                    </p>
                    <p className="text-[11px] text-emerald-700 leading-normal">
                      Bebas kendala cross-origin iframe pada domain Vercel. Catatan keuangan langsung tersimpan dan tersinkronisasi ke cloud Firestore.
                    </p>
                  </div>
                </div>
              ) : authTab === 'sakurapi' ? (
                /* Sakurapi Firebase Custom Config Tab */
                <div className="space-y-3 py-1">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold mb-1">
                      <Database className="w-3 h-3 text-amber-600" />
                      <span>Koneksi Firebase Sakurapi</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Hubungkan ke Firebase Sakurapi
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Hubungkan web ini ke proyek Firebase Anda agar seluruh transaksi tersimpan di database Sakurapi.
                    </p>
                  </div>

                  {/* Active project & Connection checker card */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Proyek Aktif:</span>
                      <span className="font-mono font-bold text-slate-800 truncate max-w-[170px]">
                        {activeConfig?.projectId || 'angular-reality-6mn89'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status Database:</span>
                      <span className={`font-semibold ${isCustomConfig ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {isCustomConfig ? '✓ Terhubung ke Sakurapi' : 'Default AI Studio'}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="text-[11px] text-[#4c6674] hover:text-[#3d5562] font-semibold flex items-center gap-1 active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${testingConnection ? 'animate-spin' : ''}`} />
                        <span>{testingConnection ? 'Memeriksa...' : 'Uji Koneksi Firestore'}</span>
                      </button>

                      {connectionStatusText && (
                        <span className="text-[10px] font-medium text-emerald-700 truncate max-w-[170px]">
                          {connectionStatusText}
                        </span>
                      )}
                    </div>
                  </div>

                  {customConfigStatus && (
                    <div
                      className={`p-2.5 text-xs rounded-xl border flex items-center gap-2 ${
                        customConfigStatus.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {customConfigStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="text-[11px] font-medium">{customConfigStatus.message}</span>
                    </div>
                  )}

                  {/* Mode Selector: Form Isian Cepat vs Tempel Kode */}
                  <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSakurapiInputMode('fields')}
                      className={`flex-1 py-1 font-semibold rounded-md transition-all ${
                        sakurapiInputMode === 'fields'
                          ? 'bg-white text-slate-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Form Isian Cepat
                    </button>
                    <button
                      type="button"
                      onClick={() => setSakurapiInputMode('raw')}
                      className={`flex-1 py-1 font-semibold rounded-md transition-all ${
                        sakurapiInputMode === 'raw'
                          ? 'bg-white text-slate-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Tempel Kode / JSON
                    </button>
                  </div>

                  {sakurapiInputMode === 'fields' ? (
                    /* Form Isian Langsung */
                    <form onSubmit={handleApplySakurapiFields} className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-slate-500">Isi data Firebase Sakurapi:</span>
                        <button
                          type="button"
                          onClick={handleFillSakurapiPreset}
                          className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-0.5 hover:underline"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Gunakan Preset Sakurapi</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Project ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={sakurapiProjectId}
                          onChange={(e) => {
                            setSakurapiProjectId(e.target.value);
                            if (sakurapiAuthDomain === 'sakurapi.firebaseapp.com' || !sakurapiAuthDomain) {
                              setSakurapiAuthDomain(`${e.target.value}.firebaseapp.com`);
                            }
                          }}
                          placeholder="sakurapi"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4c6674] bg-slate-50 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Web API Key <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={sakurapiApiKey}
                          onChange={(e) => setSakurapiApiKey(e.target.value)}
                          placeholder="AIzaSyB..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4c6674] bg-slate-50 font-mono"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            Auth Domain
                          </label>
                          <input
                            type="text"
                            value={sakurapiAuthDomain}
                            onChange={(e) => setSakurapiAuthDomain(e.target.value)}
                            placeholder="sakurapi.firebaseapp.com"
                            className="w-full px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4c6674] bg-slate-50 font-mono truncate"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            Database ID
                          </label>
                          <input
                            type="text"
                            value={sakurapiDatabaseId}
                            onChange={(e) => setSakurapiDatabaseId(e.target.value)}
                            placeholder="(default)"
                            className="w-full px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4c6674] bg-slate-50 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 px-3 bg-[#4c6674] hover:bg-[#3d5562] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Hubungkan ke Firebase Sakurapi</span>
                        </button>

                        {isCustomConfig && (
                          <button
                            type="button"
                            onClick={handleResetToDefault}
                            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                            title="Kembalikan ke konfigurasi default AI Studio"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    /* Tempel Kode / JSON SDK */
                    <form onSubmit={handleApplySakurapiConfig} className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tempel Konfigurasi Firebase (JSON atau Kode SDK):
                        </label>
                        <textarea
                          rows={4}
                          value={customConfigInput}
                          onChange={(e) => setCustomConfigInput(e.target.value)}
                          placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "sakurapi",\n  authDomain: "sakurapi.firebaseapp.com",\n};`}
                          className="w-full p-2 text-[10px] font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4c6674] bg-slate-50 leading-tight"
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Bisa disalin langsung dari Firebase Console &gt; Project Settings &gt; General &gt; Your apps.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 px-3 bg-[#4c6674] hover:bg-[#3d5562] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Terapkan & Hubungkan Sakurapi</span>
                        </button>

                        {isCustomConfig && (
                          <button
                            type="button"
                            onClick={handleResetToDefault}
                            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                            title="Kembalikan ke konfigurasi default AI Studio"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Quick helpful link to Firebase Console */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Belum punya Web API Key?</span>
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4c6674] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Buka Firebase Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Email & Password Login / Register */
                <form onSubmit={handleEmailAuthSubmit} className="space-y-3 py-1">
                  <div className="text-center pb-1">
                    <h3 className="text-sm font-bold text-slate-800">
                      {isRegisterMode ? 'Daftar Akun Baru' : 'Masuk dengan Email'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isRegisterMode
                        ? 'Buat akun untuk menyimpan catatan keuangan'
                        : 'Gunakan email dan kata sandi Anda'}
                    </p>
                  </div>

                  {isRegisterMode && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Nama Anda"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4c6674]"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4c6674]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4c6674]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={handleDemoFill}
                      className="text-[10px] text-slate-500 hover:text-[#4c6674] font-medium underline"
                    >
                      Isi Otomatis Akun Demo
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-[#4c6674] hover:bg-[#3d5562] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
                  >
                    <span>
                      {isSubmitting
                        ? 'Memproses...'
                        : isRegisterMode
                        ? 'Daftar Sekarang'
                        : 'Masuk Akun'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(!isRegisterMode)}
                      className="text-[11px] font-semibold text-[#4c6674] hover:underline"
                    >
                      {isRegisterMode
                        ? 'Sudah punya akun? Masuk di sini'
                        : 'Belum punya akun? Daftar gratis'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className="text-slate-500">
              {connectionStatusText || (isFirebaseConnected ? 'Firestore: Terhubung' : 'Firestore: Menghubungkan...')}
            </span>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="text-[10px] text-[#4c6674] hover:underline font-medium ml-1"
            >
              {testingConnection ? 'Memeriksa...' : 'Tes Koneksi'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="font-semibold text-slate-600 hover:text-slate-900"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};


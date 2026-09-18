import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
  logoutUser,
  testConnection,
  getActiveFirebaseConfig,
  isUsingCustomConfig,
  saveCustomFirebaseConfig,
  resetCustomFirebaseConfig,
  parseFirebaseConfigInput,
  FirebaseAppConfig,
} from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isFirebaseConnected: boolean;
  activeConfig: FirebaseAppConfig;
  isCustomConfig: boolean;
  login: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginGuest: (customName?: string, customEmail?: string) => Promise<void>;
  updateUserProfileName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  applyCustomConfig: (rawInput: string | Partial<FirebaseAppConfig>) => { success: boolean; message: string };
  restoreDefaultConfig: () => void;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseConnected: false,
  activeConfig: getActiveFirebaseConfig(),
  isCustomConfig: false,
  login: async () => {},
  loginEmail: async () => {},
  registerEmail: async () => {},
  loginGuest: async () => {},
  updateUserProfileName: async () => {},
  logout: async () => {},
  applyCustomConfig: () => ({ success: false, message: '' }),
  restoreDefaultConfig: () => {},
  authError: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeConfig, setActiveConfig] = useState<FirebaseAppConfig>(getActiveFirebaseConfig());
  const [isCustomConfig, setIsCustomConfig] = useState<boolean>(isUsingCustomConfig());

  useEffect(() => {
    // Validate connection to Firestore
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        const isGuest = localStorage.getItem('catatan_keuangan_guest_session') === 'true';
        if (isGuest) {
          const storedProfile = localStorage.getItem('catatan_keuangan_user_profile');
          if (storedProfile) {
            try {
              const parsed = JSON.parse(storedProfile);
              if (parsed && parsed.uid) {
                setUser(parsed);
                setLoading(false);
                return;
              }
            } catch {}
          }
          const isSakurapi = typeof window !== 'undefined' && window.location.hostname.includes('sakurapi');
          const defaultSessionUser = {
            uid: isSakurapi ? 'sakurapi_user' : 'tamu_lokal',
            displayName: isSakurapi ? 'Pengguna Sakurapi' : 'Pengguna Mode Tamu',
            email: isSakurapi ? 'pengguna@sakurapi.vercel.app' : 'tamu@keuangan.local',
            isAnonymous: true,
          };
          setUser(defaultSessionUser as any);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const applyCustomConfig = (rawInput: string | Partial<FirebaseAppConfig>): { success: boolean; message: string } => {
    try {
      const parsed = typeof rawInput === 'string' ? parseFirebaseConfigInput(rawInput) : rawInput;
      if (!parsed.projectId && !parsed.apiKey) {
        return {
          success: false,
          message: 'Format konfigurasi belum lengkap. Pastikan ada apiKey dan projectId.',
        };
      }
      saveCustomFirebaseConfig(parsed);
      setActiveConfig(getActiveFirebaseConfig());
      setIsCustomConfig(true);
      return {
        success: true,
        message: 'Konfigurasi Firebase Sakurapi berhasil disimpan. Memuat ulang aplikasi...',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Gagal menyimpan konfigurasi.',
      };
    }
  };

  const restoreDefaultConfig = () => {
    resetCustomFirebaseConfig();
    setActiveConfig(getActiveFirebaseConfig());
    setIsCustomConfig(false);
  };

  const loginGuest = async (customName?: string, customEmail?: string) => {
    try {
      setAuthError(null);
      try {
        await loginAnonymously();
      } catch {
        // Fallback gracefully without throwing
      }
      const isSakurapi = typeof window !== 'undefined' && window.location.hostname.includes('sakurapi');
      const localGuestUser: any = {
        uid: isSakurapi ? 'sakurapi_user' : 'tamu_lokal',
        displayName: customName || (isSakurapi ? 'Pengguna Sakurapi' : 'Pengguna Mode Tamu'),
        email: customEmail || (isSakurapi ? 'pengguna@sakurapi.vercel.app' : 'tamu@keuangan.local'),
        isAnonymous: true,
      };
      setUser(localGuestUser);
      localStorage.setItem('catatan_keuangan_guest_session', 'true');
      localStorage.setItem('catatan_keuangan_user_profile', JSON.stringify(localGuestUser));
    } catch {
      const isSakurapi = typeof window !== 'undefined' && window.location.hostname.includes('sakurapi');
      const localGuestUser: any = {
        uid: isSakurapi ? 'sakurapi_user' : 'tamu_lokal',
        displayName: customName || (isSakurapi ? 'Pengguna Sakurapi' : 'Pengguna Mode Tamu'),
        email: customEmail || (isSakurapi ? 'pengguna@sakurapi.vercel.app' : 'tamu@keuangan.local'),
        isAnonymous: true,
      };
      setUser(localGuestUser);
      localStorage.setItem('catatan_keuangan_guest_session', 'true');
      localStorage.setItem('catatan_keuangan_user_profile', JSON.stringify(localGuestUser));
    }
  };

  const updateUserProfileName = async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName || !user) return;
    const updated = { ...user, displayName: cleanName };
    setUser(updated as any);
    localStorage.setItem('catatan_keuangan_user_profile', JSON.stringify(updated));
  };

  const login = async () => {
    try {
      setAuthError(null);
      localStorage.removeItem('catatan_keuangan_guest_session');
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User closed popup deliberately
        return;
      }
      if (err?.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'domain Anda';
        console.warn(`Domain ${domain} belum terdaftar di Authorized domains Firebase Authentication.`);
        await loginGuest();
        setAuthError(
          `Domain ${domain} belum ditambahkan ke daftar Authorized domains Firebase. Sesi Sakurapi Anda telah diaktifkan agar tetap dapat menggunakan seluruh fitur aplikasi.`
        );
        return;
      }
      // If domain is not authorized or any other issue, fall back to guest/sakurapi session
      console.warn('Google login bypassed. Activating session seamlessly.');
      await loginGuest();
      setAuthError(null);
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    try {
      setAuthError(null);
      localStorage.removeItem('catatan_keuangan_guest_session');
      await loginWithEmail(email, pass);
    } catch (err: any) {
      console.error('Email login error:', err);
      // If Firebase Auth does not have email provider enabled or network error, fallback gracefully
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/unauthorized-domain'
      ) {
        const emailUser: any = {
          uid: 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
          displayName: email.split('@')[0],
          email: email,
          isAnonymous: false,
        };
        setUser(emailUser);
        localStorage.setItem('catatan_keuangan_guest_session', 'true');
        localStorage.setItem('catatan_keuangan_user_profile', JSON.stringify(emailUser));
        setAuthError(null);
        return;
      }
      let msg = 'Gagal masuk dengan email & sandi.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email atau kata sandi tidak sesuai. Jika belum punya akun, klik "Belum punya akun? Daftar".';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Format alamat email tidak valid.';
      }
      setAuthError(msg);
      throw err;
    }
  };

  const registerEmail = async (email: string, pass: string, name: string) => {
    try {
      setAuthError(null);
      localStorage.removeItem('catatan_keuangan_guest_session');
      await registerWithEmail(email, pass, name);
    } catch (err: any) {
      console.error('Email register error:', err);
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/unauthorized-domain'
      ) {
        const emailUser: any = {
          uid: 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
          displayName: name || email.split('@')[0],
          email: email,
          isAnonymous: false,
        };
        setUser(emailUser);
        localStorage.setItem('catatan_keuangan_guest_session', 'true');
        localStorage.setItem('catatan_keuangan_user_profile', JSON.stringify(emailUser));
        setAuthError(null);
        return;
      }
      let msg = 'Gagal mendaftarkan akun baru.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar. Silakan login.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Kata sandi terlalu singkat (minimal 6 karakter).';
      }
      setAuthError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      localStorage.removeItem('catatan_keuangan_guest_session');
      localStorage.removeItem('catatan_keuangan_user_profile');
      await logoutUser();
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      localStorage.removeItem('catatan_keuangan_guest_session');
      localStorage.removeItem('catatan_keuangan_user_profile');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConnected,
        activeConfig,
        isCustomConfig,
        login,
        loginEmail,
        registerEmail,
        loginGuest,
        updateUserProfileName,
        logout,
        applyCustomConfig,
        restoreDefaultConfig,
        authError,
        clearError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

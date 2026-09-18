export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  createdAt: number;
}

export type ActiveTab = 'laporan' | 'beranda' | 'setelan' | 'splash';

export type TimePeriod = 'hari_ini' | 'bulan_ini' | 'tahun_ini' | 'semua';

export type ThemePreset = 'slate' | 'teal' | 'ocean' | 'charcoal';

export interface AppThemeConfig {
  id: ThemePreset;
  name: string;
  primary: string; // e.g. #5a7380
  primaryDark: string;
  primaryLight: string;
  accent: string;
  cardBg: string;
}

export interface AppSettings {
  currency: string;
  pinEnabled: boolean;
  pinCode: string;
  theme: ThemePreset;
  userName: string;
}

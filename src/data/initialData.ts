import { Category, Transaction, AppSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Pengeluaran (Expense)
  { id: 'cat-belanja', name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#f59e0b' },
  { id: 'cat-makan', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#ef4444' },
  { id: 'cat-transport', name: 'Transportasi', type: 'expense', icon: 'Car', color: '#3b82f6' },
  { id: 'cat-tagihan', name: 'Tagihan & Listrik', type: 'expense', icon: 'Receipt', color: '#8b5cf6' },
  { id: 'cat-hiburan', name: 'Hiburan', type: 'expense', icon: 'Gamepad2', color: '#ec4899' },
  { id: 'cat-kesehatan', name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
  { id: 'cat-belanja-umum', name: 'Belanja Umum', type: 'expense', icon: 'ShoppingCart', color: '#6366f1' },

  // Pemasukan (Income)
  { id: 'cat-gaji', name: 'Gaji Bulanan', type: 'income', icon: 'Banknote', color: '#10b981' },
  { id: 'cat-bonus', name: 'Uang Bonus', type: 'income', icon: 'Gift', color: '#06b6d4' },
  { id: 'cat-investasi', name: 'Investasi / Dividen', type: 'income', icon: 'TrendingUp', color: '#3b82f6' },
  { id: 'cat-lainnya', name: 'Pemasukan Lainnya', type: 'income', icon: 'Coins', color: '#84cc16' },
];

export const getInitialTransactions = (): Transaction[] => {
  const today = new Date();
  const formatYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];

  const d0 = new Date(today);
  const d1 = new Date(today);
  d1.setDate(d1.getDate() - 1);
  const d3 = new Date(today);
  d3.setDate(d3.getDate() - 3);
  const d5 = new Date(today);
  d5.setDate(d5.getDate() - 5);
  const d8 = new Date(today);
  d8.setDate(d8.getDate() - 8);

  return [
    // Hari ini (matches mockup "Belanja Rp 50.000", "Uang Bonus Rp 100.000")
    {
      id: 'tx-1',
      title: 'Belanja',
      amount: 50000,
      type: 'expense',
      categoryId: 'cat-belanja',
      categoryName: 'Belanja',
      date: formatYYYYMMDD(d0),
      notes: 'Belanja kebutuhan dapur',
      createdAt: d0.getTime() - 3600000,
    },
    {
      id: 'tx-2',
      title: 'Uang Bonus',
      amount: 100000,
      type: 'income',
      categoryId: 'cat-bonus',
      categoryName: 'Uang Bonus',
      date: formatYYYYMMDD(d0),
      notes: 'Bonus insentif harian',
      createdAt: d0.getTime() - 7200000,
    },
    // Kemarin / Hari sebelumnya (matches mockup: 15 MAR / 12 MAR)
    {
      id: 'tx-3',
      title: 'Belanja Umum',
      amount: 50000,
      type: 'expense',
      categoryId: 'cat-belanja-umum',
      categoryName: 'Belanja Umum',
      date: formatYYYYMMDD(d1),
      notes: 'Beli ATK & perlengkapan',
      createdAt: d1.getTime() - 10000000,
    },
    {
      id: 'tx-4',
      title: 'Penjualan Online',
      amount: 150000,
      type: 'income',
      categoryId: 'cat-lainnya',
      categoryName: 'Pemasukan Lainnya',
      date: formatYYYYMMDD(d1),
      notes: 'Hasil jualan thrift',
      createdAt: d1.getTime() - 15000000,
    },
    {
      id: 'tx-5',
      title: 'Makanan & Minuman',
      amount: 50000,
      type: 'expense',
      categoryId: 'cat-makan',
      categoryName: 'Makanan & Minuman',
      date: formatYYYYMMDD(d3),
      notes: 'Makan siang & kopi',
      createdAt: d3.getTime() - 12000000,
    },
    {
      id: 'tx-6',
      title: 'Cashback & Hadiah',
      amount: 20000,
      type: 'income',
      categoryId: 'cat-lainnya',
      categoryName: 'Pemasukan Lainnya',
      date: formatYYYYMMDD(d3),
      notes: 'Cashback dompet digital',
      createdAt: d3.getTime() - 18000000,
    },
    {
      id: 'tx-7',
      title: 'Transportasi Bensin',
      amount: 80000,
      type: 'expense',
      categoryId: 'cat-transport',
      categoryName: 'Transportasi',
      date: formatYYYYMMDD(d5),
      notes: 'Isi bensin motor full tank',
      createdAt: d5.getTime() - 25000000,
    },
    {
      id: 'tx-8',
      title: 'Gaji Pokok',
      amount: 2500000,
      type: 'income',
      categoryId: 'cat-gaji',
      categoryName: 'Gaji Bulanan',
      date: formatYYYYMMDD(d8),
      notes: 'Gaji bulanan',
      createdAt: d8.getTime() - 30000000,
    },
  ];
};

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'IDR',
  pinEnabled: false,
  pinCode: '1234',
  theme: 'slate',
  userName: 'Pengguna',
};

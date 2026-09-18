import { Transaction, TimePeriod } from '../types';

export const formatRupiah = (amount: number): string => {
  const rounded = Math.round(amount);
  return 'Rp ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const NAMA_BULAN_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN',
  'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'
];

export const formatTanggalIndo = (dateStr: string): string => {
  try {
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const date = new Date(year, month, day);
    const hari = NAMA_HARI[date.getDay()];
    const namaBulan = NAMA_BULAN[month];

    return `${hari}, ${day} ${namaBulan} ${year}`;
  } catch {
    return dateStr;
  }
};

export const parseDateParts = (dateStr: string): { day: string; monthShort: string; year: string; hari: string } => {
  try {
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const date = new Date(year, month, day);
    const dayPadded = String(day).padStart(2, '0');
    const monthShort = NAMA_BULAN_SHORT[month] || 'MAR';
    const hari = NAMA_HARI[date.getDay()];

    return {
      day: dayPadded,
      monthShort,
      year: String(year),
      hari,
    };
  } catch {
    return { day: '01', monthShort: 'JAN', year: '2026', hari: 'Senin' };
  }
};

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: TimePeriod,
  referenceDate = new Date()
): Transaction[] => {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  return transactions.filter((tx) => {
    if (!tx.date) return false;
    const [y, m, d] = tx.date.split('-').map(Number);
    if (!y || !m || !d) return false;

    if (period === 'hari_ini') {
      return y === refYear && m - 1 === refMonth && d === refDay;
    }
    if (period === 'bulan_ini') {
      return y === refYear && m - 1 === refMonth;
    }
    if (period === 'tahun_ini') {
      return y === refYear;
    }
    return true; // 'semua'
  });
};

export interface PeriodSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeRatio: number;
  expenseRatio: number;
  avgDailyIncome: number;
  avgDailyExpense: number;
  topExpenseCategory: { name: string; amount: number } | null;
  topIncomeCategory: { name: string; amount: number } | null;
  daysInPeriod: number;
}

export const calculateSummary = (
  transactions: Transaction[],
  period: TimePeriod = 'bulan_ini'
): PeriodSummary => {
  let totalIncome = 0;
  let totalExpense = 0;

  const expenseByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};

  const uniqueDays = new Set<string>();

  transactions.forEach((tx) => {
    uniqueDays.add(tx.date);
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeByCategory[tx.categoryName] = (incomeByCategory[tx.categoryName] || 0) + tx.amount;
    } else {
      totalExpense += tx.amount;
      expenseByCategory[tx.categoryName] = (expenseByCategory[tx.categoryName] || 0) + tx.amount;
    }
  });

  const now = new Date();
  let daysInPeriod = 30;
  if (period === 'hari_ini') {
    daysInPeriod = 1;
  } else if (period === 'bulan_ini') {
    daysInPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  } else if (period === 'tahun_ini') {
    daysInPeriod = 365;
  } else {
    daysInPeriod = Math.max(1, uniqueDays.size);
  }

  const grandTotal = totalIncome + totalExpense;
  const incomeRatio = grandTotal > 0 ? (totalIncome / grandTotal) * 100 : 50;
  const expenseRatio = grandTotal > 0 ? (totalExpense / grandTotal) * 100 : 50;

  // Top expense category
  let topExpenseCategory: { name: string; amount: number } | null = null;
  Object.entries(expenseByCategory).forEach(([name, amount]) => {
    if (!topExpenseCategory || amount > topExpenseCategory.amount) {
      topExpenseCategory = { name, amount };
    }
  });

  // Top income category
  let topIncomeCategory: { name: string; amount: number } | null = null;
  Object.entries(incomeByCategory).forEach(([name, amount]) => {
    if (!topIncomeCategory || amount > topIncomeCategory.amount) {
      topIncomeCategory = { name, amount };
    }
  });

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    incomeRatio,
    expenseRatio,
    avgDailyIncome: Math.round(totalIncome / daysInPeriod),
    avgDailyExpense: Math.round(totalExpense / daysInPeriod),
    topExpenseCategory,
    topIncomeCategory,
    daysInPeriod,
  };
};

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const headers = ['ID', 'Tanggal', 'Tipe', 'Judul', 'Kategori', 'Jumlah (Rp)', 'Catatan'];
  const rows = transactions.map((tx) => [
    tx.id,
    tx.date,
    tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    `"${tx.title.replace(/"/g, '""')}"`,
    `"${tx.categoryName.replace(/"/g, '""')}"`,
    tx.amount,
    `"${(tx.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Catatan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

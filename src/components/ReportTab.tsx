import React, { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, Calendar, PieChart as PieIcon } from 'lucide-react';
import { Transaction, TimePeriod } from '../types';
import { calculateSummary, filterTransactionsByPeriod, formatRupiah } from '../utils/formatters';

interface ReportTabProps {
  transactions: Transaction[];
}

export const ReportTab: React.FC<ReportTabProps> = ({ transactions }) => {
  const [period, setPeriod] = useState<TimePeriod>('bulan_ini');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const filteredTransactions = filterTransactionsByPeriod(transactions, period);
  const summary = calculateSummary(filteredTransactions, period);

  // Format date range text matching mockup "1 April 2021 - 30 April 2021"
  const now = new Date();
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dateRangeText = `1 ${namaBulan[now.getMonth()]} ${now.getFullYear()} - ${lastDay} ${namaBulan[now.getMonth()]} ${now.getFullYear()}`;

  const periodLabels: Record<TimePeriod, string> = {
    hari_ini: 'Hari Ini',
    bulan_ini: 'Bulan Ini',
    tahun_ini: 'Tahun Ini',
    semua: 'Semua',
  };

  // Pie chart calculation
  const totalAmount = summary.totalIncome + summary.totalExpense;
  const incomePercent = totalAmount > 0 ? (summary.totalIncome / totalAmount) * 100 : 50;
  const expensePercent = totalAmount > 0 ? (summary.totalExpense / totalAmount) * 100 : 50;

  // SVG Pie chart arc calculation
  // Radius 45, center 50,50
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const incomeStrokeDash = (incomePercent / 100) * circumference;
  const expenseStrokeDash = circumference - incomeStrokeDash;

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Header Section */}
      <div className="px-5 pt-3 pb-4">
        <div className="flex items-center justify-between mb-1 relative">
          <h1 className="text-xl font-bold text-white tracking-wide">Ringkasan Keuangan</h1>

          {/* Period selector dropdown pill */}
          <div className="relative">
            <button
              id="btn-filter-period"
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all backdrop-blur-md active:scale-95"
            >
              <span>{periodLabels[period]}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isPeriodDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                {(['hari_ini', 'bulan_ini', 'tahun_ini', 'semua'] as TimePeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setIsPeriodDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      period === p
                        ? 'bg-slate-100 text-teal-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date range subtitle */}
        <p className="text-xs text-white/80 font-medium mb-3.5">{dateRangeText}</p>

        {/* Donut / Pie Chart Card */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
          {/* Custom SVG Pie Chart matching mockup */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {totalAmount === 0 ? (
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-white/40 flex items-center justify-center text-[10px] text-white/70">
                Belum ada data
              </div>
            ) : (
              <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background base circle (Expenses) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#cbd5e1" // light grey/slate
                  strokeWidth="20"
                />
                {/* Income slice (White/cream segment) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#ffffff"
                  strokeWidth="20"
                  strokeDasharray={`${incomeStrokeDash} ${circumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-700 ease-out"
                />
                {/* Center hole cutout for donut feel */}
                <circle cx="50" cy="50" r="28" fill="#4c6674" />
              </svg>
            )}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-white/70 font-medium">Saldo</span>
              <span className="text-[11px] font-bold text-white">
                {formatRupiah(summary.balance)}
              </span>
            </div>
          </div>

          {/* Legend matching mockup */}
          <div className="space-y-2.5 flex-1 pl-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-white/90">
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs inline-block" />
                <span className="font-medium">Total Pemasukan</span>
              </div>
              <span className="text-sm font-bold text-white pl-4">
                {formatRupiah(summary.totalIncome)}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-white/90">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-xs inline-block" />
                <span className="font-medium">Total Pengeluaran</span>
              </div>
              <span className="text-sm font-bold text-white pl-4">
                {formatRupiah(summary.totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet - Details & Averages (Matching Mockup 4) */}
      <div className="bg-white rounded-t-[32px] pt-3 px-5 pb-12 shadow-2xl flex-1 border-t border-slate-100/50 space-y-3">
        {/* Handle indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        {/* Card 1: Rata-Rata Harian */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Rata-Rata Harian</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pengeluaran per Hari</span>
              <span className="font-semibold text-slate-800">
                {formatRupiah(summary.avgDailyExpense)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pemasukan per Hari</span>
              <span className="font-semibold text-slate-700">
                {formatRupiah(summary.avgDailyIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Top Kategori Pengeluaran */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Top Kategori Pengeluaran</h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium truncate max-w-[180px]">
              {summary.topExpenseCategory ? summary.topExpenseCategory.name : 'Belum ada data'}
            </span>
            <span className="font-bold text-slate-800">
              {summary.topExpenseCategory
                ? formatRupiah(summary.topExpenseCategory.amount)
                : 'Rp 0'}
            </span>
          </div>
        </div>

        {/* Card 3: Top Kategori Pemasukan */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Top Kategori Pemasukan</h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium truncate max-w-[180px]">
              {summary.topIncomeCategory ? summary.topIncomeCategory.name : 'Belum ada data'}
            </span>
            <span className="font-bold text-slate-800">
              {summary.topIncomeCategory ? formatRupiah(summary.topIncomeCategory.amount) : 'Rp 0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

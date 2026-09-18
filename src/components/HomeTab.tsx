import React, { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, ChevronRight, Trash2, Edit2, Calendar, LogIn, User } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, formatTanggalIndo, parseDateParts } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

interface HomeTabProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAuthModal?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Filter today's transactions
  const todayISO = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((tx) => tx.date === todayISO);

  // Group transactions by date for the "Riwayat Transaksi" section
  const groupedByDate = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) {
      acc[tx.date] = [];
    }
    acc[tx.date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Header Section */}
      <div className="px-5 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Keuangan Hari Ini</h1>
            <p className="text-[11px] text-white/80 font-medium">
              {user ? `Halo, ${user.displayName || 'Pengguna'}` : 'Mode Tamu (Lokal)'}
            </p>
          </div>
          
          <div className="flex items-center gap-1.5">
            {onOpenAuthModal && (
              <button
                id="btn-home-auth"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all active:scale-95"
                title={user ? 'Lihat Akun & Menu Logout' : 'Masuk Akun (Login)'}
              >
                {user ? (
                  <>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User"
                        className="w-3.5 h-3.5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </>
                )}
              </button>
            )}

            <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
              {todayTransactions.length} Catatan
            </span>
          </div>
        </div>

        {/* Card Keuangan Hari Ini (Directly matching mockup 2) */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              {formatTanggalIndo(todayISO)}
            </span>
          </div>

          <div className="py-2.5 space-y-2 min-h-[58px]">
            {todayTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Belum ada transaksi hari ini
              </p>
            ) : (
              todayTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
                  onClick={() => setSelectedTxId(selectedTxId === tx.id ? null : tx.id)}
                >
                  <span className="text-slate-700 font-medium truncate max-w-[170px]">
                    {tx.title}
                  </span>
                  <span
                    className={`font-semibold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {formatRupiah(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 flex justify-end border-t border-slate-100">
            <button
              id="btn-tambah-transaksi"
              onClick={onOpenAddModal}
              className="px-4 py-1.5 bg-[#4c6674] hover:bg-[#3d5562] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi (White bottom card with handle) */}
      <div className="bg-white rounded-t-[32px] pt-3 px-5 pb-12 shadow-2xl flex-1 border-t border-slate-100/50">
        {/* Handle indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Riwayat Transaksi</h2>
          <span className="text-xs text-slate-500 font-medium">
            {sortedDates.length} Hari tercatat
          </span>
        </div>

        {/* Date groups */}
        <div className="space-y-3 pb-8">
          {sortedDates.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">Belum ada riwayat transaksi</p>
              <button
                onClick={onOpenAddModal}
                className="mt-3 text-xs text-teal-700 font-medium hover:underline"
              >
                + Tambah transaksi pertama
              </button>
            </div>
          ) : (
            sortedDates.map((dateStr) => {
              const dayTxs = groupedByDate[dateStr];
              const { day, monthShort } = parseDateParts(dateStr);

              // Calculate total income and expense for this date
              let totalExp = 0;
              let totalInc = 0;
              dayTxs.forEach((t) => {
                if (t.type === 'expense') totalExp += t.amount;
                else totalInc += t.amount;
              });

              const net = totalInc - totalExp;
              const isPositive = net >= 0;

              return (
                <div
                  key={dateStr}
                  className="border border-slate-200/90 rounded-2xl p-3.5 hover:border-slate-300 transition-all bg-white shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Day & Month */}
                    <div className="flex items-center pr-3 border-r border-slate-200 min-w-[56px] text-center justify-center">
                      <div>
                        <div className="text-xl font-extrabold text-slate-800 leading-none">
                          {day}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 tracking-wider mt-0.5">
                          {monthShort}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Pengeluaran & Pemasukan summary */}
                    <div className="flex-1 px-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Pengeluaran</span>
                        <span className="font-semibold text-slate-800">
                          {formatRupiah(totalExp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Pemasukan</span>
                        <span className="font-semibold text-slate-700">
                          {formatRupiah(totalInc)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Trend Arrow icon matching mockup */}
                    <div className="pl-2 flex flex-col items-center justify-center">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isPositive ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'
                        }`}
                        title={isPositive ? 'Surplus harian' : 'Defisit harian'}
                      >
                        {isPositive ? (
                          <div className="flex flex-col items-center">
                            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <ArrowDown className="w-5 h-5 stroke-[2.5]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Individual sub-items list */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    {dayTxs.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-medium text-slate-700 truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-400">({item.categoryName})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              item.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                            }`}
                          >
                            {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                          </span>

                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => onEditTransaction(item)}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="Edit transaksi"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Hapus transaksi"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

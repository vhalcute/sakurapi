import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Printer, Check, Copy } from 'lucide-react';
import { Transaction } from '../types';
import { exportTransactionsToCSV, formatRupiah, formatTanggalIndo } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Catatan_Keuangan_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    let text = `=== RINGKASAN CATATAN KEUANGAN ===\n`;
    text += `Tanggal Ekspor: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}\n`;
    text += `Jumlah Transaksi: ${transactions.length}\n\n`;

    let totalInc = 0;
    let totalExp = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') totalInc += t.amount;
      else totalExp += t.amount;
      text += `[${t.date}] ${t.title} (${t.categoryName}): ${t.type === 'income' ? '+' : '-'}${formatRupiah(t.amount)}\n`;
    });

    text += `\nTotal Pemasukan: ${formatRupiah(totalInc)}\n`;
    text += `Total Pengeluaran: ${formatRupiah(totalExp)}\n`;
    text += `Saldo Bersih: ${formatRupiah(totalInc - totalExp)}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-800">Export Data Keuangan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-3 mb-4">
          Unduh rekaman transaksi keuangan Anda untuk arsip pembukuan pribadi atau dibuka di Excel / Google Sheets.
        </p>

        <div className="space-y-2.5">
          {/* CSV Download */}
          <button
            onClick={handleDownloadCSV}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                CSV
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Unduh Format CSV (Excel)</span>
                <span className="text-[11px] text-slate-400">Cocok untuk spreadsheet</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* JSON Download */}
          <button
            onClick={handleDownloadJSON}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                JSON
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Cadangan Lengkap (JSON)</span>
                <span className="text-[11px] text-slate-400">Untuk backup dan restore data</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* Copy Summary */}
          <button
            onClick={handleCopySummary}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                TXT
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Salin Ringkasan Teks</span>
                <span className="text-[11px] text-slate-400">Salin ke clipboard untuk WA / Notes</span>
              </div>
            </div>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            )}
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

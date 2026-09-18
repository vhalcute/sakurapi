import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag, FileText } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types';
import { formatRupiah } from '../utils/formatters';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  categories: Category[];
  editingTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(50000);
  const [amountInput, setAmountInput] = useState<string>('50000');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Synchronize when opening or when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount);
      setAmountInput(String(editingTransaction.amount));
      setTitle(editingTransaction.title);
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || '');
    } else {
      // Default to expense
      setType('expense');
      setAmount(50000);
      setAmountInput('50000');
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');

      // Default category for current type
      const firstCat = categories.find((c) => c.type === 'expense');
      if (firstCat) setCategoryId(firstCat.id);
    }
  }, [editingTransaction, isOpen, categories]);

  // When type changes, ensure valid category is selected
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCategory = categories.find((c) => c.type === newType);
    if (validCategory) {
      setCategoryId(validCategory.id);
    }
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setAmount(num);
    setAmountInput(raw);
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val);
    setAmountInput(String(val));
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : 'Umum';

    onSave(
      {
        title: title.trim() || (type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
        amount,
        type,
        categoryId: categoryId || 'cat-general',
        categoryName,
        date,
        notes: notes.trim(),
      },
      editingTransaction ? editingTransaction.id : undefined
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {editingTransaction ? 'Edit Transaksi' : 'Catat Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Income / Expense Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="btn-type-expense"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              id="btn-type-income"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount Display & Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nominal (Rupiah)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">Rp</span>
              <input
                type="text"
                value={amount ? amount.toLocaleString('id-ID') : ''}
                onChange={handleAmountInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                autoFocus
                required
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[20000, 50000, 100000, 250000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
                >
                  +{formatRupiah(val).replace('Rp ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Judul / Keterangan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'Contoh: Belanja Pasar' : 'Contoh: Uang Bonus'}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-600"
              required
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Kategori</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2 rounded-xl text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                    categoryId === cat.id
                      ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Tanggal</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-600"
              required
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Catatan Tambahan (Opsional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan kecil..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-simpan-transaksi"
              className="w-full py-2.5 bg-[#4c6674] hover:bg-[#3d5562] active:scale-98 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Simpan Perubahan' : 'Tambah Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

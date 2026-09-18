import React, { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { Category, TransactionType } from '../types';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
];

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === activeType);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      name: newCatName.trim(),
      type: activeType,
      icon: 'Tag',
      color: selectedColor,
    });

    setNewCatName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-800">Edit Kategori</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type tabs */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveType('expense')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeType === 'expense'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengeluaran ({categories.filter((c) => c.type === 'expense').length})
          </button>
          <button
            onClick={() => setActiveType('income')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeType === 'income'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemasukan ({categories.filter((c) => c.type === 'income').length})
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto my-3 space-y-2 pr-1 max-h-[300px]">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-xs"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-medium text-slate-800">{cat.name}</span>
              </div>
              <button
                onClick={() => onDeleteCategory(cat.id)}
                className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                title="Hapus kategori"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Category Form / Button */}
        {isAdding ? (
          <form onSubmit={handleCreate} className="pt-2 border-t border-slate-100 space-y-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nama Kategori baru..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-600"
              autoFocus
              required
            />
            {/* Color picker */}
            <div>
              <span className="block text-[11px] text-slate-500 font-semibold mb-1">
                Pilih Warna
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === col ? 'scale-125 ring-2 ring-slate-800 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#4c6674] hover:bg-[#3b535f] rounded-xl transition-colors shadow-sm"
              >
                Simpan
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        )}
      </div>
    </div>
  );
};

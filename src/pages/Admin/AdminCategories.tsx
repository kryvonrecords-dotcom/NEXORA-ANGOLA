import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit, Trash2, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../services/api';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminCategories({ onNavigate }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#CE1126');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Categorias Editoriais | Nexora Admin';
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('#CE1126');
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || '#CE1126');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          color
        });
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        await api.createCategory({
          name: name.trim(),
          description: description.trim(),
          color
        });
        setSuccess('Categoria criada com sucesso!');
      }
      setModalOpen(false);
      loadCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem a certeza de que deseja eliminar a categoria "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      setSuccess('Categoria eliminada com sucesso!');
      loadCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Não é possível eliminar a categoria.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            Categorias & Editorias
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize as seções temáticas do portal (ex: Angola, Economia, Tecnologia, Desporto).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-emerald-700">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#CE1126]" />
            <p className="text-sm">A carregar categorias...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-2xs"
                        style={{ backgroundColor: cat.color || '#CE1126' }}
                      ></div>
                      <span className="font-bold text-slate-900 text-base">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">
                      /{cat.slug}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {cat.description || 'Sem descrição cadastrada para esta categoria.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200/80">
                  <span className="text-xs text-slate-400">
                    ID: <code className="text-[11px]">{cat.id}</code>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-slate-500 hover:text-[#CE1126] rounded-lg hover:bg-white transition-colors"
                      title="Editar Categoria"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                      title="Eliminar Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 font-serif mb-4">
              {editingCategory ? 'Editar Categoria' : 'Criar Nova Categoria'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Política, Sociedade, Opinião..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição / Linha Editorial
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Reportagens e análises sobre o cenário..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cor Temática
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-12 h-10 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600">{color}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#CE1126] text-white text-xs font-bold rounded-xl hover:bg-[#A50D1F] shadow-md flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingCategory ? 'Gravar Alterações' : 'Criar Categoria'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

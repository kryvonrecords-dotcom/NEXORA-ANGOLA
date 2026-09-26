import React, { useEffect, useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Flame, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Filter,
  Eye
} from 'lucide-react';
import { Category, NewsItem } from '../../types';
import { api } from '../../services/api';
import { formatDate, formatTimeAgo } from '../../lib/utils';
import { getNewsImageUrl, handleImageError } from '../../utils/imageUtils';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminNewsList({ onNavigate }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deleteModalItem, setDeleteModalItem] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [newsRes, catsRes] = await Promise.all([
        api.getAdminNews({
          search: search || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          limit: 100
        }),
        api.getCategories()
      ]);
      setNews(newsRes.news || []);
      setCategories(catsRes || []);
    } catch (err) {
      console.error('Error loading news list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Gerenciar Notícias | Nexora Admin';
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleBreaking = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleBreaking(id);
      setNews(prev => prev.map(item => item.id === id ? res.news : item));
    } catch (err) {
      console.error('Failed to toggle breaking:', err);
    }
  };

  const handleToggleHero = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleHero(id);
      setNews(prev => prev.map(item => item.id === id ? res.news : item));
    } catch (err) {
      console.error('Failed to toggle hero:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);
    try {
      await api.deleteNews(deleteModalItem.id);
      setNews(prev => prev.filter(item => item.id !== deleteModalItem.id));
      setDeleteModalItem(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            Gestão de Notícias
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publique, edite rascunhos, agende matérias ou altere destaques.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/admin/noticias/nova')}
          className="px-4 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Escrever Notícia</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por título ou palavra-chave..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
          />
        </form>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filtrar por status"
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
        >
          <option value="">Todos os Estados</option>
          <option value="published">Publicadas</option>
          <option value="draft">Rascunhos</option>
          <option value="scheduled">Agendadas</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          aria-label="Filtrar por categoria"
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
        >
          <option value="">Todas as Categorias</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* News Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#CE1126]" />
            <p className="text-sm">A carregar notícias...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="font-bold text-slate-800 text-base">Nenhuma notícia encontrada</p>
            <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros de pesquisa ou crie uma nova publicação.</p>
            <button
              onClick={() => onNavigate('/admin/noticias/nova')}
              className="mt-4 px-4 py-2 bg-[#CE1126] text-white text-xs font-bold rounded-xl"
            >
              Criar Primeira Notícia
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Notícia</th>
                  <th className="py-3 px-3 hidden md:table-cell">Categoria</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Destaques</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Leituras</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Data</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {news.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title & Image */}
                    <td className="py-3 px-4 min-w-[240px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={getNewsImageUrl(item.featuredImage, item.categoryName, item.title)}
                          alt={item.title}
                          onError={e => handleImageError(e, item.categoryName, item.title)}
                          className="w-12 h-12 object-cover rounded-lg shrink-0 bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 
                            onClick={() => onNavigate(`/admin/noticias/editar/${item.id}`)}
                            className="font-bold text-slate-900 hover:text-[#CE1126] cursor-pointer line-clamp-1 text-xs sm:text-sm"
                          >
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 block md:hidden">
                            {item.categoryName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Por: {item.authorName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 hidden md:table-cell">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                        {item.categoryName}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {item.status === 'published' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md">
                          <CheckCircle className="w-3 h-3" /> Publicada
                        </span>
                      )}
                      {item.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-md">
                          <Clock className="w-3 h-3" /> Rascunho
                        </span>
                      )}
                      {item.status === 'scheduled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-md">
                          <Clock className="w-3 h-3" /> Agendada
                        </span>
                      )}
                    </td>

                    {/* Fast Toggles */}
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => handleToggleBreaking(item.id, e)}
                          className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                            item.isBreaking
                              ? 'bg-rose-50 border-rose-200 text-rose-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Alternar Notícia Urgente"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Urgente</span>
                        </button>

                        <button
                          onClick={e => handleToggleHero(item.id, e)}
                          className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                            item.isHero
                              ? 'bg-amber-50 border-amber-200 text-amber-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Alternar Destaque Principal"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Hero</span>
                        </button>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="py-3 px-3 hidden sm:table-cell text-slate-600 font-semibold text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.views.toLocaleString('pt-PT')}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 hidden sm:table-cell text-slate-500 text-xs">
                      {formatDate(item.publishedAt || item.createdAt)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate(`/noticia/${item.slug}`)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                          title="Ver artigo público"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onNavigate(`/admin/noticias/editar/${item.id}`)}
                          className="p-1.5 text-[#CE1126] hover:bg-blue-50 rounded-lg"
                          title="Editar artigo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteModalItem(item)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="Apagar artigo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Eliminar Notícia Definitivamente?
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Tem a certeza de que deseja apagar a notícia <strong>"{deleteModalItem.title}"</strong>? Esta ação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Eliminar Notícia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Eye, 
  PlusCircle, 
  Clock, 
  Layers, 
  Users, 
  Flame, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  ExternalLink,
  Edit,
  Loader2,
  Calendar,
  Trash2,
  Megaphone,
  Briefcase
} from 'lucide-react';
import { AdminStats } from '../../types';
import { api } from '../../services/api';
import { formatDate } from '../../lib/utils';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminDashboard({ onNavigate }: Props) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalItem, setDeleteModalItem] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStats = () => {
    setLoading(true);
    api.getAdminDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Dashboard Administrativo | Nexora Angola';
    loadStats();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);
    try {
      await api.deleteNews(deleteModalItem.id);
      setDeleteModalItem(null);
      loadStats();
    } catch (err) {
      console.error('Failed to delete news:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mb-2" />
        <p className="text-sm text-slate-500 font-medium">A carregar métricas editoriais...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total de Notícias', value: stats.totalNews, icon: FileText, color: 'text-[#A50D1F]', bg: 'bg-blue-50' },
    { label: 'Publicadas', value: stats.publishedNews, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Propostas Comerciais', value: stats.pendingProposalsCount !== undefined ? `${stats.pendingProposalsCount} Pendentes` : `${stats.totalProposalsCount || 0}`, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50', isLink: true, link: '/admin/propostas' },
    { label: 'Rascunhos', value: stats.draftNews, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Visualizações', value: stats.totalViews.toLocaleString('pt-PT'), icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Categorias Ativas', value: stats.totalCategories, icon: Layers, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#000000] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#CE1126] uppercase tracking-widest block mb-1">
            Painel Editorial
          </span>
          <h1 className="text-2xl font-black font-serif">
            Gestão do Portal Nexora Angola
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Publique, edite notícias em tempo real e acompanhe as métricas de leitura.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/admin/propostas')}
            className="px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm rounded-xl transition-all border border-amber-400/30 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Propostas Comerciais ({stats.pendingProposalsCount || 0})</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/publicidades')}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-white" />
            <span>Publicidades</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/noticias/nova')}
            className="px-5 py-3 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Notícia</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              onClick={() => card.isLink && card.link && onNavigate(card.link)}
              className={`bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs transition-all ${
                card.isLink ? 'cursor-pointer hover:border-amber-300 hover:shadow-md' : ''
              }`}
            >
              <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} w-fit mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {card.value}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1.5 truncate">
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main split: Top Viewed & Categories Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top News (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#CE1126]" />
              <h2 className="font-bold text-slate-900 text-base">Notícias Mais Lidas</h2>
            </div>
            <button
              onClick={() => onNavigate('/admin/noticias')}
              className="text-xs font-semibold text-[#CE1126] hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.topNews.map((item, idx) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-black text-sm text-slate-400 w-5">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-[#CE1126] transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {item.categoryName} • {item.views.toLocaleString('pt-PT')} visualizações
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onNavigate(`/admin/noticias/editar/${item.id}`)}
                    className="p-1.5 text-slate-400 hover:text-[#CE1126] rounded-lg hover:bg-slate-50 transition-colors"
                    title="Editar Notícia"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate(`/noticia/${item.slug}`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Ver no site"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteModalItem({ id: item.id, title: item.title })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Apagar Notícia"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#CE1126]" />
              <h2 className="font-bold text-slate-900 text-base">Notícias por Categoria</h2>
            </div>
            <button
              onClick={() => onNavigate('/admin/categorias')}
              className="text-xs font-semibold text-[#CE1126] hover:underline"
            >
              Gerenciar
            </button>
          </div>

          <div className="space-y-3">
            {stats.categoryDistribution.map(cat => {
              const percentage = stats.totalNews > 0 ? Math.round((cat.count / stats.totalNews) * 100) : 0;
              return (
                <div key={cat.categoryName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.categoryName}</span>
                    <span className="text-slate-400 font-semibold">{cat.count} artigos ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: cat.color || '#CE1126'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
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

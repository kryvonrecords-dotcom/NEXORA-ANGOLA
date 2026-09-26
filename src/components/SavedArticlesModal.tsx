import React from 'react';
import { Bookmark, X, Trash2, BookOpen, Clock, Sparkles } from 'lucide-react';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { getNewsImageUrl, handleImageError } from '../utils/imageUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function SavedArticlesModal({ isOpen, onClose, onNavigate }: Props) {
  const { savedArticles, removeArticle, clearAllSaved } = useSavedArticles();

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeArticle(id);
  };

  const handleClearAll = () => {
    if (window.confirm('Deseja remover todas as notícias salvas no aplicativo?')) {
      clearAllSaved();
    }
  };

  const handleOpenArticle = (slug: string) => {
    onClose();
    onNavigate(`/noticia/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-slideUp sm:animate-fadeIn overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CE1126]/10 text-[#CE1126]">
              <Bookmark className="w-5 h-5 fill-[#CE1126]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Notícias Guardadas no App</h3>
              <p className="text-xs text-slate-500">{savedArticles.length} artigos salvos para leitura offline</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {savedArticles.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                title="Limpar todas as notícias"
              >
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {savedArticles.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#CE1126] flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Nenhum artigo salvo ainda</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                Toque no ícone de marcador em qualquer notícia para guardar e ler a qualquer hora no aplicativo.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#CE1126] text-white text-xs font-bold rounded-xl shadow hover:bg-[#A50D1F] transition-all"
              >
                Explorar Notícias
              </button>
            </div>
          ) : (
            savedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => handleOpenArticle(article.slug)}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-all"
              >
                <img
                  src={getNewsImageUrl(article.featuredImage || (article as any).imageUrl, article.categoryName, article.title)}
                  alt={article.title}
                  onError={e => handleImageError(e, article.categoryName, article.title)}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#CE1126] uppercase tracking-wider">
                      {article.categoryName || (article as any).category || 'Geral'}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-[#CE1126] transition-colors leading-snug">
                    {article.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleRemove(article.id, e)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remover dos salvos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Notícias salvas ficam disponíveis offline na memória do seu dispositivo
        </div>
      </div>
    </div>
  );
}

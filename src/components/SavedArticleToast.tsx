import React from 'react';
import { Bookmark, Check, Trash2, X } from 'lucide-react';
import { useSavedArticles } from '../context/SavedArticlesContext';

export function SavedArticleToast() {
  const { lastFeedback, dismissFeedback } = useSavedArticles();

  if (!lastFeedback) return null;

  const isSaved = lastFeedback.type === 'saved';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border text-white transition-all ${
          isSaved
            ? 'bg-[#000000]/95 border-[#CE1126]/50 ring-1 ring-[#CE1126]/30'
            : 'bg-slate-900/95 border-rose-500/40 ring-1 ring-rose-500/30'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isSaved ? 'bg-[#CE1126] text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {isSaved ? <Bookmark className="w-4 h-4 fill-white" /> : <Trash2 className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-100 line-clamp-1">
              {isSaved ? 'Artigo Salvo' : 'Artigo Removido'}
            </p>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              {lastFeedback.message}
            </p>
          </div>
        </div>

        <button
          onClick={dismissFeedback}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
          title="Fechar"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

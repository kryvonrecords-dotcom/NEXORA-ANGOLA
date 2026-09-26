import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight, X, Flame } from 'lucide-react';
import { NewsItem } from '../types';
import { api } from '../services/api';

interface Props {
  breakingNews?: NewsItem | null;
  customText?: string;
  onNavigate: (path: string) => void;
}

export function BreakingNewsBanner({ breakingNews, customText, onNavigate }: Props) {
  const [data, setData] = useState<{
    enabled: boolean;
    customText?: string;
    customUrl?: string;
    breakingItems: NewsItem[];
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.getBreakingNews().then(res => {
      setData(res);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const items = breakingNews ? [breakingNews] : data?.breakingItems;
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [data, breakingNews]);

  const isBannerActive = (data?.enabled ?? true) || Boolean(breakingNews) || Boolean(customText);
  if (dismissed || !isBannerActive) return null;

  const items = breakingNews ? [breakingNews] : (data?.breakingItems || []);
  const currentItem = items.length > 0 ? items[currentIndex % items.length] : null;
  const displayText = currentItem ? currentItem.title : (customText || data?.customText);
  const displayUrl = currentItem ? `/noticia/${currentItem.slug}` : (data?.customUrl || '#');

  if (!displayText) return null;

  return (
    <aside aria-label="Notícia Urgente" className="bg-[#000000] text-white border-b border-red-500/30 overflow-hidden shadow-md relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E53935] text-white text-xs font-black uppercase tracking-wider rounded-md shrink-0 animate-pulse">
            <Flame className="w-3.5 h-3.5" />
            <span>URGENTE</span>
          </div>

          <div 
            onClick={() => onNavigate(displayUrl)}
            className="truncate font-medium text-slate-100 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5 group"
          >
            <span className="truncate">{displayText}</span>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </div>

        {items && items.length > 1 && (
          <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{items.length}</span>
          </div>
        )}

        <button 
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
          title="Fechar alerta"
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

import React from 'react';
import { TrendingUp, Eye } from 'lucide-react';
import { NewsItem } from '../types';

interface Props {
  news: NewsItem[];
  onNavigate: (path: string) => void;
}

export function MostReadSidebar({ news, onNavigate }: Props) {
  if (!news || news.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="w-2.5 h-2.5 rounded-full bg-[#CE1126]"></div>
        <h3 className="text-base font-black text-[#000000] uppercase tracking-wide">
          Mais Lidas
        </h3>
      </div>

      <div className="space-y-4">
        {news.slice(0, 5).map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onNavigate(`/noticia/${item.slug}`)}
            className="group flex items-start gap-3.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0 cursor-pointer"
          >
            <span className="text-2xl font-black text-slate-300 group-hover:text-[#CE1126] transition-colors leading-none shrink-0 w-7">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#CE1126] uppercase tracking-wider block mb-0.5">
                {item.categoryName}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#CE1126] transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <span>{item.readTimeMinutes} min de leitura</span>
                {item.views > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {item.views.toLocaleString('pt-PT')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

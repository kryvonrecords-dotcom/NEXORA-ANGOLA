import React from 'react';
import { Flame, Clock, Eye, ChevronRight, TrendingUp } from 'lucide-react';
import { NewsItem } from '../types';
import { formatTimeAgo } from '../lib/utils';
import { getNewsImageUrl, handleImageError } from '../utils/imageUtils';

interface Props {
  leadNews?: NewsItem;
  secondaryNews: NewsItem[];
  trendingNews: NewsItem[];
  onNavigate: (path: string) => void;
}

export function HeroSection({ leadNews, secondaryNews, trendingNews, onNavigate }: Props) {
  if (!leadNews) return null;

  return (
    <section aria-label="Destaques Principais" className="mb-10 sm:mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* MAIN LEAD ARTICLE (Left 7 Columns) */}
        <div 
          onClick={() => onNavigate(`/noticia/${leadNews.slug}`)}
          className="lg:col-span-7 group relative rounded-2xl overflow-hidden bg-[#000000] cursor-pointer shadow-lg flex flex-col justify-end min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]"
        >
          {/* Background Image with Dark Vignette */}
          <img
            src={getNewsImageUrl(leadNews.featuredImage, leadNews.categoryName, leadNews.title)}
            alt={leadNews.title}
            onError={e => handleImageError(e, leadNews.categoryName, leadNews.title)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/50 to-transparent"></div>

          {/* Lead Content */}
          <div className="relative p-6 sm:p-8 z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#CE1126] text-white text-xs font-black uppercase tracking-wider rounded-md">
                {leadNews.categoryName}
              </span>
              {leadNews.isBreaking && (
                <span className="px-2.5 py-1 bg-[#E53935] text-white text-xs font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                  <Flame className="w-3 h-3" /> URGENTE
                </span>
              )}
              <span className="text-xs text-slate-300 ml-auto hidden sm:inline">
                {formatTimeAgo(leadNews.publishedAt)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight group-hover:text-[#F9D616] transition-colors font-serif">
              {leadNews.title}
            </h1>

            <p className="text-xs sm:text-sm text-white line-clamp-2 sm:line-clamp-3 mt-3 leading-relaxed max-w-2xl font-medium">
              {leadNews.excerpt}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-300 mt-4 pt-3 border-t border-slate-700/50">
              <span className="font-semibold text-white">{leadNews.authorName}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{leadNews.readTimeMinutes} min de leitura</span>
              </div>
              {leadNews.views > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{leadNews.views.toLocaleString('pt-PT')} leituras</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECONDARY STORIES & TRENDING (Right 5 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Secondary Lead Story 1 */}
            {secondaryNews[0] && (
              <div
                onClick={() => onNavigate(`/noticia/${secondaryNews[0].slug}`)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={getNewsImageUrl(secondaryNews[0].featuredImage, secondaryNews[0].categoryName, secondaryNews[0].title)}
                    alt={secondaryNews[0].title}
                    onError={e => handleImageError(e, secondaryNews[0].categoryName, secondaryNews[0].title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 bg-[#000000]/85 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                      {secondaryNews[0].categoryName}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#CE1126] transition-colors line-clamp-2 leading-snug">
                      {secondaryNews[0].title}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>{formatTimeAgo(secondaryNews[0].publishedAt)}</span>
                    <span>{secondaryNews[0].readTimeMinutes} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Lead Story 2 */}
            {secondaryNews[1] && (
              <div
                onClick={() => onNavigate(`/noticia/${secondaryNews[1].slug}`)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={getNewsImageUrl(secondaryNews[1].featuredImage, secondaryNews[1].categoryName, secondaryNews[1].title)}
                    alt={secondaryNews[1].title}
                    onError={e => handleImageError(e, secondaryNews[1].categoryName, secondaryNews[1].title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 bg-[#000000]/85 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                      {secondaryNews[1].categoryName}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#CE1126] transition-colors line-clamp-2 leading-snug">
                      {secondaryNews[1].title}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>{formatTimeAgo(secondaryNews[1].publishedAt)}</span>
                    <span>{secondaryNews[1].readTimeMinutes} min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TRENDING BAR */}
          {trendingNews.length > 0 && (
            <div className="bg-[#F5F7FA] rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-[#000000] uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4 text-[#CE1126]" />
                <span>Em Destaque Agora</span>
              </div>
              <div className="divide-y divide-slate-200">
                {trendingNews.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(`/noticia/${item.slug}`)}
                    className="py-2 first:pt-0 last:pb-0 flex items-start gap-2.5 cursor-pointer group"
                  >
                    <span className="text-sm font-black text-[#CE1126] shrink-0 w-4">
                      {idx + 1}.
                    </span>
                    <p className="text-xs font-medium text-slate-800 group-hover:text-[#CE1126] transition-colors line-clamp-1">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { NewsItem, Category } from '../types';
import { NewsCard } from './NewsCard';

interface Props {
  category: Category;
  news: NewsItem[];
  variant?: 'grid-3' | 'lead-and-list' | 'grid-4';
  onNavigate: (path: string) => void;
}

export function CategoryBlock({ category, news, variant = 'grid-3', onNavigate }: Props) {
  if (!news || news.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Category Section Header */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div 
            className="w-3.5 h-6 rounded-sm"
            style={{ backgroundColor: category.color || '#CE1126' }}
          ></div>
          <h2 className="text-xl sm:text-2xl font-black text-[#000000] font-serif tracking-tight">
            {category.name}
          </h2>
        </div>

        <button
          onClick={() => onNavigate(`/categoria/${category.slug}`)}
          className="text-xs sm:text-sm font-bold text-[#CE1126] hover:text-[#A50D1F] flex items-center gap-1 group transition-colors"
        >
          <span>Ver mais em {category.name}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid variations */}
      {variant === 'lead-and-list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Big lead card */}
          {news[0] && (
            <div className="lg:col-span-7">
              <NewsCard news={news[0]} variant="standard" onNavigate={onNavigate} />
            </div>
          )}
          {/* Compact stacked list */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm divide-y divide-slate-100">
            {news.slice(1, 4).map(item => (
              <NewsCard key={item.id} news={item} variant="compact" onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

      {variant === 'grid-3' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(0, 3).map(item => (
            <NewsCard key={item.id} news={item} variant="standard" onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {variant === 'grid-4' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {news.slice(0, 4).map(item => (
            <NewsCard key={item.id} news={item} variant="standard" onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </section>
  );
}

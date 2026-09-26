import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, TrendingUp, Sparkles, Newspaper, Flame } from 'lucide-react';
import { Category, NewsItem } from '../types';
import { api } from '../services/api';
import { HeroSection } from '../components/HeroSection';
import { NewsCard } from '../components/NewsCard';
import { CategoryBlock } from '../components/CategoryBlock';
import { MostReadSidebar } from '../components/MostReadSidebar';
import { NewsletterBox } from '../components/NewsletterBox';
import { PromoHeroBanner } from '../components/PromoHeroBanner';
import { RefreshButton } from '../components/RefreshButton';
import AdsterraBanner from '../components/ads/AdsterraBanner';

interface Props {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [newsRes, catsRes] = await Promise.all([
        api.getNews({ limit: 40 }),
        api.getCategories()
      ]);
      setNews(newsRes.news || []);
      setCategories(catsRes || []);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Nexora Angola - Jornalismo Independente em Tempo Real';
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-[#CE1126] mb-3" />
        <p className="text-sm font-medium">A carregar as notícias mais recentes...</p>
      </div>
    );
  }

  // Segmenting News for rich layout
  const heroLead = news.find(n => n.isHero) || news[0];
  const secondaryLead = news.filter(n => n.id !== heroLead?.id).slice(0, 2);
  const trendingNews = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const latestNews = news.filter(n => n.id !== heroLead?.id && !secondaryLead.some(s => s.id === n.id)).slice(0, 6);

  const angolaCategory = categories.find(c => c.slug === 'angola');
  const angolaNews = news.filter(n => n.categoryId === 'cat-angola' || n.categorySlug === 'angola');

  const economiaCategory = categories.find(c => c.slug === 'economia');
  const economiaNews = news.filter(n => n.categoryId === 'cat-economia' || n.categorySlug === 'economia');

  const techCategory = categories.find(c => c.slug === 'tecnologia');
  const techNews = news.filter(n => n.categoryId === 'cat-tecnologia' || n.categorySlug === 'tecnologia');

  const desportoCategory = categories.find(c => c.slug === 'desporto');
  const desportoNews = news.filter(n => n.categoryId === 'cat-desporto' || n.categorySlug === 'desporto');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 0. PROMO HERO BANNER & ADVERTISING (TOP OF PAGE) */}
      <PromoHeroBanner onNavigate={onNavigate} />

      {/* 1. HERO SECTION */}
      {heroLead && (
        <HeroSection
          leadNews={heroLead}
          secondaryNews={secondaryLead}
          trendingNews={trendingNews}
          onNavigate={onNavigate}
        />
      )}

      {/* 2. LATEST NEWS & SIDEBAR SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left: Latest News Grid (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-6 rounded-sm bg-[#CE1126]"></div>
              <h2 className="text-xl sm:text-2xl font-black text-[#000000] dark:text-white font-serif tracking-tight">
                Últimas Notícias
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <RefreshButton onRefresh={loadData} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {latestNews.map((item, index) => (
              <React.Fragment key={item.id}>
                <NewsCard news={item} variant="standard" onNavigate={onNavigate} />
                {index === 1 && (
                  <div className="sm:col-span-2">
                    <AdsterraBanner />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right: Most Read Sidebar & Special Box (4 Cols) */}
        <aside aria-label="Notícias mais lidas e tópicos populares" className="lg:col-span-4 space-y-6">
          <MostReadSidebar news={trendingNews} onNavigate={onNavigate} />

          {/* Quick Categories Cloud */}
          <div className="bg-[#F5F7FA] dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-xs font-black text-[#000000] dark:text-white uppercase tracking-wider mb-3">
              Explorar por Temas
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onNavigate(`/categoria/${cat.slug}`)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-[#CE1126] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-all shadow-2xs cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 3. CATEGORY BLOCKS */}
      {angolaCategory && angolaNews.length > 0 && (
        <CategoryBlock
          category={angolaCategory}
          news={angolaNews}
          variant="lead-and-list"
          onNavigate={onNavigate}
        />
      )}

      {/* 4. NEWSLETTER BANNER */}
      <NewsletterBox />

      {economiaCategory && economiaNews.length > 0 && (
        <CategoryBlock
          category={economiaCategory}
          news={economiaNews}
          variant="grid-3"
          onNavigate={onNavigate}
        />
      )}

      {techCategory && techNews.length > 0 && (
        <CategoryBlock
          category={techCategory}
          news={techNews}
          variant="grid-3"
          onNavigate={onNavigate}
        />
      )}

      {desportoCategory && desportoNews.length > 0 && (
        <CategoryBlock
          category={desportoCategory}
          news={desportoNews}
          variant="grid-4"
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

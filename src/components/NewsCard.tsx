import React from 'react';
import { Calendar, Clock, Eye, Flame, Share2, Bookmark } from 'lucide-react';
import { NewsItem } from '../types';
import { formatDate, formatTimeAgo, shareArticle } from '../lib/utils';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { getNewsImageUrl, handleImageError } from '../utils/imageUtils';

interface Props {
  key?: React.Key;
  news: NewsItem;
  variant?: 'standard' | 'horizontal' | 'compact' | 'featured';
  onNavigate: (path: string) => void;
}

export function NewsCard({ news, variant = 'standard', onNavigate }: Props) {
  const { isSaved: checkIsSaved, toggleSaveArticle } = useSavedArticles();
  const isSaved = checkIsSaved(news.id) || checkIsSaved(news.slug);

  const handleClick = () => {
    onNavigate(`/noticia/${news.slug}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/noticia/${news.slug}`;
    await shareArticle({ title: news.title, text: news.excerpt, url });
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveArticle(news);
  };

  if (variant === 'compact') {
    return (
      <article 
        onClick={handleClick}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer mb-4 last:mb-0"
      >
        {/* 1. Imagem Ampla no Topo */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={getNewsImageUrl(news.featuredImage, news.categoryName, news.title)}
            alt={news.title}
            loading="lazy"
            onError={e => handleImageError(e, news.categoryName, news.title)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-[#000000]/85 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider rounded">
              {news.categoryName}
            </span>
            {news.isBreaking && (
              <span className="px-2 py-0.5 bg-[#E53935] text-white text-[10px] font-black uppercase tracking-wider rounded">
                URGENTE
              </span>
            )}
          </div>
          <button
            onClick={handleToggleSave}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all ${
              isSaved
                ? 'bg-[#CE1126] text-white shadow-md'
                : 'bg-[#000000]/70 text-white/85 hover:text-white hover:bg-[#000000]/90'
            }`}
            title={isSaved ? 'Artigo Salvo' : 'Salvar Notícia'}
            aria-label={isSaved ? 'Artigo Salvo' : 'Salvar Notícia'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* 2. Todas as Informações da Notícia Abaixo da Imagem */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#CE1126] transition-colors leading-snug">
              {news.title}
            </h4>
            {news.excerpt && (
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                {news.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span>{formatTimeAgo(news.publishedAt)}</span>
              <span>•</span>
              <span>{news.readTimeMinutes || 3} min</span>
            </div>
            <button
              onClick={handleShare}
              className="text-slate-400 hover:text-[#CE1126] p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Partilhar notícia"
              aria-label="Partilhar notícia"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article 
        onClick={handleClick}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
      >
        {/* 1. Imagem Ampla no Topo */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={getNewsImageUrl(news.featuredImage, news.categoryName, news.title)}
            alt={news.title}
            loading="lazy"
            onError={e => handleImageError(e, news.categoryName, news.title)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 bg-[#000000]/85 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider rounded-md">
              {news.categoryName}
            </span>
            {news.isBreaking && (
              <span className="px-2.5 py-1 bg-[#E53935] text-white text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" />
                URGENTE
              </span>
            )}
          </div>

          <button
            onClick={handleToggleSave}
            className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-all ${
              isSaved
                ? 'bg-[#CE1126] text-white shadow-md'
                : 'bg-[#000000]/70 text-white/85 hover:text-white hover:bg-[#000000]/90'
            }`}
            title={isSaved ? 'Artigo Salvo' : 'Salvar Notícia'}
            aria-label={isSaved ? 'Artigo Salvo' : 'Salvar Notícia'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* 2. Todas as Informações da Notícia Abaixo da Imagem */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#CE1126] transition-colors line-clamp-2 leading-snug">
              {news.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
              {news.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{news.authorName}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(news.publishedAt)}</span>
              </div>
              <span>•</span>
              <span>{news.readTimeMinutes || 3} min</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleSave}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  isSaved ? 'text-[#CE1126]' : 'text-slate-400 hover:text-[#CE1126]'
                }`}
                title={isSaved ? 'Artigo Salvo' : 'Salvar Notícia'}
                aria-label="Salvar Notícia"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="text-slate-400 hover:text-[#CE1126] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Partilhar notícia"
                aria-label="Partilhar notícia"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard Card - Imagem Ampla no Topo, Todas as informações abaixo
  return (
    <article 
      onClick={handleClick}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
    >
      {/* 1. Imagem Ampla e Panorâmica no Topo */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={getNewsImageUrl(news.featuredImage, news.categoryName, news.title)}
          alt={news.title}
          loading="lazy"
          onError={e => handleImageError(e, news.categoryName, news.title)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Categorias e Tags sobre a imagem */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 bg-[#000000]/85 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider rounded-md">
            {news.categoryName}
          </span>
          {news.isBreaking && (
            <span className="px-2.5 py-1 bg-[#E53935] text-white text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
              <Flame className="w-2.5 h-2.5" />
              URGENTE
            </span>
          )}
        </div>

        {/* Botão de Salvar Notícia sobre a imagem */}
        <button
          onClick={handleToggleSave}
          className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-[#CE1126] text-white shadow-md'
              : 'bg-[#000000]/70 text-white/85 hover:text-white hover:bg-[#000000]/90'
          }`}
          title={isSaved ? 'Artigo Salvo' : 'Salvar para Ler Offline'}
          aria-label={isSaved ? 'Artigo Salvo' : 'Salvar Notícia'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* 2. Todas as Instalações / Informações da Notícia Abaixo da Imagem */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-[#CE1126] uppercase tracking-wider">
              {news.categoryName}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {formatTimeAgo(news.publishedAt)}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#CE1126] transition-colors line-clamp-2 leading-snug">
            {news.title}
          </h3>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {news.excerpt}
          </p>
        </div>

        {/* Rodapé do Card com Autor e Ações */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{news.authorName}</span>
            <span>•</span>
            <span>{news.readTimeMinutes || 3} min</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleSave}
              className={`p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                isSaved ? 'text-[#CE1126]' : 'text-slate-400 hover:text-[#CE1126]'
              }`}
              title={isSaved ? 'Artigo Salvo' : 'Salvar Notícia'}
              aria-label="Salvar Notícia"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="text-slate-400 hover:text-[#CE1126] p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Partilhar"
              aria-label="Partilhar"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

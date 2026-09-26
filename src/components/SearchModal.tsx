import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { NewsItem } from '../types';
import { api } from '../services/api';
import { formatDate } from '../lib/utils';
import { getNewsImageUrl, handleImageError } from '../utils/imageUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function SearchModal({ isOpen, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query.trim());
        setResults(res.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onNavigate(`/pesquisa?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#000000]/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 pb-12">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative flex items-center border-b border-slate-100 p-4 sm:p-5">
          <Search className="w-6 h-6 text-[#CE1126] ml-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pesquisar notícias, temas, autores, Angola, Economia..."
            className="w-full bg-transparent border-none text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 px-4"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin shrink-0 mr-2" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 mr-2"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            ESC
          </button>
        </form>

        {/* Search Results Preview */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="text-center py-10 text-slate-500">
              <p className="font-medium text-slate-700">O que procura hoje?</p>
              <p className="text-sm mt-1 text-slate-400">Digite palavras-chave como Angola, Economia, Tecnologia, Girabola ou Saúde.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Angola', 'Economia', 'Tecnologia', 'Desporto', 'Saúde', 'Política'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="text-xs bg-slate-100 hover:bg-[#CE1126]/10 hover:text-[#CE1126] text-slate-600 font-medium px-3 py-1.5 rounded-full transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#CE1126]" />
              <p className="text-sm">A pesquisar notícias no Nexora Angola...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="font-semibold text-slate-800">Nenhum resultado encontrado</p>
              <p className="text-sm mt-1 text-slate-400">Não encontramos notícias para "{query}". Tente termos mais gerais.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-2">
                <span>{results.length} resultados encontrados</span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-[#CE1126] hover:underline flex items-center gap-1 font-semibold"
                >
                  Ver todos os resultados <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {results.slice(0, 6).map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate(`/noticia/${item.slug}`);
                    onClose();
                  }}
                  className="group flex gap-4 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <img
                    src={getNewsImageUrl(item.featuredImage, item.categoryName, item.title)}
                    alt={item.title}
                    onError={e => handleImageError(e, item.categoryName, item.title)}
                    className="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded-lg shrink-0 group-hover:opacity-90 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#CE1126] uppercase tracking-wider">
                      {item.categoryName}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-[#CE1126] transition-colors mt-0.5">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.publishedAt)}</span>
                      <span>•</span>
                      <span>{item.readTimeMinutes} min de leitura</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

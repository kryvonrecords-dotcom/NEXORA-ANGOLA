import React, { useEffect, useState } from 'react';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { NewsItem } from '../types';
import { api } from '../services/api';
import { NewsCard } from '../components/NewsCard';

interface Props {
  query: string;
  onNavigate: (path: string) => void;
}

export function SearchResultsPage({ query, onNavigate }: Props) {
  const [results, setResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    document.title = `Pesquisa: "${query}" | Nexora Angola`;

    api.search(query)
      .then(res => {
        setResults(res.results || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate(`/pesquisa?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="bg-[#000000] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-black font-serif mb-4">
          Resultados da Pesquisa
        </h1>

        <form onSubmit={handleNewSearch} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por título, assunto, palavra-chave..."
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#CE1126] hover:bg-[#A50D1F] font-bold text-sm rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Pesquisar
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-400">
          Mostrando resultados para: <span className="text-white font-semibold">"{query}"</span>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mb-2" />
          <p className="text-sm">A procurar notícias...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-800 font-bold text-lg">Nenhuma notícia encontrada</p>
          <p className="text-slate-500 text-sm mt-1">Não foram encontrados artigos correspondentes a "{query}".</p>
          <button
            onClick={() => onNavigate('/')}
            className="mt-6 px-6 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-sm rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            {results.length} {results.length === 1 ? 'notícia encontrada' : 'notícias encontradas'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(item => (
              <NewsCard key={item.id} news={item} variant="standard" onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

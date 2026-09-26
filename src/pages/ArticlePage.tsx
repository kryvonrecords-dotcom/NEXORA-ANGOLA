import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  MessageSquare, 
  Printer, 
  Check, 
  Copy, 
  Loader2, 
  Flame, 
  Tag, 
  ArrowLeft,
  ZoomIn,
  Type,
  Edit,
  Trash2,
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { NewsItem } from '../types';
import { api } from '../services/api';
import { formatDate, formatDateTime, shareArticle } from '../lib/utils';
import { NewsCard } from '../components/NewsCard';
import AdsterraBanner from '../components/ads/AdsterraBanner';
import { useAuth } from '../context/AuthContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { getNewsImageUrl, handleImageError } from '../utils/imageUtils';

interface Props {
  slug: string;
  onNavigate: (path: string) => void;
}

export function ArticlePage({ slug, onNavigate }: Props) {
  const { user } = useAuth();
  const { isSaved: checkIsSaved, toggleSaveArticle: contextToggleSave } = useSavedArticles();
  const [data, setData] = useState<{
    news: NewsItem;
    related: NewsItem[];
    prevNews: any;
    nextNews: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isSaved = data?.news ? (checkIsSaved(data.news.id) || checkIsSaved(data.news.slug)) : false;

  const handleDeleteArticle = async () => {
    if (!data?.news?.id) return;
    setDeleting(true);
    try {
      await api.deleteNews(data.news.id);
      onNavigate('/');
    } catch (err) {
      console.error('Delete error:', err);
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setError(null);

    api.getNewsBySlug(slug)
      .then(res => {
        setData(res);
        document.title = `${res.news.title} | Nexora Angola`;
      })
      .catch(err => {
        setError(err.message || 'Notícia não encontrada');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleToggleSave = () => {
    if (!data?.news) return;
    contextToggleSave(data.news);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-[#CE1126] mb-3" />
        <p className="text-sm font-medium">A carregar artigo...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-serif">Notícia Não Encontrada</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            O artigo solicitado pode ter sido removido ou o link está incorreto.
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-sm rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à Página Inicial
          </button>
        </div>
      </div>
    );
  }

  const { news, related, prevNews, nextNews } = data;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    await shareArticle({
      title: news.title,
      text: news.excerpt,
      url: currentUrl
    });
  };

  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + ' ' + currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(currentUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(news.title)}`
  };

  const fontClass = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-lg sm:text-xl leading-relaxed',
    xlarge: 'text-xl sm:text-2xl leading-loose'
  }[fontSize];

  return (
    <div className="bg-[#F5F7FA] dark:bg-slate-950 min-h-screen py-6 sm:py-10">
      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": news.title,
            "image": [news.featuredImage],
            "datePublished": news.publishedAt,
            "dateModified": news.updatedAt || news.publishedAt,
            "author": [{
              "@type": "Person",
              "name": news.authorName
            }],
            "publisher": {
              "@type": "Organization",
              "name": "Nexora Angola",
              "logo": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/logo.png`
              }
            },
            "description": news.excerpt
          })
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Admin Quick Action Toolbar if logged in */}
        {user?.role === 'admin' && (
          <div className="mb-6 p-4 bg-[#000000] text-white rounded-2xl shadow-lg border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-[#CE1126]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-slate-200">Painel do Editor: </span>
                <span className="text-slate-400 font-mono">ID: {news.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => onNavigate(`/admin/noticias/editar/${news.id}`)}
                className="px-3 py-1.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Notícia</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Apagar Notícia</span>
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#CE1126] dark:hover:text-[#CE1126] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-[#CE1126] text-[#CE1126]'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Artigo Salvo nos Favoritos' : 'Salvar para Ler Offline'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#CE1126] hover:bg-[#A50D1F] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Partilhar Notícia"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partilhar</span>
            </button>
          </div>
        </div>

        {/* Article Container */}
        <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
          {/* 1. Imagem Principal Ampla no Topo da Notícia */}
          <div className="relative w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <img
              src={getNewsImageUrl(news.featuredImage, news.categoryName, news.title)}
              alt={news.title}
              loading="eager"
              decoding="async"
              onError={e => handleImageError(e, news.categoryName, news.title)}
              className="w-full aspect-[16/9] sm:aspect-[21/9] object-cover max-h-[580px] w-full"
              referrerPolicy="no-referrer"
            />
            {news.featuredImageCaption && (
              <p className="px-6 py-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 italic">
                Foto: {news.featuredImageCaption}
              </p>
            )}
          </div>

          {/* 2. Todas as Instalações e Informações da Notícia Abaixo da Imagem */}
          <div className="p-6 sm:p-10">
            {/* Header Metadata */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#CE1126]/15 text-[#CE1126]">
                    {news.categoryName || 'Geral'}
                  </span>
                  {news.isBreaking && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Urgente
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {news.readTimeMinutes || 3} min de leitura
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#000000] dark:text-white font-serif leading-tight">
                {news.title}
              </h1>

              {news.excerpt && (
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 font-medium leading-relaxed font-sans border-l-4 border-[#CE1126] pl-4 py-1">
                  {news.excerpt}
                </p>
              )}

              {/* Author & Timestamp Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#CE1126] to-blue-400 text-white flex items-center justify-center font-bold text-sm uppercase shadow-xs">
                    {news.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm block">
                      {news.authorName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {news.authorRole || 'Redação Nexora Angola'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#CE1126]" />
                    Publicado em: {formatDateTime(news.publishedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Publicidade */}
            <div className="my-8">
              <AdsterraBanner />
            </div>

            {/* Text Size Controls */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 mb-8 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#CE1126]" />
                Ajustar Tamanho da Leitura:
              </span>
              <div className="flex items-center gap-1.5">
                {(['normal', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      fontSize === size
                        ? 'bg-[#CE1126] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {size === 'normal' ? 'Padrão' : size === 'large' ? 'Grande (A+)' : 'Maior (A++)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Article Body */}
            <div className={`prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 space-y-6 ${fontClass}`}>
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>
          </div>

          {/* Editorial Source Credits */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#CE1126]" />
              <span><strong>Fonte da Informação:</strong> Redação Nexora Angola / Agências Oficiais</span>
            </div>
            <span>Jornalismo Verificado &amp; Independente</span>
          </div>
        </article>

        {/* Previous & Next Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {prevNews && (
            <div
              onClick={() => onNavigate(`/noticia/${prevNews.slug}`)}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#CE1126] transition-all cursor-pointer flex items-center gap-3 group shadow-xs"
            >
              <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-[#CE1126] shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Notícia Anterior</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#CE1126] transition-colors line-clamp-1">
                  {prevNews.title}
                </p>
              </div>
            </div>
          )}

          {nextNews && (
            <div
              onClick={() => onNavigate(`/noticia/${nextNews.slug}`)}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#CE1126] transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-xs sm:ml-auto w-full"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Próxima Notícia</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#CE1126] transition-colors line-clamp-1">
                  {nextNews.title}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-[#CE1126] shrink-0" />
            </div>
          )}
        </div>

        {/* Related News Section */}
        {related && related.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-2 pb-3 mb-6 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="w-3.5 h-6 rounded-sm bg-[#CE1126]"></div>
              <h2 className="text-xl font-black text-[#000000] dark:text-white font-serif">
                Notícias Relacionadas
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.slice(0, 3).map(item => (
                <NewsCard key={item.id} news={item} variant="standard" onNavigate={onNavigate} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal for Admin */}
      {deleteModalOpen && data?.news && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
              Eliminar esta Notícia Definitivamente?
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Tem a certeza de que deseja apagar a notícia <strong>"{data.news.title}"</strong>? Esta publicação será removida de todas as secções do portal imediatamente.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteArticle}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Eliminar Notícia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

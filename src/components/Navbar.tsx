import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Lock, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  Share2,
  ChevronDown,
  Smartphone,
  Download,
  Bookmark,
  Bell
} from 'lucide-react';
import { Category } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { SearchModal } from './SearchModal';
import { WeatherWidget } from './WeatherWidget';

interface Props {
  currentPath?: string;
  categories?: Category[];
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
  onOpenSaved?: () => void;
  onOpenNotifications?: () => void;
}

export function Navbar({ currentPath = '/', categories: propCategories, onNavigate, onOpenSearch, onOpenSaved, onOpenNotifications }: Props) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { savedCount } = useSavedArticles();
  const [categories, setCategories] = useState<Category[]>(propCategories || []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      api.getCategories().then(setCategories).catch(console.error);
    }
  }, [propCategories]);

  useEffect(() => {
    // Format date in Portuguese
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now);
    // Capitalize first letter
    setCurrentDateFormatted(formatted.charAt(0).toUpperCase() + formatted.slice(1));

    // Fetch categories
    api.getCategories().then(setCategories).catch(console.error);

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white z-40 relative">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-[#000000] text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          {/* Date & Weather */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline font-medium text-slate-200">{currentDateFormatted}</span>
            <WeatherWidget />
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Edição em Tempo Real</span>
            </div>
          </div>

          {/* Top Right Links & Admin Button */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => handleNavClick('/sobre')}
              className="hover:text-white transition-colors hidden md:inline"
            >
              Sobre Nós
            </button>
            <button
              onClick={() => handleNavClick('/contactos')}
              className="hover:text-white transition-colors hidden md:inline"
            >
              Contactos
            </button>
            <button
              onClick={() => handleNavClick('/newsletter')}
              className="text-slate-300 font-semibold hover:text-white transition-colors hidden sm:inline"
            >
              Newsletter
            </button>

            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer relative"
                title="Central de Notificações"
              >
                <div className="relative">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-slate-900" />
                  )}
                </div>
                <span className="hidden sm:inline text-cyan-300 font-semibold">Alertas</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {onOpenSaved && (
              <button
                onClick={onOpenSaved}
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800/80"
                title="Ver Notícias Salvas no App"
              >
                <div className="relative flex items-center">
                  <Bookmark className="w-3.5 h-3.5 text-[#CE1126]" />
                  {savedCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#CE1126]" />
                  )}
                </div>
                <span className="hidden sm:inline font-semibold text-xs">Salvos</span>
                {savedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#CE1126] text-white text-[9px] font-bold">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Portal Button */}
            {user ? (
              <button
                onClick={() => handleNavClick('/admin')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#CE1126] hover:bg-[#A50D1F] text-white font-semibold transition-all shadow-sm"
                title="Aceder ao Painel Administrativo"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden xs:inline">Painel Admin</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('/admin')}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white py-0.5 px-2 rounded hover:bg-slate-800 transition-colors"
                title="Acesso Administrativo (Apenas Proprietário)"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="text-[11px]">Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGO & BRANDING BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        {/* Left: Mobile hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Center: Brand Logo */}
        <div 
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 shadow-md ring-2 ring-[#CE1126]/40 bg-[#000000] flex items-center justify-center">
            <img 
              src="/nexora-angola.svg" 
              alt="Nexora Angola Logo" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/app-cover.jpg';
              }}
            />
          </div>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#000000] font-serif uppercase">
                NEXORA
              </span>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#CE1126] font-serif uppercase">
                NEWS
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E53935] mb-2 sm:mb-3"></span>
            </div>
            <span className="text-[10px] sm:text-xs tracking-wider uppercase text-slate-500 font-semibold mt-0.5">
              Notícias de Angola em tempo real
            </span>
          </div>
        </div>

        {/* Right: Quick Search Button & CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#CE1126] transition-all cursor-pointer"
              aria-label="Central de Notificações"
              title="Notificações em tempo real"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-rose-500 text-[9px] font-black text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors group cursor-pointer"
            aria-label="Pesquisar Notícias"
          >
            <Search className="w-4 h-4 text-slate-500 group-hover:text-[#CE1126]" />
            <span className="hidden sm:inline text-xs text-slate-500">Pesquisar notícias...</span>
          </button>
        </div>
      </div>

      {/* 3. STICKY CATEGORIES BAR */}
      <nav className={`bg-[#000000] text-white border-t border-slate-800 transition-all ${
        isScrolled ? 'sticky top-0 shadow-lg z-40' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center overflow-x-auto no-scrollbar py-2.5 gap-1 sm:gap-2">
            <button
              onClick={() => handleNavClick('/')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                currentPath === '/' 
                  ? 'bg-[#CE1126] text-white' 
                  : 'text-slate-200 hover:text-white hover:bg-slate-800'
              }`}
            >
              Início
            </button>

            {categories.slice(0, 10).map(cat => {
              const isActive = currentPath === `/categoria/${cat.slug}`;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleNavClick(`/categoria/${cat.slug}`)}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold tracking-wider whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'bg-[#CE1126] text-white' 
                      : 'text-slate-200 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}

            {categories.length > 10 && (
              <div className="relative group">
                <button className="px-3 py-1.5 text-xs sm:text-sm font-bold tracking-wider text-slate-300 hover:text-white flex items-center gap-1">
                  Mais <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute left-0 top-full mt-1 w-48 bg-[#000000] border border-slate-700 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
                  {categories.slice(10).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleNavClick(`/categoria/${cat.slug}`)}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-200 hover:bg-[#CE1126] hover:text-white transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center pl-4 border-l border-slate-800">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-slate-300 hover:text-[#CE1126] p-1.5 transition-colors"
              title="Pesquisar"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-sm flex flex-col">
          <div className="bg-[#000000] border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow ring-1 ring-[#CE1126] bg-[#000000] flex items-center justify-center">
                <img 
                  src="/nexora-angola.svg" 
                  alt="Nexora Angola Logo" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/app-cover.jpg';
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-white font-serif">NEXORA</span>
                <span className="text-xl font-black text-[#CE1126] font-serif">ANGOLA</span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-300 hover:text-white rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Live Weather inside mobile menu */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Clima em Tempo Real:</span>
              <WeatherWidget />
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Categorias</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('/')}
                  className="text-left px-3 py-2.5 rounded-lg bg-slate-800/60 text-white font-semibold text-sm hover:bg-[#CE1126] transition-colors"
                >
                  Início
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleNavClick(`/categoria/${cat.slug}`)}
                    className="text-left px-3 py-2.5 rounded-lg bg-slate-800/60 text-slate-200 font-medium text-sm hover:bg-[#CE1126] hover:text-white transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-2">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Páginas e Suporte</p>
              <button
                onClick={() => handleNavClick('/sobre')}
                className="w-full text-left py-2 text-sm text-slate-300 hover:text-white"
              >
                Sobre o Nexora Angola
              </button>
              <button
                onClick={() => handleNavClick('/estatuto-editorial')}
                className="w-full text-left py-2 text-sm text-slate-300 hover:text-white"
              >
                Estatuto Editorial
              </button>
              <button
                onClick={() => handleNavClick('/contactos')}
                className="w-full text-left py-2 text-sm text-slate-300 hover:text-white"
              >
                Contactos e Redação
              </button>
              <button
                onClick={() => handleNavClick('/anuncios')}
                className="w-full text-left py-2 text-sm text-amber-300 hover:text-amber-200 font-semibold"
              >
                Anúncios & Publicidade
              </button>
              <button
                onClick={() => handleNavClick('/privacidade')}
                className="w-full text-left py-2 text-sm text-slate-300 hover:text-white"
              >
                Política de Privacidade
              </button>
              <button
                onClick={() => handleNavClick('/termos')}
                className="w-full text-left py-2 text-sm text-slate-300 hover:text-white"
              >
                Termos de Uso
              </button>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={() => handleNavClick('/admin')}
                className="w-full py-3 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock className="w-4 h-4" />
                {user ? 'Aceder ao Painel Admin' : 'Área do Administrador'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavClick}
      />
    </header>
  );
}

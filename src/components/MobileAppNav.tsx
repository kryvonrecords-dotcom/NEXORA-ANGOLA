import React, { useState } from 'react';
import { 
  Home, 
  Grid, 
  Bookmark, 
  Search, 
  Menu, 
  Radio, 
  Flame, 
  Share2, 
  Sparkles, 
  X,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Bell
} from 'lucide-react';
import { Category, SiteSettings } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useSavedArticles } from '../context/SavedArticlesContext';

interface Props {
  currentPath: string;
  categories: Category[];
  settings: SiteSettings | null;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenSaved: () => void;
  onOpenNotifications?: () => void;
}

export function MobileAppNav({
  currentPath,
  categories,
  settings,
  onNavigate,
  onOpenSearch,
  onOpenSaved,
  onOpenNotifications
}: Props) {
  const { unreadCount } = useNotifications();
  const { savedCount } = useSavedArticles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Don't render on Admin layout if deeply nested to give admin maximum screen space
  const isAdmin = currentPath.startsWith('/admin') && currentPath !== '/admin/login';

  return (
    <>
      {/* Mobile App Bottom Bar (Fixed at Bottom with Safe Area Padding) */}
      <nav 
        id="mobile-app-bottom-nav"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#000000]/95 backdrop-blur-md border-t border-slate-800 text-slate-300 pb-[env(safe-area-inset-bottom,0px)] shadow-2xl"
      >
        <div className="grid grid-cols-5 items-center h-15 px-2">
          {/* 1. Home / Início */}
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onNavigate('/');
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 transition-all ${
              currentPath === '/' ? 'text-[#CE1126] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-lg transition-transform ${currentPath === '/' ? 'scale-110' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Início</span>
          </button>

          {/* 2. Categorias / Explorar */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 py-1 transition-all ${
              currentPath.startsWith('/categoria') ? 'text-[#CE1126] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="p-1 rounded-lg">
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Editorias</span>
          </button>

          {/* 3. Pesquisa Rápida */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-white transition-all"
          >
            <div className="p-1 rounded-lg">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Pesquisa</span>
          </button>

          {/* 4. Guardados / Offline */}
          <button
            type="button"
            onClick={onOpenSaved}
            className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-white transition-all relative"
          >
            <div className="p-1 rounded-lg relative">
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-[#CE1126] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Salvos</span>
          </button>

          {/* 5. Menu Completo / Mais */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-white transition-all"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Mais</span>
          </button>
        </div>
      </nav>

      {/* Slide-over Categories & App Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end md:justify-center p-0 md:p-4">
          <div 
            className="bg-[#000000] text-white w-full max-w-md mx-auto rounded-t-3xl md:rounded-2xl max-h-[88vh] flex flex-col overflow-hidden border border-slate-800 shadow-2xl animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow border border-blue-500/30 bg-[#000000] flex items-center justify-center">
                  <img
                    src="/icon-192.svg"
                    alt="Nexora Angola"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/app-cover.jpg';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Nexora Angola</h3>
                  <p className="text-[11px] text-slate-400">Jornalismo independente 24h</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1 divide-y divide-slate-800/80">
              {/* Categories Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#CE1126] block">
                  Editorias & Assuntos
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setIsDrawerOpen(false);
                        onNavigate(`/categoria/${cat.slug}`);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-[#CE1126] text-left text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick App Shortcuts */}
              <div className="pt-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#CE1126] block">
                  Acesso Rápido
                </span>
                <div className="space-y-1.5">
                  {onOpenNotifications && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        onOpenNotifications();
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span>Central de Notificações</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                          {unreadCount} novas
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenSaved();
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bookmark className="w-4 h-4 text-[#CE1126]" />
                      <span>Notícias Salvas no App</span>
                    </div>
                    {savedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#CE1126] text-white font-bold">
                        {savedCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNavigate('/sobre');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Sobre o Nexora Angola</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNavigate('/estatuto-editorial');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <span>Estatuto Editorial</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNavigate('/contactos');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>Contactar Redação / Enviar Pauta</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNavigate('/anuncios');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left text-xs font-semibold text-amber-300 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>Anúncios & Publicidade</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNavigate('/admin/login');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left text-xs font-semibold text-slate-300 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-[#CE1126]" />
                      <span>Acesso Redação & Painel Admin</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Bottom */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[11px] text-slate-400">
              Nexora Angola • Notícias e Informação 24 Horas
            </div>
          </div>
        </div>
      )}
    </>
  );
}

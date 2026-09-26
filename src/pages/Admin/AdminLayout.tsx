import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Layers, 
  Image as ImageIcon, 
  Users, 
  Mail, 
  Settings, 
  KeyRound, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck,
  Bell,
  Megaphone,
  Share2,
  Briefcase,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface Props {
  activeTab: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function AdminLayout({ activeTab, onNavigate, children }: Props) {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingProposalsCount, setPendingProposalsCount] = useState<number>(0);

  useEffect(() => {
    const fetchPendingCount = () => {
      api.getAdminAdProposals({ status: 'pending' })
        .then(res => {
          if (Array.isArray(res)) {
            setPendingProposalsCount(res.length);
          }
        })
        .catch(() => {
          // ignore background failure
        });
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'app-stats', label: 'Estatísticas do Aplicativo', path: '/admin/app', icon: Smartphone },
    { id: 'news-list', label: 'Todas as Notícias', path: '/admin/noticias', icon: FileText },
    { id: 'news-new', label: 'Nova Notícia', path: '/admin/noticias/nova', icon: PlusCircle, highlight: true },
    { 
      id: 'proposals', 
      label: 'Propostas Comerciais', 
      path: '/admin/propostas', 
      icon: Briefcase,
      badge: pendingProposalsCount > 0 ? pendingProposalsCount : undefined
    },
    { id: 'ads', label: 'Publicidades & Banners', path: '/admin/publicidades', icon: Megaphone },
    { id: 'notifications', label: 'Notificações Push', path: '/admin/notificacoes', icon: Bell },
    { id: 'categories', label: 'Categorias', path: '/admin/categorias', icon: Layers },
    { id: 'media', label: 'Galeria de Mídia', path: '/admin/midia', icon: ImageIcon },
    { id: 'subscribers', label: 'Newsletter', path: '/admin/subscritores', icon: Mail },
    { id: 'social-media', label: 'Redes Sociais', path: '/admin/redes-sociais', icon: Share2 },
    { id: 'settings', label: 'Configurações', path: '/admin/configuracoes', icon: Settings },
    { id: 'security', label: 'Segurança & Senha', path: '/admin/seguranca', icon: KeyRound },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-[#000000] text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => handleNav('/admin/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow ring-1 ring-[#CE1126]/40 bg-[#000000] flex items-center justify-center">
                <img 
                  src="/icon-192.svg" 
                  alt="Nexora Admin Logo" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/app-cover.jpg';
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black font-serif text-white uppercase">NEXORA</span>
                <span className="text-xl font-black font-serif text-[#CE1126] uppercase">ADMIN</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleNav('/')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
              title="Abrir o portal público de notícias"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Portal</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-[#CE1126] text-white flex items-center justify-center font-bold text-xs uppercase shadow">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-white leading-tight">{user?.name || 'Administrador'}</div>
                <div className="text-slate-400 text-[10px]">{user?.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Shell */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm sticky top-24 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    item.highlight && !isActive
                      ? 'bg-[#CE1126]/10 text-[#CE1126] hover:bg-[#CE1126]/20'
                      : isActive
                      ? 'bg-[#CE1126] text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-[#CE1126]' : 'bg-amber-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex">
            <div className="w-72 bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 font-serif">NEXORA</span>
                    <span className="font-black text-[#CE1126] font-serif">ADMIN</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.path)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-[#CE1126] text-white shadow'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            isActive ? 'bg-white text-[#CE1126]' : 'bg-amber-500 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Terminar Sessão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

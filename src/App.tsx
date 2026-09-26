import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { SavedArticlesProvider } from './context/SavedArticlesContext';
import { BreakingNewsBanner } from './components/BreakingNewsBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { MobileAppNav } from './components/MobileAppNav';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { SavedArticlesModal } from './components/SavedArticlesModal';
import { SavedArticleToast } from './components/SavedArticleToast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NotificationToast } from './components/NotificationToast';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { AdMobConsentModal } from './components/AdMobConsentModal';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { AboutPage, EditorialStatutePage, ContactPage, PrivacyPage, TermsPage } from './pages/InstitutionalPages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminLogin } from './pages/Admin/AdminLogin';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminAppStats } from './pages/Admin/AdminAppStats';
import { AdminNewsList } from './pages/Admin/AdminNewsList';
import { AdminNewsEditor } from './pages/Admin/AdminNewsEditor';
import { AdminNotifications } from './pages/Admin/AdminNotifications';
import { AdminCategories } from './pages/Admin/AdminCategories';
import { AdminMediaGallery } from './pages/Admin/AdminMediaGallery';
import { AdminAds } from './pages/Admin/AdminAds';
import { AdminProposals } from './pages/Admin/AdminProposals';
import { AdminSubscribers } from './pages/Admin/AdminSubscribers';
import { AdminSocialMedia } from './pages/Admin/AdminSocialMedia';
import { AdminSettings } from './pages/Admin/AdminSettings';
import { AdminSecurity } from './pages/Admin/AdminSecurity';
import { api } from './services/api';
import { Category, NewsItem, PortalSettings } from './types';
import { Loader2, MessageCircle } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [breakingNews, setBreakingNews] = useState<NewsItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load common metadata (categories, global settings, urgent news)
  useEffect(() => {
    async function loadGlobalData() {
      try {
        const [cats, sett, newsRes] = await Promise.all([
          api.getCategories(),
          api.getSettings(),
          api.getNews({ limit: 10 })
        ]);
        setCategories(cats);
        setSettings(sett);

        // find active breaking news
        const urgent = newsRes.news?.find(n => n.isBreaking);
        if (urgent) {
          setBreakingNews(urgent);
        }
      } catch (err) {
        console.error('Failed to load global portal config:', err);
      }
    }
    loadGlobalData();
  }, [currentPath]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#CE1126]" />
      </div>
    );
  }

  // Parse path & params
  const pathname = currentPath.split('?')[0];
  const searchParams = new URLSearchParams(currentPath.split('?')[1] || '');

  // ADMIN ROUTING
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return <AdminLogin onNavigate={navigate} />;
    }

    if (pathname === '/admin' || pathname === '/admin/dashboard') {
      return (
        <AdminLayout activeTab="dashboard" onNavigate={navigate}>
          <AdminDashboard onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/app') {
      return (
        <AdminLayout activeTab="app-stats" onNavigate={navigate}>
          <AdminAppStats onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/noticias') {
      return (
        <AdminLayout activeTab="news-list" onNavigate={navigate}>
          <AdminNewsList onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/noticias/nova') {
      return (
        <AdminLayout activeTab="news-new" onNavigate={navigate}>
          <AdminNewsEditor onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname.startsWith('/admin/noticias/editar/')) {
      const editId = pathname.replace('/admin/noticias/editar/', '');
      return (
        <AdminLayout activeTab="news-list" onNavigate={navigate}>
          <AdminNewsEditor editId={editId} onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/notificacoes' || pathname === '/admin/push') {
      return (
        <AdminLayout activeTab="notifications" onNavigate={navigate}>
          <AdminNotifications onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/categorias') {
      return (
        <AdminLayout activeTab="categories" onNavigate={navigate}>
          <AdminCategories onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/midia') {
      return (
        <AdminLayout activeTab="media" onNavigate={navigate}>
          <AdminMediaGallery onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/propostas' || pathname === '/admin/proposals' || pathname === '/admin/comercial' || pathname === '/admin/midia-kit') {
      return (
        <AdminLayout activeTab="proposals" onNavigate={navigate}>
          <AdminProposals onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/publicidades' || pathname === '/admin/anuncios') {
      return (
        <AdminLayout activeTab="ads" onNavigate={navigate}>
          <AdminAds onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (
      pathname === '/admin/subscritores' ||
      pathname === '/admin/newsletter' ||
      pathname === '/admin/subscribers' ||
      pathname === '/admin/newsletters' ||
      pathname === '/admin/boletim'
    ) {
      return (
        <AdminLayout activeTab="subscribers" onNavigate={navigate}>
          <ErrorBoundary fallbackTitle="Erro ao carregar Newsletter" fallbackMessage="Ocorreu um erro no módulo de Newsletter. Clique para recarregar ou voltar ao painel.">
            <AdminSubscribers onNavigate={navigate} />
          </ErrorBoundary>
        </AdminLayout>
      );
    }

    if (pathname === '/admin/redes-sociais' || pathname === '/admin/redes') {
      return (
        <AdminLayout activeTab="social-media" onNavigate={navigate}>
          <AdminSocialMedia onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/configuracoes') {
      return (
        <AdminLayout activeTab="settings" onNavigate={navigate}>
          <AdminSettings onNavigate={navigate} />
        </AdminLayout>
      );
    }

    if (pathname === '/admin/seguranca') {
      return (
        <AdminLayout activeTab="security" onNavigate={navigate}>
          <AdminSecurity onNavigate={navigate} />
        </AdminLayout>
      );
    }

    // Default admin fallback
    return (
      <AdminLayout activeTab="dashboard" onNavigate={navigate}>
        <AdminDashboard onNavigate={navigate} />
      </AdminLayout>
    );
  }

  // PUBLIC PORTAL ROUTING
  const renderPublicPage = () => {
    if (pathname === '/' || pathname === '') {
      return <HomePage onNavigate={navigate} />;
    }

    if (pathname.startsWith('/noticia/')) {
      const slug = pathname.replace('/noticia/', '');
      return <ArticlePage slug={slug} onNavigate={navigate} />;
    }

    if (pathname.startsWith('/categoria/')) {
      const slug = pathname.replace('/categoria/', '');
      return <CategoryPage slug={slug} onNavigate={navigate} />;
    }

    if (pathname === '/pesquisa') {
      const q = searchParams.get('q') || '';
      return <SearchResultsPage query={q} onNavigate={navigate} />;
    }

    if (pathname === '/sobre' || pathname === '/institucional/sobre' || pathname === '/quem-somos' || pathname === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (
      pathname === '/estatuto-editorial' || 
      pathname === '/estatuto' || 
      pathname === '/editorial' || 
      pathname === '/institucional/estatuto' || 
      pathname === '/institucional/estatuto-editorial'
    ) {
      return <EditorialStatutePage onNavigate={navigate} />;
    }

    if (
      pathname === '/contacto' || 
      pathname === '/contactos' || 
      pathname === '/institucional/contacto' || 
      pathname === '/institucional/contactos' || 
      pathname === '/redacao' || 
      pathname === '/fale-connosco' ||
      pathname === '/anuncios' ||
      pathname === '/anuncie' ||
      pathname === '/publicidade' ||
      pathname === '/comercial'
    ) {
      return <ContactPage onNavigate={navigate} />;
    }

    if (pathname === '/privacidade' || pathname === '/institucional/privacidade') {
      return <PrivacyPage onNavigate={navigate} />;
    }

    if (pathname === '/termos' || pathname === '/institucional/termos') {
      return <TermsPage onNavigate={navigate} />;
    }

    // 404 Fallback
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900 font-serif mb-2">Página Não Encontrada</h2>
        <p className="text-slate-600 text-sm mb-6">A página solicitada não existe ou mudou de endereço.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-[#CE1126] text-white font-bold text-sm rounded-xl hover:bg-[#A50D1F] transition-colors"
        >
          Voltar à Página Inicial
        </button>
      </div>
    );
  };

  const isPublicPage = !currentPath.startsWith('/admin') || currentPath === '/admin/login';

  return (
    <div className={`min-h-screen bg-[#F5F7FA] flex flex-col text-slate-900 font-sans selection:bg-[#CE1126] selection:text-white ${isPublicPage ? 'pb-16 md:pb-0' : ''}`}>
      {/* 0. Offline / Online Indicator */}
      <OfflineIndicator />

      {/* 1. Global Breaking News Banner */}
      <BreakingNewsBanner
        breakingNews={breakingNews}
        customText={settings?.breakingNewsEnabled ? settings?.breakingNewsText : undefined}
        onNavigate={navigate}
      />

      {/* 2. Main Portal Navbar */}
      <Navbar
        categories={categories}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSaved={() => setSavedOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* 3. Page Content */}
      <main className="flex-1">
        {renderPublicPage()}
      </main>

      {/* 4. Footer */}
      <Footer categories={categories} onNavigate={navigate} />

      {/* 5. Mobile App Bottom Navigation Bar */}
      {isPublicPage && (
        <MobileAppNav
          currentPath={currentPath}
          categories={categories}
          settings={settings}
          onNavigate={navigate}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenSaved={() => setSavedOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
      )}

      {/* 6. PWA Install Prompt & iOS Guided Add-to-Homescreen */}
      <PWAInstallPrompt />

      {/* 7. Saved Offline Articles Modal */}
      <SavedArticlesModal
        isOpen={savedOpen}
        onClose={() => setSavedOpen(false)}
        onNavigate={navigate}
      />

      {/* Instant Feedback Toast for Saved Articles */}
      <SavedArticleToast />

      {/* 8. Global Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={navigate}
      />

      {/* 9. Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={navigate}
      />

      {/* 10. Push Toast Alerter */}
      <NotificationToast onNavigate={navigate} />

      {/* 11. Push Notification Permission Opt-in Prompt */}
      <NotificationPermissionBanner />

      {/* 12. Google AdMob UMP / Privacy Consent Modal */}
      <AdMobConsentModal onNavigate={navigate} />

      {/* 12. Floating WhatsApp Contact Badge (if enabled) */}
      {settings?.whatsappFloatingEnabled !== false && (settings?.whatsappFloatingNumber || settings?.socialLinks?.whatsapp) && (
        <a
          href={
            settings.socialLinks?.whatsapp?.includes('http')
              ? settings.socialLinks.whatsapp
              : `https://wa.me/${(settings.whatsappFloatingNumber || settings.socialLinks?.whatsapp || '244921281315').replace(/\D/g, '')}?text=${encodeURIComponent(settings.whatsappFloatingMessage || 'Olá! Gostaria de falar com a redação do Nexora Angola.')}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 group border-2 border-white/20"
          title="Fale Connosco no WhatsApp"
        >
          <MessageCircle className="w-6 h-6 shrink-0 fill-current" />
          <span className="hidden sm:inline font-bold text-xs">WhatsApp Redação</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping absolute -top-1 -right-1"></span>
        </a>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <SavedArticlesProvider>
              <AppContent />
            </SavedArticlesProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

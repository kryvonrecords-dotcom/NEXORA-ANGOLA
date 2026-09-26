import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, Check, Share, PlusSquare, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface Props {
  onInstallSuccess?: () => void;
}

export function PWAInstallPrompt({ onInstallSuccess }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(Boolean(checkStandalone));

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isApple);

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissed = localStorage.getItem('nexora_pwa_dismissed');
      const lastDismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const hoursSinceDismissed = (Date.now() - lastDismissedTime) / (1000 * 60 * 60);

      // Show banner if not dismissed in the last 24h
      if (hoursSinceDismissed > 24 && !checkStandalone) {
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
        if (onInstallSuccess) onInstallSuccess();
      }
    } else if (isIOS) {
      setShowIOSModal(true);
      setShowBanner(false);
    } else {
      // Fallback info for general browsers
      setShowIOSModal(true);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem('nexora_pwa_dismissed', Date.now().toString());
    } catch {}
  };

  // If already installed as native standalone app, do not show prompt banner
  if (isStandalone) return null;

  return (
    <>
      {/* 1. Floating Bottom-Right App Install Banner */}
      {showBanner && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-sm bg-[#000000] text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-slideUp flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <img
                src="/icon-192.svg"
                alt="Nexora Angola App"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/app-cover.jpg';
                }}
                className="w-11 h-11 rounded-xl shadow-md border border-slate-700 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white leading-tight">Instalar Nexora Angola</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#CE1126] text-white">
                    App
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  Acesso rápido, modo offline e notícias em tempo real.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-4 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Agora</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
            >
              Agora Não
            </button>
          </div>
        </div>
      )}

      {/* 2. iOS Safari & Manual Add To Home Screen Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 animate-slideUp sm:animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/icon-192.svg"
                  alt="Nexora Angola"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/app-cover.jpg';
                  }}
                  className="w-9 h-9 rounded-xl shadow border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Instalar no seu Telemóvel</h3>
                  <p className="text-[11px] text-slate-500">Adicione à tela inicial para usar como App</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#FDECEF] text-[#CE1126] font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Toque no botão <strong>Partilhar</strong></span>
                  <Share className="w-4 h-4 text-[#CE1126] inline" />
                  <span>na barra inferior do navegador.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#FDECEF] text-[#CE1126] font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Role e selecione <strong>Adicionar ao Ecrã Principal</strong></span>
                  <PlusSquare className="w-4 h-4 text-[#CE1126] inline" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#FDECEF] text-[#CE1126] font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  Toque em <strong>Adicionar</strong> no canto superior direito para concluir.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

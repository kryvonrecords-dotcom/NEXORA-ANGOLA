import React, { useState, useEffect } from 'react';
import { Bell, Flame, X, Check, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const DISMISS_KEY = 'nexora_push_banner_dismissed_until';

export function NotificationPermissionBanner() {
  const { permission, requestPermission } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show if browser supports Notification and permission has not yet been decided ('default')
    if (permission === 'default') {
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        // Show after a gentle 3.5 seconds delay so user isn't startled immediately upon entry
        const timer = setTimeout(() => {
          setVisible(true);
        }, 3500);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [permission]);

  if (!visible || permission !== 'default') return null;

  const handleAccept = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    // Dismiss for 3 days
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 3 * 86400 * 1000));
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-40 sm:max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-[#000000] text-white p-4 sm:p-4.5 rounded-2xl shadow-2xl border border-[#CE1126]/40 backdrop-blur-md relative overflow-hidden ring-1 ring-white/10">
        {/* Top subtle blue accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CE1126] via-cyan-400 to-[#CE1126]" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CE1126] text-white flex items-center justify-center shrink-0 shadow-md">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#CE1126] text-white tracking-wider">
                SEGUNDO PLANO
              </span>
              <span className="text-[11px] text-cyan-300 font-semibold">Web Push Nativo</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
              Receba notícias urgentes mesmo com o aplicativo fechado!
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Alertas instantâneos e furos de reportagem de Angola e do Mundo direto no seu telemóvel ou computador.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-xl bg-[#CE1126] hover:bg-[#A50D1F] active:scale-95 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{loading ? 'A ativar...' : 'Ativar Notificações'}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer"
              >
                Agora não
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Bell, Flame, X, ArrowRight, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { handleImageError } from '../utils/imageUtils';

interface Props {
  onNavigate: (path: string) => void;
}

export function NotificationToast({ onNavigate }: Props) {
  const { activeToast, dismissToast, markAsRead, soundEnabled, setSoundEnabled } = useNotifications();

  if (!activeToast) return null;

  const handleClick = () => {
    markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.clickUrl) {
      onNavigate(activeToast.clickUrl);
    } else if (activeToast.newsSlug) {
      onNavigate(`/noticia/${activeToast.newsSlug}`);
    }
  };

  const isUrgent = activeToast.isBreaking || activeToast.type === 'breaking_news' || activeToast.type === 'urgent_broadcast';

  return (
    <aside 
      aria-label="Notificação de última hora"
      className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto select-none"
    >
      <div 
        onClick={handleClick}
        className={`relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border ${
          isUrgent 
            ? 'bg-[#000000]/95 text-white border-rose-500/50 shadow-rose-950/40 ring-2 ring-rose-500/30' 
            : 'bg-[#000000]/95 text-white border-[#CE1126]/40 shadow-blue-950/40 ring-2 ring-[#CE1126]/20'
        }`}
      >
        {/* Top glow pulse line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${isUrgent ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse' : 'bg-gradient-to-r from-[#CE1126] via-cyan-400 to-[#CE1126]'}`} />

        <div className="flex items-start gap-3.5">
          {/* Thumbnail / Icon */}
          <div className="relative shrink-0 mt-0.5">
            {activeToast.imageUrl ? (
              <img 
                src={activeToast.imageUrl} 
                alt="Notícia" 
                onError={e => handleImageError(e, 'Notícias', activeToast.title)}
                className="w-13 h-13 rounded-xl object-cover ring-2 ring-white/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-rose-600 text-white' : 'bg-[#CE1126] text-white'}`}>
                {isUrgent ? <Flame className="w-6 h-6 animate-bounce" /> : <Bell className="w-6 h-6" />}
              </div>
            )}
            {/* Live Indicator Dot */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isUrgent ? 'bg-rose-400' : 'bg-blue-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isUrgent ? 'bg-rose-500' : 'bg-[#CE1126]'} border-2 border-[#000000]`}></span>
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                isUrgent ? 'bg-rose-500 text-white' : 'bg-[#CE1126] text-white'
              }`}>
                {isUrgent && <Flame className="w-2.5 h-2.5" />}
                {activeToast.categoryName || (isUrgent ? 'ÚLTIMA HORA' : 'NEXORA ALERT')}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">Agora mesmo</span>
            </div>

            <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
              {activeToast.title}
            </h4>

            {activeToast.body && (
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 leading-relaxed font-normal">
                {activeToast.body}
              </p>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-[#CE1126] font-semibold mt-2 group">
              <span className="text-cyan-300 group-hover:underline">Toque para ler matéria completa</span>
              <ArrowRight className="w-3 h-3 text-cyan-300 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Top Actions: Sound toggle and Close */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Silenciar som de alertas' : 'Ativar som de alertas'}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={dismissToast}
              title="Fechar notificação"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

import React, { useState } from 'react';
import { 
  Bell, 
  Flame, 
  X, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Check, 
  Radio
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';
import { handleImageError } from '../utils/imageUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

function timeAgo(dateString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) {
      const min = Math.floor(diff / 60);
      return `há ${min} ${min === 1 ? 'minuto' : 'minutos'}`;
    }
    if (diff < 86400) {
      const h = Math.floor(diff / 3600);
      return `há ${h} ${h === 1 ? 'hora' : 'horas'}`;
    }
    const days = Math.floor(diff / 86400);
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  } catch {
    return 'Recentemente';
  }
}

export function NotificationCenterModal({ isOpen, onClose, onNavigate }: Props) {
  const { 
    notifications, 
    unreadCount, 
    permission, 
    isPushSubscribed,
    requestPermission, 
    testBackgroundPush, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAllNotifications,
    soundEnabled,
    setSoundEnabled,
    triggerTestNotification
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'breaking'>('all');
  const [requestingPerm, setRequestingPerm] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);

  if (!isOpen) return null;

  const handleItemClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    onClose();
    if (notif.clickUrl) {
      onNavigate(notif.clickUrl);
    } else if (notif.newsSlug) {
      onNavigate(`/noticia/${notif.newsSlug}`);
    }
  };

  const handleEnablePush = async () => {
    setRequestingPerm(true);
    await requestPermission();
    setRequestingPerm(false);
  };

  const handleTestNativePush = async () => {
    setTestingPush(true);
    if (permission !== 'granted') {
      await requestPermission();
    }
    await testBackgroundPush();
    setTimeout(() => setTestingPush(false), 2000);
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setShowConfirmClearAll(false);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'breaking') return n.isBreaking || n.type === 'breaking_news' || n.type === 'urgent_broadcast';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] mt-2 sm:mt-12 border border-slate-200 animate-in slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#000000] text-white p-5 border-b border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#CE1126] text-white flex items-center justify-center shadow-md">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black font-serif text-white tracking-wide">
                    Central de Notificações
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  Alertas e notícias em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Silenciar avisos sonoros' : 'Ativar avisos sonoros'}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Push permission banner if not yet allowed */}
          {permission !== 'granted' && (
            <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-blue-950/80 to-[#CE1126]/30 border border-[#CE1126]/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Radio className="w-4 h-4 text-[#CE1126] shrink-0 animate-pulse" />
                <span className="text-xs text-slate-200 truncate">
                  {permission === 'denied' 
                    ? 'Notificações bloqueadas no navegador' 
                    : 'Receba furos de reportagem em 1º lugar'}
                </span>
              </div>
              {permission !== 'denied' && (
                <button
                  onClick={handleEnablePush}
                  disabled={requestingPerm}
                  className="shrink-0 px-3 py-1 bg-[#CE1126] hover:bg-[#A50D1F] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  {requestingPerm ? 'A ativar...' : 'Ativar Alertas'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter bar & Actions */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-slate-900 text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                activeFilter === 'unread' 
                  ? 'bg-[#CE1126] text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Não lidas ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('breaking')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                activeFilter === 'breaking' 
                  ? 'bg-rose-600 text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Urgentes
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#CE1126] hover:text-[#A50D1F] font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 cursor-pointer"
                title="Marcar todas as notificações como lidas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marcar lidas</span>
              </button>
            )}

            {notifications.length > 0 && (
              showConfirmClearAll ? (
                <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-xl border border-rose-200">
                  <span className="text-[11px] font-bold text-rose-700">Apagar todas?</span>
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setShowConfirmClearAll(false)}
                    className="px-1.5 py-0.5 text-slate-500 hover:text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmClearAll(true)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                  title="Apagar todas as notificações da sua lista"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Apagar todas</span>
                  <span className="sm:hidden">Limpar</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 min-h-[260px] max-h-[55vh]">
          {filteredNotifications.length === 0 ? (
            <div className="py-14 text-center px-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Você receberá um alerta imediato com som e imagem assim que novas matérias forem publicadas.
              </p>
              <button
                onClick={() => triggerTestNotification()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#CE1126]" />
                Simular Alerta de Notícia
              </button>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUrgent = notif.isBreaking || notif.type === 'breaking_news' || notif.type === 'urgent_broadcast';
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer relative group my-1 ${
                    !notif.read 
                      ? 'bg-blue-50/60 hover:bg-[#FDECEF]/60 border border-[#FDECEF]' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail / Badge */}
                    <div className="shrink-0 relative mt-0.5">
                      {notif.imageUrl ? (
                        <img 
                          src={notif.imageUrl} 
                          alt="Thumbnail" 
                          onError={e => handleImageError(e, 'Notícias', notif.title)}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isUrgent ? 'bg-rose-500 text-white' : 'bg-[#CE1126] text-white'
                        }`}>
                          {isUrgent ? <Flame className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                      )}
                      {!notif.read && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#CE1126] ring-2 ring-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                          isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-[#FDECEF] text-[#CE1126]'
                        }`}>
                          {isUrgent && <Flame className="w-2.5 h-2.5 text-rose-600" />}
                          {notif.categoryName || (isUrgent ? 'Urgente' : 'Notícia')}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(notif.sentAt)}
                        </span>
                      </div>

                      <h4 className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${
                        !notif.read ? 'text-slate-950 font-black' : 'text-slate-800'
                      }`}>
                        {notif.title}
                      </h4>

                      {notif.body && (
                        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {notif.body}
                        </p>
                      )}
                    </div>

                    {/* Action buttons (Trash button always accessible on mobile and desktop) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notif.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/80 active:scale-90 rounded-xl transition-all cursor-pointer"
                        title="Apagar esta notificação"
                        aria-label="Apagar notificação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${permission === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-semibold text-slate-700">
              {permission === 'granted' ? 'Web Push em Segundo Plano Ativo' : 'Push Aguardando Permissão'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestNativePush}
              disabled={testingPush}
              className="text-[11px] font-bold text-white bg-[#CE1126] hover:bg-[#A50D1F] active:scale-95 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Dispara notificação push que chega ao telemóvel mesmo com o app fechado"
            >
              <Bell className="w-3 h-3" />
              <span>{testingPush ? 'A enviar...' : 'Testar Push no Telemóvel'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

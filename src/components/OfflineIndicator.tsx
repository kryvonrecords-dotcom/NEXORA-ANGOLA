import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
      {!isOnline ? (
        <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-center">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>Modo Offline ativado — A ler edições guardadas em cache no aplicativo</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-[11px] underline font-bold hover:text-amber-100 flex items-center gap-1 shrink-0 ml-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Tentar reconectar</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 shadow-md animate-fadeIn">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Conexão restabelecida! Atualizando o aplicativo...</span>
        </div>
      )}
    </div>
  );
}

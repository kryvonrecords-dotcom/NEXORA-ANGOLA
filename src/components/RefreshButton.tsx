import React, { useState } from 'react';
import { RefreshCw, Check, Wifi, WifiOff } from 'lucide-react';

interface Props {
  onRefresh: () => Promise<void> | void;
  className?: string;
  variant?: 'icon' | 'badge' | 'button';
}

export function RefreshButton({ onRefresh, className = '', variant = 'badge' }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const handleClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setJustUpdated(false);

    try {
      await onRefresh();
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isRefreshing}
        className={`p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer ${className}`}
        title="Atualizar Notícias Agora"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#CE1126]' : ''}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRefreshing}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
        justUpdated
          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
      } ${className}`}
      title="Atualizar Feed de Notícias em Tempo Real"
    >
      {justUpdated ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>Atualizado!</span>
        </>
      ) : (
        <>
          <RefreshCw className={`w-3.5 h-3.5 text-[#CE1126] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'A atualizar...' : 'Atualizar'}</span>
        </>
      )}
    </button>
  );
}

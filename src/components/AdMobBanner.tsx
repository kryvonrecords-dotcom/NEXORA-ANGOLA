import React, { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';
import { admobService } from '../services/admob';

interface Props {
  position?: 'top' | 'middle' | 'bottom' | 'sidebar';
  className?: string;
}

export function AdMobBanner({ position = 'bottom', className = '' }: Props) {
  const [closed, setClosed] = useState(false);
  const config = admobService.getConfig();

  if (closed) return null;

  return (
    <aside 
      className={`my-6 mx-auto w-full max-w-4xl px-2 sm:px-0 transition-all ${className}`}
      aria-label="Publicidade Google AdMob"
    >
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/90 p-4 shadow-xs">
        {/* Ad Tag Header */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
          <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
              Anúncio
            </span>
            <span className="hidden sm:inline">Google Mobile Ads</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setClosed(true)}
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Ocultar anúncio nesta sessão"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Banner Mock Container (320x50 / 728x90 Adaptive) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-[#CE1126]/15 text-[#CE1126] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Nexora Business & Inovação Digital
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                Conheça as soluções de tecnologia e comunicação para empresas em crescimento.
              </p>
            </div>
          </div>

          <a
            href="#anuncio"
            onClick={(e) => e.preventDefault()}
            className="px-4 py-1.5 rounded-lg bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
          >
            Saber Mais
          </a>
        </div>
      </div>
    </aside>
  );
}

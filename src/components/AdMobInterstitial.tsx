import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { admobService } from '../services/admob';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AdMobInterstitial({ isOpen, onClose }: Props) {
  const [countdown, setCountdown] = useState(3);
  const [canClose, setCanClose] = useState(false);
  const config = admobService.getConfig();

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setCanClose(false);
      return;
    }

    admobService.markInterstitialShown();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
              ANÚNCIO INTERSTICIAL
            </span>
            <span className="text-[11px]">Patrocinado</span>
          </div>

          <div>
            {canClose ? (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Fechar Anúncio</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pode fechar em {countdown}s
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#CE1126]/15 text-[#CE1126] flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-[#CE1126] uppercase tracking-widest block mb-1">
              Destaque Patrocinado
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-serif">
              Nexora Prime & Inovação Tecnológica
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Acompanhe as reportagens especiais, entrevistas exclusivas e análises financeiras aprofundadas com os melhores especialistas de Angola e do Mundo.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              Continuar a Leitura da Notícia
            </button>
          </div>
        </div>

        {/* Bottom policy footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Em conformidade com as políticas do Google AdMob</span>
          </div>
        </div>
      </div>
    </div>
  );
}

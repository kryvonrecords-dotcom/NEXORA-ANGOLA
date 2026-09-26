import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Info, Lock } from 'lucide-react';
import { admobService, AdConsentStatus } from '../services/admob';

interface Props {
  onNavigate?: (path: string) => void;
}

export function AdMobConsentModal({ onNavigate }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if consent has been chosen yet
    const status = admobService.getConsentStatus();
    if (status === 'pending') {
      // Small timeout so it does not startle the reader immediately on first render
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (status: AdConsentStatus) => {
    admobService.setConsentStatus(status);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#CE1126] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Sua Privacidade & Preferências de Leitura
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              O <strong>Nexora Angola</strong> e os parceiros autorizados (como Google AdMob) utilizam identificadores para personalizar conteúdos e anúncios relevantes, mantendo o acesso gratuito a reportagens de alta qualidade.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Nunca vendemos os seus dados pessoais ou contactos a terceiros.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleChoice('granted')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#CE1126] hover:bg-[#A50D1F] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Aceitar e Continuar</span>
          </button>

          <button
            type="button"
            onClick={() => handleChoice('declined')}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Anúncios Não Personalizados
          </button>
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onNavigate) onNavigate('/privacidade');
            }}
            className="text-[11px] text-slate-400 hover:text-[#CE1126] underline cursor-pointer"
          >
            Ler a Política de Privacidade Completa
          </button>
        </div>
      </div>
    </div>
  );
}

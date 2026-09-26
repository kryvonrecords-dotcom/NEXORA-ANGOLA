import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Por favor insira um endereço de email válido.');
      return;
    }

    setStatus('loading');
    try {
      const res = await api.subscribeNewsletter(email);
      setStatus('success');
      setMessage(res.message || 'Obrigado por assinar a nossa newsletter!');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Falha ao processar a inscrição. Tente novamente.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#000000] to-[#162244] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden my-10">
      {/* Background ambient lighting */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#CE1126]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-md">
          <Mail className="w-6 h-6 text-[#CE1126]" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black font-serif">
          Receba o resumo diário de notícias no seu email
        </h3>

        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          As principais notícias de Angola, África e do Mundo selecionadas pela redação do Nexora Angola todas as manhãs.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder="Insira o seu email profissional..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#CE1126] focus:border-transparent transition-all"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-[#CE1126] hover:bg-[#A50D1F] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Subscrever</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {status === 'success' && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-4 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-950/50 border border-rose-800/60 px-4 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <p className="text-[11px] text-slate-400 mt-4">
          Respeitamos a sua privacidade. Cancele a inscrição a qualquer momento com um clique.
        </p>
      </div>
    </div>
  );
}

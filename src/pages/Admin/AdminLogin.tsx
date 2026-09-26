import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminLogin({ onNavigate }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      onNavigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique os dados de acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div 
        onClick={() => onNavigate('/')} 
        className="flex items-center gap-1.5 mb-8 cursor-pointer select-none group"
      >
        <span className="text-3xl font-black text-white font-serif uppercase tracking-tight">
          NEXORA
        </span>
        <span className="text-3xl font-black text-[#CE1126] font-serif uppercase tracking-tight">
          NEWS
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#E53935] mb-2"></span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-50 text-[#CE1126]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000]">Área do Editor</h1>
            <p className="text-xs text-slate-500">Acesso restrito ao administrador do portal</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email do Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@nexoranews.ao"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Senha de Acesso
              </label>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs text-slate-500 hover:text-[#CE1126] font-medium"
          >
            ← Voltar para Nexora Angola
          </button>
        </div>
      </div>
    </div>
  );
}

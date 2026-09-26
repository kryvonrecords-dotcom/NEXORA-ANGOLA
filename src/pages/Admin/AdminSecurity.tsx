import React, { useState } from 'react';
import { KeyRound, Shield, Eye, EyeOff, Check, AlertCircle, Loader2, User } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminSecurity({ onNavigate }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Administrador');
  const [email, setEmail] = useState(user?.email || 'admin@nexoranews.ao');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não coincide.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.updateAdminProfile({
        name: name.trim(),
        email: email.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });

      setSuccess('Credenciais atualizadas com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar dados de segurança.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            Segurança & Credenciais
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerencie o email de login e altere a senha do administrador do portal.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          <span>Salvar Credenciais</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-emerald-700">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-[#CE1126]" />
          <span>Perfil do Administrador</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome de Exibição
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email de Acesso
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#CE1126]" />
            <span>Alterar Senha de Acesso</span>
          </h2>

          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPass ? 'Ocultar' : 'Mostrar'}</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Senha Atual (Necessária para validação)
          </label>
          <input
            type={showPass ? 'text' : 'password'}
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Insira a senha atual..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nova Senha
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirmar Nova Senha
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

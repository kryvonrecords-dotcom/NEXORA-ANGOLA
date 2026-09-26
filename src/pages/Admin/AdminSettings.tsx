import React, { useEffect, useState } from 'react';
import { Settings, Save, Check, Loader2, AlertCircle, Flame, Globe, Mail, Phone, MapPin, Share2, ArrowRight } from 'lucide-react';
import { PortalSettings } from '../../types';
import { api } from '../../services/api';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminSettings({ onNavigate }: Props) {
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Configurações Gerais | Nexora Admin';
    api.getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.updateSettings(settings);
      setSettings(res.settings);
      setSuccess('Configurações atualizadas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao guardar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mb-2" />
        <p className="text-sm text-slate-500 font-medium">A carregar configurações...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            Configurações do Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ajuste informações institucionais, contactos da redação e alerta de breaking news.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Alterações</span>
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

      {/* Social Media Shortcuts Card */}
      <div className="bg-gradient-to-r from-blue-900 to-[#000000] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-[#CE1126] rounded-xl text-white shadow-md shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Redes Sociais & Canais Oficiais</h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-lg">
              Gerencie links do WhatsApp, Instagram, YouTube, TikTok, Telegram, Facebook, X, Podcasts e botão flutuante.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/admin/redes-sociais')}
          className="px-4 py-2.5 bg-white hover:bg-slate-100 text-[#000000] font-bold text-xs sm:text-sm rounded-xl transition-all shadow shrink-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Gerir Redes Sociais</span>
          <ArrowRight className="w-4 h-4 text-[#CE1126]" />
        </button>
      </div>

      {/* Breaking News Global Bar Settings */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Flame className="w-5 h-5 text-[#E53935]" />
          <h2 className="font-bold text-slate-900 text-base">Barra Global de Notícia Urgente (Breaking News)</h2>
        </div>

        <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(settings.breakingNewsEnabled)}
            onChange={e => setSettings({ ...settings, breakingNewsEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
          />
          <span className="text-xs font-bold text-slate-800">
            Exibir Alerta Vermelho de Urgente no Topo de Todas as Páginas
          </span>
        </label>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Texto do Alerta de Urgência
          </label>
          <input
            type="text"
            value={settings.breakingNewsText || ''}
            onChange={e => setSettings({ ...settings, breakingNewsText: e.target.value })}
            placeholder="Ex: Cimeira extraordinária anuncia novas medidas económicas para o país..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
          />
        </div>
      </div>

      {/* Identity & Slogan */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Globe className="w-5 h-5 text-[#CE1126]" />
          <h2 className="font-bold text-slate-900 text-base">Identidade Editorial</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome do Portal
            </label>
            <input
              type="text"
              value={settings.siteName || ''}
              onChange={e => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Slogan Editorial
            </label>
            <input
              type="text"
              value={settings.siteTagline || ''}
              onChange={e => setSettings({ ...settings, siteTagline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>
        </div>
      </div>

      {/* Editorial Contact Information */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
          Dados de Contacto da Redação
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Institucional
            </label>
            <input
              type="email"
              value={settings.contactEmail || ''}
              onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              value={settings.contactPhone || ''}
              onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Endereço Físico da Redação
          </label>
          <input
            type="text"
            value={settings.address || ''}
            onChange={e => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
          />
        </div>
      </div>
    </form>
  );
}

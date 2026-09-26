import React, { useEffect, useState } from 'react';
import { 
  Share2, 
  Save, 
  Check, 
  Loader2, 
  AlertCircle, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Send, 
  Linkedin, 
  Music, 
  Smartphone, 
  Globe, 
  CheckCircle2,
  X,
  Sparkles,
  Radio,
  Copy
} from 'lucide-react';
import { CustomSocialLink, SiteSettings, SocialLinksMap } from '../../types';
import { api } from '../../services/api';

interface Props {
  onNavigate: (path: string) => void;
}

interface SocialPlatformInfo {
  key: keyof SocialLinksMap;
  label: string;
  placeholder: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  defaultPrefix: string;
}

const PLATFORMS: SocialPlatformInfo[] = [
  {
    key: 'whatsapp',
    label: 'WhatsApp (Canal / Contacto)',
    placeholder: 'https://wa.me/244921281315 ou https://chat.whatsapp.com/...',
    description: 'Canal oficial, grupo de leitores ou número de atendimento',
    icon: MessageCircle,
    color: '#25D366',
    bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    defaultPrefix: 'https://wa.me/'
  },
  {
    key: 'facebook',
    label: 'Facebook (Página Oficial)',
    placeholder: 'https://facebook.com/nexoranews',
    description: 'Página pública de notícias e transmissões ao vivo',
    icon: Facebook,
    color: '#1877F2',
    bgLight: 'bg-blue-50 text-[#A50D1F] border-blue-200',
    defaultPrefix: 'https://facebook.com/'
  },
  {
    key: 'instagram',
    label: 'Instagram (@nexoranews)',
    placeholder: 'https://instagram.com/nexoranews',
    description: 'Stories, reels e destaques em imagens',
    icon: Instagram,
    color: '#E4405F',
    bgLight: 'bg-rose-50 text-rose-600 border-rose-200',
    defaultPrefix: 'https://instagram.com/'
  },
  {
    key: 'twitter',
    label: 'X (antigo Twitter)',
    placeholder: 'https://x.com/nexoranews',
    description: 'Notícias de última hora e cobertura minuto a minuto',
    icon: Twitter,
    color: '#000000',
    bgLight: 'bg-slate-100 text-slate-900 border-slate-300',
    defaultPrefix: 'https://x.com/'
  },
  {
    key: 'youtube',
    label: 'YouTube (Canal Oficial)',
    placeholder: 'https://youtube.com/@nexoranews',
    description: 'Reportagens completas, entrevistas e programas especiais',
    icon: Youtube,
    color: '#FF0000',
    bgLight: 'bg-red-50 text-red-600 border-red-200',
    defaultPrefix: 'https://youtube.com/@'
  },
  {
    key: 'telegram',
    label: 'Telegram (Canal de Notícias)',
    placeholder: 'https://t.me/nexoranews',
    description: 'Alertas urgentes instantâneos direto no telemóvel',
    icon: Send,
    color: '#229ED9',
    bgLight: 'bg-sky-50 text-sky-600 border-sky-200',
    defaultPrefix: 'https://t.me/'
  },
  {
    key: 'tiktok',
    label: 'TikTok (Vídeos Curtos)',
    placeholder: 'https://tiktok.com/@nexoranews',
    description: 'Vídeos informativos rápidos e bastidores da redação',
    icon: Music,
    color: '#000000',
    bgLight: 'bg-purple-50 text-purple-600 border-purple-200',
    defaultPrefix: 'https://tiktok.com/@'
  },
  {
    key: 'linkedin',
    label: 'LinkedIn (Página Corporativa)',
    placeholder: 'https://linkedin.com/company/nexoranews',
    description: 'Notícias de economia, negócios e comunicados institucionais',
    icon: Linkedin,
    color: '#0A66C2',
    bgLight: 'bg-blue-50 text-[#A50D1F] border-blue-200',
    defaultPrefix: 'https://linkedin.com/company/'
  },
  {
    key: 'threads',
    label: 'Threads (@nexoranews)',
    placeholder: 'https://threads.net/@nexoranews',
    description: 'Debates rápidos e interação com a comunidade',
    icon: Globe,
    color: '#101010',
    bgLight: 'bg-neutral-100 text-neutral-900 border-neutral-300',
    defaultPrefix: 'https://threads.net/@'
  },
  {
    key: 'spotify',
    label: 'Spotify / Podcasts',
    placeholder: 'https://open.spotify.com/show/nexoranews',
    description: 'Edições diárias do podcast de notícias e análises em áudio',
    icon: Radio,
    color: '#1DB954',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    defaultPrefix: 'https://open.spotify.com/show/'
  },
  {
    key: 'playStore',
    label: 'Google Play Store (App Android)',
    placeholder: 'https://play.google.com/store/apps/details?id=ao.nexora.news',
    description: 'Link direto para baixar o aplicativo oficial no Android',
    icon: Smartphone,
    color: '#01875F',
    bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    defaultPrefix: 'https://play.google.com/store'
  },
  {
    key: 'appStore',
    label: 'Apple App Store (App iOS)',
    placeholder: 'https://apps.apple.com/app/nexora-news/id123456789',
    description: 'Link direto para baixar o aplicativo no iPhone e iPad',
    icon: Smartphone,
    color: '#0070c9',
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    defaultPrefix: 'https://apps.apple.com/'
  }
];

export function AdminSocialMedia({ onNavigate }: Props) {
  const [socialLinks, setSocialLinks] = useState<SocialLinksMap>({});
  const [customLinks, setCustomLinks] = useState<CustomSocialLink[]>([]);
  const [whatsappFloating, setWhatsappFloating] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('+244 921 281 315');
  const [whatsappMessage, setWhatsappMessage] = useState('Olá! Gostaria de falar com a redação do Nexora Angola.');
  const [showInHeader, setShowInHeader] = useState(true);
  const [showInFooter, setShowInFooter] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomIndex, setEditingCustomIndex] = useState<number | null>(null);
  const [customFormData, setCustomFormData] = useState<CustomSocialLink>({
    id: '',
    platform: 'other',
    label: '',
    url: '',
    username: '',
    followersText: '',
    isActive: true,
    color: '#CE1126',
    showInHeader: true,
    showInFooter: true
  });

  useEffect(() => {
    document.title = 'Redes Sociais & Canais | Nexora Admin';
    async function loadData() {
      try {
        const data = await api.getAdminSocialMedia();
        setSocialLinks(data.socialLinks || {});
        setCustomLinks(data.customSocialLinks || []);
        setWhatsappFloating(data.whatsappFloatingEnabled ?? true);
        setWhatsappNumber(data.whatsappFloatingNumber || '+244 921 281 315');
        setWhatsappMessage(data.whatsappFloatingMessage || 'Olá! Gostaria de falar com a redação do Nexora Angola.');
        setShowInHeader(data.showSocialInHeader ?? true);
        setShowInFooter(data.showSocialInFooter ?? true);
      } catch (err: any) {
        console.error('Erro ao carregar redes sociais:', err);
        setError(err.message || 'Falha ao carregar configurações de redes sociais.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLinkChange = (key: keyof SocialLinksMap, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTestLink = (url?: string) => {
    if (!url) return;
    const formatted = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    window.open(formatted, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = (url?: string, key?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    if (key) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.updateSocialMedia({
        socialLinks,
        customSocialLinks: customLinks,
        whatsappFloatingEnabled: whatsappFloating,
        whatsappFloatingNumber: whatsappNumber,
        whatsappFloatingMessage: whatsappMessage,
        showSocialInHeader: showInHeader,
        showSocialInFooter: showInFooter
      });

      setSuccess('Redes sociais e canais salvos com sucesso!');
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar redes sociais.');
    } finally {
      setSaving(false);
    }
  };

  // Custom Links handlers
  const openNewCustomModal = () => {
    setCustomFormData({
      id: `custom-${Date.now()}`,
      platform: 'other',
      label: '',
      url: '',
      username: '',
      followersText: '',
      isActive: true,
      color: '#CE1126',
      showInHeader: true,
      showInFooter: true
    });
    setEditingCustomIndex(null);
    setIsModalOpen(true);
  };

  const openEditCustomModal = (index: number) => {
    setCustomFormData({ ...customLinks[index] });
    setEditingCustomIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveCustomModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormData.label || !customFormData.url) return;

    if (editingCustomIndex !== null) {
      const updated = [...customLinks];
      updated[editingCustomIndex] = customFormData;
      setCustomLinks(updated);
    } else {
      setCustomLinks([...customLinks, customFormData]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCustom = (index: number) => {
    const updated = customLinks.filter((_, i) => i !== index);
    setCustomLinks(updated);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mb-2" />
        <p className="text-sm text-slate-500 font-medium">A carregar redes sociais e canais...</p>
      </div>
    );
  }

  // Count active social networks
  const activeCount = Object.values(socialLinks).filter(Boolean).length + customLinks.filter(c => c.isActive).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#CE1126]">
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              Redes Sociais & Canais Oficiais
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conecte o portal às redes oficiais ({activeCount} canais configurados). Os links são atualizados em tempo real no cabeçalho, rodapé e artigos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openNewCustomModal}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#CE1126]" />
            <span>Adicionar Canal</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* 1. Global Visibility Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#CE1126]" />
          <span>Visibilidade no Portal</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showInHeader}
              onChange={e => setShowInHeader(e.target.checked)}
              className="w-4 h-4 rounded text-[#CE1126] focus:ring-[#CE1126]"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Exibir Ícones no Topo do Portal (Barra Superior)
              </span>
              <span className="text-[11px] text-slate-500">
                Mostra atalhos sociais na barra de utilidades e no menu mobile
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showInFooter}
              onChange={e => setShowInFooter(e.target.checked)}
              className="w-4 h-4 rounded text-[#CE1126] focus:ring-[#CE1126]"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Exibir Ícones no Rodapé (Footer)
              </span>
              <span className="text-[11px] text-slate-500">
                Apresenta todos os canais oficiais na área inferior do portal
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Floating WhatsApp Widget */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-white to-white rounded-2xl p-6 border border-emerald-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Botão Flutuante do WhatsApp no Portal</h2>
              <p className="text-[11px] text-slate-500">Permite aos leitores e anunciantes entrar em contacto com 1 clique</p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={whatsappFloating}
              onChange={e => setWhatsappFloating(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>{whatsappFloating ? 'Ativado no Portal' : 'Desativado'}</span>
          </label>
        </div>

        {whatsappFloating && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Número de WhatsApp (com DDI e DDD)
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="Ex: +244 921 281 315"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mensagem Padrão Inicial
              </label>
              <input
                type="text"
                value={whatsappMessage}
                onChange={e => setWhatsappMessage(e.target.value)}
                placeholder="Ex: Olá! Gostaria de falar com a redação do Nexora Angola."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Platforms Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#CE1126]" />
            <span>Principais Redes Sociais & Aplicativos</span>
          </h2>
          <span className="text-xs text-slate-500">Deixe em branco as redes que não deseja exibir</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PLATFORMS.map(platform => {
            const Icon = platform.icon;
            const value = socialLinks[platform.key] || '';
            const isFilled = Boolean(value.trim());

            return (
              <div 
                key={platform.key} 
                className={`p-4 rounded-2xl border transition-all ${
                  isFilled ? 'bg-slate-50/70 border-slate-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${platform.bgLight}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block">
                        {platform.label}
                      </label>
                      <span className="text-[10px] text-slate-500 leading-none">
                        {platform.description}
                      </span>
                    </div>
                  </div>

                  {isFilled && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTestLink(value)}
                        className="p-1.5 text-slate-500 hover:text-[#CE1126] rounded-lg hover:bg-slate-200 transition-colors"
                        title="Abrir e Testar Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(value, String(platform.key))}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Copiar Link"
                      >
                        {copiedKey === platform.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={value}
                    onChange={e => handleLinkChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126] transition-all font-mono"
                  />
                  {value && (
                    <button
                      type="button"
                      onClick={() => handleLinkChange(platform.key, '')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-1"
                      title="Limpar campo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Custom Social Networks / Adicionais */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#CE1126]" />
              <span>Canais e Redes Adicionais Personalizadas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adicione links específicos como Discord, Bluesky, Kwai, Pinterest ou Canais Regionais
            </p>
          </div>

          <button
            type="button"
            onClick={openNewCustomModal}
            className="px-3.5 py-1.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Canal</span>
          </button>
        </div>

        {customLinks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Nenhum canal personalizado adicionado.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Clique em "Adicionar Canal" para incluir redes específicas ou grupos comunitários.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customLinks.map((item, index) => (
              <div 
                key={item.id || index}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color || '#CE1126' }}
                  >
                    {item.label.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">{item.label}</span>
                      {item.followersText && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#FDECEF] text-[#CE1126]">
                          {item.followersText}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 truncate block">{item.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTestLink(item.url)}
                    className="p-1.5 text-slate-400 hover:text-[#CE1126] rounded-lg hover:bg-slate-200"
                    title="Testar Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditCustomModal(index)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustom(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Live Preview Widget */}
      <div className="bg-[#000000] text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#CE1126]" />
            <h2 className="font-bold text-white text-base">Pré-visualização em Tempo Real (Como os Leitores Vêem)</h2>
          </div>
          <span className="text-[11px] text-slate-400">Clique em qualquer ícone para testar</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
          {PLATFORMS.map(p => {
            const url = socialLinks[p.key];
            if (!url) return null;
            const Icon = p.icon;
            return (
              <a
                key={p.key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-[#CE1126] text-slate-200 hover:text-white transition-all transform hover:-translate-y-0.5 shadow flex items-center gap-2 text-xs font-semibold"
                title={`${p.label}: ${url}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{p.label.split(' ')[0]}</span>
              </a>
            );
          })}

          {customLinks.filter(c => c.isActive).map(c => (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl text-white transition-all transform hover:-translate-y-0.5 shadow flex items-center gap-1.5 text-xs font-semibold"
              style={{ backgroundColor: c.color || '#CE1126' }}
              title={`${c.label}: ${c.url}`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </a>
          ))}

          {activeCount === 0 && (
            <p className="text-xs text-slate-500 italic">Preencha os campos acima para ver os ícones interativos aqui.</p>
          )}
        </div>
      </div>

      {/* Floating Save Button Bar on Bottom */}
      <div className="sticky bottom-4 z-20 flex justify-end">
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="px-6 py-3 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-black text-sm rounded-2xl transition-all shadow-2xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Salvar Todas as Redes Sociais</span>
        </button>
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomIndex !== null ? 'Editar Canal Personalizado' : 'Novo Canal Personalizado'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomModal} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Canal / Rede</label>
                <input
                  type="text"
                  required
                  value={customFormData.label}
                  onChange={e => setCustomFormData({ ...customFormData, label: e.target.value })}
                  placeholder="Ex: Canal Discord, Comunidade Kwai, Bluesky..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#CE1126] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL de Destino (Link Completo)</label>
                <input
                  type="url"
                  required
                  value={customFormData.url}
                  onChange={e => setCustomFormData({ ...customFormData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#CE1126] outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Texto de Destaque</label>
                  <input
                    type="text"
                    value={customFormData.followersText || ''}
                    onChange={e => setCustomFormData({ ...customFormData, followersText: e.target.value })}
                    placeholder="Ex: 50K membros"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#CE1126] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cor do Botão</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customFormData.color || '#CE1126'}
                      onChange={e => setCustomFormData({ ...customFormData, color: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={customFormData.color || '#CE1126'}
                      onChange={e => setCustomFormData({ ...customFormData, color: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#CE1126] hover:bg-[#A50D1F] text-white rounded-xl text-xs font-bold shadow"
                >
                  Guardar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

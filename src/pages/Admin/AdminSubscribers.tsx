import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Trash2, 
  Loader2, 
  Mail, 
  Check, 
  Send, 
  Plus, 
  History, 
  Settings as SettingsIcon, 
  Eye, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  X, 
  Copy, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Layers,
  FileText
} from 'lucide-react';
import { NewsItem, NewsletterCampaign, Subscriber } from '../../types';
import { api } from '../../services/api';
import { formatDateTime, formatDate, truncateText } from '../../lib/utils';

interface Props {
  onNavigate?: (path: string) => void;
}

type TabType = 'subscribers' | 'broadcast' | 'history' | 'settings';

export function AdminSubscribers({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalCampaigns: 0,
    lastCampaignDate: null as string | null,
    averageOpenRate: 65,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal: Add Subscriber
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Broadcast Form State
  const [broadcastSubject, setBroadcastSubject] = useState('Boletim Diário Nexora Angola: Principais Destaques de Hoje');
  const [broadcastPreviewText, setBroadcastPreviewText] = useState('Confira as principais notícias e análises de Angola e do mundo selecionadas pela nossa redação.');
  const [broadcastIntro, setBroadcastIntro] = useState('Estimado leitor,\n\nReunimos aqui as principais reportagens e destaques do dia para o manter sempre bem informado.');
  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([]);
  const [broadcastCustomNote, setBroadcastCustomNote] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Newsletter Settings State
  const [senderName, setSenderName] = useState('Nexora Angola - Redação');
  const [senderEmail, setSenderEmail] = useState('newsletter@nexoranews.ao');
  const [frequencyLabel, setFrequencyLabel] = useState('Diária (Segunda a Sábado, às 07:30)');
  const [footerDisclaimer, setFooterDisclaimer] = useState('Recebeu este email porque se inscreveu na newsletter do portal Nexora Angola Angola.');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Subscribers
      const subRes = await api.getAdminSubscribers().catch(() => ({ subscribers: [] }));
      const subList = Array.isArray(subRes?.subscribers)
        ? subRes.subscribers
        : Array.isArray(subRes)
        ? subRes
        : [];
      setSubscribers(subList);

      // 2. Fetch Stats
      const statsRes = await api.getNewsletterStats().catch(() => null);
      if (statsRes) {
        setStats({
          totalSubscribers: statsRes.totalSubscribers ?? subList.length,
          activeSubscribers: statsRes.activeSubscribers ?? subList.length,
          totalCampaigns: statsRes.totalCampaigns ?? 0,
          lastCampaignDate: statsRes.lastCampaignDate ?? null,
          averageOpenRate: statsRes.averageOpenRate ?? 65,
        });
      } else {
        setStats(prev => ({
          ...prev,
          totalSubscribers: subList.length,
          activeSubscribers: subList.length,
        }));
      }

      // 3. Fetch Campaigns
      const campRes = await api.getNewsletterCampaigns().catch(() => []);
      const campList = Array.isArray(campRes) ? campRes : [];
      setCampaigns(campList);

      // 4. Fetch Published News for Broadcast selection
      const newsRes = await api.getNews({ limit: 10 }).catch(() => ({ news: [] }));
      const newsItems = Array.isArray(newsRes?.news) ? newsRes.news : [];
      setRecentNews(newsItems);

      // Preselect top 3 news for convenience if not selected yet
      if (newsItems.length > 0 && selectedNewsIds.length === 0) {
        setSelectedNewsIds(newsItems.slice(0, 3).map(n => n.id));
      }
    } catch (err: any) {
      console.error('Error loading newsletter data:', err);
      showNotification('Erro ao carregar dados da newsletter.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Newsletter & Subscritores | Nexora Admin';
    loadData();
  }, []);

  const safeSubscribers = Array.isArray(subscribers) ? subscribers : [];
  const filteredSubscribers = safeSubscribers.filter(s => {
    if (!s || !s.email) return false;
    if (!search.trim()) return true;
    return s.email.toLowerCase().includes(search.toLowerCase().trim());
  });

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showNotification('Por favor, introduza um email válido.', true);
      return;
    }

    setIsAdding(true);
    try {
      await api.addAdminSubscriber(cleanEmail);
      showNotification(`Subscritor "${cleanEmail}" adicionado com sucesso.`);
      setNewEmailInput('');
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao adicionar subscritor.', true);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Tem certeza de que deseja remover o email "${email}" da lista de subscritores?`)) {
      return;
    }

    try {
      await api.deleteSubscriber(id);
      setSubscribers(prev => (Array.isArray(prev) ? prev.filter(s => s.id !== id) : []));
      showNotification('Subscritor removido com sucesso.');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao remover subscritor.', true);
    }
  };

  const handleCopyEmail = (email: string, id: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  const handleExportCSV = () => {
    try {
      const header = 'Email,Data de Subscricao,Status';
      const rows = safeSubscribers.map(s => `"${s.email || ''}","${s.createdAt || ''}","${s.status || 'active'}"`);
      const csvContent = '\uFEFF' + [header, ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nexora_newsletter_subscritores_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification('Lista exportada em formato CSV com sucesso.');
    } catch (err) {
      showNotification('Falha ao exportar ficheiro CSV.', true);
    }
  };

  const toggleNewsSelection = (id: string) => {
    setSelectedNewsIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim()) {
      showNotification('Por favor, preencha o assunto da Newsletter.', true);
      return;
    }

    const count = safeSubscribers.length;
    if (!confirm(`Confirma o envio desta edição da Newsletter para todos os ${count} subscritores registados?`)) {
      return;
    }

    setIsSendingBroadcast(true);
    try {
      const res = await api.broadcastNewsletter({
        subject: broadcastSubject.trim(),
        previewText: broadcastPreviewText.trim(),
        introText: broadcastIntro.trim(),
        selectedNewsIds,
        customContent: broadcastCustomNote.trim()
      });

      showNotification(res.message || 'Newsletter enviada com sucesso para toda a lista!');
      loadData();
      setActiveTab('history');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao enviar a newsletter.', true);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const selectedArticles = recentNews.filter(n => selectedNewsIds.includes(n.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#CE1126] flex items-center justify-center shrink-0 border border-[#FDECEF]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                  Newsletter & Subscrições
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Gestão da audiência, envio de boletins diários e acompanhamento de subscritores do Nexora Angola.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#CE1126]" />
              <span>Adicionar Subscritor</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={safeSubscribers.length === 0}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className="px-4 py-2 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Disparar Newsletter</span>
            </button>
          </div>
        </div>

        {/* Notifications feedback */}
        {successMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total de Subscritores</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{safeSubscribers.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Base ativa
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Edições Enviadas</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{campaigns.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Campanhas disparadas</div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taxa Média de Abertura</div>
            <div className="text-xl sm:text-2xl font-black text-[#CE1126] mt-1">{stats.averageOpenRate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Estimativa do público</div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Último Disparo</div>
            <div className="text-sm font-bold text-slate-800 mt-1 truncate">
              {stats.lastCampaignDate ? formatDate(stats.lastCampaignDate) : 'Hoje cedo'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Boletim programado</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'subscribers'
              ? 'bg-[#CE1126] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Subscritores ({safeSubscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'broadcast'
              ? 'bg-[#CE1126] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Disparar Nova Edição</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#CE1126] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Envios ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#CE1126] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Configurações do Boletim</span>
        </button>
      </div>

      {/* TAB 1: SUBSCRIBERS LIST */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar por endereço de email..."
                className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-slate-600 w-full sm:w-auto text-right">
              A exibir: <span className="text-[#CE1126] font-black">{filteredSubscribers.length}</span> de {safeSubscribers.length} leitores
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#CE1126]" />
              <p className="text-sm font-medium">A carregar subscritores...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-800 text-base">Nenhum subscritor encontrado</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `Nenhum resultado corresponde à pesquisa "${search}".`
                  : 'Os utilizadores que subscreverem a newsletter no portal aparecerão aqui automaticamente.'}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Primeiro Subscritor</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Leitor / Email</th>
                    <th className="py-3.5 px-4 sm:px-6">Data de Inscrição</th>
                    <th className="py-3.5 px-4 sm:px-6">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscribers.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#CE1126] font-bold text-xs flex items-center justify-center shrink-0 border border-[#FDECEF]">
                            {sub.email ? sub.email.charAt(0).toUpperCase() : 'L'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 select-all">{sub.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500">
                        {sub.createdAt ? formatDateTime(sub.createdAt) : 'Data recente'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Ativo
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyEmail(sub.email, sub.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Copiar email"
                          >
                            {copiedEmailId === sub.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remover subscritor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BROADCAST / ENVIAR EDIÇÃO */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#CE1126]" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                    Compositor de Newsletter
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="lg:hidden text-xs font-bold text-[#CE1126] flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {previewMode ? 'Ver Formulário' : 'Ver Prévia'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assunto do Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={e => setBroadcastSubject(e.target.value)}
                  placeholder="Ex: Nexora Resumo Diário: Principais manchetes de Angola e do Mundo"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Texto de Pré-visualização (Preheader)
                </label>
                <input
                  type="text"
                  value={broadcastPreviewText}
                  onChange={e => setBroadcastPreviewText(e.target.value)}
                  placeholder="Breve resumo que aparece na caixa de entrada antes de abrir o email"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nota de Abertura da Redação
                </label>
                <textarea
                  rows={3}
                  value={broadcastIntro}
                  onChange={e => setBroadcastIntro(e.target.value)}
                  placeholder="Mensagem editorial para os leitores..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>

              {/* News Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Notícias em Destaque no Boletim ({selectedNewsIds.length} selecionadas)
                  </label>
                  <span className="text-[11px] text-slate-400">Marque as reportagens a incluir</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {recentNews.map(item => {
                    const isSelected = selectedNewsIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleNewsSelection(item.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'bg-blue-50/80 border-[#F9D616] text-slate-900 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#CE1126] focus:ring-[#CE1126] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                              {item.categoryName || 'Geral'}
                            </span>
                            <span className="text-[10px] text-slate-400">{formatDate(item.publishedAt)}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {truncateText(item.excerpt || item.content, 90)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mensagem / Anúncio Adicional (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={broadcastCustomNote}
                  onChange={e => setBroadcastCustomNote(e.target.value)}
                  placeholder="Ex: Acompanhe também a nossa cobertura especial nas redes sociais..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSendBroadcast}
                  disabled={isSendingBroadcast || safeSubscribers.length === 0}
                  className="w-full py-3.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingBroadcast ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>A enviar edição para {safeSubscribers.length} subscritores...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Disparar Newsletter para {safeSubscribers.length} Leitores</span>
                    </>
                  )}
                </button>
                {safeSubscribers.length === 0 && (
                  <p className="text-[11px] text-rose-500 text-center mt-2">
                    Não há subscritores registados para receber o envio.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Email Preview Mockup */}
          <div className={`lg:col-span-5 ${previewMode ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-[#CE1126]" />
                  <span>Pré-visualização do Email</span>
                </div>
                <span className="text-[10px] text-slate-400">Modelo Responsivo HTML</span>
              </div>

              {/* Email Client Frame */}
              <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 space-y-2">
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div><span className="font-bold text-slate-400">De:</span> {senderName} &lt;{senderEmail}&gt;</div>
                  <div><span className="font-bold text-slate-400">Para:</span> leitor@exemplo.ao</div>
                  <div><span className="font-bold text-slate-400">Assunto:</span> <span className="font-bold text-slate-900">{broadcastSubject || 'Sem assunto'}</span></div>
                </div>

                {/* Email Body */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-4 max-h-[500px] overflow-y-auto">
                  {/* Email Header */}
                  <div className="text-center pb-3 border-b-2 border-[#000000]">
                    <span className="text-xl font-black font-serif text-[#000000] uppercase tracking-wider">NEXORA</span>
                    <span className="text-xl font-black font-serif text-[#CE1126] uppercase tracking-wider ml-1">NEWS</span>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      Boletim Informativo • {formatDate(new Date().toISOString())}
                    </div>
                  </div>

                  {/* Intro */}
                  {broadcastIntro && (
                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {broadcastIntro}
                    </div>
                  )}

                  {/* Articles */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      Destaques da Edição
                    </div>

                    {selectedArticles.length === 0 ? (
                      <div className="text-xs text-slate-400 italic text-center py-4">
                        Nenhuma notícia selecionada para esta edição.
                      </div>
                    ) : (
                      selectedArticles.map(article => (
                        <div key={article.id} className="pb-3 border-b border-slate-100 last:border-0 space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#CE1126]">
                            {article.categoryName || 'Notícia'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {article.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {article.excerpt || truncateText(article.content, 90)}
                          </p>
                          <div className="pt-1">
                            <span className="text-[10px] font-bold text-[#CE1126] hover:underline inline-flex items-center gap-1">
                              Ler notícia completa →
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Custom Note */}
                  {broadcastCustomNote && (
                    <div className="p-2.5 bg-blue-50/70 border border-[#FDECEF] rounded-lg text-xs text-slate-700">
                      {broadcastCustomNote}
                    </div>
                  )}

                  {/* Email Footer */}
                  <div className="pt-4 border-t border-slate-200 text-center space-y-1.5">
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {footerDisclaimer}
                    </p>
                    <div className="text-[9px] text-slate-400 space-x-2">
                      <span className="underline cursor-pointer">Cancelar subscrição</span>
                      <span>•</span>
                      <span className="underline cursor-pointer">Preferências de email</span>
                      <span>•</span>
                      <span className="underline cursor-pointer">Visitar Nexora Angola</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAMPAIGN HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#CE1126]" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Histórico de Edições Disparadas
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total: {campaigns.length} disparos
            </span>
          </div>

          {campaigns.length === 0 ? (
            <div className="py-20 text-center px-4">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-base">Nenhuma edição enviada ainda</p>
              <p className="text-xs text-slate-400 mt-1">
                Utilize a aba "Disparar Nova Edição" para compor e enviar a sua primeira newsletter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Assunto / Conteúdo</th>
                    <th className="py-3.5 px-4 sm:px-6">Data de Envio</th>
                    <th className="py-3.5 px-4 sm:px-6">Destinatários</th>
                    <th className="py-3.5 px-4 sm:px-6">Taxa de Abertura</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.map(camp => (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 leading-snug">{camp.subject}</div>
                        {camp.previewText && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{camp.previewText}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-600 whitespace-nowrap">
                        {camp.sentAt ? formatDateTime(camp.sentAt) : 'Recentemente'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800 whitespace-nowrap">
                        {camp.sentCount || stats.totalSubscribers} leitores
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#CE1126] h-2 rounded-full"
                              style={{ width: `${camp.openRateEstimated || 65}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700 text-xs">{camp.openRateEstimated || 65}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Entregue
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SETTINGS & CONFIG */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Configurações Gerais do Boletim
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize o remetente, horários de envio e informações institucionais dos e-mails.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome do Remetente
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email de Envio / Resposta
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={e => setSenderEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Frequência Padrão Informada ao Leitor
              </label>
              <input
                type="text"
                value={frequencyLabel}
                onChange={e => setFrequencyLabel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Texto de Isenção e Rodapé do Email
              </label>
              <textarea
                rows={3}
                value={footerDisclaimer}
                onChange={e => setFooterDisclaimer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => showNotification('Configurações da newsletter salvas com sucesso.')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBSCRIBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#CE1126]" />
                <h3 className="font-bold text-base text-slate-900">
                  Adicionar Novo Subscritor
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Endereço de Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmailInput}
                  onChange={e => setNewEmailInput(e.target.value)}
                  placeholder="exemplo@dominio.ao"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  O leitor passará a receber os resumos diários de notícias disparados pela redação.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Adicionar Subscritor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

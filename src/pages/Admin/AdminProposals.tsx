import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  ExternalLink, 
  Loader2, 
  Eye, 
  Check, 
  X, 
  Tag, 
  RefreshCw,
  Send,
  PlusCircle,
  Briefcase
} from 'lucide-react';
import { CommercialProposal, EditorialContactMessage, ProposalStatus, ContactMessageStatus } from '../../types';
import { api } from '../../services/api';
import { formatDate } from '../../lib/utils';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminProposals({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<'proposals' | 'editorial'>('proposals');
  
  // Proposals State
  const [proposals, setProposals] = useState<CommercialProposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [proposalStatusFilter, setProposalStatusFilter] = useState<string>('all');
  const [proposalSearch, setProposalSearch] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<CommercialProposal | null>(null);

  // Editorial Messages State
  const [messages, setMessages] = useState<EditorialContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageStatusFilter, setMessageStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<EditorialContactMessage | null>(null);

  // Edit / Action State
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [deleteModalItem, setDeleteModalItem] = useState<{ id: string; type: 'proposal' | 'message'; name: string } | null>(null);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Propostas Comerciais & Redação | Admin Nexora Angola';
    loadProposals();
    loadMessages();
  }, []);

  const loadProposals = async () => {
    setLoadingProposals(true);
    try {
      const data = await api.getAdminAdProposals();
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar propostas comerciais:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await api.getAdminContactMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar mensagens editoriais:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleUpdateProposalStatus = async (id: string, newStatus: ProposalStatus, notes?: string) => {
    setActionLoading(true);
    try {
      const payload: Partial<CommercialProposal> = { status: newStatus };
      if (notes !== undefined) payload.notes = notes;
      const res = await api.updateAdminAdProposal(id, payload);
      
      setProposals(prev => prev.map(p => p.id === id ? res.proposal : p));
      if (selectedProposal && selectedProposal.id === id) {
        setSelectedProposal(res.proposal);
      }
      setStatusSuccessMessage('Status da proposta atualizado com sucesso.');
      setTimeout(() => setStatusSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Falha ao atualizar proposta:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMessageStatus = async (id: string, newStatus: ContactMessageStatus) => {
    setActionLoading(true);
    try {
      const res = await api.updateAdminContactMessage(id, { status: newStatus });
      setMessages(prev => prev.map(m => m.id === id ? res.item : m));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(res.item);
      }
      setStatusSuccessMessage('Status da mensagem atualizado.');
      setTimeout(() => setStatusSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Falha ao atualizar mensagem:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    setActionLoading(true);
    try {
      if (deleteModalItem.type === 'proposal') {
        await api.deleteAdminAdProposal(deleteModalItem.id);
        setProposals(prev => prev.filter(p => p.id !== deleteModalItem.id));
        if (selectedProposal?.id === deleteModalItem.id) setSelectedProposal(null);
      } else {
        await api.deleteAdminContactMessage(deleteModalItem.id);
        setMessages(prev => prev.filter(m => m.id !== deleteModalItem.id));
        if (selectedMessage?.id === deleteModalItem.id) setSelectedMessage(null);
      }
      setDeleteModalItem(null);
    } catch (err) {
      console.error('Erro ao eliminar item:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProposals = proposals.filter(p => {
    if (proposalStatusFilter !== 'all' && p.status !== proposalStatusFilter) return false;
    if (proposalSearch.trim()) {
      const query = proposalSearch.toLowerCase();
      const matchCompany = p.company?.toLowerCase().includes(query);
      const matchName = p.contactName?.toLowerCase().includes(query);
      const matchEmail = p.email?.toLowerCase().includes(query);
      const matchPhone = p.phone?.toLowerCase().includes(query);
      const matchFormat = p.adFormat?.toLowerCase().includes(query);
      return matchCompany || matchName || matchEmail || matchPhone || matchFormat;
    }
    return true;
  });

  const filteredMessages = messages.filter(m => {
    if (messageStatusFilter !== 'all' && m.status !== messageStatusFilter) return false;
    return true;
  });

  const getFormatLabel = (fmt: string) => {
    switch (fmt) {
      case 'hero_banner': return 'Hero Banner Principal (Topo)';
      case 'sidebar_banner': return 'Banner Lateral & Notícias';
      case 'publirreportagem': return 'Publirreportagem Patrocinada';
      case 'patrocinio_categoria': return 'Patrocínio de Categoria';
      case 'pacote_completo': return 'Pacote Multimídia 360°';
      default: return fmt;
    }
  };

  const getBudgetLabel = (b?: string) => {
    switch (b) {
      case '1_semana': return '1 a 2 Semanas';
      case '1_mes': return '1 Mês (30 Dias)';
      case 'trimestral': return 'Pacote Trimestral';
      case 'anual': return 'Parceria Anual';
      default: return b || 'Padrão';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
      case 'reviewed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDECEF] text-blue-800 border border-blue-200 inline-flex items-center gap-1"><Eye className="w-3 h-3" /> Em Análise</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Contactado</span>;
      case 'closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Fechado / Concluído</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const unreadMessagesCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#000000] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#CE1126] uppercase tracking-widest">
              Setor Comercial & Redação
            </span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-900 animate-pulse">
                {pendingCount} {pendingCount === 1 ? 'NOVA PROPOSTA' : 'NOVAS PROPOSTAS'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black font-serif">
            Propostas de Publicidade & Mensagens
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Receba e responda às solicitações de anunciantes do formulário Mídia Kit e mensagens dos leitores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/publicidades')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>Gerir Banners Ativos</span>
          </button>

          <button
            onClick={() => {
              loadProposals();
              loadMessages();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {statusSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{statusSuccessMessage}</span>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'proposals'
              ? 'bg-[#CE1126] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Propostas Comerciais (Mídia Kit)</span>
          {pendingCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'proposals' ? 'bg-white text-[#CE1126]' : 'bg-amber-500 text-slate-900'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('editorial')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'editorial'
              ? 'bg-[#CE1126] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Fale com a Redação</span>
          {unreadMessagesCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'editorial' ? 'bg-white text-[#CE1126]' : 'bg-blue-500 text-white'
            }`}>
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PROPOSTAS COMERCIAIS */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={proposalSearch}
                onChange={e => setProposalSearch(e.target.value)}
                placeholder="Pesquisar por empresa, contacto, email..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
              />
              {proposalSearch && (
                <button
                  onClick={() => setProposalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {[
                { id: 'all', label: 'Todas' },
                { id: 'pending', label: 'Pendentes' },
                { id: 'reviewed', label: 'Em Análise' },
                { id: 'contacted', label: 'Contactadas' },
                { id: 'closed', label: 'Fechadas' },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setProposalStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                    proposalStatusFilter === st.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Proposals List / Table */}
          {loadingProposals ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">A carregar propostas comerciais...</p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#CE1126] flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">Nenhuma proposta encontrada</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Quando uma empresa ou agência submeter uma solicitação no formulário "Anuncie no Nexora Angola", ela aparecerá listada aqui em tempo real.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredProposals.map(prop => {
                const whatsappClean = prop.phone?.replace(/[^0-9]/g, '');
                return (
                  <div
                    key={prop.id}
                    className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                      prop.status === 'pending'
                        ? 'border-amber-300 bg-amber-50/20 shadow-2xs'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Company & Contact Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 font-serif">
                            <Building2 className="w-4 h-4 text-[#CE1126]" />
                            {prop.company}
                          </span>
                          {getStatusBadge(prop.status)}
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(prop.createdAt)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {prop.contactName}
                          </span>
                          <a 
                            href={`mailto:${prop.email}?subject=Proposta Comercial Nexora Angola - ${encodeURIComponent(prop.company)}`}
                            className="flex items-center gap-1 text-[#CE1126] hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {prop.email}
                          </a>
                          <span className="flex items-center gap-1 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {prop.phone}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#A50D1F] border border-[#FDECEF] flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {getFormatLabel(prop.adFormat)}
                          </span>
                          {prop.budget && (
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              Duração: {getBudgetLabel(prop.budget)}
                            </span>
                          )}
                        </div>

                        {prop.message && (
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 mt-2 font-normal italic">
                            "{prop.message}"
                          </div>
                        )}

                        {prop.notes && (
                          <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 mt-2">
                            <strong>Notas Internas do Admin:</strong> {prop.notes}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        
                        {/* Quick Status Changers */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={prop.status}
                            disabled={actionLoading}
                            onChange={(e) => handleUpdateProposalStatus(prop.id, e.target.value as any)}
                            className="px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-hidden cursor-pointer hover:bg-slate-200 transition-colors"
                          >
                            <option value="pending">⏳ Pendente</option>
                            <option value="reviewed">👀 Em Análise</option>
                            <option value="contacted">💬 Contactado</option>
                            <option value="closed">✅ Fechado / Concluído</option>
                          </select>

                          <button
                            onClick={() => {
                              setSelectedProposal(prop);
                              setAdminNotes(prop.notes || '');
                            }}
                            className="p-1.5 bg-blue-50 hover:bg-[#FDECEF] text-[#CE1126] rounded-lg transition-colors cursor-pointer"
                            title="Ver detalhes e editar notas"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteModalItem({ id: prop.id, type: 'proposal', name: prop.company })}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar proposta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Direct Responder Links */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${prop.email}?subject=Proposta Comercial Nexora Angola - ${encodeURIComponent(prop.company)}&body=Ol%C3%A1%20${encodeURIComponent(prop.contactName)},%0A%0AAgradecemos%20o%20seu%20interesse%20em%20anunciar%20no%20Nexora%20News.%0A%0AEm%20anexo%20enviamos%20o%20nosso%20M%C3%ADdia%20Kit%20atualizado%20com%20as%20especifica%C3%A7%C3%B5es%20do%20formato%20${encodeURIComponent(getFormatLabel(prop.adFormat))}.%0A%0AFicamos%20ao%20dispor%20para%20agendar%20uma%20chamada.%0A%0AAtentamente,%0AEquipa%20Comercial%20Nexora%20News`}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Responder por Email</span>
                          </a>

                          {whatsappClean && (
                            <a
                              href={`https://wa.me/${whatsappClean}?text=Ol%C3%A1%20${encodeURIComponent(prop.contactName)},%20contacto%20da%20equipa%20comercial%20do%20Nexora%20News%20relativamente%20%C3%A0%20sua%20solicita%C3%A7%C3%A3o%20de%20publicidade%20para%20a%20empresa%20${encodeURIComponent(prop.company)}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MENSAGENS À REDAÇÃO */}
      {activeTab === 'editorial' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Filtro de Mensagens:
            </span>
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'unread', label: 'Não Lidas' },
                { id: 'read', label: 'Lidas' },
                { id: 'answered', label: 'Respondidas' },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setMessageStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    messageStatusFilter === st.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {loadingMessages ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">A carregar mensagens à redação...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#CE1126] flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">Nenhuma mensagem editorial</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Sugestões de pautas, denúncias e artigos submetidos pelo público serão listados aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    msg.status === 'unread'
                      ? 'border-[#F9D616] bg-blue-50/20 shadow-2xs'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm font-serif">
                          {msg.subject || 'Mensagem à Redação'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          msg.status === 'unread' ? 'bg-[#FDECEF] text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {msg.status === 'unread' ? 'Não Lida' : msg.status === 'answered' ? 'Respondida' : 'Lida'}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDate(msg.createdAt)}</span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-3">
                        <span><strong>Autor:</strong> {msg.name}</span>
                        <span><strong>Email:</strong> {msg.email}</span>
                        {msg.phone && <span><strong>Telefone:</strong> {msg.phone}</span>}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-100 mt-2">
                        {msg.message}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={msg.status}
                        onChange={e => handleUpdateMessageStatus(msg.id, e.target.value as any)}
                        className="px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
                      >
                        <option value="unread">Não Lida</option>
                        <option value="read">Lida</option>
                        <option value="answered">Respondida</option>
                        <option value="archived">Arquivada</option>
                      </select>

                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Contacto Nexora Angola')}`}
                        className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        title="Responder por email"
                      >
                        <Send className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => setDeleteModalItem({ id: msg.id, type: 'message', name: msg.subject || msg.name })}
                        className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Proposal Detail & Notes Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#CE1126]" />
                <h3 className="font-bold text-slate-900 text-base font-serif">Detalhes da Proposta Comercial</h3>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold">Empresa / Marca:</span>
                  <span className="text-slate-900 font-bold text-sm">{selectedProposal.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Responsável:</span>
                  <span className="text-slate-800 font-bold">{selectedProposal.contactName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Email:</span>
                  <span className="text-[#A50D1F] font-semibold">{selectedProposal.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Telefone / WhatsApp:</span>
                  <span className="text-slate-800 font-semibold">{selectedProposal.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Formato Solicitado:</span>
                  <span className="text-[#CE1126] font-bold">{getFormatLabel(selectedProposal.adFormat)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Duração:</span>
                  <span className="text-slate-800 font-semibold">{getBudgetLabel(selectedProposal.budget)}</span>
                </div>
              </div>

              {selectedProposal.message && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Mensagem do Solicitante:</span>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 italic">
                    "{selectedProposal.message}"
                  </div>
                </div>
              )}

              {/* Status and Notes Editing */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700">
                  Notas Internas da Administração:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Insira anotações sobre negociações, valores acordados ou histórico de contacto..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('/admin/publicidades')}
                className="px-3 py-2 bg-blue-50 hover:bg-[#FDECEF] text-[#CE1126] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Criar Banner no Sistema</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateProposalStatus(selectedProposal.id, selectedProposal.status, adminNotes)}
                  className="px-4 py-2 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Salvar Notas</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base font-serif">Eliminar Registo</h3>
              <p className="text-xs text-slate-500">
                Tem a certeza de que deseja eliminar o registo de <strong>{deleteModalItem.name}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Eliminar Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

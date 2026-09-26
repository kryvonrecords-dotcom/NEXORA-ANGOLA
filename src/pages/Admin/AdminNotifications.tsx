import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Flame, 
  Send, 
  Radio, 
  Sparkles, 
  Smartphone, 
  Users, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon, 
  Upload, 
  Clock, 
  Search, 
  RefreshCw, 
  Volume2, 
  Layers,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { AppNotification, NewsItem } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { handleImageError } from '../../utils/imageUtils';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminNotifications({ onNavigate }: Props) {
  const { triggerTestNotification } = useNotifications();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<{ totalSent: number; activeSubscribers: number; registeredDevices: number }>({
    totalSent: 0,
    activeSubscribers: 1,
    registeredDevices: 1
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isBreaking, setIsBreaking] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedNewsId, setSelectedNewsId] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [categoryName, setCategoryName] = useState('Última Hora');

  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifData, newsData] = await Promise.all([
        api.getAdminNotifications(),
        api.getAdminNews({ limit: 100 })
      ]);
      setNotifications(notifData.notifications || []);
      setStats(notifData.stats || { totalSent: 0, activeSubscribers: 1, registeredDevices: 1 });
      setNewsList(newsData.news || []);
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao carregar notificações.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Notificações Push | Nexora Admin';
    loadData();
  }, []);

  // When a news item is selected in dropdown, auto-fill form
  const handleSelectNews = (id: string) => {
    setSelectedNewsId(id);
    if (!id) return;
    const selected = newsList.find(n => n.id === id);
    if (selected) {
      setTitle(selected.title);
      setBody(selected.excerpt || '');
      setImageUrl(selected.featuredImage || '');
      setIsBreaking(selected.isBreaking || false);
      setCategoryName(selected.categoryName || 'Geral');
      setClickUrl(`/noticia/${selected.slug}`);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      setImageUrl(res.url);
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao carregar imagem.', type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ text: 'Por favor introduza o título da notificação.', type: 'error' });
      return;
    }

    setSending(true);
    setMessage(null);

    const selectedNews = newsList.find(n => n.id === selectedNewsId);

    try {
      const res = await api.sendAdminPush({
        title: title.trim(),
        body: body.trim(),
        isBreaking,
        imageUrl: imageUrl.trim() || undefined,
        newsId: selectedNews?.id,
        newsSlug: selectedNews?.slug,
        categoryName: categoryName.trim() || undefined,
        clickUrl: clickUrl.trim() || undefined
      });

      setMessage({ text: res.message || 'Notificação enviada com sucesso a todos os leitores!', type: 'success' });
      
      // Also trigger in-app toast for instant admin feedback
      triggerTestNotification(res.notification);

      // Reset form
      setTitle('');
      setBody('');
      setImageUrl('');
      setSelectedNewsId('');
      setClickUrl('');
      
      // Refresh list
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao enviar notificação.', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleQuickTest = async () => {
    setTesting(true);
    setMessage(null);
    try {
      const res = await api.testAdminPush();
      setMessage({ text: 'Notificação de teste disparada! Verifique o alerta no topo da tela.', type: 'success' });
      triggerTestNotification(res.notification);
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro no teste de notificação.', type: 'error' });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja eliminar esta notificação do histórico?')) return;
    try {
      await api.deleteAdminNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setMessage({ text: 'Notificação removida do histórico.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao excluir notificação.', type: 'error' });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Tem a certeza que deseja eliminar todas as notificações do histórico do sistema? Esta ação não pode ser desfeita.')) return;
    try {
      await api.deleteAllAdminNotifications();
      setNotifications([]);
      setMessage({ text: 'Todas as notificações foram removidas do histórico com sucesso.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao excluir notificações.', type: 'error' });
    }
  };

  const addPrefix = (prefix: string) => {
    setTitle(prev => {
      // Remove previous prefixes if any
      const cleaned = prev.replace(/^(🔴 URGENTE:|📱 TECNOLOGIA:|⚽ GOLO:|🌍 MUNDO:|💼 ECONOMIA:|🚨 ALERTA:)\s*/i, '');
      return `${prefix} ${cleaned}`;
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#CE1126] text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-slate-900 font-serif">
              Notificações Push em Segundo Plano (Web Push API)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Envie alertas instantâneos e furos de reportagem para os telemóveis e computadores dos leitores, mesmo com o aplicativo fechado
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleQuickTest}
            disabled={testing}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Dispara um alerta sonoro e visual de teste neste aparelho"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Testar no Meu Aparelho</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Message Feedback */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-xs ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#CE1126] flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.totalSent}</div>
            <div className="text-xs text-slate-500 font-medium">Alertas Enviados</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.activeSubscribers}</div>
            <div className="text-xs text-slate-500 font-medium">Dispositivos Conectados</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">Instantâneo</div>
            <div className="text-xs text-slate-500 font-medium">Som + Notificação Visual</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form: Send Broadcast (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Send className="w-4 h-4 text-[#CE1126]" />
            <h2 className="text-base font-bold text-slate-900">
              Disparar Nova Notificação Push
            </h2>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            {/* Quick Link from published news */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vincular a uma Notícia Existente (Opcional)
              </label>
              <select
                value={selectedNewsId}
                onChange={(e) => handleSelectNews(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE1126]/30 focus:border-[#CE1126]"
              >
                <option value="">-- Selecione uma notícia para auto-preencher ou escreva livremente --</option>
                {newsList.map((news) => (
                  <option key={news.id} value={news.id}>
                    {news.isBreaking ? '🔴 [URGENTE] ' : ''}{news.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Prefixes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Etiquetas Rápidas de Alerta
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => addPrefix('🔴 URGENTE:')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
                >
                  🔴 URGENTE
                </button>
                <button
                  type="button"
                  onClick={() => addPrefix('🚨 ALERTA:')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition-colors"
                >
                  🚨 ALERTA
                </button>
                <button
                  type="button"
                  onClick={() => addPrefix('📱 TECNOLOGIA:')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors"
                >
                  📱 TECNOLOGIA
                </button>
                <button
                  type="button"
                  onClick={() => addPrefix('⚽ GOLO:')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
                >
                  ⚽ GOLO
                </button>
                <button
                  type="button"
                  onClick={() => addPrefix('💼 ECONOMIA:')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-[#FDECEF] text-[#CE1126] text-xs font-bold border border-blue-200 transition-colors"
                >
                  💼 ECONOMIA
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título do Alerta *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 🔴 URGENTE: Governo aprova novo plano de fomento económico"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#CE1126]/30 focus:border-[#CE1126]"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mensagem / Resumo do Alerta
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={2}
                placeholder="Texto explicativo breve que aparecerá na notificação do telemóvel..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#CE1126]/30 focus:border-[#CE1126]"
              />
            </div>

            {/* Image URL & Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Imagem da Notificação (Opcional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... ou faça upload"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#CE1126]/30 focus:border-[#CE1126]"
                />
                <label className="shrink-0 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                  {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* Options: Breaking toggle & category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria / Rótulo
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Economia, Desporto..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#CE1126]/30 focus:border-[#CE1126]"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  <span className="ml-2 text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    Alerta de Última Hora
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Disparo instantâneo para todos os leitores
              </span>

              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 rounded-xl bg-[#CE1126] hover:bg-[#A50D1F] active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{sending ? 'A transmitir...' : 'Transmitir Notificação Push'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Preview: How readers see it (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#000000] text-white p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 text-xs font-bold">
              <Smartphone className="w-4 h-4" />
              <span>PRÉ-VISUALIZAÇÃO NO TELEMÓVEL</span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 shadow-lg relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${isBreaking ? 'bg-rose-500' : 'bg-[#CE1126]'}`} />
              
              <div className="flex items-start gap-3">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    onError={e => handleImageError(e, 'Notícias', title)}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isBreaking ? 'bg-rose-600 text-white' : 'bg-[#CE1126] text-white'}`}>
                    {isBreaking ? <Flame className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${isBreaking ? 'bg-rose-500 text-white' : 'bg-[#CE1126] text-white'}`}>
                      {categoryName || 'NEXORA ANGOLA'}
                    </span>
                    <span className="text-[10px] text-slate-400">Agora mesmo</span>
                  </div>

                  <div className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {title || 'Título da notificação aparecerá aqui...'}
                  </div>

                  <div className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 font-normal">
                    {body || 'Resumo do alerta de notícias...'}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              Assim que enviar, os usuários que estiverem com o app aberto ou em segundo plano receberão este alerta com som e vibração automática.
            </p>
          </div>

          {/* Auto-Notification on News Publish note */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#CE1126]" />
              Envio Automático ao Publicar
            </div>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              Sempre que publicar ou agendar uma notícia em <strong>Nova Notícia</strong>, o sistema gera e envia automaticamente a notificação push para todos os usuários.
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">
              Histórico de Notificações Enviadas ({notifications.length})
            </h2>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-3 py-1.5 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Excluir todas as notificações do histórico"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">
            Nenhuma notificação enviada até ao momento.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  {notif.imageUrl ? (
                    <img 
                      src={notif.imageUrl} 
                      alt="Thumbnail" 
                      onError={e => handleImageError(e, 'Notícias', notif.title)}
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      notif.isBreaking ? 'bg-rose-100 text-rose-700' : 'bg-[#FDECEF] text-[#CE1126]'
                    }`}>
                      {notif.isBreaking ? <Flame className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase ${
                        notif.isBreaking ? 'bg-rose-600 text-white' : 'bg-[#CE1126] text-white'
                      }`}>
                        {notif.categoryName || (notif.isBreaking ? 'Urgente' : 'Notícia')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(notif.sentAt).toLocaleString('pt-AO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {notif.title}
                    </div>

                    {notif.body && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {notif.body}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notif.newsSlug && (
                    <button
                      onClick={() => onNavigate(`/noticia/${notif.newsSlug}`)}
                      className="p-2 text-slate-400 hover:text-[#CE1126] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver notícia no portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir notificação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

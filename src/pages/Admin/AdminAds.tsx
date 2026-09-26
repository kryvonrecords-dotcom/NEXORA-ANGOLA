import React, { useState, useEffect, useRef } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  MousePointerClick, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  ExternalLink, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Calendar,
  X,
  Clipboard,
  Check,
  Film,
  Globe,
  Briefcase
} from 'lucide-react';
import { Advertisement, AdMediaType, AdPosition } from '../../types';
import { api } from '../../services/api';
import { 
  cleanPastedUrl, 
  detectMediaType, 
  isYouTubeUrl, 
  getYouTubeEmbedUrl, 
  getYouTubeThumbnailUrl 
} from '../../utils/mediaUtils';
import { getBannerImageUrl, handleBannerImageError } from '../../utils/imageUtils';

interface Props {
  onNavigate: (path: string) => void;
}

const DEFAULT_BANNER_IMAGE = '/promo-banner.jpg';

export function AdminAds({ onNavigate }: Props) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pastedFeedback, setPastedFeedback] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    badgeText: 'PUBLICIDADE',
    mediaType: 'image' as AdMediaType,
    mediaUrl: '',
    videoThumbnail: '',
    linkUrl: '',
    targetNewTab: true,
    callToAction: 'Acesse Agora',
    position: 'top_hero' as AdPosition,
    status: 'active' as 'active' | 'inactive',
    startDate: '',
    endDate: '',
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [deleting, setDeleting] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAds();
      setAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admin ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      subtitle: '',
      tagline: '',
      badgeText: 'DESTAQUE',
      mediaType: 'image',
      mediaUrl: '',
      videoThumbnail: '',
      linkUrl: '',
      targetNewTab: true,
      callToAction: 'Acesse Agora',
      position: 'top_hero',
      status: 'active',
      startDate: '',
      endDate: '',
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      subtitle: ad.subtitle || '',
      tagline: ad.tagline || '',
      badgeText: ad.badgeText || 'PUBLICIDADE',
      mediaType: ad.mediaType || 'image',
      mediaUrl: ad.mediaUrl || '',
      videoThumbnail: ad.videoThumbnail || '',
      linkUrl: ad.linkUrl || '',
      targetNewTab: ad.targetNewTab ?? true,
      callToAction: ad.callToAction || 'Acesse Agora',
      position: ad.position || 'top_hero',
      status: ad.status || 'active',
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  // Intelligent handler when pasting into Media URL field
  const handleMediaUrlChange = (rawText: string) => {
    const cleaned = cleanPastedUrl(rawText);
    const detectedType = detectMediaType(cleaned);
    
    let updatedThumbnail = formData.videoThumbnail;
    if (isYouTubeUrl(cleaned) && !updatedThumbnail) {
      const ytThumb = getYouTubeThumbnailUrl(cleaned);
      if (ytThumb) updatedThumbnail = ytThumb;
    }

    setFormData(prev => ({
      ...prev,
      mediaUrl: cleaned,
      mediaType: detectedType,
      videoThumbnail: updatedThumbnail
    }));
  };

  // Paste directly from system clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleMediaUrlChange(text);
          setPastedFeedback(true);
          setTimeout(() => setPastedFeedback(false), 2000);
        }
      }
    } catch (err) {
      console.warn('Clipboard access not allowed or unavailable:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage(null);
    try {
      const result = await api.uploadMedia(file);
      if (result?.url) {
        const isVideo = file.type.startsWith('video/');
        setFormData(prev => ({
          ...prev,
          mediaUrl: result.url,
          mediaType: isVideo ? 'video' : 'image'
        }));
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Erro ao carregar o arquivo de mídia.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleStatus = async (ad: Advertisement) => {
    const newStatus = ad.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateAd(ad.id, { status: newStatus });
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = (formData.title || '').trim();
    if (!cleanTitle) {
      setErrorMessage('O título da publicidade é obrigatório.');
      return;
    }

    let finalMediaUrl = (formData.mediaUrl || '').trim();
    if (!finalMediaUrl) {
      // Provide default banner so publication never fails or blocks the user
      finalMediaUrl = DEFAULT_BANNER_IMAGE;
    }

    const payload = {
      ...formData,
      title: cleanTitle,
      mediaUrl: finalMediaUrl,
      subtitle: (formData.subtitle || '').trim(),
      tagline: (formData.tagline || '').trim(),
      badgeText: (formData.badgeText || 'PUBLICIDADE').trim(),
      callToAction: (formData.callToAction || 'Acesse Agora').trim(),
      linkUrl: (formData.linkUrl || '').trim(),
      videoThumbnail: (formData.videoThumbnail || '').trim()
    };

    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingAd) {
        await api.updateAd(editingAd.id, payload);
        setSuccessMessage('Publicidade atualizada com sucesso!');
      } else {
        await api.createAd(payload);
        setSuccessMessage('Nova publicidade publicada com sucesso no portal!');
      }
      setModalOpen(false);
      await loadAds();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'Erro ao guardar a publicidade. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!adToDelete) return;
    setDeleting(true);
    try {
      await api.deleteAd(adToDelete.id);
      setDeleteModalOpen(false);
      setAdToDelete(null);
      await loadAds();
      setSuccessMessage('Publicidade removida com sucesso!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorMessage(err.message || 'Erro ao excluir a publicidade.');
    } finally {
      setDeleting(false);
    }
  };

  // Metrics calculation
  const totalAds = ads.length;
  const activeAds = ads.filter(a => a.status === 'active').length;
  const totalViews = ads.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicksCount || 0), 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  // Filtered ads
  const filteredAds = ads.filter(ad => {
    if (filterPosition !== 'all' && ad.position !== filterPosition) return false;
    if (filterType !== 'all' && ad.mediaType !== filterType) return false;
    return true;
  });

  // Modal preview helpers
  const isVideoInForm = formData.mediaType === 'video';
  const isYouTubeInForm = isYouTubeUrl(formData.mediaUrl);
  const ytEmbedUrl = isYouTubeInForm ? getYouTubeEmbedUrl(formData.mediaUrl) : null;

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#CE1126] flex items-center justify-center shadow-xs">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Gestão de Publicidades & Banners
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Publique fotos, vídeos promocionais e banners diretamente na página inicial e secções do portal.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('/admin/propostas')}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Briefcase className="w-4 h-4 text-amber-600" />
            <span>Ver Propostas Recebidas</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Anúncio</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Anúncios</div>
          <div className="text-2xl font-black text-slate-900 font-serif mt-1">{totalAds}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Anúncios Ativos</div>
          <div className="text-2xl font-black text-emerald-600 font-serif mt-1">{activeAds}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-[#A50D1F] uppercase tracking-wider">Visualizações</div>
          <div className="text-2xl font-black text-[#A50D1F] font-serif mt-1">{totalViews.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Total de Cliques</div>
          <div className="text-2xl font-black text-purple-600 font-serif mt-1">{totalClicks.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">CTR Médio</div>
          <div className="text-2xl font-black text-amber-600 font-serif mt-1">{avgCtr}%</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-600 mr-1">Posição:</span>
          <button
            type="button"
            onClick={() => setFilterPosition('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterPosition === 'all' ? 'bg-[#000000] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilterPosition('top_hero')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterPosition === 'top_hero' ? 'bg-[#000000] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Topo (Página Inicial)
          </button>
          <button
            type="button"
            onClick={() => setFilterPosition('sidebar')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterPosition === 'sidebar' ? 'bg-[#000000] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Barra Lateral
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600">Formato:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-[#CE1126] outline-hidden cursor-pointer"
          >
            <option value="all">Todos os Formatos</option>
            <option value="image">Fotos & Imagens</option>
            <option value="video">Vídeos & Spots</option>
            <option value="custom_banner">Banner Especial</option>
          </select>
        </div>
      </div>

      {/* Ads List */}
      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mb-2" />
          <p className="text-xs font-semibold">A carregar publicidades...</p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-serif">Nenhuma publicidade encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Publique fotos e vídeos com links para anunciantes ou para promover os serviços do Nexora Angola.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-[#CE1126] text-white text-xs font-bold rounded-xl hover:bg-[#A50D1F] transition-colors cursor-pointer shadow"
          >
            Publicar Novo Anúncio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAds.map((ad) => {
            const isVideo = ad.mediaType === 'video';
            const isYt = isYouTubeUrl(ad.mediaUrl || '');
            const ytEmbed = isYt ? getYouTubeEmbedUrl(ad.mediaUrl || '') : null;
            const isActive = ad.status === 'active';
            const ctr = (ad.viewsCount || 0) > 0 
              ? (((ad.clicksCount || 0) / (ad.viewsCount || 1)) * 100).toFixed(1) 
              : '0.0';

            return (
              <div 
                key={ad.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Media Preview Box */}
                  <div className="relative aspect-video bg-[#000000] overflow-hidden flex items-center justify-center border-b border-slate-100 group">
                    {isVideo ? (
                      isYt && ytEmbed ? (
                        <iframe
                          src={ytEmbed}
                          title={ad.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={ad.mediaUrl}
                          poster={getBannerImageUrl(ad.videoThumbnail || DEFAULT_BANNER_IMAGE, ad.title, ad.subtitle)}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )
                    ) : (
                      <img
                        src={getBannerImageUrl(ad.mediaUrl || DEFAULT_BANNER_IMAGE, ad.title, ad.subtitle)}
                        alt={ad.title}
                        onError={e => handleBannerImageError(e, ad.title, ad.subtitle)}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase shadow">
                      {isVideo ? <Video className="w-3 h-3 text-purple-400" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
                      <span>{isVideo ? (isYt ? 'YouTube' : 'Vídeo Spot') : 'Foto / Imagem'}</span>
                    </div>

                    {/* Position Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#000000]/80 text-slate-200 text-[10px] font-semibold">
                      {ad.position === 'top_hero' ? 'Topo da Página' : 'Barra Lateral'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black text-[#CE1126] uppercase tracking-wider">
                          {ad.badgeText || 'PUBLICIDADE'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 font-serif leading-snug mt-0.5">
                          {ad.title}
                        </h3>
                      </div>

                      {/* Status Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(ad)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Alternar entre Ativo e Inativo"
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span>{isActive ? 'Ativo' : 'Pausado'}</span>
                      </button>
                    </div>

                    {ad.subtitle && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ad.subtitle}
                      </p>
                    )}

                    {ad.linkUrl && (
                      <div className="flex items-center gap-1.5 text-xs text-[#A50D1F] font-medium truncate">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <a 
                          href={ad.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline truncate"
                        >
                          {ad.linkUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Performance Stats & Action Buttons */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-600 font-semibold">
                    <div className="flex items-center gap-1" title="Visualizações">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ad.viewsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Cliques">
                      <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ad.clicksCount || 0}</span>
                    </div>
                    <div className="text-[11px] text-amber-600 font-mono font-bold" title="Taxa de Cliques">
                      CTR: {ctr}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(ad)}
                      className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar Publicidade"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdToDelete(ad);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Apagar Publicidade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#CE1126] flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    {editingAd ? 'Editar Publicidade' : 'Publicar Nova Publicidade'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Insira fotos, links, vídeos do YouTube ou ficheiros que aparecerão no topo do portal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Presets / Shortcuts */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modelos Rápidos e Predefinições</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        mediaUrl: DEFAULT_BANNER_IMAGE,
                        mediaType: 'image',
                        title: prev.title || 'NEXORA ANGOLA: A Notícia Que Move o Mundo!',
                        subtitle: prev.subtitle || 'Cobertura completa, análises profundas e informação confiável em tempo real.',
                        badgeText: 'BAIXE O APLICATIVO'
                      }));
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#F9D616] text-slate-700 hover:text-[#CE1126] rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#CE1126]" />
                    <span>Banner Oficial Nexora</span>
                  </button>
                </div>
              </div>

              {/* Media Format Selector (Foto vs Vídeo) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Formato da Mídia
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mediaType: 'image' }))}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                      formData.mediaType === 'image'
                        ? 'bg-[#CE1126]/10 border-[#CE1126] text-[#CE1126] ring-2 ring-[#CE1126]/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Foto / Imagem</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mediaType: 'video' }))}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                      formData.mediaType === 'video'
                        ? 'bg-purple-500/10 border-purple-600 text-purple-600 ring-2 ring-purple-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Vídeo / YouTube / Spot</span>
                  </button>
                </div>
              </div>

              {/* Media Upload & URL with Paste Support */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Link da Mídia ou Upload (Foto, Vídeo ou YouTube)
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-[11px] text-[#CE1126] hover:text-[#A50D1F] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {pastedFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Colado!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Colar da Área de Transferência</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.mediaUrl}
                      onChange={(e) => handleMediaUrlChange(e.target.value)}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text');
                        if (pasted) {
                          e.preventDefault();
                          handleMediaUrlChange(pasted);
                        }
                      }}
                      placeholder={formData.mediaType === 'video' ? 'Cole o link do YouTube, MP4 ou faça upload' : 'Cole o link da foto (URL) ou faça upload'}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden font-mono"
                    />

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept={formData.mediaType === 'video' ? 'video/mp4,video/webm,video/ogg,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{uploading ? 'Carregando...' : 'Fazer Upload'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Você pode colar links diretos do <strong>YouTube</strong>, links de imagens na web, ou subir arquivos do seu computador.
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              {formData.mediaUrl && (
                <div className="p-3 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Pré-visualização em Tempo Real</span>
                    <span className="text-[#CE1126] font-semibold">{formData.mediaType === 'video' ? (isYouTubeInForm ? 'Vídeo YouTube' : 'Vídeo Direto') : 'Imagem'}</span>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    {isVideoInForm ? (
                      isYouTubeInForm && ytEmbedUrl ? (
                        <iframe
                          src={ytEmbedUrl}
                          title="Preview"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={formData.mediaUrl}
                          poster={getBannerImageUrl(formData.videoThumbnail || DEFAULT_BANNER_IMAGE, formData.title, formData.subtitle)}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )
                    ) : (
                      <img
                        src={getBannerImageUrl(formData.mediaUrl || DEFAULT_BANNER_IMAGE, formData.title, formData.subtitle)}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => handleBannerImageError(e, formData.title, formData.subtitle)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Título Principal *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: NEXORA ANGOLA: A Notícia Que Move o Mundo!"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selo / Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeText: e.target.value }))}
                    placeholder="Ex: NOVIDADE, PROMO"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                  />
                </div>
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subtítulo ou Descrição Promocional
                </label>
                <textarea
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  rows={2}
                  placeholder="Ex: Cobertura completa, análises profundas e informação confiável em tempo real. 24 horas com você."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                />
              </div>

              {/* Link URL & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Link de Destino (URL ao Clicar)
                  </label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="https://... ou /categoria/angola"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Texto do Botão (CTA)
                  </label>
                  <input
                    type="text"
                    value={formData.callToAction}
                    onChange={(e) => setFormData(prev => ({ ...prev, callToAction: e.target.value }))}
                    placeholder="Ex: Acesse Agora, Baixar App, Ver Vídeo"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                  />
                </div>
              </div>

              {/* Position & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Posição no Portal
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as AdPosition }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden cursor-pointer"
                  >
                    <option value="top_hero">Topo da Página Inicial (Banner Principal / Hero)</option>
                    <option value="sidebar">Barra Lateral</option>
                    <option value="between_news">Entre Notícias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden cursor-pointer"
                  >
                    <option value="active">Ativo (Visível no Portal)</option>
                    <option value="inactive">Pausado / Rascunho</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-6 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                  <span>{editingAd ? 'Salvar Alterações' : 'Publicar Anúncio Agora'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && adToDelete && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Eliminar esta Publicidade?
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Tem a certeza de que deseja apagar a publicidade <strong>"{adToDelete.title}"</strong>? Esta ação removerá a exibição do anúncio da página inicial.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Eliminar Publicidade</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

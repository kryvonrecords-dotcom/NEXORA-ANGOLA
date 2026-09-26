import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Plus, 
  Flame, 
  Star, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  ListOrdered, 
  Video, 
  ArrowLeft, 
  Check, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  Layers,
  Trash2,
  Bell
} from 'lucide-react';
import { Category, NewsItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getNewsImageUrl, getCategoryFallbackUrl, handleImageError } from '../../utils/imageUtils';

interface Props {
  editId?: string;
  onNavigate: (path: string) => void;
}

export function AdminNewsEditor({ editId, onNavigate }: Props) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(editId ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageCaption, setFeaturedImageCaption] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState(user?.name || 'Redação Nexora');
  const [authorRole, setAuthorRole] = useState('Jornalista');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isHero, setIsHero] = useState(false);
  const [sendPushNotification, setSendPushNotification] = useState(true);
  // AI News Generator
  const [aiTheme, setAiTheme] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Quick Category creation modal
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#CE1126');

  // File Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Deletion Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteArticle = async () => {
    if (!editId) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteNews(editId);
      onNavigate('/admin/noticias');
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar notícia.');
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = editId ? 'Editar Notícia | Nexora Admin' : 'Nova Notícia | Nexora Admin';

    async function init() {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }

        if (editId) {
          const all = await api.getAdminNews({ limit: 500 });
          const found = all.news.find(n => n.id === editId);
          if (found) {
            setTitle(found.title);
            setExcerpt(found.excerpt);
            setContent(found.content);
            setCategoryId(found.categoryId);
            setFeaturedImage(found.featuredImage);
            setFeaturedImageCaption(found.featuredImageCaption || '');
            setGalleryImages(found.galleryImages || []);
            setAuthorName(found.authorName);
            setAuthorRole(found.authorRole || 'Jornalista');
            setTags(found.tags || []);
            setStatus(found.status);
            setScheduledFor(found.scheduledFor ? found.scheduledFor.substring(0, 16) : '');
            setIsBreaking(found.isBreaking);
            setIsHero(found.isHero);
          } else {
            setError('Notícia não encontrada para edição.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [editId]);

  // Handle Real File Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    setError(null);
    try {
      const res = await api.uploadImage(file);
      setFeaturedImage(res.url);
    } catch (err: any) {
      setError(err.message || 'Erro no upload da imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const array = Array.from(files);
      const res = await api.uploadMultipleImages(array);
      const urls = res.files.map(f => f.url);
      setGalleryImages(prev => [...prev, ...urls]);
    } catch (err: any) {
      setError(err.message || 'Erro no upload de fotos adicionais.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Tag helper
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Rich Text Editor formatting helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = textareaRef.current.value;
    const selectedText = currentText.substring(start, end);
    const replacement = `${prefix}${selectedText || 'texto'}${suffix}`;

    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);
    setContent(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 5));
      }
    }, 50);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await api.createCategory({
        name: newCatName.trim(),
        color: newCatColor
      });
      setCategories(prev => [...prev, res.category]);
      setCategoryId(res.category.id);
      setNewCategoryModal(false);
      setNewCatName('');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar categoria.');
    }
  };

  // Generate news with Gemini AI
  const handleGenerateWithAI = async () => {
    if (!aiTheme.trim()) {
      setError('Escreva primeiro o tema da notícia para a IA.');
      return;
    }

    setAiGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedCategory = categories.find(c => c.id === categoryId);
      const result = await api.generateAiNewsDraft({
        theme: aiTheme.trim(),
        categorySlug: selectedCategory?.slug || 'geral',
        tone: 'journalistic',
        targetLength: 'medium'
      });

      setTitle(result.title || '');
      setExcerpt(result.excerpt || '');
      setContent(result.content || '');
      setTags(result.suggestedTags || []);

      // Usar a imagem que o servidor já encontrou automaticamente.
      if (result.featuredImage) {
        setFeaturedImage(result.featuredImage);
        setFeaturedImageCaption(
          result.featuredImageCaption || 'Imagem: Wikimedia Commons'
        );
      } else {
        // Fallback: procurar uma imagem gratuita caso o servidor não tenha encontrado.
        const imageSearchDescription =
          result.suggestedImageDescription?.trim() ||
          result.title?.trim() ||
          aiTheme.trim();

        if (imageSearchDescription) {
          try {
            const imageResult = await api.searchNewsImage(imageSearchDescription);
            if (imageResult?.imageUrl) {
              setFeaturedImage(imageResult.imageUrl);
              setFeaturedImageCaption(
                imageResult.title
                  ? `${imageResult.title.replace(/^File:/, '')} — Wikimedia Commons`
                  : 'Imagem: Wikimedia Commons'
              );
            }
          } catch (imageErr) {
            console.warn('Não foi possível obter imagem gratuita:', imageErr);
          }
        }
      }

      const matchedCategory = categories.find(c => c.slug === result.categorySlug);
      if (matchedCategory) setCategoryId(matchedCategory.id);

      setSuccess('✨ Notícia criada pela IA! Revise e publique quando quiser.');
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar notícia com a IA.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('Por favor preencha o título, categoria e o conteúdo da notícia.');
      return;
    }

    if (status === 'scheduled' && !scheduledFor) {
      setError('Por favor defina a data e hora para a publicação agendada.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const selectedCat = categories.find(c => c.id === categoryId);
    const resolvedFeaturedImage = featuredImage.trim() || getCategoryFallbackUrl(selectedCat?.name || 'Geral', title.trim());

    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content,
      categoryId,
      featuredImage: resolvedFeaturedImage,
      featuredImageCaption: featuredImageCaption.trim(),
      galleryImages,
      authorName: authorName.trim() || 'Redação Nexora',
      authorRole: authorRole.trim() || 'Jornalista',
      tags,
      status,
      scheduledFor: status === 'scheduled' ? new Date(scheduledFor).toISOString() : undefined,
      isBreaking,
      isHero,
      sendPushNotification
    };

    try {
      if (editId) {
        const res = await api.updateNews(editId, payload);
        setSuccess('Notícia atualizada com sucesso!');
        setTimeout(() => onNavigate('/admin/noticias'), 1200);
      } else {
        const res = await api.createNews(payload);
        setSuccess('Notícia publicada com sucesso!');
        setTimeout(() => onNavigate('/admin/noticias'), 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gravar a publicação.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mb-2" />
        <p className="text-sm text-slate-500 font-medium">A carregar editor...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      {/* Editor Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/admin/noticias')}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            title="Voltar à lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 font-serif">
              {editId ? 'Editar Artigo' : 'Nova Notícia'}
            </h1>
            <p className="text-xs text-slate-500">
              {editId ? 'Atualize as informações do artigo publicado ou rascunho' : 'Redija e publique uma nova matéria em tempo real'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {editId && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              disabled={saving || deleting}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Eliminar esta notícia definitivamente"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Apagar Notícia</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setStatus('draft');
              handleSave({ preventDefault: () => {} } as any);
            }}
            disabled={saving || deleting}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Salvar Rascunho
          </button>

          <button
            type="submit"
            disabled={saving || deleting}
            className="px-5 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editId ? 'Guardar Alterações' : 'Publicar Notícia'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-emerald-700">
          <Check className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: Content (8 Cols) & Sidebar Configuration (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: TITLE & RICH CONTENT (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI NEWS GENERATOR */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#CE1126] text-white rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Criar Notícia com IA
                </h2>
                <p className="text-xs text-slate-500">
                  Escreva um tema e a IA cria automaticamente a notícia.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={aiTheme}
                onChange={e => setAiTheme(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerateWithAI();
                  }
                }}
                placeholder="Ex: Novo investimento em Angola"
                disabled={aiGenerating}
                className="flex-1 px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126] disabled:opacity-60"
              />

              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={aiGenerating}
                className="px-5 py-3 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A IA está a escrever...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar com IA
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              A IA preencherá o título, subtítulo, conteúdo e tags automaticamente.
            </p>
          </div>

          {/* Title & Excerpt */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título Principal da Notícia *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Angola acelera transição energética com novo polo industrial..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtítulo / Lead / Resumo (Aparece nos cards e início do artigo)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Breve resumo informativo de 2 a 3 linhas sintetizando a matéria..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              ></textarea>
            </div>
          </div>

          {/* REAL IMAGE UPLOAD BOX */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Imagem Principal de Capa (Upload Real do Computador ou Celular)
            </label>

            {/* Drag & Drop / File Input Box */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragOver ? 'border-[#CE1126] bg-blue-50/50' : 'border-slate-300 bg-slate-50/50'
              }`}
            >
              {featuredImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-video max-h-64 mx-auto bg-slate-900 shadow">
                    <img
                      src={getNewsImageUrl(featuredImage, categories.find(c => c.id === categoryId)?.name, title)}
                      alt="Pré-visualização"
                      onError={e => handleImageError(e, categories.find(c => c.id === categoryId)?.name, title)}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition-colors"
                      title="Remover Imagem"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Substituir Imagem
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#CE1126] mb-2" />
                      <p className="text-xs font-semibold text-slate-600">A fazer upload da imagem para o servidor...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#CE1126] flex items-center justify-center mx-auto mb-3">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        Arraste uma foto aqui ou clique para selecionar do computador/celular
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Formatos recomendados: JPG, PNG, WEBP (Máx. 15MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 px-4 py-2 bg-[#CE1126] text-white text-xs font-bold rounded-xl hover:bg-[#A50D1F] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Escolher Ficheiro
                      </button>
                    </>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Legenda da Foto / Créditos do Fotógrafo
              </label>
              <input
                type="text"
                value={featuredImageCaption}
                onChange={e => setFeaturedImageCaption(e.target.value)}
                placeholder="Ex: Cerimónia de inauguração em Luanda. (Foto: Divulgação/Nexora)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
            </div>
          </div>

          {/* RICH TEXT EDITOR */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Corpo do Artigo / Notícia Completa *
              </label>
            </div>

            {/* Editor Toolbar */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting('<h2>', '</h2>')}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors font-bold text-xs"
                title="Título H2"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<h3>', '</h3>')}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors font-bold text-xs"
                title="Subtítulo H3"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-5 bg-slate-200 mx-1"></div>
              <button
                type="button"
                onClick={() => insertFormatting('<strong>', '</strong>')}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors"
                title="Negrito"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<em>', '</em>')}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors"
                title="Itálico"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-5 bg-slate-200 mx-1"></div>
              <button
                type="button"
                onClick={() => insertFormatting('<blockquote>"', '"</blockquote>')}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors"
                title="Citação"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<p>', '</p>')}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors text-xs font-semibold"
                title="Parágrafo"
              >
                ¶
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors"
                title="Lista de Tópicos"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<ol>\n  <li>', '</li>\n</ol>')}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors"
                title="Lista Numerada"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-5 bg-slate-200 mx-1"></div>
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Insira o link (URL):', 'https://');
                  if (url) insertFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>');
                }}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors"
                title="Adicionar Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Insira a URL do vídeo do YouTube / Vimeo para incorporação:', '');
                  if (url) {
                    insertFormatting(`<div class="aspect-video my-4 rounded-xl overflow-hidden"><iframe src="${url}" class="w-full h-full" frameborder="0" allowfullscreen></iframe></div>\n`);
                  }
                }}
                className="p-1.5 text-slate-600 hover:text-[#CE1126] hover:bg-white rounded-lg transition-colors"
                title="Incorporar Vídeo"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={12}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Escreva aqui o texto completo da matéria com formatações..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126] font-mono leading-relaxed"
            ></textarea>
            <p className="text-[11px] text-slate-400">
              Dica: Pode escrever texto normal ou utilizar tags como &lt;h2&gt;, &lt;p&gt;, &lt;blockquote&gt; e &lt;strong&gt;.
            </p>
          </div>

          {/* MULTIPLE GALLERY IMAGES */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fotos Adicionais / Galeria da Matéria
              </label>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="text-xs font-bold text-[#CE1126] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Fotos
              </button>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={e => {
                if (e.target.files) handleGalleryUpload(e.target.files);
              }}
              className="hidden"
            />

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {galleryImages.map((imgUrl, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 group">
                    <img
                      src={imgUrl}
                      alt="Foto da galeria"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                Nenhuma foto adicional adicionada a este artigo.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PUBLISHING CONTROLS & METADATA (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publication Status & Action Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Estado de Publicação
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-[#CE1126]">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="text-[#CE1126] focus:ring-[#CE1126]"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Publicar Imediatamente</span>
                  <span className="text-slate-400">Visível no portal logo após gravar</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-[#CE1126]">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="text-[#CE1126] focus:ring-[#CE1126]"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Salvar como Rascunho</span>
                  <span className="text-slate-400">Fica guardado no painel para revisão</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-[#CE1126]">
                <input
                  type="radio"
                  name="status"
                  value="scheduled"
                  checked={status === 'scheduled'}
                  onChange={() => setStatus('scheduled')}
                  className="text-[#CE1126] focus:ring-[#CE1126]"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Agendar Publicação</span>
                  <span className="text-slate-400">Programa uma data/hora futura</span>
                </div>
              </label>
            </div>

            {status === 'scheduled' && (
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Data e Hora de Lançamento
                </label>
                <input
                  type="datetime-local"
                  required={status === 'scheduled'}
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>
            )}
          </div>

          {/* Highlights & Breaking Switch */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Destaques Especiais
            </h3>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-rose-50/50 transition-colors">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${isBreaking ? 'text-red-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Notícia Urgente</span>
                  <span className="text-[11px] text-slate-400">Ativa barra de alerta no topo</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={e => setIsBreaking(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-amber-50/50 transition-colors">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${isHero ? 'text-amber-500' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Destaque Principal</span>
                  <span className="text-[11px] text-slate-400">Manchete grande na Homepage</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isHero}
                onChange={e => setIsHero(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
            </label>

            {/* Push Notification Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50/70 cursor-pointer hover:bg-[#FDECEF]/70 transition-colors">
              <div className="flex items-center gap-2">
                <Bell className={`w-4 h-4 ${sendPushNotification ? 'text-[#CE1126]' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Notificação Push</span>
                  <span className="text-[11px] text-slate-600">Dispara alerta sonoro e visual aos leitores</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={sendPushNotification}
                onChange={e => setSendPushNotification(e.target.checked)}
                className="w-4 h-4 rounded text-[#CE1126] focus:ring-[#CE1126]"
              />
            </label>
          </div>

          {/* Category Picker */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Categoria *
              </h3>
              <button
                type="button"
                onClick={() => setNewCategoryModal(true)}
                className="text-[11px] font-bold text-[#CE1126] hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Nova
              </button>
            </div>

            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Author & Role */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Autoria & Redação
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome do Autor / Jornalista</label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="Ex: Mário dos Santos"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Cargo / Função Editorial</label>
              <input
                type="text"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                placeholder="Ex: Editor de Economia"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Etiquetas / Tags
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ex: Luanda, Petróleo..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#CE1126] text-xs font-medium rounded-lg"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-[#CE1126] hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK NEW CATEGORY MODAL */}
      {newCategoryModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 font-serif">
              Criar Nova Categoria
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Ex: Cidades, Agro..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#CE1126]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cor Temática</label>
                <input
                  type="color"
                  value={newCatColor}
                  onChange={e => setNewCatColor(e.target.value)}
                  className="w-full h-10 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCategoryModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-[#CE1126] text-white text-xs font-bold rounded-xl hover:bg-[#A50D1F]"
                >
                  Criar Categoria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DELETE NOTICIA MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Eliminar esta Notícia?
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Tem a certeza de que deseja apagar permanentemente o artigo <strong>"{title || 'Sem título'}"</strong>? Todos os dados associados serão removidos do portal.
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
                onClick={handleDeleteArticle}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Eliminar Notícia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

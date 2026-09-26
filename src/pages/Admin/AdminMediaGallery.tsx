import React, { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { formatDateTime } from '../../lib/utils';
import { handleImageError } from '../../utils/imageUtils';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminMediaGallery({ onNavigate }: Props) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMedia();
      setMedia(res.media || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivos de mídia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Galeria de Mídia | Nexora Admin';
    loadMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const files = Array.from(e.target.files) as File[];
      if (files.length === 1) {
        await api.uploadImage(files[0]);
      } else {
        await api.uploadMultipleImages(files);
      }
      loadMedia();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Eliminar esta imagem do servidor?')) return;
    try {
      await api.deleteMedia(filename);
      setMedia(prev => prev.filter(m => m.filename !== filename));
    } catch (err: any) {
      alert(err.message || 'Erro ao apagar arquivo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            Galeria de Mídia & Imagens
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Arquivos reais armazenados no servidor. Copie o link direto para usar nos seus artigos.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 bg-[#CE1126] hover:bg-[#A50D1F] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Fazer Upload de Fotos</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#CE1126]" />
            <p className="text-sm">A carregar fotos...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-base">Nenhum arquivo enviado ainda</p>
            <p className="text-xs text-slate-400 mt-1">Carregue fotos através do botão acima ou ao redigir uma notícia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((file, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group flex flex-col justify-between"
              >
                <div className="aspect-video bg-slate-900 overflow-hidden relative">
                  <img
                    src={file.url}
                    alt={file.filename}
                    onError={e => handleImageError(e, 'Mídia', file.filename)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/90 text-slate-900 rounded-lg hover:bg-white transition-colors"
                      title="Ver tamanho original"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleCopy(file.url)}
                      className="p-2 bg-white/90 text-slate-900 rounded-lg hover:bg-white transition-colors"
                      title="Copiar URL"
                    >
                      {copiedUrl === file.url ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="font-mono text-[11px] text-slate-700 truncate font-semibold">
                    {file.filename}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{(file.size / 1024).toFixed(0)} KB</span>
                    <span>{formatDateTime(file.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/80">
                    <button
                      onClick={() => handleCopy(file.url)}
                      className="text-xs font-semibold text-[#CE1126] hover:underline flex items-center gap-1"
                    >
                      {copiedUrl === file.url ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl === file.url ? 'Copiado!' : 'Copiar URL'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(file.filename)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Eliminar imagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

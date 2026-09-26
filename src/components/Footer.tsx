import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Send, 
  MessageCircle,
  Linkedin,
  Radio,
  Smartphone,
  Music,
  Lock, 
  ShieldCheck,
  ArrowUp
} from 'lucide-react';
import { Category, SiteSettings } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Props {
  categories?: Category[];
  onNavigate: (path: string) => void;
}

export function Footer({ categories: propCategories, onNavigate }: Props) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>(propCategories || []);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      api.getCategories().then(setCategories).catch(console.error);
    }
    api.getSettings().then(setSettings).catch(console.error);
  }, [propCategories]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#000000] text-slate-300 border-t border-slate-800 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('/')} 
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 shadow-md ring-2 ring-[#CE1126]/40 bg-[#000000] flex items-center justify-center">
                <img
                  src="/icon-192.svg"
                  alt="Nexora Angola Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/app-cover.jpg';
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-serif uppercase tracking-tight">
                  NEXORA
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#CE1126] font-serif uppercase tracking-tight">
                  NEWS
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E53935] mb-2"></span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings?.siteTagline || 'Jornalismo de Excelência, Rigor e Credibilidade em Tempo Real. Informação independente com cobertura completa de Angola, África e do Mundo.'}
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#CE1126] shrink-0" />
                <span>{settings?.address || 'Avenida 4 de Fevereiro, Marginal de Luanda, Angola'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#CE1126] shrink-0" />
                <span>{settings?.contactEmail || 'redacao@nexoranews.ao'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#CE1126] shrink-0" />
                <a 
                  href={`tel:${(settings?.contactPhone || '+244 921 281 315').replace(/\s+/g, '')}`} 
                  className="hover:text-white transition-colors"
                >
                  {settings?.contactPhone || '+244 921 281 315'}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {settings?.socialLinks?.whatsapp && (
                <a href={settings.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-[#25D366] text-slate-300 hover:text-white transition-colors" title="WhatsApp">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-[#1877F2] text-slate-300 hover:text-white transition-colors" title="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-[#E4405F] text-slate-300 hover:text-white transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors" title="X">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-[#FF0000] text-slate-300 hover:text-white transition-colors" title="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.telegram && (
                <a href={settings.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-[#229ED9] text-slate-300 hover:text-white transition-colors" title="Telegram">
                  <Send className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.tiktok && (
                <a href={settings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-[#EE1D52] text-slate-300 hover:text-white transition-colors" title="TikTok">
                  <Music className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-[#0A66C2] text-slate-300 hover:text-white transition-colors" title="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.spotify && (
                <a href={settings.socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-[#1DB954] text-slate-300 hover:text-white transition-colors" title="Spotify">
                  <Radio className="w-4 h-4" />
                </a>
              )}
              {settings?.customSocialLinks?.filter(c => c.isActive).map(c => (
                <a 
                  key={c.id} 
                  href={c.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-2.5 py-1.5 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 flex items-center gap-1"
                  style={{ backgroundColor: c.color || '#CE1126' }}
                  title={c.label}
                >
                  <span>{c.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Categorias */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4 border-l-2 border-[#CE1126] pl-2.5">
              Editorias
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/categoria/${cat.slug}`)}
                    className="text-slate-400 hover:text-white hover:translate-x-1 transition-all"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Mais Categorias */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4 border-l-2 border-[#CE1126] pl-2.5">
              Mais Temas
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(6, 12).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/categoria/${cat.slug}`)}
                    className="text-slate-400 hover:text-white hover:translate-x-1 transition-all"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Institucional & Legal */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4 border-l-2 border-[#CE1126] pl-2.5">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/sobre')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Sobre o Nexora Angola
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/estatuto-editorial')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Estatuto Editorial
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contactos')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Redação & Contactos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/anuncios')} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-amber-400/90 hover:text-amber-300 font-medium">
                  Anuncie no Nexora Angola
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacidade')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/termos')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Termos de Uso
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('/admin')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#CE1126] hover:text-[#F9D616] font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{user ? 'Painel Administrativo' : 'Acesso do Editor (Admin)'}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} Nexora Angola. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

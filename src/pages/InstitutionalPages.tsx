import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Send, 
  Shield, 
  BookOpen, 
  Award, 
  Users, 
  Globe, 
  Lock, 
  Bell, 
  Sparkles,
  Megaphone,
  TrendingUp,
  FileText,
  Clock,
  Check,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Share2,
  Tv,
  Layout,
  Target,
  ArrowRight,
  Briefcase,
  HelpCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { admobService } from '../services/admob';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';
import { SiteSettings } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

// -------------------------------------------------------------
// 1. PÁGINA: SOBRE O NEXORA ANGOLA
// -------------------------------------------------------------
export function AboutPage({ onNavigate }: Props) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="about-page max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={() => onNavigate('/')} className="hover:text-[#CE1126] transition-colors">Início</button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Sobre Nós</span>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#CE1126] text-xs font-bold uppercase tracking-wider mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>Jornalismo Independente & Rigor Informativo</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#000000] font-serif tracking-tight leading-tight">
          Sobre o Nexora Angola
        </h1>
        <p className="text-slate-900 text-base sm:text-lg mt-4 leading-relaxed font-medium">
          Um órgão de comunicação social de referência, dedicado a informar com verdade, independência e profundidade os acontecimentos que moldam Angola, África e o Mundo.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="bg-white text-slate-700 rounded-3xl border border-slate-200 p-6 sm:p-12 shadow-sm space-y-12 leading-relaxed dark:bg-white dark:text-slate-700">
        
        {/* Section 1: Quem Somos & Missão */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#CE1126] uppercase tracking-widest block">Nossa Identidade</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] font-serif dark:!text-white">
              A Notícia Que Move o Mundo, Contada com Rigor
            </h2>
            <p className="text-sm sm:text-base text-slate-900 font-medium dark:!text-slate-700">
              O <strong>Nexora Angola</strong> é uma publicação digital de informação geral fundada com o propósito de oferecer aos cidadãos, líderes de opinião, agentes económicos e à sociedade civil uma cobertura jornalística contínua, analítica e isenta.
            </p>
            <p className="text-sm sm:text-base text-slate-900 font-medium dark:!text-slate-700">
              Com sede em Luanda e correspondentes estratégicos nos principais polos urbanos e capitais internacionais, acompanhamos o pulsar diário da política, economia, sociedade, desporto, cultura, tecnologia e relações internacionais.
            </p>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-[#000000] to-[#1E293B] text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#CE1126] text-white flex items-center justify-center font-serif font-black text-xl shadow">
              N
            </div>
            <h3 className="text-lg font-bold font-serif">Compromisso Nexora</h3>
            <p className="text-xs text-white leading-relaxed font-medium">
              "Garantir o direito fundamental dos cidadãos à informação verídica, promovendo o debate democrático, a transparência pública e o progresso social."
            </p>
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-white">
              <span>Redação Central</span>
              <span className="text-[#CE1126] font-semibold">24 Horas / 7 Dias</span>
            </div>
          </div>
        </div>

        {/* Section 2: Três Pilares Fundamentais */}
        <div className="pt-8 border-t border-slate-100">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-[#000000] font-serif dark:!text-white">Os Nossos Pilares Editoriais</h3>
            <p className="text-xs text-slate-900 font-medium dark:!text-slate-700 mt-1">Princípios inegociáveis que orientam cada linha publicada</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 hover:border-[#F9D616] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FDECEF] text-[#CE1126] flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#000000] text-base mb-2 font-serif dark:text-[#000000]">Independência Editorial</h4>
              <p className="text-xs text-slate-900 font-medium dark:!text-slate-700 leading-relaxed">
                Total autonomia em relação a interesses partidários, governamentais, confissionais ou grupos de pressão económica.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#000000] text-base mb-2 font-serif dark:text-[#000000]">Rigor & Fact-Checking</h4>
              <p className="text-xs text-slate-900 font-medium dark:!text-slate-700 leading-relaxed">
                Verificação minuciosa de factos com cruzamento de múltiplas fontes fidedignas antes de qualquer divulgação ao público.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#000000] text-base mb-2 font-serif dark:text-[#000000]">Pluralismo & Isenção</h4>
              <p className="text-xs text-slate-900 font-medium dark:!text-slate-700 leading-relaxed">
                Respeito absoluto pelo contraditório, dando voz às diferentes perspetivas com respeito pela dignidade da pessoa humana.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Inovação e Acessibilidade Digital */}
        <div className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">Tecnologia & Inovação</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#000000] font-serif dark:!text-white">
              Jornalismo na Era Digital
            </h3>
            <p className="text-xs sm:text-sm text-slate-900 font-medium dark:!text-slate-700 leading-relaxed">
              O Nexora Angola foi construído com arquitetura digital moderna para garantir leitura ultra rápida, suporte a funcionamento offline (PWA), alertas sonoros instantâneos de notícias urgentes e compatibilidade universal em computadores, tablets e smartphones.
            </p>
            <ul className="space-y-2 text-xs text-slate-900 font-semibold dark:!text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#CE1126] shrink-0" />
                <span>Notificações push em tempo real com breaking news</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#CE1126] shrink-0" />
                <span>Modo de leitura guardada offline sem consumo de dados móveis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#CE1126] shrink-0" />
                <span>Formatos multimédia enriquecidos com galerias, vídeos e infográficos</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-[#000000] text-base font-serif flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#CE1126]" />
              <span>Transparência Institucional</span>
            </h4>
            <p className="text-xs text-slate-900 font-medium dark:!text-slate-700 leading-relaxed">
              Consulte os nossos documentos oficiais que regem o exercício da nossa atividade jornalística e comercial.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigate('/estatuto-editorial')}
                className="w-full p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#F9D616] text-left text-xs font-bold text-slate-800 hover:text-[#CE1126] transition-all flex items-center justify-between shadow-2xs cursor-pointer"
              >
                <span>Ler o Estatuto Editorial Completo</span>
                <ChevronRight className="w-4 h-4 text-[#CE1126]" />
              </button>

              <button
                onClick={() => onNavigate('/contactos')}
                className="w-full p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#F9D616] text-left text-xs font-bold text-slate-800 hover:text-[#CE1126] transition-all flex items-center justify-between shadow-2xs cursor-pointer"
              >
                <span>Contactar a Redação / Enviar Pauta</span>
                <ChevronRight className="w-4 h-4 text-[#CE1126]" />
              </button>

              <button
                onClick={() => onNavigate('/anuncios')}
                className="w-full p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#F9D616] text-left text-xs font-bold text-slate-800 hover:text-[#CE1126] transition-all flex items-center justify-between shadow-2xs cursor-pointer"
              >
                <span>Espaço Publicitário & Anúncios</span>
                <ChevronRight className="w-4 h-4 text-[#CE1126]" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. PÁGINA: ESTATUTO EDITORIAL
// -------------------------------------------------------------
export function EditorialStatutePage({ onNavigate }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={() => onNavigate('/')} className="hover:text-[#CE1126] transition-colors">Início</button>
        <span>/</span>
        <button onClick={() => onNavigate('/sobre')} className="hover:text-[#CE1126] transition-colors">Institucional</button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Estatuto Editorial</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-bold text-[#CE1126] uppercase tracking-widest block mb-2">
          Código Deontológico & Linha de Orientação
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-tight">
          Estatuto Editorial
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
          Documento reitor que define a identidade, a linha de conduta profissional e os princípios éticos do órgão de comunicação social <strong>Nexora Angola</strong>.
        </p>
      </div>

      {/* Statute Document Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-12 shadow-sm space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
        
        {/* Preâmbulo */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-bold text-[#000000] font-serif mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#CE1126]" />
            <span>Preâmbulo</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            O <strong>Nexora Angola</strong> rege-se pelos preceitos constitucionais da liberdade de imprensa e de expressão, bem como pelas normas universais da deontologia jornalística. O presente Estatuto Editorial consagra o compromisso firme e inegociável da Direção e de todos os seus jornalistas e colaboradores perante os leitores e a sociedade.
          </p>
        </div>

        {/* Artigo 1º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">1</span>
            <span>Artigo 1.º — Natureza e Âmbito</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            O <strong>Nexora Angola</strong> é uma publicação periódica digital de informação geral, independente, pluralista e de circulação contínua, orientada para a divulgação, análise e debate dos acontecimentos que marcam a atualidade em Angola, no continente africano e no panorama internacional.
          </p>
        </section>

        {/* Artigo 2º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">2</span>
            <span>Artigo 2.º — Independência Editorial</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            O Nexora Angola afirma-se rigorosamente independente de quaisquer poderes políticos, governamentais, ideológicos, partidários, confissionais ou grupos de pressão económica e financeira. A sua única fidelidade é devida aos leitores e ao direito dos cidadãos a serem informados com verdade.
          </p>
        </section>

        {/* Artigo 3º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">3</span>
            <span>Artigo 3.º — Rigor e Distinção entre Factos e Opinião</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            O Nexora Angola compromete-se a assegurar o mais estrito rigor na apuração, redação e verificação dos factos noticiados. Os conteúdos noticiosos distinguem-se com clareza dos artigos de opinião, análises, crónicas e comentários assinados, garantindo que a informação factual permaneça isenta e verificável.
          </p>
        </section>

        {/* Artigo 4º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">4</span>
            <span>Artigo 4.º — Pluralismo e Princípio do Contraditório</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            O Nexora Angola defende a pluralidade democrática e o livre confronto de ideias. Sempre que uma notícia envolva alegações controversas ou acusações sobre pessoas singulares ou coletivas, é obrigatório ouvir todas as partes envolvidas antes da publicação ou facultar prontamente o espaço para o seu posicionamento.
          </p>
        </section>

        {/* Artigo 5º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">5</span>
            <span>Artigo 5.º — Presunção de Inocência e Direitos Fundamentais</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            A redação respeita escrupulosamente a presunção de inocência de todos os cidadãos em processos judiciais, bem como o direito à honra, à imagem e à reserva da intimidade da vida privada, não promovendo julgamentos sumários ou sensacionalismo.
          </p>
        </section>

        {/* Artigo 6º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">6</span>
            <span>Artigo 6.º — Sigilo Profissional e Proteção de Fontes</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            O segredo profissional e a confidencialidade das fontes de informação constituem um dever e um direito inalienável dos jornalistas do Nexora Angola, nos termos da legislação aplicável e da ética da profissão.
          </p>
        </section>

        {/* Artigo 7º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">7</span>
            <span>Artigo 7.º — Direito de Resposta e Retificação</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            O Nexora Angola assegura o direito de resposta e de retificação a qualquer entidade ou indivíduo visado por informações comprovadamente incorretas ou difamatórias, procedendo à devida correção pública com destaque proporcional e celeridade.
          </p>
        </section>

        {/* Artigo 8º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">8</span>
            <span>Artigo 8.º — Distinção Clara da Publicidade</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            Todos os anúncios comerciais, publirreportagens ou artigos patrocinados publicados no portal são expressa e inequivocamente identificados através de rótulos visíveis ("PUBLICIDADE", "DESTAQUE COMERCIAL" ou "PATROCINADO"), não se confundindo em caso algum com o trabalho estritamente editorial da redação.
          </p>
        </section>

        {/* Artigo 9º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">9</span>
            <span>Artigo 9.º — Responsabilidade da Direção</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            A orientação editorial do Nexora Angola e a supervisão dos seus conteúdos são da exclusiva responsabilidade do Diretor e do Corpo Redatorial, nos termos da Lei de Imprensa em vigor.
          </p>
        </section>

        {/* Artigo 10º */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-[#000000] font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#CE1126]/10 text-[#CE1126] text-xs font-black flex items-center justify-center shrink-0">10</span>
            <span>Artigo 10.º — Compromisso Ético</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
            Todos os jornalistas, repórteres e colaboradores do Nexora Angola vinculam-se expressamente ao cumprimento integral das diretrizes aqui exaradas, pugnando pela elevação do jornalismo em língua portuguesa.
          </p>
        </section>

        {/* Bottom CTA Box */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Aprovado pela Direção Editorial do Nexora Angola • Luanda, Angola
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/contactos')}
              className="px-4 py-2 bg-[#CE1126] text-white text-xs font-bold rounded-xl hover:bg-[#A50D1F] transition-colors cursor-pointer"
            >
              Falar com a Redação
            </button>
            <button
              onClick={() => onNavigate('/sobre')}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Sobre o Portal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. PÁGINA: CONTACTAR REDAÇÃO & ANÚNCIOS / PUBLICIDADE
// -------------------------------------------------------------
export function ContactPage({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<'redacao' | 'anuncios'>('redacao');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Form states - Redação
  const [redacaoSubmitted, setRedacaoSubmitted] = useState(false);
  const [isSubmittingRedacao, setIsSubmittingRedacao] = useState(false);
  const [redacaoError, setRedacaoError] = useState<string | null>(null);
  const [redacaoForm, setRedacaoForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'sugestao_pauta',
    subject: '',
    message: ''
  });

  // Form states - Anúncios / Comercial
  const [adsSubmitted, setAdsSubmitted] = useState(false);
  const [isSubmittingAds, setIsSubmittingAds] = useState(false);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [lastSubmittedProposal, setLastSubmittedProposal] = useState<any>(null);
  const [adsForm, setAdsForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    adFormat: 'hero_banner',
    budget: '1_mes',
    message: ''
  });

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Detect if user came directly with hash #anuncios or #publicidade
    if (window.location.hash.includes('anuncio') || window.location.pathname.includes('anuncio') || window.location.pathname.includes('publicidade')) {
      setActiveTab('anuncios');
    }
  }, []);

  const handleRedacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedacaoError(null);
    setIsSubmittingRedacao(true);
    try {
      await api.submitContactMessage(redacaoForm);
      setRedacaoSubmitted(true);
      setRedacaoForm({ name: '', email: '', phone: '', category: 'sugestao_pauta', subject: '', message: '' });
    } catch (err: any) {
      setRedacaoError(err?.message || 'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.');
    } finally {
      setIsSubmittingRedacao(false);
    }
  };

  const handleAdsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdsError(null);
    setIsSubmittingAds(true);
    try {
      const res = await api.submitAdProposal(adsForm);
      setLastSubmittedProposal(res?.proposal || { ...adsForm, createdAt: new Date().toISOString() });
      setAdsSubmitted(true);
      setAdsForm({ company: '', contactName: '', email: '', phone: '', adFormat: 'hero_banner', budget: '1_mes', message: '' });
    } catch (err: any) {
      setAdsError(err?.message || 'Ocorreu um erro ao enviar a proposta comercial. Por favor, tente novamente.');
    } finally {
      setIsSubmittingAds(false);
    }
  };

  const contactEmail = settings?.contactEmail || 'redacao@nexoranews.ao';
  const contactPhone = settings?.contactPhone || '+244 921 281 315';
  const whatsappNumber = contactPhone.replace(/[^0-9]/g, '');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={() => onNavigate('/')} className="hover:text-[#CE1126] transition-colors">Início</button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Contactar Redação & Anúncios</span>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <span className="text-xs font-bold text-[#CE1126] uppercase tracking-widest block mb-2">
          Canais Oficiais de Atendimento
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-tight">
          Redação & Publicidade
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
          Conecte-se diretamente com a nossa redação de jornalistas ou promova a sua marca com soluções publicitárias de alto impacto.
        </p>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 max-w-md w-full shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('redacao')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'redacao'
                ? 'bg-white text-[#000000] shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-[#CE1126]" />
            <span>Falar com a Redação</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anuncios')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'anuncios'
                ? 'bg-[#CE1126] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Anúncios & Parcerias</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REDAÇÃO GERAL */}
      {activeTab === 'redacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          {/* Coluna Esquerda: Informações de Contacto da Redação */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Direct Email */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#CE1126] flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm font-serif">Email da Redação Central</h3>
                <p className="text-xs text-slate-500 mt-0.5">Envio de comunicados, denúncias e artigos</p>
                <a 
                  href={`mailto:${contactEmail}`} 
                  className="text-xs font-bold text-[#CE1126] mt-2 inline-flex items-center gap-1 hover:underline"
                >
                  <span>{contactEmail}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* WhatsApp / Phone */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm font-serif">WhatsApp & Linha Telefónica</h3>
                <p className="text-xs text-slate-500 mt-0.5">Envio de fotos, áudios e sugestões de reportagem</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <a 
                    href={`tel:${contactPhone.replace(/\s+/g, '')}`} 
                    className="text-xs font-bold text-slate-800 hover:text-[#CE1126]"
                  >
                    {contactPhone}
                  </a>
                  <span className="text-slate-300">•</span>
                  <a 
                    href={`https://wa.me/${whatsappNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Abrir WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Sede Editorial */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm font-serif">Sede Editorial & Correspondência</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {settings?.address || 'Avenida 4 de Fevereiro, Marginal de Luanda, Edifício Baía, Luanda - Angola'}
                </p>
                <div className="text-[11px] text-slate-400 mt-2">
                  Atendimento de Segunda a Sexta: 08:00 às 18:00 (WAT)
                </div>
              </div>
            </div>

            {/* Security Notice for Whistleblowers */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Shield className="w-4 h-4" />
                <span>Proteção Absoluta de Fontes</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Garantimos o sigilo e anonimato absoluto das nossas fontes e denunciantes de interesse público, em estrito cumprimento da lei de imprensa.
              </p>
            </div>

          </div>

          {/* Coluna Direita: Formulário de Contacto com a Redação */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 font-serif mb-1">
              Enviar Mensagem ou Pauta à Redação
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Preencha os campos abaixo. A nossa equipa de jornalistas analisará a sua submissão.
            </p>

            {redacaoSubmitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-900 text-base font-serif">
                  Mensagem Enviada com Sucesso!
                </h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                  Obrigado pelo seu contacto. A redação do Nexora Angola recebeu as suas informações e entrará em contacto se forem necessários esclarecimentos adicionais.
                </p>
                <button
                  type="button"
                  onClick={() => setRedacaoSubmitted(false)}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Enviar Nova Mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleRedacaoSubmit} className="space-y-4">
                {redacaoError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{redacaoError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={redacaoForm.name}
                      onChange={e => setRedacaoForm({ ...redacaoForm, name: e.target.value })}
                      placeholder="Ex: Manuel António"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email de Contacto *
                    </label>
                    <input
                      type="email"
                      required
                      value={redacaoForm.email}
                      onChange={e => setRedacaoForm({ ...redacaoForm, email: e.target.value })}
                      placeholder="seu.email@exemplo.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Telefone / WhatsApp (Opcional)
                    </label>
                    <input
                      type="tel"
                      value={redacaoForm.phone}
                      onChange={e => setRedacaoForm({ ...redacaoForm, phone: e.target.value })}
                      placeholder="+244 9..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tipo de Assunto
                    </label>
                    <select
                      value={redacaoForm.category}
                      onChange={e => setRedacaoForm({ ...redacaoForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden cursor-pointer"
                    >
                      <option value="sugestao_pauta">Sugestão de Pauta / Notícia</option>
                      <option value="denuncia">Denúncia de Interesse Público</option>
                      <option value="comunicado">Comunicado de Imprensa Oficial</option>
                      <option value="artigo_opiniao">Submissão de Artigo de Opinião</option>
                      <option value="direito_resposta">Direito de Resposta / Retificação</option>
                      <option value="duvida_geral">Dúvida ou Esclarecimento Geral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Título / Resumo do Assunto *
                  </label>
                  <input
                    type="text"
                    required
                    value={redacaoForm.subject}
                    onChange={e => setRedacaoForm({ ...redacaoForm, subject: e.target.value })}
                    placeholder="Ex: Acontecimento em Luanda sobre..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detalhes da Mensagem / Fatos *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={redacaoForm.message}
                    onChange={e => setRedacaoForm({ ...redacaoForm, message: e.target.value })}
                    placeholder="Descreva com o máximo de detalhes os factos, datas, locais e fontes envolvidas..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRedacao}
                  className="w-full py-3.5 bg-[#CE1126] hover:bg-[#A50D1F] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingRedacao ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A enviar à Redação...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Informação à Redação</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANÚNCIOS & PARCERIAS COMERCIAIS */}
      {activeTab === 'anuncios' && (
        <div className="space-y-10 animate-fadeIn">
          
          {/* Banner de Apresentação Comercial */}
          <div className="bg-gradient-to-r from-[#000000] via-[#1E293B] to-[#000000] text-white rounded-3xl p-6 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CE1126]/30 text-[#F9D616] text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mídia Kit & Publicidade Nexora Angola</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-serif leading-tight">
                Destaque a Sua Marca perante Decisores e Milhares de Leitores Diários
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Alcance um público qualificado em Angola e na Lusofonia através de formatos digitais inovadores: Hero Banners no topo da página inicial, vídeos publicitários, patrocínios de categorias e publirreportagens.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Ol%C3%A1,%20gostaria%20de%20solicitar%20uma%20proposta%20de%20publicidade%20no%20Nexora%20News.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Falar com o Comercial no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Formatos Publicitários Disponíveis */}
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">Formatos Disponíveis no Portal</h3>
              <p className="text-xs text-slate-500 mt-1">Soluções flexíveis e adaptáveis a qualquer estratégia de marketing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Formato 1: Top Hero Banner & Vídeo */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#CE1126] flex items-center justify-center mb-4">
                    <Tv className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-[#CE1126] uppercase tracking-wider">MAIOR VISIBILIDADE</span>
                  <h4 className="font-bold text-slate-900 text-base font-serif mt-1 mb-2">Hero Banner de Topo</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Exibição no topo de abertura da página inicial. Suporta fotos em alta resolução, vídeos promocionais em streaming e botões de ação direta (CTA).
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>Impacto Imediato</span>
                  <span className="text-emerald-600">100% dos Visitantes</span>
                </div>
              </div>

              {/* Formato 2: Banners Laterais & Entre Notícias */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                    <Layout className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">PRESENÇA CONTÍNUA</span>
                  <h4 className="font-bold text-slate-900 text-base font-serif mt-1 mb-2">Banners nas Notícias</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Posicionamento estratégico nas barras laterais e no corpo de leitura das notícias mais visualizadas de política, economia e desporto.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>Alta Taxa de Cliques</span>
                  <span className="text-purple-600">Leitura Engajada</span>
                </div>
              </div>

              {/* Formato 3: Publirreportagens & Conteúdo Patrocinado */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">BRANDED CONTENT</span>
                  <h4 className="font-bold text-slate-900 text-base font-serif mt-1 mb-2">Publirreportagens</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Artigos aprofundados, lançamentos de produtos e entrevistas corporativas com distribuição no portal, redes sociais e newsletter oficial.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>Autoridade de Marca</span>
                  <span className="text-amber-600">Permanência Permanente</span>
                </div>
              </div>

            </div>
          </div>

          {/* Formulário para Anunciantes */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                  Solicitar Proposta Comercial / Mídia Kit
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Envie-nos os dados da sua campanha e a equipa comercial do Nexora Angola analisará o pedido e entrará em contacto no prazo máximo de 24 horas.
                </p>
              </div>

              {adsSubmitted ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      Registado no Sistema
                    </span>
                    <h3 className="font-bold text-emerald-950 text-lg font-serif">
                      Proposta Comercial Enviada com Sucesso!
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                    A sua solicitação foi recebida e encaminhada diretamente para a <strong>Administração & Equipa Comercial do Nexora Angola</strong>. Analisaremos o seu perfil empresarial e responderemos via email/telefone.
                  </p>

                  {lastSubmittedProposal && (
                    <div className="bg-white/80 backdrop-blur-xs border border-emerald-200 rounded-xl p-4 text-left text-xs space-y-1.5 max-w-md mx-auto shadow-2xs">
                      <div className="font-bold text-slate-800 border-b border-emerald-100 pb-1 flex justify-between items-center">
                        <span>Resumo do Pedido</span>
                        <span className="text-[10px] text-slate-500 font-normal">Pendente de Avaliação</span>
                      </div>
                      <div className="text-slate-600"><strong>Empresa:</strong> {lastSubmittedProposal.company}</div>
                      <div className="text-slate-600"><strong>Contacto:</strong> {lastSubmittedProposal.contactName} ({lastSubmittedProposal.email})</div>
                      <div className="text-slate-600"><strong>Telefone:</strong> {lastSubmittedProposal.phone}</div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAdsSubmitted(false);
                        setLastSubmittedProposal(null);
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Enviar Outra Solicitação
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdsSubmit} className="space-y-4">
                  {adsError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{adsError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nome da Empresa / Marca *
                      </label>
                      <input
                        type="text"
                        required
                        value={adsForm.company}
                        onChange={e => setAdsForm({ ...adsForm, company: e.target.value })}
                        placeholder="Ex: Empresa X Lda."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nome do Responsável *
                      </label>
                      <input
                        type="text"
                        required
                        value={adsForm.contactName}
                        onChange={e => setAdsForm({ ...adsForm, contactName: e.target.value })}
                        placeholder="Ex: Dra. Teresa Silva"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Profissional *
                      </label>
                      <input
                        type="email"
                        required
                        value={adsForm.email}
                        onChange={e => setAdsForm({ ...adsForm, email: e.target.value })}
                        placeholder="comercial@suaempresa.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={adsForm.phone}
                        onChange={e => setAdsForm({ ...adsForm, phone: e.target.value })}
                        placeholder="+244 9..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Formato Desejado
                      </label>
                      <select
                        value={adsForm.adFormat}
                        onChange={e => setAdsForm({ ...adsForm, adFormat: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden cursor-pointer"
                      >
                        <option value="hero_banner">Hero Banner Principal de Topo (Foto / Vídeo)</option>
                        <option value="sidebar_banner">Banner na Barra Lateral & Notícias</option>
                        <option value="publirreportagem">Publirreportagem / Artigo Patrocinado</option>
                        <option value="patrocinio_categoria">Patrocínio Exclusivo de Categoria</option>
                        <option value="pacote_completo">Pacote Completo Multimídia 360°</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Duração Prevista da Campanha
                      </label>
                      <select
                        value={adsForm.budget}
                        onChange={e => setAdsForm({ ...adsForm, budget: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden cursor-pointer"
                      >
                        <option value="1_semana">Campanha Curta (1 a 2 Semanas)</option>
                        <option value="1_mes">Campanha Mensal (30 Dias)</option>
                        <option value="trimestral">Pacote Trimestral (Desconto Especial)</option>
                        <option value="anual">Parceria Anual Contínua</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Objetivo da Campanha ou Observações
                    </label>
                    <textarea
                      rows={3}
                      value={adsForm.message}
                      onChange={e => setAdsForm({ ...adsForm, message: e.target.value })}
                      placeholder="Descreva brevemente os objetivos da sua marca ou peça detalhes específicos..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#CE1126] outline-hidden"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAds}
                    className="w-full py-3.5 bg-[#CE1126] hover:bg-[#A50D1F] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingAds ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A registar solicitação...</span>
                      </>
                    ) : (
                      <>
                        <Megaphone className="w-4 h-4" />
                        <span>Solicitar Mídia Kit & Proposta</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// 4. PÁGINA: POLÍTICA DE PRIVACIDADE
// -------------------------------------------------------------
export function PrivacyPage({ onNavigate }: Props) {
  const { isPushSubscribed, requestPermission } = useNotifications();
  const consent = admobService.getConsentStatus();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={() => onNavigate('/')} className="hover:text-[#CE1126] transition-colors">Início</button>
        <span>/</span>
        <button onClick={() => onNavigate('/sobre')} className="hover:text-[#CE1126] transition-colors">Institucional</button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Privacidade</span>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold text-[#CE1126] uppercase tracking-widest block mb-2">
          Transparência & Conformidade
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#000000] font-serif">
          Política de Privacidade & Proteção de Dados
        </h1>
        <p className="text-slate-600 text-sm mt-2">
          Atualizada para total conformidade com a Google Play Store, AdMob e legislação aplicável.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
        {/* Quick Preferences Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
            <Lock className="w-4 h-4 text-[#CE1126]" />
            <span>Gerenciar Preferências de Privacidade no Aplicativo</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>Notificações Push</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isPushSubscribed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {isPushSubscribed ? 'Ativadas' : 'Desativadas'}
                </span>
              </div>
              <p className="text-slate-500 mb-2">Alertas sonoros e visuais de notícias urgentes.</p>
              <button
                type="button"
                onClick={() => requestPermission()}
                className="px-3 py-1.5 rounded-lg bg-[#CE1126] text-white font-semibold hover:bg-[#A50D1F] transition-colors cursor-pointer"
              >
                {isPushSubscribed ? 'Notificações Ativas' : 'Ativar Notificações'}
              </button>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>Consentimento Google AdMob</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FDECEF] text-[#A50D1F]">
                  {consent === 'granted' ? 'Personalizado' : 'Não Personalizado'}
                </span>
              </div>
              <p className="text-slate-500 mb-2">Preferências de anúncios do Google Mobile Ads.</p>
              <button
                type="button"
                onClick={() => admobService.setConsentStatus(consent === 'granted' ? 'declined' : 'granted')}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Alternar Modo de Anúncios
              </button>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif" style={{ color: "#FFFFFF" }}>1. Introdução e Compromisso</h2>
          <p>
            O <strong>Nexora Angola</strong> valoriza e protege a privacidade dos seus utilizadores. Esta Política de Privacidade descreve as práticas de tratamento de dados da aplicação móvel e portal web Nexora Angola, de acordo com as diretrizes da Google Play Store, RGPD, LGPD e demais legislações aplicáveis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold !text-white font-serif">2. Dados Recolhidos e Finalidade</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Identificadores Técnicos e de Dispositivo:</strong> Endereço IP anónimo, modelo do dispositivo e versão do sistema operativo, utilizados exclusivamente para garantir a entrega correta do conteúdo, cache de leitura e estabilidade técnica da aplicação.</li>
            <li><strong>Subscrição da Newsletter e Contactos:</strong> Endereço de email e nome voluntariamente fornecidos pelo leitor ao subscrever boletins informativos ou ao submeter formulários de contacto.</li>
            <li><strong>Notificações Push:</strong> Token de envio de notificações gerado pelo sistema quando o utilizador autoriza expressamente a receção de alertas de notícias urgentes.</li>
            <li><strong>Favoritos e Artigos Salvos:</strong> Armazenados estritamente na memória local do seu dispositivo (LocalStorage / IndexedDB) sem envio para servidores externos.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold !text-white font-serif">3. Publicidade e Google AdMob</h2>
          <p>
            O Nexora Angola utiliza o serviço de publicidade <strong>Google Mobile Ads (AdMob)</strong> para financiar as operações jornalísticas e manter o acesso livre aos artigos. O Google AdMob pode utilizar identificadores de publicidade (Google Advertising ID / GAID) para exibir anúncios relevantes.
          </p>
          <p>
            O utilizador pode a qualquer momento optar por receber apenas anúncios não personalizados através do painel de consentimento do aplicativo ou nas configurações de privacidade do seu dispositivo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold !text-white font-serif">4. Armazenamento e Segurança</h2>
          <p>
            Adotamos protocolos avançados de encriptação SSL/TLS para transmissão segura de dados e medidas rígidas de segurança contra acessos não autorizados. Nenhum dado pessoal é comercializado ou partilhado com entidades terceiras para fins de marketing abusivo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold !text-white font-serif">5. Contacto do Responsável de Privacidade</h2>
          <p>
            Para exercer os seus direitos de acesso, retificação, eliminação de dados ou esclarecer dúvidas sobre esta política, entre em contacto direto com o nosso Responsável de Proteção de Dados:
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <p className="font-bold text-slate-900">Nexora Angola - Departamento Jurídico & Privacidade</p>
            <p className="text-slate-600 mt-1">Email: <a href="mailto:privacidade@nexoranews.ao" className="text-[#CE1126] underline">privacidade@nexoranews.ao</a></p>
            <p className="text-slate-600">Morada: Avenida 4 de Fevereiro, Marginal de Luanda, Angola</p>
          </div>
        </section>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. PÁGINA: TERMOS DE USO
// -------------------------------------------------------------
export function TermsPage({ onNavigate }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={() => onNavigate('/')} className="hover:text-[#CE1126] transition-colors">Início</button>
        <span>/</span>
        <button onClick={() => onNavigate('/sobre')} className="hover:text-[#CE1126] transition-colors">Institucional</button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Termos de Uso</span>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold text-[#CE1126] uppercase tracking-widest block mb-2">
          Condições de Utilização
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#000000] font-serif">
          Termos de Uso
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>
          Bem-vindo ao <strong>Nexora Angola</strong>. Ao aceder e utilizar a aplicação móvel ou portal web do Nexora Angola, o utilizador concorda expressamente com os presentes Termos de Uso.
        </p>

        <h2 className="text-lg font-bold !text-white font-serif">1. Propriedade Intelectual</h2>
        <p>
          Todos os artigos, fotografias, infográficos e conteúdos multimédia publicados são propriedade do Nexora Angola ou de fontes creditadas, protegidos pela legislação de direitos de autor. É estritamente proibida a reprodução comercial sem autorização prévia por escrito.
        </p>

        <h2 className="text-lg font-bold !text-white font-serif">2. Responsabilidade Editorial</h2>
        <p>
          A redação do Nexora Angola compromete-se com a precisão dos factos noticiados. Caso seja detetada qualquer incorreção, a retificação será publicada de forma clara e visível no artigo correspondente.
        </p>

        <h2 className="text-lg font-bold !text-white font-serif">3. Atualizações dos Termos</h2>
        <p>
          O Nexora Angola reserva-se o direito de atualizar estes termos periodicamente para refletir alterações legislativas ou melhorias na plataforma.
        </p>
      </div>
    </div>
  );
}

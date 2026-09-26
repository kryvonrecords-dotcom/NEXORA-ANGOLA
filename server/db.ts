import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase';
import { 
  Advertisement, 
  AppNotification, 
  Category, 
  CommercialProposal, 
  EditorialContactMessage, 
  NewsItem, 
  NewsletterCampaign, 
  NewsletterSubscriber, 
  PushSubscriptionItem, FcmTokenItem, 
  SiteSettings, 
  User 
} from '../src/types';

interface DatabaseSchema {
  users: User[];
  categories: Category[];
  news: NewsItem[];
  deletedNewsIds: string[];
  subscribers: NewsletterSubscriber[];
  newsletterCampaigns?: NewsletterCampaign[];
  settings: SiteSettings;
  advertisements: Advertisement[];
  adProposals?: CommercialProposal[];
  contactMessages?: EditorialContactMessage[];
  notifications: AppNotification[];
  pushSubscriptions: PushSubscriptionItem[];
  fcmTokens: FcmTokenItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nexora_news.json');

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-angola', name: 'Angola', slug: 'angola', description: 'Notícias nacionais de Angola, atualidade e sociedade.', color: '#146EF5', order: 1, createdAt: new Date().toISOString() },
  { id: 'cat-africa', name: 'África', slug: 'africa', description: 'Acontecimentos no continente africano e cooperação regional.', color: '#0B132B', order: 2, createdAt: new Date().toISOString() },
  { id: 'cat-mundo', name: 'Mundo', slug: 'mundo', description: 'Geopolítica e notícias internacionais de relevo.', color: '#2563EB', order: 3, createdAt: new Date().toISOString() },
  { id: 'cat-politica', name: 'Política', slug: 'politica', description: 'Decisões governamentais, assembleia e diplomacia.', color: '#4F46E5', order: 4, createdAt: new Date().toISOString() },
  { id: 'cat-economia', name: 'Economia', slug: 'economia', description: 'Mercados, finanças, investimentos, petróleo e banca.', color: '#0D9488', order: 5, createdAt: new Date().toISOString() },
  { id: 'cat-tecnologia', name: 'Tecnologia', slug: 'tecnologia', description: 'Inovação digital, telecomunicações, startups e ciência.', color: '#7C3AED', order: 6, createdAt: new Date().toISOString() },
  { id: 'cat-desporto', name: 'Desporto', slug: 'desporto', description: 'Girabola, futebol internacional, basquetebol e atletas.', color: '#EA580C', order: 7, createdAt: new Date().toISOString() },
  { id: 'cat-entretenimento', name: 'Entretenimento', slug: 'entretenimento', description: 'Música, cinema, moda, celebridades e espetáculos.', color: '#DB2777', order: 8, createdAt: new Date().toISOString() },
  { id: 'cat-cultura', name: 'Cultura', slug: 'cultura', description: 'Artes, literatura, património histórico e tradições.', color: '#9333EA', order: 9, createdAt: new Date().toISOString() },
  { id: 'cat-saude', name: 'Saúde', slug: 'saude', description: 'Medicina, bem-estar, hospitais e saúde pública.', color: '#059669', order: 10, createdAt: new Date().toISOString() },
  { id: 'cat-educacao', name: 'Educação', slug: 'educacao', description: 'Universidades, bolsas de estudo, formação e ensino.', color: '#0284C7', order: 11, createdAt: new Date().toISOString() },
  { id: 'cat-sociedade', name: 'Sociedade', slug: 'sociedade', description: 'Comunidade, iniciativas sociais e cidadania.', color: '#D97706', order: 12, createdAt: new Date().toISOString() },
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Nexora News',
  siteTagline: 'Jornalismo de Excelência, Rigor e Credibilidade em Tempo Real',
  logoText: 'NEXORA NEWS',
  breakingNewsEnabled: true,
  breakingNewsText: 'URGENTE: Banco Central de Angola anuncia novo pacote de incentivos ao crédito para startups de base tecnológica',
  breakingNewsUrl: '/noticia/banco-central-anuncia-incentivos-credito-startups',
  contactEmail: 'redacao@nexoranews.ao',
  contactPhone: '+244 921 281 315',
  address: 'Avenida 4 de Fevereiro, Marginal de Luanda, Angola',
  socialLinks: {
    facebook: 'https://facebook.com/nexoranews',
    twitter: 'https://x.com/nexoranews',
    instagram: 'https://instagram.com/nexoranews',
    youtube: 'https://youtube.com/@nexoranews',
    whatsapp: 'https://wa.me/244921281315',
    telegram: 'https://t.me/nexoranews',
    tiktok: 'https://tiktok.com/@nexoranews',
    linkedin: 'https://linkedin.com/company/nexoranews',
    threads: 'https://threads.net/@nexoranews',
    spotify: 'https://open.spotify.com/show/nexoranews',
    playStore: 'https://play.google.com/store',
    appStore: 'https://apps.apple.com'
  },
  customSocialLinks: [],
  whatsappFloatingEnabled: true,
  whatsappFloatingNumber: '+244 921 281 315',
  whatsappFloatingMessage: 'Olá! Gostaria de falar com a redação do Nexora News.',
  showSocialInHeader: true,
  showSocialInFooter: true
};

const DEFAULT_ADS: Advertisement[] = [
  {
    id: 'ad-nexora-app',
    title: 'NEXORA NEWS: A Notícia Que Move o Mundo!',
    subtitle: 'Cobertura completa, análises profundas e informação confiável em tempo real. 24 horas com você, onde você estiver.',
    tagline: 'A Verdade Importa. A Gente Traz Até Você!',
    badgeText: 'BAIXE O APLICATIVO',
    mediaType: 'custom_banner',
    mediaUrl: '/promo-banner.jpg',
    linkUrl: 'https://play.google.com/store',
    targetNewTab: true,
    callToAction: 'Acesse Agora',
    position: 'top_hero',
    status: 'active',
    order: 1,
    viewsCount: 1420,
    clicksCount: 238,
    createdAt: new Date().toISOString()
  }
];

const DEMO_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Angola acelera transição energética com novo parque solar fotovoltaico de grande capacidade',
    slug: 'angola-acelera-transicao-energetica-parque-solar',
    excerpt: 'Com capacidade para abastecer mais de 450 mil famílias, o novo empreendimento em Benguela marca um passo decisivo na diversificação da matriz energética nacional e redução de emissões.',
    content: `<p class="lead font-medium text-lg text-slate-700 leading-relaxed mb-6">O setor energético angolano atingiu um marco histórico com a inauguração oficial de um dos maiores complexos solares fotovoltaicos da África Austral, localizado na província de Benguela. O projeto visa fortalecer a autossuficiência energética e impulsionar o desenvolvimento agroindustrial regional.</p>
<h2>Um avanço sustentável para o desenvolvimento industrial</h2>
<p>Com um investimento estratégico estruturado entre o Executivo angolano e parceiros de cooperação internacional, o complexo conta com mais de 350.000 painéis solares de última geração com tecnologia bifacial, maximizando o aproveitamento do elevado índice de radiação solar característico da região.</p>
<blockquote>"Este projeto não é apenas uma infraestrutura elétrica; é um catalisador de oportunidades industriais, criação de postos de trabalho qualificados para jovens angolanos e cumprimento rigoroso das metas climáticas internacionais."</blockquote>
<p>Durante a cerimónia de inauguração, representantes ministeriais sublinharam que a entrada em funcionamento do parque permitirá poupar milhares de toneladas de combustível fóssil anualmente, desonerando o erário público e garantindo eletricidade fiável a polos fabris e agrícolas vizinhos.</p>
<h2>Impacto social e formação técnica local</h2>
<p>Mais de 80% da mão-de-obra contratada na fase de construção e subsequente operação é constituída por técnicos e engenheiros formados em institutos politécnicos nacionais, reafirmando o compromisso com a capacitação do capital humano angolano.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1400&q=80',
    featuredImageCaption: 'Complexo solar fotovoltaico em operação plena no centro-oeste angolano. (Foto: Divulgação/Nexora)',
    galleryImages: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80'
    ],
    categoryId: 'cat-angola',
    categoryName: 'Angola',
    categorySlug: 'angola',
    authorId: 'admin-1',
    authorName: 'Mário dos Santos',
    authorRole: 'Editor de Infraestruturas e Energia',
    tags: ['Energia Solar', 'Angola', 'Sustentabilidade', 'Economia', 'Benguela'],
    status: 'published',
    isBreaking: false,
    isHero: true,
    isSecondaryHero: false,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    views: 3420,
    readTimeMinutes: 4,
    isDemo: true
  },
  {
    id: 'news-2',
    title: 'Banco Central anuncia incentivos ao crédito para startups e inovação digital',
    slug: 'banco-central-anuncia-incentivos-credito-startups',
    excerpt: 'Nova diretiva regulamentar reduz exigências de garantias reais para empresas de base tecnológica e cria linha de garantia soberana de apoio ao empreendedorismo jovem.',
    content: `<p class="lead font-medium text-lg text-slate-700 leading-relaxed mb-6">O Banco Nacional anunciou esta manhã um pacote pioneiro de facilitação ao crédito financeiro direcionado especificamente ao ecossistema de inovação, fintechs e soluções agrotech em fase de expansão.</p>
<h2>Menos burocracia e juros bonificados</h2>
<p>A medida responde a antigas reivindicações de jovens inovadores que encontravam barreiras na exigência tradicional de hipotecas de imóveis como colateral para financiamento inicial de software e propriedade intelectual.</p>
<p>Com o novo mecanismo, a validação de fluxos de caixa projetados e contratos prévios passa a ser aceite como ativo elegível perante as instituições de crédito comercial participantes.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Sede financeira e analistas em Luanda. (Foto: Arquivo)',
    categoryId: 'cat-economia',
    categoryName: 'Economia',
    categorySlug: 'economia',
    authorId: 'admin-1',
    authorName: 'Ana Clara Baptista',
    authorRole: 'Analista de Mercados e Finanças',
    tags: ['Economia', 'Banca', 'Startups', 'Fintech', 'Crédito'],
    status: 'published',
    isBreaking: true,
    isHero: false,
    isSecondaryHero: true,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    views: 4890,
    readTimeMinutes: 3,
    isDemo: true
  },
  {
    id: 'news-3',
    title: 'Cúpula da União Africana debate integração comercial e livre circulação de bens',
    slug: 'cupula-uniao-africana-integracao-comercial',
    excerpt: 'Chefes de Estado e de Governo reúnem-se para avaliar os avanços da Zona de Comércio Livre Continental Africana (AfCFTA) e harmonização alfandegária.',
    content: `<p>A conferência anual de cúpula destacou a necessidade urgente de reduzir barreiras não-tarifárias e modernizar corredores logísticos ferroviários e portuários entre as várias regiões económicas do continente.</p>
<p>Líderes sublinharam que o comércio intra-africano tem o potencial de elevar o PIB regional em mais de 7% até 2035 se os protocolos aduaneiros digitais forem plenamente implementados.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Painel diplomático em sessão plenária.',
    categoryId: 'cat-africa',
    categoryName: 'África',
    categorySlug: 'africa',
    authorId: 'admin-1',
    authorName: 'Gabriel Vunge',
    authorRole: 'Correspondente Internacional',
    tags: ['África', 'Comércio', 'AfCFTA', 'Diplomacia'],
    status: 'published',
    isBreaking: false,
    isHero: false,
    isSecondaryHero: true,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    views: 2150,
    readTimeMinutes: 3,
    isDemo: true
  },
  {
    id: 'news-4',
    title: 'Inteligência Artificial e Telecomunicações: Nova rede de fibra ótica submarina conecta Luanda ao Atlântico Norte',
    slug: 'nova-rede-fibra-otica-submarina-luanda',
    excerpt: 'Consórcio de telecomunicações conclui amarração de cabo de alta velocidade, reduzindo latência em 40% e preparando o país para datacenters de hiperescala.',
    content: `<p>A infraestrutura de conectividade internacional de Angola recebeu um impulso significativo com a conclusão bem-sucedida da amarração de um novo sistema de cabo submarino de fibra ótica de múltiplos terabits por segundo.</p>
<p>Com esta capacidade, empresas de serviços em nuvem, banca e instituições de ensino superior passam a beneficiar de ligações ultra-rápidas com os principais pontos de troca de tráfego na Europa e Américas.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-tecnologia',
    categoryName: 'Tecnologia',
    categorySlug: 'tecnologia',
    authorId: 'admin-1',
    authorName: 'Patrícia Quaresma',
    authorRole: 'Editora de Tecnologia e Inovação',
    tags: ['Tecnologia', 'Telecomunicações', 'Internet', 'Inovação'],
    status: 'published',
    isBreaking: false,
    isHero: false,
    isSecondaryHero: false,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 13).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    views: 3100,
    readTimeMinutes: 4,
    isDemo: true
  },
  {
    id: 'news-5',
    title: 'Girabola: Petro e 1º de Agosto empatam em clássico emocionante no Estádio 11 de Novembro',
    slug: 'girabola-petro-primeiro-agosto-classico',
    excerpt: 'Diante de mais de 40 mil adeptos fervorosos, o dérbi da capital terminou com um golo para cada lado após 90 minutos de ritmo intenso e jogadas disputadas.',
    content: `<p>O maior clássico do futebol angolano não desiludiu os adeptos que lotaram o Estádio 11 de Novembro neste fim de semana. Com arbitragem exemplar e ambiente de grande festa desportiva, ambas as equipas demonstraram maturidade tática e empenho.</p>
<p>O resultado mantém o equilíbrio no topo da tabela classificativa do campeonato nacional, deixando tudo em aberto para a reta final da temporada.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-desporto',
    categoryName: 'Desporto',
    categorySlug: 'desporto',
    authorId: 'admin-1',
    authorName: 'Edson Silva',
    authorRole: 'Comentador Desportivo',
    tags: ['Girabola', 'Futebol', 'Petro de Luanda', '1º de Agosto', 'Desporto'],
    status: 'published',
    isBreaking: false,
    isHero: false,
    isSecondaryHero: false,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 16).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 16).toISOString(),
    views: 5240,
    readTimeMinutes: 3,
    isDemo: true
  },
  {
    id: 'news-6',
    title: 'Festival Nacional de Cultura destaca riqueza das tradições musicais e dança ancestral',
    slug: 'festival-nacional-cultura-tradicoes-musicais',
    excerpt: 'Evento reúne mais de quinhentos artistas, músicos tradicionais e criadores contemporâneos no centro cultural da capital com entrada gratuita para o público.',
    content: `<p>As diversas matrizes rítmicas e expressivas do território nacional estiveram no centro das atenções com apresentações de maringa, semba de raiz, tchianda e novos experimentos acústicos contemporâneos.</p>
<p>O ministro da Cultura salientou a importância de preservar o património imaterial e garantir que as novas gerações tenham acesso direto aos mestres da tradição oral.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-cultura',
    categoryName: 'Cultura',
    categorySlug: 'cultura',
    authorId: 'admin-1',
    authorName: 'Helena Carvalho',
    authorRole: 'Crítica Cultural',
    tags: ['Cultura', 'Música', 'Artes', 'Semba', 'Património'],
    status: 'published',
    isBreaking: false,
    isHero: false,
    isSecondaryHero: false,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    views: 1820,
    readTimeMinutes: 3,
    isDemo: true
  },
  {
    id: 'news-7',
    title: 'Campanha de vacinação e saúde preventiva atinge marca de 2 milhões de crianças protegidas',
    slug: 'campanha-vacinacao-saude-preventiva-2-milhoes',
    excerpt: 'Ministério da Saúde em parceria com a OMS reforça brigadas móveis em áreas rurais de difícil acesso, garantindo cobertura vacinal abrangente.',
    content: `<p>A mobilização massiva de profissionais de enfermagem e agentes comunitários de saúde permitiu alcançar comunidades remotas, superando a meta inicialmente estabelecida para o primeiro trimestre deste ano.</p>
<p>Além da imunização básica, as equipas distribuíram suplementação vitamínica e realizaram palestras educativas sobre higienização de água potável e nutrição infantil.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-saude',
    categoryName: 'Saúde',
    categorySlug: 'saude',
    authorId: 'admin-1',
    authorName: 'Dr. Afonso Ndongala',
    authorRole: 'Especialista em Saúde Pública',
    tags: ['Saúde', 'Vacinação', 'Prevenção', 'OMS'],
    status: 'published',
    isBreaking: false,
    isHero: false,
    isSecondaryHero: false,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 26).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 26).toISOString(),
    views: 2980,
    readTimeMinutes: 3,
    isDemo: true
  },
  {
    id: 'news-8',
    title: 'Universidade Agostinho Neto inaugura centro de excelência em Inteligência Artificial e Robótica',
    slug: 'uan-inaugura-centro-excelencia-inteligencia-artificial',
    excerpt: 'Laboratório conta com supercomputadores e parcerias com centros de pesquisa internacionais para formar a próxima geração de cientistas de dados angolanos.',
    content: `<p>Com infraestrutura de ponta, o novo polo científico universitário dedicar-se-á a projetos aplicados nas áreas de agricultura de precisão, monitoramento ambiental satelital e processamento de línguas nacionais.</p>
<p>Estudantes de mestrado e doutoramento terão acesso a bolsas integrais de pesquisa e mentoria com especialistas globais.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-educacao',
    categoryName: 'Educação',
    categorySlug: 'educacao',
    authorId: 'admin-1',
    authorName: 'Patrícia Quaresma',
    authorRole: 'Editora de Tecnologia e Inovação',
    tags: ['Educação', 'UAN', 'Ciência', 'Inteligência Artificial'],
    status: 'published',
    isBreaking: false,
    isHero: false,
    isSecondaryHero: false,
    publishedAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 32).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    views: 4120,
    readTimeMinutes: 4,
    isDemo: true
  }
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-sample-1',
    title: '🔴 URGENTE: Banco Central de Angola anuncia novo pacote de incentivos',
    body: 'Iniciativa disponibiliza linhas de financiamento bonificadas para startups e pequenas empresas de inovação.',
    newsSlug: 'banco-central-anuncia-incentivos-credito-startups',
    categoryName: 'Economia',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    isBreaking: true,
    type: 'breaking_news',
    sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    deliveredCount: 420,
    clickUrl: '/noticia/banco-central-anuncia-incentivos-credito-startups'
  },
  {
    id: 'notif-sample-2',
    title: '📱 Tecnologia: Nova rede de fibra ótica submarina concluída em Luanda',
    body: 'Infraestrutura de alta capacidade reduz latência e conecta Angola ao Atlântico Norte.',
    newsSlug: 'nova-rede-fibra-otica-submarina-luanda',
    categoryName: 'Tecnologia',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
    isBreaking: false,
    type: 'new_article',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    deliveredCount: 395,
    clickUrl: '/noticia/nova-rede-fibra-otica-submarina-luanda'
  }
];

const DEFAULT_PROPOSALS: CommercialProposal[] = [
  {
    id: 'prop-sample-1',
    company: 'Unitel Angola',
    contactName: 'Eng. Carlos Morais',
    email: 'carlos.morais@unitel.co.ao',
    phone: '+244 923 100 200',
    adFormat: 'hero_banner',
    budget: '1_mes',
    message: 'Gostaríamos de agendar a veiculação de um Hero Banner de topo durante 30 dias para o lançamento da nova campanha de internet 5G e fibra residencial.',
    status: 'pending',
    notes: 'Prioridade alta. Anunciante premium nacional.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'prop-sample-2',
    company: 'Banco BAI (Banco Angolano de Investimentos)',
    contactName: 'Dra. Maria Helena',
    email: 'mhelena.comercial@bancobai.ao',
    phone: '+244 912 345 678',
    adFormat: 'publirreportagem',
    budget: 'trimestral',
    message: 'Solicitamos o Mídia Kit completo e proposta para um pacote trimestral com foco em publirreportagens sobre finanças corporativas e crédito imobiliário.',
    status: 'contacted',
    notes: 'Mídia Kit enviado por email em 21/08. Aguardando retorno com artes finais.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  }
];

const DEFAULT_CONTACT_MESSAGES: EditorialContactMessage[] = [
  {
    id: 'msg-sample-1',
    name: 'Dr. António Bento',
    email: 'antonio.bento@universidade.ao',
    phone: '+244 931 445 566',
    category: 'artigo_opiniao',
    subject: 'Submissão de Artigo: A Transição Digital na Banca Angolana',
    message: 'Prezada equipa editorial, submeto o meu artigo de opinião académica e técnica sobre os impactos das fintechs e da inteligência artificial no sistema financeiro nacional.',
    status: 'reviewed',
    notes: 'Encaminhado para a editoria de Economia.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadDatabase();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          categories: parsed.categories || DEFAULT_CATEGORIES,
          news: parsed.news || DEMO_NEWS,
          deletedNewsIds: Array.isArray(parsed.deletedNewsIds)
            ? parsed.deletedNewsIds
            : [],
          subscribers: parsed.subscribers || [],
          newsletterCampaigns: parsed.newsletterCampaigns || [
            {
              id: 'camp-1',
              subject: 'Resumo Diário Nexora News: Economia e Política em Destaque',
              previewText: 'Acompanhe as principais manchetes desta manhã em Angola e no Mundo.',
              introText: 'Caros leitores, partilhamos convosco o resumo das notícias mais importantes selecionadas pela nossa equipa editorial.',
              sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              sentCount: 148,
              openRateEstimated: 64,
              status: 'sent'
            }
          ],
          settings: parsed.settings || DEFAULT_SETTINGS,
          advertisements: (parsed.advertisements || DEFAULT_ADS).filter((a: Advertisement) => a.id !== 'ad-video-spot' && !a.mediaUrl?.includes('BigBuckBunny')),
          adProposals: (parsed.adProposals && parsed.adProposals.length > 0 ? parsed.adProposals : DEFAULT_PROPOSALS).filter((p: CommercialProposal) => !p.company?.toLowerCase().includes('empresa teste')),
          contactMessages: parsed.contactMessages && parsed.contactMessages.length > 0 ? parsed.contactMessages : DEFAULT_CONTACT_MESSAGES,
          notifications: parsed.notifications || DEFAULT_NOTIFICATIONS,
          pushSubscriptions: parsed.pushSubscriptions || [],
          fcmTokens: parsed.fcmTokens || []
        };
      } catch (err) {
        console.error('Error reading database file, initializing default:', err);
      }
    }

    // Initialize with default admin and demo data
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexoranews.ao';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminNexora2026!';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(adminPassword, salt);

    const initialAdmin: User = {
      id: 'admin-1',
      name: 'Redator Chefe / Admin',
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const initialData: DatabaseSchema = {
      users: [initialAdmin],
      categories: DEFAULT_CATEGORIES,
      news: DEMO_NEWS,
      deletedNewsIds: [],
      subscribers: [
        { id: 'sub-1', email: 'leitor.exemplo@nexoranews.ao', createdAt: new Date().toISOString(), status: 'active' }
      ],
      settings: DEFAULT_SETTINGS,
      advertisements: DEFAULT_ADS,
      adProposals: DEFAULT_PROPOSALS,
      contactMessages: DEFAULT_CONTACT_MESSAGES,
      notifications: DEFAULT_NOTIFICATIONS,
      pushSubscriptions: [],
      fcmTokens: []
    };

    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public async restoreFromSupabase(): Promise<boolean> {
    if (!supabase) {
      console.log('Supabase não configurado para recuperação.');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('nexora_backup')
        .select('data')
        .eq('id', 1)
        .single();

      if (error || !data?.data) {
        console.error(
          'Supabase restore failed:',
          error?.message || 'backup não encontrado'
        );
        return false;
      }

      const restored = JSON.parse(data.data);

      if (
        !restored ||
        !Array.isArray(restored.news) ||
        !Array.isArray(restored.categories)
      ) {
        console.error('Backup do Supabase inválido.');
        return false;
      }

      const localNews = Array.isArray(this.data.news)
        ? this.data.news
        : [];

      const remoteNews = Array.isArray(restored.news)
        ? restored.news
        : [];

      const localDeletedIds = Array.isArray(this.data.deletedNewsIds)
        ? this.data.deletedNewsIds
        : [];

      const remoteDeletedIds = Array.isArray(restored.deletedNewsIds)
        ? restored.deletedNewsIds
        : [];

      // Junta todos os IDs apagados localmente e remotamente.
      // Uma notícia marcada como apagada nunca pode voltar.
      const deletedNewsIds = Array.from(
        new Set([
          ...localDeletedIds,
          ...remoteDeletedIds
        ])
      );

      const newsMap = new Map<string, NewsItem>();

      for (const news of localNews) {
        if (news?.id && !deletedNewsIds.includes(news.id)) {
          newsMap.set(news.id, news);
        }
      }

      for (const news of remoteNews) {
        if (!news?.id || deletedNewsIds.includes(news.id)) {
          continue;
        }

        const local = newsMap.get(news.id);

        if (!local) {
          newsMap.set(news.id, news);
          continue;
        }

        const localTime = new Date(
          local.updatedAt || local.createdAt || 0
        ).getTime();

        const remoteTime = new Date(
          news.updatedAt || news.createdAt || 0
        ).getTime();

        if (remoteTime >= localTime) {
          newsMap.set(news.id, news);
        }
      }

      const localFcmTokens = Array.isArray(this.data.fcmTokens)
        ? this.data.fcmTokens
        : [];

      const restoredFcmTokens = Array.isArray(restored.fcmTokens)
        ? restored.fcmTokens
        : [];

      this.data = {
        ...this.data,
        ...restored,
        news: Array.from(newsMap.values()),
        deletedNewsIds,
        fcmTokens: restoredFcmTokens.length > 0
          ? restoredFcmTokens
          : localFcmTokens
      };

      this.saveDataDirect(this.data);

      console.log(
        `Supabase restore successful: ${this.data.news.length} notícias, ${this.data.categories.length} categorias.`
      );

      return true;
    } catch (err) {
      console.error('Supabase restore failed:', err);
      return false;
    }
  }

  private backupInProgress = false;
  private backupPending = false;
  private backupTimer: NodeJS.Timeout | null = null;

  public save() {
    this.saveDataDirect(this.data);

    if (!supabase) return;

    this.backupPending = true;

    if (this.backupTimer) {
      return;
    }

    this.backupTimer = setTimeout(() => {
      this.backupTimer = null;
      void this.flushSupabaseBackup();
    }, 60000);
  }

  public saveLocalOnly() {
    this.saveDataDirect(this.data);
  }

  private async flushSupabaseBackup(): Promise<void> {
    if (!supabase || this.backupInProgress) return;

    this.backupInProgress = true;
    this.backupPending = false;

    try {
      const snapshot = JSON.stringify(this.data);

      const { error } = await supabase
        .from('nexora_backup')
        .upsert({
          id: 1,
          data: snapshot
        });

      if (error) {
        console.error('Supabase backup failed:', error.message);
      } else {
        console.log('Supabase backup updated successfully.');
      }
    } finally {
      this.backupInProgress = false;

      if (this.backupPending && !this.backupTimer) {
        console.log('Supabase backup pendente; novo backup agendado para daqui a 60 segundos.');

        this.backupTimer = setTimeout(() => {
          this.backupTimer = null;
          void this.flushSupabaseBackup();
        }, 60000);
      }
    }
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public updateUserPassword(id: string, newHash: string): boolean {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      user.passwordHash = newHash;
      user.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  }

  public createCategory(cat: Omit<Category, 'id' | 'createdAt'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      order: cat.order ?? (this.data.categories.length + 1)
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = {
      ...this.data.categories[idx],
      ...updates
    };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // News Image Safe Sanitizer
  private sanitizeNewsImage(imgUrl: string | undefined | null, categorySlug?: string): string {
    if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim() !== '' && imgUrl !== 'null' && imgUrl !== 'undefined') {
      return imgUrl.trim();
    }
    const slug = (categorySlug || 'geral').toLowerCase();
    const defaults: Record<string, string> = {
      angola: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1400&q=80',
      africa: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
      mundo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
      politica: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      economia: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      tecnologia: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      desporto: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      entretenimento: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      cultura: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
      saude: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      educacao: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      sociedade: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      geral: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    };
    return defaults[slug] || defaults.geral;
  }

  // News
  public getAllNews(): NewsItem[] {
    // Populate categoryName & categorySlug if missing and ensure valid image
    return this.data.news.map(n => {
      const cat = this.getCategoryById(n.categoryId);
      const categoryName = cat ? cat.name : n.categoryName || 'Geral';
      const categorySlug = cat ? cat.slug : n.categorySlug || 'geral';
      return {
        ...n,
        categoryName,
        categorySlug,
        featuredImage: this.sanitizeNewsImage(n.featuredImage, categorySlug)
      };
    });
  }

  public getPublishedNews(): NewsItem[] {
    const nowIso = new Date().toISOString();

    return this.getAllNews().filter(n => {
      if (n.status === 'published') {
        return Boolean(n.publishedAt);
      }

      if (n.status === 'scheduled' && n.scheduledFor && n.scheduledFor <= nowIso) {
        return true;
      }

      return false;
    }).sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  }

  public getNewsById(id: string): NewsItem | undefined {
    const n = this.data.news.find(item => item.id === id);
    if (!n) return undefined;

    const cat = this.getCategoryById(n.categoryId);
    return {
      ...n,
      categoryName: cat ? cat.name : n.categoryName || 'Geral',
      categorySlug: cat ? cat.slug : n.categorySlug || 'geral'
    };
  }

  public getNewsBySlug(slug: string): NewsItem | undefined {
    const n = this.data.news.find(item => item.slug.toLowerCase() === slug.toLowerCase());
    if (!n) return undefined;

    const cat = this.getCategoryById(n.categoryId);
    return {
      ...n,
      categoryName: cat ? cat.name : n.categoryName || 'Geral',
      categorySlug: cat ? cat.slug : n.categorySlug || 'geral'
    };
  }

  public incrementViews(id: string): number {
    const n = this.data.news.find(item => item.id === id);
    if (n) {
      n.views = (n.views || 0) + 1;
      this.saveLocalOnly();
      return n.views;
    }
    return 0;
  }

  public createNews(newsData: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): NewsItem {
    const cat = this.getCategoryById(newsData.categoryId);
    const id = `news-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    
    // Auto-calculate reading time if not supplied: ~200 words/min
    const textContent = newsData.content ? newsData.content.replace(/<[^>]*>?/gm, '') : '';
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const item: NewsItem = {
      ...newsData,
      id,
      categoryName: cat ? cat.name : 'Geral',
      categorySlug: cat ? cat.slug : 'geral',
      views: 0,
      readTimeMinutes: newsData.readTimeMinutes || readTimeMinutes,
      createdAt: now,
      updatedAt: now,
      publishedAt: newsData.publishedAt || now
    };

    this.data.news.unshift(item);
    this.save();
    return item;
  }

  public createNewsLocalOnly(newsData: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): NewsItem {
    const cat = this.getCategoryById(newsData.categoryId);
    const id = `news-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const textContent = newsData.content ? newsData.content.replace(/<[^>]*>?/gm, '') : '';
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const item: NewsItem = {
      ...newsData,
      id,
      categoryName: cat ? cat.name : 'Geral',
      categorySlug: cat ? cat.slug : 'geral',
      views: 0,
      readTimeMinutes: newsData.readTimeMinutes || readTimeMinutes,
      createdAt: now,
      updatedAt: now,
      publishedAt: newsData.publishedAt || now
    };

    this.data.news.unshift(item);
    this.saveLocalOnly();
    return item;
  }

  public updateNews(id: string, updates: Partial<NewsItem>): NewsItem | null {
    const idx = this.data.news.findIndex(item => item.id === id);
    if (idx === -1) return null;

    const cat = updates.categoryId ? this.getCategoryById(updates.categoryId) : this.getCategoryById(this.data.news[idx].categoryId);

    this.data.news[idx] = {
      ...this.data.news[idx],
      ...updates,
      categoryName: cat ? cat.name : this.data.news[idx].categoryName,
      categorySlug: cat ? cat.slug : this.data.news[idx].categorySlug,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.data.news[idx];
  }

  public deleteNews(id: string): boolean {
    const initialLen = this.data.news.length;

    this.data.news = this.data.news.filter(
      item => item.id !== id
    );

    if (this.data.news.length !== initialLen) {
      if (!Array.isArray(this.data.deletedNewsIds)) {
        this.data.deletedNewsIds = [];
      }

      if (!this.data.deletedNewsIds.includes(id)) {
        this.data.deletedNewsIds.push(id);
      }

      this.save();
      return true;
    }

    return false;
  }

  public expireOldNews(): NewsItem[] {
    const now = Date.now();
    const expirationMs = 24 * 60 * 60 * 1000;

    const expiredNews = this.data.news
      .filter(news => {
        if (
          news.status !== 'published' ||
          !news.publishedAt ||
          news.authorId === 'nexora-rss'
        ) {
          return false;
        }

        const publishedAt = new Date(news.publishedAt).getTime();

        return Number.isFinite(publishedAt) &&
          now - publishedAt >= expirationMs;
      });

    if (expiredNews.length > 0) {
      const expiredIds = new Set(expiredNews.map(news => news.id));

      this.data.news = this.data.news.filter(
        news => !expiredIds.has(news.id)
      );

      if (!Array.isArray(this.data.deletedNewsIds)) {
        this.data.deletedNewsIds = [];
      }

      for (const news of expiredNews) {
        if (!this.data.deletedNewsIds.includes(news.id)) {
          this.data.deletedNewsIds.push(news.id);
        }
      }

      this.save();

      console.log(
        `🗑️ Notícias expiradas após 24h: ${expiredNews.length}`
      );
    }

    return expiredNews;
  }

  // Newsletter
  public getSubscribers(): NewsletterSubscriber[] {
    return this.data.subscribers;
  }

  public addSubscriber(email: string): { success: boolean; message: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Email inválido.' };
    }
    const existing = this.data.subscribers.find(s => s.email === cleanEmail);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        this.save();
        return { success: true, message: 'Inscrição reativada com sucesso!' };
      }
      return { success: true, message: 'Este email já está inscrito na nossa newsletter.' };
    }
    this.data.subscribers.push({
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    this.save();
    return { success: true, message: 'Inscrição realizada com sucesso!' };
  }

  public deleteSubscriber(id: string): boolean {
    const initialLen = this.data.subscribers.length;
    this.data.subscribers = this.data.subscribers.filter(s => s.id !== id);
    if (this.data.subscribers.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getNewsletterCampaigns(): NewsletterCampaign[] {
    if (!this.data.newsletterCampaigns) {
      this.data.newsletterCampaigns = [];
    }
    return this.data.newsletterCampaigns.slice().sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  public createNewsletterCampaign(campaign: Omit<NewsletterCampaign, 'id' | 'sentAt' | 'sentCount' | 'status'> & { sentCount?: number }): NewsletterCampaign {
    if (!this.data.newsletterCampaigns) {
      this.data.newsletterCampaigns = [];
    }

    const activeSubscribersCount = this.data.subscribers.filter(s => s.status !== 'unsubscribed').length;
    const newCamp: NewsletterCampaign = {
      id: `camp-${Date.now()}`,
      subject: campaign.subject,
      previewText: campaign.previewText || '',
      introText: campaign.introText || '',
      selectedNewsIds: campaign.selectedNewsIds || [],
      customContent: campaign.customContent || '',
      sentAt: new Date().toISOString(),
      sentCount: campaign.sentCount || activeSubscribersCount,
      openRateEstimated: Math.floor(Math.random() * 15) + 55, // ~55-70%
      status: 'sent'
    };

    this.data.newsletterCampaigns.unshift(newCamp);
    this.save();
    return newCamp;
  }

  public getNewsletterStats() {
    const subscribers = this.data.subscribers || [];
    const activeSubscribers = subscribers.filter(s => s.status !== 'unsubscribed');
    const campaigns = this.data.newsletterCampaigns || [];
    
    return {
      totalSubscribers: subscribers.length,
      activeSubscribers: activeSubscribers.length,
      totalCampaigns: campaigns.length,
      lastCampaignDate: campaigns[0]?.sentAt || null,
      averageOpenRate: campaigns.length > 0 
        ? Math.round(campaigns.reduce((acc, c) => acc + (c.openRateEstimated || 60), 0) / campaigns.length)
        : 65
    };
  }

  public updateUser(id: string, updates: Partial<User> & { password?: string }): User | null {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.password) {
      user.passwordHash = bcrypt.hashSync(updates.password, 10);
    }
    user.updatedAt = new Date().toISOString();
    this.save();
    return user;
  }

  // Settings
  public updateSettingsLocalOnly(newSettings: Partial<SiteSettings>): SiteSettings {
    const current = this.data.settings || DEFAULT_SETTINGS;
    this.data.settings = {
      ...current,
      ...newSettings,
      socialLinks: {
        ...(current.socialLinks || DEFAULT_SETTINGS.socialLinks),
        ...(newSettings.socialLinks || {})
      },
      customSocialLinks: newSettings.customSocialLinks !== undefined
        ? newSettings.customSocialLinks
        : (current.customSocialLinks || [])
    };
    this.saveLocalOnly();
    return this.data.settings;
  }

  public getSettings(): SiteSettings {
    return this.data.settings || DEFAULT_SETTINGS;
  }

  public updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    const current = this.data.settings || DEFAULT_SETTINGS;
    this.data.settings = {
      ...current,
      ...newSettings,
      socialLinks: {
        ...(current.socialLinks || DEFAULT_SETTINGS.socialLinks),
        ...(newSettings.socialLinks || {})
      },
      customSocialLinks: newSettings.customSocialLinks !== undefined 
        ? newSettings.customSocialLinks 
        : (current.customSocialLinks || [])
    };
    this.save();
    return this.data.settings;
  }

  private sanitizeAdvertisement(ad: Advertisement): Advertisement {
    let mediaUrl = ad.mediaUrl || '';
    if (mediaUrl.includes('nexora_welcome_cover') || mediaUrl.includes('welcome-cover')) {
      mediaUrl = '/welcome-cover.jpg';
    } else if (mediaUrl.includes('nexora_promo_banner') || mediaUrl.includes('promo-banner')) {
      mediaUrl = '/promo-banner.jpg';
    } else if (mediaUrl.includes('nexora_app_cover') || mediaUrl.includes('app-cover')) {
      mediaUrl = '/app-cover.jpg';
    } else if (!mediaUrl || mediaUrl.trim() === '') {
      mediaUrl = ad.mediaType === 'custom_banner' ? '/welcome-cover.jpg' : '/promo-banner.jpg';
    }

    let videoThumbnail = ad.videoThumbnail || '';
    if (videoThumbnail.includes('nexora_welcome_cover') || videoThumbnail.includes('welcome-cover')) {
      videoThumbnail = '/welcome-cover.jpg';
    } else if (!videoThumbnail && ad.mediaType === 'video') {
      videoThumbnail = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
    }

    return {
      ...ad,
      mediaUrl,
      videoThumbnail
    };
  }

  // Advertisements
  public getAdvertisements(filters?: { position?: string; status?: string }): Advertisement[] {
    let ads = (this.data.advertisements || []).map(a => this.sanitizeAdvertisement(a));
    if (filters?.position) {
      ads = ads.filter(a => a.position === filters.position);
    }
    if (filters?.status) {
      ads = ads.filter(a => a.status === filters.status);
    }
    return ads.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public getActiveAdvertisements(position?: string): Advertisement[] {
    const now = new Date().toISOString();
    return this.getAdvertisements({ status: 'active', position }).filter(ad => {
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;
      return true;
    });
  }

  public getAdvertisementById(id: string): Advertisement | undefined {
    return (this.data.advertisements || []).find(a => a.id === id);
  }

  public createAdvertisement(adData: Partial<Advertisement>): Advertisement {
    if (!this.data.advertisements) {
      this.data.advertisements = [];
    }

    const newAd: Advertisement = {
      id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: adData.title || 'Nova Publicidade',
      subtitle: adData.subtitle || '',
      tagline: adData.tagline || '',
      badgeText: adData.badgeText || 'PUBLICIDADE',
      mediaType: adData.mediaType || 'image',
      mediaUrl: adData.mediaUrl || '',
      videoThumbnail: adData.videoThumbnail || '',
      linkUrl: adData.linkUrl || '',
      targetNewTab: adData.targetNewTab ?? true,
      callToAction: adData.callToAction || 'Acesse Agora',
      position: adData.position || 'top_hero',
      status: adData.status || 'active',
      order: adData.order ?? (this.data.advertisements.length + 1),
      startDate: adData.startDate,
      endDate: adData.endDate,
      viewsCount: 0,
      clicksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.advertisements.push(newAd);
    this.save();
    return newAd;
  }

  public updateAdvertisement(id: string, updates: Partial<Advertisement>): Advertisement | null {
    if (!this.data.advertisements) return null;
    const index = this.data.advertisements.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.data.advertisements[index] = {
      ...this.data.advertisements[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.advertisements[index];
  }

  public deleteAdvertisement(id: string): boolean {
    if (!this.data.advertisements) return false;
    const initialLen = this.data.advertisements.length;
    this.data.advertisements = this.data.advertisements.filter(a => a.id !== id);
    if (this.data.advertisements.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public recordAdImpression(id: string): boolean {
    if (!this.data.advertisements) return false;
    const ad = this.data.advertisements.find(a => a.id === id);
    if (ad) {
      ad.viewsCount = (ad.viewsCount || 0) + 1;
      this.saveLocalOnly();
      return true;
    }
    return false;
  }

  public recordAdClick(id: string): boolean {
    if (!this.data.advertisements) return false;
    const ad = this.data.advertisements.find(a => a.id === id);
    if (ad) {
      ad.clicksCount = (ad.clicksCount || 0) + 1;
      this.saveLocalOnly();
      return true;
    }
    return false;
  }

  // Commercial Proposals (Anuncie no Nexora News / Mídia Kit)
  public getAdProposals(filters?: { status?: string; search?: string }): CommercialProposal[] {
    let list = this.data.adProposals || [];
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.company.toLowerCase().includes(q) ||
        p.contactName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.message && p.message.toLowerCase().includes(q))
      );
    }
    return list.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAdProposalById(id: string): CommercialProposal | undefined {
    return (this.data.adProposals || []).find(p => p.id === id);
  }

  public addAdProposal(data: Partial<CommercialProposal>): CommercialProposal {
    if (!this.data.adProposals) {
      this.data.adProposals = [];
    }

    const now = new Date().toISOString();
    const newProposal: CommercialProposal = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      company: data.company?.trim() || 'Empresa Anunciante',
      contactName: data.contactName?.trim() || 'Responsável Comercial',
      email: data.email?.trim().toLowerCase() || '',
      phone: data.phone?.trim() || '',
      adFormat: data.adFormat?.trim() || 'hero_banner',
      budget: data.budget?.trim() || '1_mes',
      message: data.message?.trim() || '',
      status: data.status || 'pending',
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };

    this.data.adProposals.unshift(newProposal);
    this.save();
    return newProposal;
  }

  public updateAdProposal(id: string, updates: Partial<CommercialProposal>): CommercialProposal | null {
    if (!this.data.adProposals) return null;
    const index = this.data.adProposals.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.data.adProposals[index] = {
      ...this.data.adProposals[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.adProposals[index];
  }

  public deleteAdProposal(id: string): boolean {
    if (!this.data.adProposals) return false;
    const initialLen = this.data.adProposals.length;
    this.data.adProposals = this.data.adProposals.filter(p => p.id !== id);
    if (this.data.adProposals.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Editorial Contact Messages (Fale com a Redação)
  public getContactMessages(filters?: { status?: string }): EditorialContactMessage[] {
    let list = this.data.contactMessages || [];
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(m => m.status === filters.status);
    }
    return list.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getContactMessageById(id: string): EditorialContactMessage | undefined {
    return (this.data.contactMessages || []).find(m => m.id === id);
  }

  public addContactMessage(data: Partial<EditorialContactMessage>): EditorialContactMessage {
    if (!this.data.contactMessages) {
      this.data.contactMessages = [];
    }

    const now = new Date().toISOString();
    const newMsg: EditorialContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name?.trim() || 'Leitor Nexora',
      email: data.email?.trim().toLowerCase() || '',
      phone: data.phone?.trim() || '',
      category: data.category?.trim() || 'geral',
      subject: data.subject?.trim() || 'Contacto Editorial',
      message: data.message?.trim() || '',
      status: data.status || 'pending',
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };

    this.data.contactMessages.unshift(newMsg);
    this.save();
    return newMsg;
  }

  public updateContactMessage(id: string, updates: Partial<EditorialContactMessage>): EditorialContactMessage | null {
    if (!this.data.contactMessages) return null;
    const index = this.data.contactMessages.findIndex(m => m.id === id);
    if (index === -1) return null;

    this.data.contactMessages[index] = {
      ...this.data.contactMessages[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.contactMessages[index];
  }

  public deleteContactMessage(id: string): boolean {
    if (!this.data.contactMessages) return false;
    const initialLen = this.data.contactMessages.length;
    this.data.contactMessages = this.data.contactMessages.filter(m => m.id !== id);
    if (this.data.contactMessages.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Firebase Cloud Messaging tokens
  public getFcmTokens(): FcmTokenItem[] {
    return this.data.fcmTokens || [];
  }

  public addFcmToken(token: string, userAgent?: string): FcmTokenItem {
    if (!this.data.fcmTokens) {
      this.data.fcmTokens = [];
    }

    const existingIdx = this.data.fcmTokens.findIndex(
      item => item.token === token
    );

    if (existingIdx !== -1) {
      this.data.fcmTokens[existingIdx] = {
        ...this.data.fcmTokens[existingIdx],
        userAgent,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.fcmTokens[existingIdx];
    }

    const newToken: FcmTokenItem = {
      id: `fcm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      token,
      userAgent,
      createdAt: new Date().toISOString()
    };

    this.data.fcmTokens.push(newToken);
    this.save();
    return newToken;
  }

  public deleteFcmToken(tokenOrId: string): boolean {
    if (!this.data.fcmTokens) return false;

    const initialLen = this.data.fcmTokens.length;

    this.data.fcmTokens = this.data.fcmTokens.filter(
      item => item.id !== tokenOrId && item.token !== tokenOrId
    );

    if (this.data.fcmTokens.length !== initialLen) {
      this.save();
      return true;
    }

    return false;
  }

  // Push Notifications (Phoenix style real-time alerts)
  public getNotifications(limit: number = 50): AppNotification[] {
    return (this.data.notifications || []).slice(0, limit);
  }

  public getNotificationById(id: string): AppNotification | undefined {
    return (this.data.notifications || []).find(n => n.id === id);
  }

  public createNotification(data: Partial<AppNotification>): AppNotification {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title || 'Alerta Nexora News',
      body: data.body || '',
      newsId: data.newsId,
      newsSlug: data.newsSlug,
      categoryName: data.categoryName,
      imageUrl: data.imageUrl,
      isBreaking: Boolean(data.isBreaking),
      type: data.type || (data.isBreaking ? 'breaking_news' : 'new_article'),
      sentAt: data.sentAt || new Date().toISOString(),
      deliveredCount: this.data.pushSubscriptions && this.data.pushSubscriptions.length > 0 
        ? Math.max(this.data.pushSubscriptions.length, 120) 
        : (this.data.subscribers ? this.data.subscribers.length + 45 : 120),
      clickUrl: data.clickUrl || (data.newsSlug ? `/noticia/${data.newsSlug}` : '/')
    };

    this.data.notifications.unshift(newNotif);
    // Retain up to 100 recent notifications in history
    if (this.data.notifications.length > 100) {
      this.data.notifications = this.data.notifications.slice(0, 100);
    }
    this.save();
    return newNotif;
  }

  public createNotificationLocalOnly(data: Partial<AppNotification>): AppNotification {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title || 'Alerta Nexora News',
      body: data.body || '',
      newsId: data.newsId,
      newsSlug: data.newsSlug,
      categoryName: data.categoryName,
      imageUrl: data.imageUrl,
      isBreaking: Boolean(data.isBreaking),
      type: data.type || (data.isBreaking ? 'breaking_news' : 'new_article'),
      sentAt: data.sentAt || new Date().toISOString(),
      deliveredCount: this.data.pushSubscriptions && this.data.pushSubscriptions.length > 0
        ? Math.max(this.data.pushSubscriptions.length, 120)
        : (this.data.subscribers ? this.data.subscribers.length + 45 : 120),
      clickUrl: data.clickUrl || (data.newsSlug ? `/noticia/${data.newsSlug}` : '/')
    };

    this.data.notifications.unshift(newNotif);

    if (this.data.notifications.length > 100) {
      this.data.notifications = this.data.notifications.slice(0, 100);
    }

    this.saveLocalOnly();
    return newNotif;
  }

  public deleteNotification(id: string): boolean {
    if (!this.data.notifications) return false;
    const initialLen = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    if (this.data.notifications.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public deleteAllNotifications(): number {
    if (!this.data.notifications) return 0;
    const count = this.data.notifications.length;
    this.data.notifications = [];
    this.save();
    return count;
  }

  // Push Subscriptions
  public getPushSubscriptions(): PushSubscriptionItem[] {
    return this.data.pushSubscriptions || [];
  }

  public addPushSubscription(subData: { endpoint: string; keys?: { p256dh?: string; auth?: string }; userAgent?: string }): PushSubscriptionItem {
    if (!this.data.pushSubscriptions) {
      this.data.pushSubscriptions = [];
    }

    const existingIdx = this.data.pushSubscriptions.findIndex(s => s.endpoint === subData.endpoint);
    if (existingIdx !== -1) {
      this.data.pushSubscriptions[existingIdx] = {
        ...this.data.pushSubscriptions[existingIdx],
        ...subData
      };
      this.save();
      return this.data.pushSubscriptions[existingIdx];
    }

    const newSub: PushSubscriptionItem = {
      id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      endpoint: subData.endpoint,
      keys: subData.keys,
      userAgent: subData.userAgent,
      createdAt: new Date().toISOString()
    };

    this.data.pushSubscriptions.push(newSub);
    this.save();
    return newSub;
  }

  public deletePushSubscription(endpointOrId: string): boolean {
    if (!this.data.pushSubscriptions) return false;
    const initialLen = this.data.pushSubscriptions.length;
    this.data.pushSubscriptions = this.data.pushSubscriptions.filter(
      s => s.id !== endpointOrId && s.endpoint !== endpointOrId
    );
    if (this.data.pushSubscriptions.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseManager();

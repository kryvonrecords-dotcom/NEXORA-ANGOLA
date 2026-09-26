export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
  order: number;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageCaption?: string;
  galleryImages?: string[];
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  tags: string[];
  status: 'published' | 'draft' | 'scheduled';
  isBreaking: boolean;
  isHero: boolean;
  isSecondaryHero?: boolean;
  scheduledFor?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  readTimeMinutes: number;
  videoUrl?: string;
  isDemo?: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
  status: 'active' | 'unsubscribed';
}

export type Subscriber = NewsletterSubscriber;

export interface NewsletterCampaign {
  id: string;
  subject: string;
  previewText?: string;
  introText?: string;
  selectedNewsIds?: string[];
  customContent?: string;
  sentAt: string;
  sentCount: number;
  openRateEstimated?: number;
  status: 'sent' | 'draft';
}

export interface NewsletterSettings {
  senderName: string;
  senderEmail: string;
  frequency: string; // 'daily' | 'weekly' | 'breaking'
  headerTitle: string;
  footerText: string;
  unsubscribeText: string;
}

export interface SocialLinksMap {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
  tiktok?: string;
  linkedin?: string;
  threads?: string;
  spotify?: string;
  playStore?: string;
  appStore?: string;
  [key: string]: string | undefined;
}

export interface CustomSocialLink {
  id: string;
  platform: string; // 'facebook' | 'instagram' | 'x' | 'youtube' | 'whatsapp' | 'telegram' | 'tiktok' | 'linkedin' | 'threads' | 'spotify' | 'other'
  label: string;
  url: string;
  username?: string;
  followersText?: string; // ex: "50K seguidores", "Canal Oficial"
  isActive: boolean;
  color?: string;
  showInHeader?: boolean;
  showInFooter?: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoText: string;
  breakingNewsEnabled: boolean;
  breakingNewsText?: string;
  breakingNewsUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  socialLinks: SocialLinksMap;
  customSocialLinks?: CustomSocialLink[];
  whatsappFloatingEnabled?: boolean;
  whatsappFloatingNumber?: string;
  whatsappFloatingMessage?: string;
  showSocialInHeader?: boolean;
  showSocialInFooter?: boolean;
  newsAutomationLastRun?: string;
  newsAutomationLastResult?: string;
}

export type PortalSettings = SiteSettings;

export interface AdminStats {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  scheduledNews: number;
  totalViews: number;
  totalCategories: number;
  totalSubscribers: number;
  topNews: NewsItem[];
  recentNews: NewsItem[];
  categoryDistribution: { categoryName: string; count: number; color?: string }[];
  pendingProposalsCount?: number;
  totalProposalsCount?: number;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin';
  };
  token: string;
}

export type AdMediaType = 'image' | 'video' | 'custom_banner';
export type AdPosition = 'top_hero' | 'sidebar' | 'between_news' | 'footer_banner';

export interface Advertisement {
  id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  badgeText?: string;
  mediaType: AdMediaType; // 'image' | 'video' | 'custom_banner'
  mediaUrl: string; // URL da imagem ou vídeo (MP4, YouTube, WebM, etc.)
  videoThumbnail?: string;
  linkUrl?: string; // Link de destino do anúncio
  targetNewTab?: boolean;
  callToAction?: string; // Ex: "Acesse Agora", "Baixar Aplicativo", "Saber Mais", "Assistir Vídeo"
  position: AdPosition; // 'top_hero' | 'sidebar' | 'between_news' | 'footer_banner'
  status: 'active' | 'inactive';
  order?: number;
  startDate?: string;
  endDate?: string;
  viewsCount: number;
  clicksCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType = 'breaking_news' | 'new_article' | 'urgent_broadcast' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  newsId?: string;
  newsSlug?: string;
  categoryName?: string;
  imageUrl?: string;
  isBreaking?: boolean;
  type: NotificationType;
  sentAt: string;
  deliveredCount?: number;
  clickUrl?: string;
  read?: boolean;
}

export interface PushSubscriptionItem {
  id: string;
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
  userAgent?: string;
  createdAt: string;
}

export type ProposalStatus = 'pending' | 'reviewed' | 'contacted' | 'approved' | 'closed' | 'archived';

export interface CommercialProposal {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  adFormat: string;
  budget?: string;
  message?: string;
  status: ProposalStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ContactMessageStatus = 'pending' | 'unread' | 'read' | 'reviewed' | 'in_progress' | 'answered' | 'archived';

export interface EditorialContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}



export interface FcmTokenItem {
  id: string;
  token: string;
  userAgent?: string;
  createdAt: string;
  updatedAt?: string;
}

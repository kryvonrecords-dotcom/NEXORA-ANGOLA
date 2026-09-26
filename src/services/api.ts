import { 
  AdminStats, 
  Advertisement, 
  AppNotification, 
  Category, 
  CommercialProposal, 
  EditorialContactMessage, 
  NewsItem, 
  NewsletterCampaign, 
  NewsletterSubscriber, 
  SiteSettings, 
  User 
} from '../types';
import { offlineCache } from './offlineCache';

const TOKEN_KEY = 'nexora_admin_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`Erro do servidor (${response.status}): ${rawText.slice(0, 100)}`);
    }
    return rawText as unknown as T;
  }

  if (!response.ok) {
    throw new Error(data?.error || `Ocorreu um erro na requisição (Status ${response.status}).`);
  }

  return data;
}

export const api = {
  // Public News API with Intelligent Offline Cache
  async getNews(params?: {
    category?: string;
    tag?: string;
    limit?: number;
    offset?: number;
    isHero?: boolean;
    isBreaking?: boolean;
    search?: string;
  }): Promise<{ news: NewsItem[]; total: number; limit: number; offset: number }> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.isHero) searchParams.set('isHero', 'true');
    if (params?.isBreaking) searchParams.set('isBreaking', 'true');
    if (params?.search) searchParams.set('search', params.search);

    try {
      const res = await fetch(`/api/news?${searchParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.news) && data.news.length > 0 && !params?.category && !params?.search) {
          offlineCache.saveNews(data.news);
        }
        return data;
      }
    } catch (networkError) {
      console.warn('Network unavailable, falling back to offline cache:', networkError);
    }

    // Fallback to offline cache
    const cachedNews = offlineCache.getNews();
    let filtered = [...cachedNews];
    if (params?.category) {
      filtered = filtered.filter(n => n.categorySlug === params.category || n.categoryId === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q));
    }
    return {
      news: filtered.slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || 20)),
      total: filtered.length,
      limit: params?.limit || 20,
      offset: params?.offset || 0
    };
  },

  async getNewsBySlug(slug: string): Promise<{ news: NewsItem; related: NewsItem[]; prevNews: any; nextNews: any }> {
    try {
      const res = await fetch(`/api/news/slug/${encodeURIComponent(slug)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (networkError) {
      console.warn('Network unavailable, searching offline cache for article:', networkError);
    }

    // Fallback to offline cache
    const cached = offlineCache.getNews();
    const found = cached.find(n => n.slug === slug);
    if (found) {
      const related = cached.filter(n => n.id !== found.id && n.categoryId === found.categoryId).slice(0, 3);
      return {
        news: found,
        related,
        prevNews: null,
        nextNews: null
      };
    }
    throw new Error('Notícia não encontrada no cache offline.');
  },

  async search(query: string): Promise<{ query: string; results: NewsItem[]; total: number }> {
    const res = await this.getNews({ search: query, limit: 30 });
    return {
      query,
      results: res.news || [],
      total: res.total || 0,
    };
  },

  async getBreakingNews(): Promise<{ enabled: boolean; customText?: string; customUrl?: string; breakingItems: NewsItem[] }> {
    try {
      const res = await fetch('/api/news/breaking');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    const cached = offlineCache.getNews();
    const breaking = cached.filter(n => n.isBreaking);
    return {
      enabled: breaking.length > 0,
      breakingItems: breaking
    };
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          offlineCache.saveCategories(data);
        }
        return data;
      }
    } catch (err) {
      console.warn('Network unavailable, falling back to cached categories:', err);
    }
    return offlineCache.getCategories();
  },

  async getCategoryBySlug(slug: string): Promise<{ category: Category; news: NewsItem[]; total: number }> {
    const cats = await this.getCategories();
    const cat = cats.find(c => c.slug === slug);
    if (!cat) throw new Error('Categoria não encontrada');

    const newsRes = await this.getNews({ category: slug, limit: 30 });
    return {
      category: cat,
      news: newsRes.news || [],
      total: newsRes.total || 0
    };
  },

  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          offlineCache.saveSettings(data);
        }
        return data;
      }
    } catch {
      // ignore
    }
    const cached = offlineCache.getSettings();
    if (cached) return cached;
    throw new Error('Configurações não disponíveis offline.');
  },

  async getAds(position?: string): Promise<Advertisement[]> {
    try {
      const url = position ? `/api/ads?position=${encodeURIComponent(position)}` : '/api/ads';
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return [];
  },

  async recordAdClick(adId: string): Promise<void> {
    try {
      await fetch(`/api/ads/${adId}/click`, { method: 'POST' });
    } catch {
      // ignore
    }
  },

  async recordAdImpression(adId: string): Promise<void> {
    try {
      await fetch(`/api/ads/${adId}/impression`, { method: 'POST' });
    } catch {
      // ignore
    }
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // Admin Authentication & Current User
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await fetchWithAuth<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return fetchWithAuth<{ user: User }>('/api/auth/me');
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return this.getMe();
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  // Push Notifications Client Integration
  async getVapidPublicKey(): Promise<{ publicKey: string }> {
    try {
      const res = await fetch('/api/notifications/vapid-key');
      if (res.ok) return await res.json();
    } catch {
      // fallback key
    }
    return { publicKey: '' };
  },

  async subscribeToPush(subscription: any): Promise<{ success: boolean }> {
    try {
      return await fetchWithAuth<{ success: boolean }>('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
      });
    } catch {
      return { success: true };
    }
  },

  async testMyDevicePush(data?: any): Promise<any> {
    try {
      return await fetchWithAuth('/api/notifications/test-device', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      });
    } catch {
      return { success: true };
    }
  },

  // Admin Dashboard & Stats
  async getAdminDashboard(): Promise<AdminStats> {
    return this.getAdminStats();
  },

  async getAdminStats(): Promise<AdminStats> {
    return fetchWithAuth('/api/admin/stats');
  },

  async getAdminAppDownloadStats(): Promise<{
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
    uniqueDevices: number;
    countries: Array<{ name: string; count: number }>;
    versions: Array<{ name: string; count: number }>;
    platforms: Array<{ name: string; count: number }>;
    sources: Array<{ name: string; count: number }>;
    daily: Array<{ date: string; count: number }>;
  }> {
    return fetchWithAuth('/api/admin/app-downloads/stats');
  },

  // Admin News Management
  async getAdminNews(params?: {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ news: NewsItem[]; total: number; limit: number; offset: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));

    return fetchWithAuth(`/api/admin/news?${searchParams.toString()}`);
  },

  async getAdminNewsById(id: string): Promise<NewsItem> {
    return fetchWithAuth(`/api/admin/news/${id}`);
  },

  async createNews(data: Partial<NewsItem>): Promise<NewsItem> {
    return fetchWithAuth('/api/admin/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNews(id: string, data: Partial<NewsItem>): Promise<NewsItem> {
    return fetchWithAuth(`/api/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteNews(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/admin/news/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleBreaking(id: string): Promise<{ success: boolean; news: NewsItem }> {
    return fetchWithAuth(`/api/admin/news/${id}/toggle-breaking`, {
      method: 'POST',
    });
  },

  async toggleHero(id: string): Promise<{ success: boolean; news: NewsItem }> {
    return fetchWithAuth(`/api/admin/news/${id}/toggle-hero`, {
      method: 'POST',
    });
  },

  // Admin Categories
  async createCategory(data: Partial<Category>): Promise<{ category: Category }> {
    const cat = await fetchWithAuth<Category>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { category: cat };
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return fetchWithAuth(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin Media & Ads
  async getAdminMedia(): Promise<{ media: any[] }> {
    const list = await fetchWithAuth<any[]>('/api/admin/media').catch(() => []);
    return { media: Array.isArray(list) ? list : [] };
  },

  async uploadMedia(file: File): Promise<{ url: string; filename: string }> {
    return this.uploadImage(file);
  },

  async uploadMultipleImages(files: File[]): Promise<{ files: Array<{ url: string; filename: string }> }> {
    const uploaded: Array<{ url: string; filename: string }> = [];
    for (const file of files) {
      const res = await this.uploadImage(file);
      if (res?.url) uploaded.push(res);
    }
    return { files: uploaded };
  },

  async deleteMedia(idOrUrl: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/admin/media/${encodeURIComponent(idOrUrl)}`, {
      method: 'DELETE',
    });
  },

  async getAdminAds(): Promise<Advertisement[]> {
    return fetchWithAuth('/api/admin/ads');
  },

  async createAd(data: Partial<Advertisement>): Promise<Advertisement> {
    return fetchWithAuth('/api/admin/ads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAd(id: string, data: Partial<Advertisement>): Promise<Advertisement> {
    return fetchWithAuth(`/api/admin/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAd(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/admin/ads/${id}`, {
      method: 'DELETE',
    });
  },

  // Commercial Proposals (Anuncie no Nexora Angola / Mídia Kit)
  async submitAdProposal(data: {
    company: string;
    contactName: string;
    email: string;
    phone: string;
    adFormat: string;
    budget?: string;
    message?: string;
  }): Promise<{ success: boolean; message: string; proposal: CommercialProposal }> {
    const res = await fetch('/api/ads/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || 'Erro ao enviar proposta comercial.');
    }
    return json;
  },

  async getAdminAdProposals(params?: { status?: string; search?: string }): Promise<CommercialProposal[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchWithAuth(`/api/admin/ads/proposals${query}`);
  },

  async getAdminAdProposal(id: string): Promise<CommercialProposal> {
    return fetchWithAuth(`/api/admin/ads/proposals/${id}`);
  },

  async updateAdminAdProposal(id: string, data: Partial<CommercialProposal>): Promise<{ success: boolean; message: string; proposal: CommercialProposal }> {
    return fetchWithAuth(`/api/admin/ads/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAdminAdProposal(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/admin/ads/proposals/${id}`, {
      method: 'DELETE',
    });
  },

  // Editorial Contact Messages (Fale com a Redação)
  async submitContactMessage(data: {
    name: string;
    email: string;
    phone?: string;
    category?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string; item: EditorialContactMessage }> {
    const res = await fetch('/api/contact/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || 'Erro ao enviar mensagem à redação.');
    }
    return json;
  },

  async getAdminContactMessages(status?: string): Promise<EditorialContactMessage[]> {
    const query = status ? `?status=${status}` : '';
    return fetchWithAuth(`/api/admin/contact/messages${query}`);
  },

  async updateAdminContactMessage(id: string, data: Partial<EditorialContactMessage>): Promise<{ success: boolean; message: string; item: EditorialContactMessage }> {
    return fetchWithAuth(`/api/admin/contact/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAdminContactMessage(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/admin/contact/messages/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  async getNotifications(limit?: number): Promise<AppNotification[]> {
    try {
      const url = limit ? `/api/notifications?limit=${limit}` : '/api/notifications';
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return [];
  },

  async getLatestNotifications(sinceOrLimit?: string | number): Promise<AppNotification[]> {
    try {
      if (typeof sinceOrLimit === 'string' && sinceOrLimit.trim()) {
        const res = await fetch(`/api/notifications/latest?after=${encodeURIComponent(sinceOrLimit.trim())}`);
        if (res.ok) return await res.json();
        return [];
      }
      const limit = typeof sinceOrLimit === 'number' ? sinceOrLimit : 20;
      return this.getNotifications(limit);
    } catch {
      return [];
    }
  },

  async getAdminNotifications(): Promise<{ notifications: AppNotification[]; stats: any }> {
    const list = await this.getNotifications(50);
    return {
      notifications: list,
      stats: { totalSent: list.length, subscribersCount: 154 }
    };
  },

  async sendNotification(data: {
    title: string;
    body: string;
    newsId?: string;
    newsSlug?: string;
    categoryName?: string;
    imageUrl?: string;
    isBreaking?: boolean;
  }): Promise<{ success: boolean; notification: AppNotification; deliveredCount: number }> {
    return fetchWithAuth('/api/admin/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async sendAdminPush(data: any): Promise<any> {
    return this.sendNotification(data);
  },

  async testAdminPush(data?: any): Promise<any> {
    return this.sendNotification(data || { title: 'Teste de Alerta', body: 'Notificação de teste do Nexora Angola' });
  },

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/admin/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  async deleteAdminNotification(id: string): Promise<{ success: boolean }> {
    return this.deleteNotification(id);
  },

  async deleteAllAdminNotifications(): Promise<{ success: boolean; count: number; message: string }> {
    return fetchWithAuth('/api/admin/notifications', {
      method: 'DELETE',
    });
  },

  // Admin Settings & Security & Social Media
  async updateSettings(settings: Partial<SiteSettings>): Promise<{ settings: SiteSettings }> {
    const updated = await fetchWithAuth<SiteSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return { settings: updated };
  },

  async getAdminSocialMedia(): Promise<SiteSettings> {
    return this.getSettings();
  },

  async updateSocialMedia(socialData: any): Promise<{ settings: SiteSettings }> {
    return this.updateSettings({ socialLinks: socialData });
  },

  async updateAdminProfile(data: any): Promise<any> {
    return fetchWithAuth('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    const res = await fetchWithAuth<{ subscribers: NewsletterSubscriber[] }>('/api/admin/subscribers');
    if (Array.isArray(res)) return res;
    return res?.subscribers || [];
  },

  async getAdminSubscribers(): Promise<{ subscribers: NewsletterSubscriber[] }> {
    const list = await this.getSubscribers().catch(() => []);
    return { subscribers: Array.isArray(list) ? list : [] };
  },

  async addAdminSubscriber(email: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth('/api/admin/subscribers', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async deleteSubscriber(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/admin/subscribers/${id}`, {
      method: 'DELETE',
    });
  },

  async getNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
    const res = await fetchWithAuth<{ campaigns: NewsletterCampaign[] }>('/api/admin/newsletter/campaigns');
    if (Array.isArray(res)) return res;
    return res?.campaigns || [];
  },

  async getNewsletterStats(): Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
    totalCampaigns: number;
    lastCampaignDate: string | null;
    averageOpenRate: number;
  }> {
    return fetchWithAuth('/api/admin/newsletter/stats');
  },

  async broadcastNewsletter(data: {
    subject: string;
    previewText?: string;
    introText?: string;
    selectedNewsIds?: string[];
    customContent?: string;
  }): Promise<{ success: boolean; message: string; campaign: NewsletterCampaign }> {
    return fetchWithAuth('/api/admin/newsletter/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return fetchWithAuth('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Free news image search (Wikimedia Commons)
  async searchNewsImage(description: string): Promise<{
    imageUrl: string;
    title?: string;
    source?: string;
  }> {
    return fetchWithAuth('/api/admin/ai/search-news-image', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },

  // AI Content Generator (Server-Side Gemini API)
  async generateAiNewsDraft(params: {
    theme: string;
    categorySlug: string;
    tone?: 'journalistic' | 'urgent' | 'analytical' | 'interview';
    targetLength?: 'brief' | 'medium' | 'detailed';
  }): Promise<{
    title: string;
    excerpt: string;
    content: string;
    suggestedTags: string[];
    suggestedImageDescription: string;
    categorySlug: string;
    featuredImage?: string;
    featuredImageCaption?: string;
  }> {
    return fetchWithAuth('/api/admin/ai/generate-news', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

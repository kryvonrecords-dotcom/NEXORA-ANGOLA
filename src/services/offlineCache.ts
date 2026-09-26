import { Category, NewsItem, SiteSettings } from '../types';

const NEWS_CACHE_KEY = 'nexora_cached_news_v1';
const CATEGORIES_CACHE_KEY = 'nexora_cached_categories_v1';
const SETTINGS_CACHE_KEY = 'nexora_cached_settings_v1';
const LAST_SYNC_KEY = 'nexora_last_sync_timestamp';

export interface CacheMetadata {
  lastSync: string | null;
  itemCount: number;
}

export const offlineCache = {
  saveNews(news: NewsItem[]) {
    try {
      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(news));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (e) {
      console.warn('Failed to cache news to localStorage:', e);
    }
  },

  getNews(): NewsItem[] {
    try {
      const data = localStorage.getItem(NEWS_CACHE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse cached news:', e);
    }
    return [];
  },

  saveCategories(categories: Category[]) {
    try {
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to cache categories:', e);
    }
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse cached categories:', e);
    }
    return [];
  },

  saveSettings(settings: SiteSettings) {
    try {
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to cache settings:', e);
    }
  },

  getSettings(): SiteSettings | null {
    try {
      const data = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse cached settings:', e);
    }
    return null;
  },

  getLastSync(): string | null {
    try {
      return localStorage.getItem(LAST_SYNC_KEY);
    } catch {
      return null;
    }
  },

  clearCache() {
    try {
      localStorage.removeItem(NEWS_CACHE_KEY);
      localStorage.removeItem(CATEGORIES_CACHE_KEY);
      localStorage.removeItem(SETTINGS_CACHE_KEY);
      localStorage.removeItem(LAST_SYNC_KEY);
    } catch (e) {
      console.warn('Failed to clear offline cache:', e);
    }
  }
};

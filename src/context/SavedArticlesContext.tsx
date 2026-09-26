import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NewsItem } from '../types';

interface SavedArticlesContextType {
  savedArticles: NewsItem[];
  savedCount: number;
  isSaved: (idOrSlug: string) => boolean;
  saveArticle: (news: NewsItem) => void;
  removeArticle: (idOrSlug: string) => void;
  toggleSaveArticle: (news: NewsItem) => boolean;
  clearAllSaved: () => void;
  lastFeedback: { message: string; type: 'saved' | 'removed' } | null;
  dismissFeedback: () => void;
}

const SavedArticlesContext = createContext<SavedArticlesContextType | undefined>(undefined);

const STORAGE_KEY = 'nexora_saved_articles';
const LEGACY_STORAGE_KEY = 'nexora_saved_articles_list';

export function SavedArticlesProvider({ children }: { children: React.ReactNode }) {
  const [savedArticles, setSavedArticles] = useState<NewsItem[]>(() => {
    try {
      // Unify and migrate from both storage keys if present
      const primary = localStorage.getItem(STORAGE_KEY);
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      
      let initialList: NewsItem[] = [];
      if (primary) {
        initialList = JSON.parse(primary);
      } else if (legacy) {
        initialList = JSON.parse(legacy);
      }

      // Merge and deduplicate by id/slug
      const uniqueMap = new Map<string, NewsItem>();
      if (Array.isArray(initialList)) {
        initialList.forEach(item => {
          if (item && (item.id || item.slug)) {
            uniqueMap.set(item.id || item.slug, item);
          }
        });
      }

      const merged = Array.from(uniqueMap.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch {
      return [];
    }
  });

  const [lastFeedback, setLastFeedback] = useState<{ message: string; type: 'saved' | 'removed' } | null>(null);

  // Sync to localStorage
  const persist = useCallback((articles: NewsItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(articles));
    } catch (err) {
      console.error('Error persisting saved articles:', err);
    }
  }, []);

  const dismissFeedback = useCallback(() => {
    setLastFeedback(null);
  }, []);

  const isSaved = useCallback((idOrSlug: string): boolean => {
    if (!idOrSlug) return false;
    return savedArticles.some(item => item.id === idOrSlug || item.slug === idOrSlug);
  }, [savedArticles]);

  const saveArticle = useCallback((news: NewsItem) => {
    if (!news) return;
    setSavedArticles(prev => {
      if (prev.some(item => item.id === news.id || item.slug === news.slug)) {
        return prev;
      }
      const updated = [news, ...prev];
      persist(updated);
      return updated;
    });
    setLastFeedback({ message: `Notícia "${news.title.slice(0, 40)}..." guardada nos seus salvos.`, type: 'saved' });
  }, [persist]);

  const removeArticle = useCallback((idOrSlug: string) => {
    if (!idOrSlug) return;
    setSavedArticles(prev => {
      const removedItem = prev.find(item => item.id === idOrSlug || item.slug === idOrSlug);
      const updated = prev.filter(item => item.id !== idOrSlug && item.slug !== idOrSlug);
      persist(updated);
      if (removedItem) {
        setLastFeedback({ message: 'Artigo removido dos seus salvos.', type: 'removed' });
      }
      return updated;
    });
  }, [persist]);

  const toggleSaveArticle = useCallback((news: NewsItem): boolean => {
    if (!news) return false;
    const exists = savedArticles.some(item => item.id === news.id || item.slug === news.slug);
    if (exists) {
      removeArticle(news.id || news.slug);
      return false;
    } else {
      saveArticle(news);
      return true;
    }
  }, [savedArticles, saveArticle, removeArticle]);

  const clearAllSaved = useCallback(() => {
    setSavedArticles([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}
    setLastFeedback({ message: 'Todas as notícias salvas foram removidas.', type: 'removed' });
  }, []);

  // Auto clear feedback after 3.5 seconds
  useEffect(() => {
    if (lastFeedback) {
      const timer = setTimeout(() => {
        setLastFeedback(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [lastFeedback]);

  return (
    <SavedArticlesContext.Provider
      value={{
        savedArticles,
        savedCount: savedArticles.length,
        isSaved,
        saveArticle,
        removeArticle,
        toggleSaveArticle,
        clearAllSaved,
        lastFeedback,
        dismissFeedback
      }}
    >
      {children}
    </SavedArticlesContext.Provider>
  );
}

export function useSavedArticles(): SavedArticlesContextType {
  const context = useContext(SavedArticlesContext);
  if (!context) {
    // Safe fallback if called outside provider
    return {
      savedArticles: [],
      savedCount: 0,
      isSaved: () => false,
      saveArticle: () => {},
      removeArticle: () => {},
      toggleSaveArticle: () => false,
      clearAllSaved: () => {},
      lastFeedback: null,
      dismissFeedback: () => {}
    };
  }
  return context;
}

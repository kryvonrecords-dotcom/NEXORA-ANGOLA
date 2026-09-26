/**
 * Google AdMob Centralized Configuration & SDK Manager
 *
 * Production Ad Unit IDs:
 * App ID: ca-app-pub-7453639745659255~3593190215
 * Banner: ca-app-pub-7453639745659255/2820651716
 */

export interface AdMobConfig {
  isTestMode: boolean;
  appId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  minSecondsBetweenInterstitials: number;
  maxInterstitialsPerSession: number;
}

// Production Configuration for Nexora Angola
export const ADMOB_PRODUCTION_CONFIG: AdMobConfig = {
  isTestMode: false,
  appId: 'ca-app-pub-7453639745659255~3593190215',
  bannerAdUnitId: 'ca-app-pub-7453639745659255/2820651716',
  interstitialAdUnitId: 'ca-app-pub-7453639745659255/1033173712',
  rewardedAdUnitId: 'ca-app-pub-7453639745659255/5224354917',
  minSecondsBetweenInterstitials: 90, // Minimum 90 seconds between popups
  maxInterstitialsPerSession: 4,      // Strict policy cap
};

// Default Configuration
export const ADMOB_CONFIG: AdMobConfig = {
  ...ADMOB_PRODUCTION_CONFIG
};

// Key in localStorage for persistent ads preferences & consent
const CONSENT_STORAGE_KEY = 'nexora_ad_consent_status';
const LAST_INTERSTITIAL_KEY = 'nexora_last_interstitial_time';
const SESSION_INTERSTITIAL_COUNT_KEY = 'nexora_session_interstitial_count';

export type AdConsentStatus = 'granted' | 'declined' | 'pending';

class AdMobManager {
  private config: AdMobConfig = { ...ADMOB_CONFIG };
  private consentStatus: AdConsentStatus = 'pending';
  private articlesReadCount = 0;

  constructor() {
    this.loadConsentStatus();
  }

  public getConfig(): AdMobConfig {
    return this.config;
  }

  public setProductionAdUnits(productionConfig: Partial<AdMobConfig>) {
    this.config = {
      ...this.config,
      ...productionConfig,
    };
  }

  public loadConsentStatus(): AdConsentStatus {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY) as AdConsentStatus | null;
      if (stored === 'granted' || stored === 'declined') {
        this.consentStatus = stored;
      }
    } catch {
      this.consentStatus = 'pending';
    }
    return this.consentStatus;
  }

  public setConsentStatus(status: AdConsentStatus) {
    this.consentStatus = status;
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, status);
    } catch {
      // ignore
    }
  }

  public getConsentStatus(): AdConsentStatus {
    return this.consentStatus;
  }

  /**
   * Tracks article read and determines if an interstitial ad should be displayed
   * according to Google Play and AdMob frequency policies.
   */
  public shouldShowInterstitialOnArticleRead(): boolean {
    this.articlesReadCount++;

    // Only show after at least 3 articles read
    if (this.articlesReadCount % 3 !== 0) {
      return false;
    }

    const now = Date.now();
    let lastTime = 0;
    try {
      lastTime = parseInt(sessionStorage.getItem(LAST_INTERSTITIAL_KEY) || '0', 10);
    } catch {
      // ignore
    }

    const elapsedSeconds = (now - lastTime) / 1000;
    if (elapsedSeconds < this.config.minSecondsBetweenInterstitials) {
      return false;
    }

    let sessionCount = 0;
    try {
      sessionCount = parseInt(sessionStorage.getItem(SESSION_INTERSTITIAL_COUNT_KEY) || '0', 10);
    } catch {
      // ignore
    }

    if (sessionCount >= this.config.maxInterstitialsPerSession) {
      return false;
    }

    return true;
  }

  public markInterstitialShown() {
    try {
      sessionStorage.setItem(LAST_INTERSTITIAL_KEY, Date.now().toString());
      const current = parseInt(sessionStorage.getItem(SESSION_INTERSTITIAL_COUNT_KEY) || '0', 10);
      sessionStorage.setItem(SESSION_INTERSTITIAL_COUNT_KEY, (current + 1).toString());
    } catch {
      // ignore
    }
  }
}

export const admobService = new AdMobManager();

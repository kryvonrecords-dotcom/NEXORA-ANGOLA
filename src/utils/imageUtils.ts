import React from 'react';

// Reliable category-based Unsplash images as secondary fallbacks
export const CATEGORY_FALLBACK_URLS: Record<string, string> = {
  angola: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
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

// Generate an ultra-fast, 100% offline-resilient SVG Data URI that NEVER fails
export function getCategoryFallbackSvg(categoryName?: string, title?: string): string {
  const cat = (categoryName || 'Notícia').trim();
  const safeTitle = (title || 'Nexora Angola').slice(0, 45).replace(/[<>&"]/g, '');
  
  // Theme color palette per category
  let gradientStart = '#000000';
  let gradientEnd = '#1C2541';
  let accentColor = '#CE1126';

  const lowerCat = cat.toLowerCase();
  if (lowerCat.includes('angola')) {
    gradientStart = '#000000';
    gradientEnd = '#1E293B';
    accentColor = '#CE1126';
  } else if (lowerCat.includes('áfrica') || lowerCat.includes('africa')) {
    gradientStart = '#18181B';
    gradientEnd = '#27272A';
    accentColor = '#EAB308';
  } else if (lowerCat.includes('mundo')) {
    gradientStart = '#0F172A';
    gradientEnd = '#1E3A8A';
    accentColor = '#38BDF8';
  } else if (lowerCat.includes('política') || lowerCat.includes('politica')) {
    gradientStart = '#1E1B4B';
    gradientEnd = '#312E81';
    accentColor = '#818CF8';
  } else if (lowerCat.includes('economia')) {
    gradientStart = '#064E3B';
    gradientEnd = '#0F766E';
    accentColor = '#2DD4BF';
  } else if (lowerCat.includes('tecnologia')) {
    gradientStart = '#2E1065';
    gradientEnd = '#4C1D95';
    accentColor = '#A78BFA';
  } else if (lowerCat.includes('desporto')) {
    gradientStart = '#7C2D12';
    gradientEnd = '#C2410C';
    accentColor = '#FB923C';
  } else if (lowerCat.includes('entretenimento')) {
    gradientStart = '#831843';
    gradientEnd = '#BE185D';
    accentColor = '#F472B6';
  } else if (lowerCat.includes('saúde') || lowerCat.includes('saude')) {
    gradientStart = '#065F46';
    gradientEnd = '#047857';
    accentColor = '#34D399';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}"/>
        <stop offset="100%" stop-color="${gradientEnd}"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="#CE1126"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="1200" height="675" fill="url(#bg)"/>
    <rect width="1200" height="675" fill="url(#grid)"/>

    <!-- Decorative Circles -->
    <circle cx="1000" cy="150" r="220" fill="${accentColor}" opacity="0.08"/>
    <circle cx="200" cy="550" r="180" fill="#CE1126" opacity="0.08"/>

    <!-- Top Badge -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="180" height="38" rx="19" fill="url(#accentGrad)" opacity="0.9"/>
      <text x="90" y="24" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" letter-spacing="2" text-anchor="middle" text-transform="uppercase">${cat.toUpperCase()}</text>
    </g>

    <!-- Center Icon Symbol (Newspaper / Broadcast) -->
    <g transform="translate(600, 270) scale(1.8)" opacity="0.95">
      <!-- Outer Shield / Circle -->
      <circle cx="0" cy="0" r="46" fill="rgba(255,255,255,0.06)" stroke="${accentColor}" stroke-width="2"/>
      <!-- Newspaper Icon Graphic -->
      <path d="M-18 -18 L18 -18 C20 -18 22 -16 22 -14 L22 18 C22 20 20 22 18 22 L-18 22 C-20 22 -22 20 -22 18 L-22 -14 C-22 -16 -20 -18 -18 -18 Z" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="-14" y1="-10" x2="4" y2="-10" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-14" y1="-3" x2="4" y2="-3" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <line x1="-14" y1="4" x2="14" y2="4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <line x1="-14" y1="11" x2="14" y2="11" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <rect x="8" y="-12" width="6" height="10" fill="${accentColor}" rx="1"/>
    </g>

    <!-- Bottom Brand & Title Banner -->
    <g transform="translate(80, 520)">
      <text x="0" y="0" fill="#ffffff" font-family="'Georgia', serif" font-size="34" font-weight="bold" opacity="0.95">${safeTitle}</text>
      <text x="0" y="45" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" letter-spacing="1">NEXORA ANGOLA • JORNALISMO EM TEMPO REAL</text>
    </g>

    <!-- Subtle Border -->
    <rect x="1" y="1" width="1198" height="673" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Get category slug from category name
export function getCategorySlug(categoryName?: string): string {
  if (!categoryName) return 'geral';
  const clean = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return clean || 'geral';
}

// Get high-quality fallback image URL for category
export function getCategoryFallbackUrl(categoryName?: string, title?: string): string {
  const slug = getCategorySlug(categoryName);
  if (CATEGORY_FALLBACK_URLS[slug]) {
    return CATEGORY_FALLBACK_URLS[slug];
  }
  return getCategoryFallbackSvg(categoryName, title);
}

// Check if an image URL is valid and non-empty
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
  return true;
}

// Get news image with guaranteed fallback
export function getNewsImageUrl(url?: string | null, categoryName?: string, title?: string): string {
  if (isValidImageUrl(url)) {
    return url!.trim();
  }
  return getCategoryFallbackSvg(categoryName, title);
}

// Generate an ultra-fast, 100% offline-resilient Banner SVG Data URI that NEVER fails
export function getBannerFallbackSvg(title?: string, subtitle?: string): string {
  const safeTitle = (title || 'NEXORA ANGOLA: A Notícia Que Move o Mundo!').slice(0, 55).replace(/[<>&"]/g, '');
  const safeSub = (subtitle || 'Cobertura completa, análises profundas e informação confiável em tempo real 24 horas.').slice(0, 85).replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
    <defs>
      <linearGradient id="bannerBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070B19"/>
        <stop offset="50%" stop-color="#000000"/>
        <stop offset="100%" stop-color="#1C2541"/>
      </linearGradient>
      <linearGradient id="bannerAccent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#CE1126"/>
        <stop offset="100%" stop-color="#38BDF8"/>
      </linearGradient>
      <pattern id="bannerGrid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Background -->
    <rect width="1600" height="900" fill="url(#bannerBg)"/>
    <rect width="1600" height="900" fill="url(#bannerGrid)"/>

    <!-- Glowing orbs -->
    <circle cx="1350" cy="250" r="380" fill="#CE1126" opacity="0.12"/>
    <circle cx="200" cy="750" r="300" fill="#38BDF8" opacity="0.08"/>

    <!-- Top Badge -->
    <g transform="translate(100, 100)">
      <rect x="0" y="0" width="280" height="48" rx="24" fill="url(#bannerAccent)" opacity="0.95"/>
      <text x="140" y="30" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" letter-spacing="2" text-anchor="middle">BAIXE O APLICATIVO OFICIAL</text>
    </g>

    <!-- Center Icon Shield & Logo -->
    <g transform="translate(800, 360) scale(2.2)" opacity="0.95">
      <circle cx="0" cy="0" r="54" fill="rgba(20,110,245,0.12)" stroke="#CE1126" stroke-width="2.5"/>
      <path d="M-22 -22 L22 -22 C25 -22 27 -20 27 -17 L27 22 C27 25 25 27 22 27 L-22 27 C-25 27 -27 25 -27 22 L-27 -17 C-27 -20 -25 -22 -22 -22 Z" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linejoin="round"/>
      <line x1="-17" y1="-12" x2="6" y2="-12" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
      <line x1="-17" y1="-4" x2="6" y2="-4" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
      <line x1="-17" y1="4" x2="17" y2="4" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
      <line x1="-17" y1="12" x2="17" y2="12" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
      <rect x="11" y="-15" width="8" height="12" fill="#CE1126" rx="1.5"/>
    </g>

    <!-- Main Title & Brand Typography -->
    <g transform="translate(800, 630)" text-anchor="middle">
      <text x="0" y="0" fill="#ffffff" font-family="'Georgia', serif" font-size="52" font-weight="bold">${safeTitle}</text>
      <text x="0" y="60" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500">${safeSub}</text>
      <text x="0" y="120" fill="#CE1126" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" letter-spacing="3">WWW.NEXORANEWS.COM • ANGOLA &amp; MUNDO</text>
    </g>

    <!-- Frame Border -->
    <rect x="2" y="2" width="1596" height="896" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" rx="16"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Get banner image with guaranteed fallback
export function getBannerImageUrl(url?: string | null, title?: string, subtitle?: string): string {
  if (isValidImageUrl(url)) {
    // If it's the old relative path, map to public url or asset
    if (url?.startsWith('/src/assets/images/')) {
      return '/promo-banner.jpg';
    }
    return url!.trim();
  }
  return '/welcome-cover.jpg';
}

// Error handler for banner images
export function handleBannerImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  title?: string,
  subtitle?: string
): void {
  const target = event.currentTarget;
  const step = parseInt(target.dataset.fallbackStep || '0', 10);

  if (step === 0) {
    target.dataset.fallbackStep = '1';
    target.src = '/welcome-cover.jpg';
  } else if (step === 1) {
    target.dataset.fallbackStep = '2';
    target.src = '/promo-banner.jpg';
  } else if (step === 2) {
    target.dataset.fallbackStep = '3';
    target.src = '/app-cover.jpg';
  } else {
    target.dataset.fallbackStep = '4';
    target.src = getBannerFallbackSvg(title, subtitle);
  }
}

// Error handler for image tags to ensure images NEVER disappear or remain broken
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  categoryName?: string,
  title?: string
): void {
  const target = event.currentTarget;
  
  // Prevent infinite loops if fallback fails
  const step = parseInt(target.dataset.fallbackStep || '0', 10);
  
  if (step === 0) {
    target.dataset.fallbackStep = '1';
    // Step 1: Try reliable Unsplash category URL
    const slug = getCategorySlug(categoryName);
    const unsplashUrl = CATEGORY_FALLBACK_URLS[slug] || CATEGORY_FALLBACK_URLS.geral;
    target.src = unsplashUrl;
  } else if (step === 1) {
    target.dataset.fallbackStep = '2';
    // Step 2: Switch to 100% offline-guaranteed vector SVG Data URI
    target.src = getCategoryFallbackSvg(categoryName, title);
  } else {
    // Step 3: Absolute minimal base SVG
    target.dataset.fallbackStep = '3';
    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%230B132B"/><text x="400" y="235" fill="%23146EF5" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">NEXORA ANGOLA</text></svg>';
  }
}

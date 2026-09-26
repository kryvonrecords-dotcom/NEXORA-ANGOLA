import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Radio,
  Eye
} from 'lucide-react';
import { Advertisement } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '../utils/mediaUtils';
import { getBannerImageUrl, handleBannerImageError } from '../utils/imageUtils';

interface Props {
  onNavigate: (path: string) => void;
}

const DEFAULT_BANNER_IMG = '/welcome-cover.jpg';
const APP_COVER_IMG = '/app-cover.jpg';
const PROMO_BANNER_IMG = '/promo-banner.jpg';

export function PromoHeroBanner({ onNavigate }: Props) {
  const { user } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadAds() {
      try {
        const list = await api.getAds('top_hero');
        setAds(list || []);
      } catch (err) {
        console.error('Failed to load hero ads:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAds();
  }, []);

  // Auto rotate if multiple ads exist
  useEffect(() => {
    if (ads.length <= 1 || isPlayingVideo) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ads.length, isPlayingVideo, currentIndex]);

  const currentAd = ads[currentIndex];

  // Track impression once per ad change
  useEffect(() => {
    if (currentAd?.id) {
      api.recordAdImpression(currentAd.id);
    }
  }, [currentAd?.id]);

  const handleAdClick = (ad?: Advertisement) => {
    const targetAd = ad || currentAd;
    if (targetAd?.id) {
      api.recordAdClick(targetAd.id);
    }
    if (targetAd?.linkUrl) {
      if (targetAd.linkUrl.startsWith('http://') || targetAd.linkUrl.startsWith('https://')) {
        window.open(targetAd.linkUrl, targetAd.targetNewTab ? '_blank' : '_self');
      } else {
        onNavigate(targetAd.linkUrl);
      }
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
    setIsPlayingVideo(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
    setIsPlayingVideo(false);
  };

  const toggleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlayingVideo(true);
    } else {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    }
  };

  const toggleVideoMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const isVideo = currentAd?.mediaType === 'video';
  const isImageAd = currentAd && currentAd.mediaType === 'image' && currentAd.mediaUrl;
  const isCustomPromo = !currentAd || currentAd.mediaType === 'custom_banner' || currentAd.id === 'ad-nexora-app';

  return (
    <div className="relative mb-6 sm:mb-8 group">
      {/* Exact 16:9 proportion banner frame matching user's image dimensions */}
      <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-[#000000] select-none">
        
        {/* CASE 1: Video Banner */}
        {isVideo ? (
          <div className="relative w-full h-full bg-black">
            {isYouTubeUrl(currentAd.mediaUrl) && getYouTubeEmbedUrl(currentAd.mediaUrl) ? (
              <iframe
                src={getYouTubeEmbedUrl(currentAd.mediaUrl)!}
                title={currentAd.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={currentAd.mediaUrl}
                  poster={getBannerImageUrl(currentAd.videoThumbnail || DEFAULT_BANNER_IMG, currentAd.title, currentAd.subtitle)}
                  className="w-full h-full object-cover"
                  playsInline
                  loop
                  muted={isMuted}
                  onPlay={() => setIsPlayingVideo(true)}
                  onPause={() => setIsPlayingVideo(false)}
                />

                {/* Video overlay controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4 sm:p-6">
                  {/* Top bar info */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                      {currentAd.badgeText || 'VÍDEO PUBLICITÁRIO'}
                    </span>

                    <button
                      type="button"
                      onClick={toggleVideoMute}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
                      title={isMuted ? 'Ativar Som' : 'Desativar Som'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Center Play/Pause button */}
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={toggleVideoPlay}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#CE1126] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      {isPlayingVideo ? (
                        <Pause className="w-5 h-5 sm:w-7 sm:h-7" />
                      ) : (
                        <Play className="w-5 h-5 sm:w-7 sm:h-7 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Bottom text & CTA */}
                  <div className="flex items-end justify-between gap-4">
                    <div className="max-w-lg">
                      <h3 className="text-sm sm:text-lg font-bold text-white font-serif line-clamp-1">
                        {currentAd.title}
                      </h3>
                      {currentAd.subtitle && (
                        <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 mt-0.5">
                          {currentAd.subtitle}
                        </p>
                      )}
                    </div>

                    {currentAd.linkUrl && (
                      <button
                        type="button"
                        onClick={() => handleAdClick(currentAd)}
                        className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#CE1126] hover:bg-[#A50D1F] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer shrink-0"
                      >
                        <span>{currentAd.callToAction || 'Acessar'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : isImageAd ? (
          /* CASE 2: Uploaded Image Banner */
          <div 
            onClick={() => handleAdClick(currentAd)}
            className="relative w-full h-full cursor-pointer group/ad bg-[#000000]"
          >
            <img
              src={getBannerImageUrl(currentAd.mediaUrl, currentAd.title, currentAd.subtitle)}
              alt={currentAd.title}
              onError={e => handleBannerImageError(e, currentAd.title, currentAd.subtitle)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover/ad:scale-[1.01] transition-transform duration-500"
            />
            {/* Gradient protection for readable tag */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider shadow">
                {currentAd.badgeText || 'PUBLICIDADE'}
              </span>
            </div>

            {currentAd.callToAction && (
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                <span className="px-4 py-2 rounded-xl bg-[#CE1126] hover:bg-[#A50D1F] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-lg transition-transform group-hover/ad:-translate-y-0.5">
                  <span>{currentAd.callToAction}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>
        ) : (
          /* CASE 3: Official Nexora Angola Promotional Banner Artwork in Exact 16:9 Frame */
          <div 
            onClick={() => handleAdClick(currentAd)}
            className="relative w-full h-full cursor-pointer group/ad overflow-hidden bg-[#000000]"
          >
            {/* The exact graphical poster image in full 16:9 fidelity */}
            <img
              src={getBannerImageUrl(DEFAULT_BANNER_IMG, 'Nexora Angola', 'A Notícia Que Move o Mundo')}
              alt="Nexora Angola - A Notícia Que Move o Mundo"
              onError={e => handleBannerImageError(e, 'Nexora Angola', 'A Notícia Que Move o Mundo')}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover/ad:scale-[1.015] transition-transform duration-700"
            />

            {/* Clickable Action Hotspots over Store Buttons and Links */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-5 lg:p-6">
              {/* Top Tag & Admin Shortcut */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CE1126] text-white text-[11px] font-black uppercase tracking-wider shadow-md backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse text-amber-300" />
                    <span>Seja Bem-vindo ao Nexora Angola</span>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('/admin/publicidades');
                    }}
                    className="pointer-events-auto flex items-center gap-1 bg-black/60 hover:bg-black/90 text-white hover:text-[#CE1126] px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                    title="Gerir Publicidades"
                  >
                    <Settings className="w-3 h-3 text-[#CE1126]" />
                    <span>Gerir Anúncios</span>
                  </button>
                )}
              </div>

              {/* Bottom Interactive Trigger Area */}
              <div className="flex items-end justify-between">
                <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
                  <a
                    href="https://play.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-[10px] font-bold border border-white/20 flex items-center gap-1.5 backdrop-blur-xs transition-transform hover:-translate-y-0.5"
                  >
                    <span>Google Play</span>
                  </a>
                  <a
                    href="https://apple.com/app-store"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-[10px] font-bold border border-white/20 flex items-center gap-1.5 backdrop-blur-xs transition-transform hover:-translate-y-0.5"
                  >
                    <span>App Store</span>
                  </a>
                </div>

                <div className="pointer-events-auto">
                  <span className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#CE1126] hover:bg-[#A50D1F] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform group-hover/ad:-translate-y-0.5">
                    <span>{currentAd?.callToAction || 'Acessar Agora'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Navigation Controls if multiple active ads exist */}
        {ads.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
              aria-label="Publicidade Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
              aria-label="Próxima Publicidade"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs">
              {ads.map((ad, idx) => (
                <button
                  key={ad.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                    setIsPlayingVideo(false);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? 'w-5 bg-[#CE1126]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para publicidade ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

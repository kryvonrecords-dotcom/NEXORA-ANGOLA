import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudSun, 
  CloudMoon, 
  CloudRain, 
  CloudLightning, 
  CloudFog, 
  CloudDrizzle, 
  Droplets, 
  Wind, 
  Thermometer, 
  MapPin, 
  RefreshCw, 
  ChevronDown,
  Loader2,
  Navigation
} from 'lucide-react';
import { 
  WeatherData, 
  ANGOLA_CITIES, 
  fetchLiveWeather, 
  getStoredCityId, 
  getWmoCondition 
} from '../services/weather';

interface WeatherWidgetProps {
  variant?: 'navbar' | 'full' | 'compact';
  className?: string;
}

export function WeatherWidget({ variant = 'navbar', className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>(getStoredCityId());
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadWeather = async (cityId = selectedCityId, coords?: { lat: number; lon: number; name?: string }) => {
    try {
      const data = await fetchLiveWeather(cityId, coords);
      setWeather(data);
    } catch (err) {
      console.error('Erro ao atualizar clima:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedCityId);

    // Auto refresh every 15 minutes
    const interval = setInterval(() => {
      loadWeather(selectedCityId);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedCityId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    setLoading(true);
    setIsOpen(false);
    setGeoError(null);
    loadWeather(cityId);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não suportada no seu navegador.');
      return;
    }
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await loadWeather(selectedCityId, {
            lat: latitude,
            lon: longitude,
            name: 'Local Atual'
          });
          setIsOpen(false);
        } catch (err) {
          setGeoError('Erro ao carregar dados do local.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocalização recusada ou indisponível:', err);
        setLocating(false);
        setGeoError('Permissão de localização não concedida.');
      },
      { timeout: 8000 }
    );
  };

  const handleManualRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    loadWeather(selectedCityId);
  };

  const renderWeatherIcon = (sizeClass = 'w-3.5 h-3.5') => {
    if (!weather) {
      return <Sun className={`${sizeClass} text-amber-400 animate-spin-slow`} />;
    }

    const { iconType } = getWmoCondition(weather.weatherCode, weather.isDay);

    switch (iconType) {
      case 'sun':
        return <Sun className={`${sizeClass} text-amber-400 animate-spin-slow drop-shadow-xs`} />;
      case 'moon':
        return <Moon className={`${sizeClass} text-indigo-300 drop-shadow-xs`} />;
      case 'cloud-sun':
        return <CloudSun className={`${sizeClass} text-amber-300 drop-shadow-xs`} />;
      case 'cloud-moon':
        return <CloudMoon className={`${sizeClass} text-blue-200 drop-shadow-xs`} />;
      case 'cloud':
        return <Cloud className={`${sizeClass} text-slate-300 drop-shadow-xs`} />;
      case 'rain':
        return <CloudRain className={`${sizeClass} text-cyan-300 animate-bounce-subtle`} />;
      case 'drizzle':
        return <CloudDrizzle className={`${sizeClass} text-cyan-200`} />;
      case 'thunder':
        return <CloudLightning className={`${sizeClass} text-amber-400 animate-pulse`} />;
      case 'fog':
        return <CloudFog className={`${sizeClass} text-slate-400`} />;
      default:
        return <Sun className={`${sizeClass} text-amber-400`} />;
    }
  };

  const displayTemp = weather ? `${weather.temperature}°C` : '...';
  const displayCity = weather ? weather.city : 'Luanda';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-amber-400 font-medium hover:bg-white/10 transition-colors cursor-pointer group text-xs select-none"
        title="Clique para ver detalhes do tempo ou mudar de cidade"
      >
        {renderWeatherIcon('w-3.5 h-3.5')}
        <span className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
          {displayCity} {displayTemp}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-[#000000] text-white border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-4 animate-fadeIn">
          
          {/* Header with City & Realtime Info */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#CE1126]" />
                <span className="font-bold text-sm text-white font-serif">{weather?.city || 'Luanda'}</span>
                <span className="text-[11px] text-slate-400">({weather?.province || 'Angola'})</span>
              </div>
              <p className="text-xs text-amber-300 font-medium mt-0.5 flex items-center gap-1">
                {weather?.conditionText || 'Céu Limpo'}
              </p>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Atualizar agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#CE1126]' : ''}`} />
            </button>
          </div>

          {/* Main Temperature & Stats Grid */}
          <div className="my-3 py-2 px-3 bg-slate-900/80 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {renderWeatherIcon('w-8 h-8')}
                <div>
                  <div className="text-2xl font-black text-white font-serif tracking-tight">
                    {weather?.temperature ?? 25}°C
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sensação: {weather?.apparentTemperature ?? 26}°C
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center justify-end gap-1.5 text-cyan-300">
                  <Droplets className="w-3 h-3" />
                  <span>Humidade: <strong>{weather?.humidity ?? 70}%</strong></span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-slate-300">
                  <Wind className="w-3 h-3 text-slate-400" />
                  <span>Vento: <strong>{weather?.windSpeed ?? 0} km/h</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Location Chooser */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Mudar Província / Cidade:
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="text-[11px] text-blue-400 hover:text-[#F9D616] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {locating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Navigation className="w-2.5 h-2.5" />}
                <span>Auto GPS</span>
              </button>
            </div>

            {geoError && (
              <p className="text-[10px] text-rose-400 bg-rose-950/40 p-1.5 rounded border border-rose-900/50">
                {geoError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {ANGOLA_CITIES.map(city => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCityId === city.id
                      ? 'bg-[#CE1126] text-white font-bold'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{city.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Dados em tempo real • Open-Meteo</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ao Vivo
            </span>
          </div>

        </div>
      )}
    </div>
  );
}

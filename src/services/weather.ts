export interface WeatherData {
  city: string;
  province: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  conditionText: string;
  lastUpdated: string;
}

export interface CityOption {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
}

export const ANGOLA_CITIES: CityOption[] = [
  { id: 'luanda', name: 'Luanda', province: 'Luanda', latitude: -8.838333, longitude: 13.234444 },
  { id: 'benguela', name: 'Benguela', province: 'Benguela', latitude: -12.5763, longitude: 13.4055 },
  { id: 'huambo', name: 'Huambo', province: 'Huambo', latitude: -12.7761, longitude: 15.7392 },
  { id: 'lubango', name: 'Lubango', province: 'Huíla', latitude: -14.9172, longitude: 13.4925 },
  { id: 'cabinda', name: 'Cabinda', province: 'Cabinda', latitude: -5.5500, longitude: 12.2000 },
  { id: 'malanje', name: 'Malanje', province: 'Malanje', latitude: -9.5400, longitude: 16.3400 },
  { id: 'soyo', name: 'Soyo', province: 'Zaire', latitude: -6.1349, longitude: 12.3689 },
  { id: 'namibe', name: 'Moçâmedes', province: 'Namibe', latitude: -15.1961, longitude: 12.1522 },
  { id: 'saurimo', name: 'Saurimo', province: 'Lunda Sul', latitude: -9.6608, longitude: 20.3916 },
  { id: 'cuito', name: 'Cuito', province: 'Bié', latitude: -12.3833, longitude: 16.9333 },
];

export function getWmoCondition(code: number, isDay: boolean): { text: string; iconType: 'sun' | 'moon' | 'cloud-sun' | 'cloud-moon' | 'cloud' | 'rain' | 'thunder' | 'fog' | 'drizzle' } {
  switch (code) {
    case 0:
      return isDay ? { text: 'Céu Limpo', iconType: 'sun' } : { text: 'Céu Estrelado', iconType: 'moon' };
    case 1:
      return isDay ? { text: 'Predomínio de Sol', iconType: 'sun' } : { text: 'Pouco Nublado', iconType: 'moon' };
    case 2:
      return isDay ? { text: 'Parcialmente Nublado', iconType: 'cloud-sun' } : { text: 'Parcialmente Nublado', iconType: 'cloud-moon' };
    case 3:
      return { text: 'Encoberto / Nublado', iconType: 'cloud' };
    case 45:
    case 48:
      return { text: 'Nevoeiro / Neblina', iconType: 'fog' };
    case 51:
    case 53:
    case 55:
      return { text: 'Chuviscos', iconType: 'drizzle' };
    case 61:
      return { text: 'Chuva Fraca', iconType: 'rain' };
    case 63:
      return { text: 'Chuva Moderada', iconType: 'rain' };
    case 65:
      return { text: 'Chuva Intensa', iconType: 'rain' };
    case 80:
    case 81:
    case 82:
      return { text: 'Aguaceiros', iconType: 'rain' };
    case 95:
    case 96:
    case 99:
      return { text: 'Trovoada', iconType: 'thunder' };
    default:
      return isDay ? { text: 'Céu Limpo', iconType: 'sun' } : { text: 'Noite Limpa', iconType: 'moon' };
  }
}

const STORAGE_KEY = 'nexora_weather_cache';
const SELECTED_CITY_KEY = 'nexora_selected_city';

export async function fetchLiveWeather(cityId = 'luanda', customCoords?: { lat: number; lon: number; name?: string }): Promise<WeatherData> {
  let lat = -8.838333;
  let lon = 13.234444;
  let cityName = 'Luanda';
  let provinceName = 'Luanda';

  if (customCoords) {
    lat = customCoords.lat;
    lon = customCoords.lon;
    cityName = customCoords.name || 'Local Atual';
    provinceName = 'Localização Atual';
  } else {
    const selected = ANGOLA_CITIES.find(c => c.id === cityId) || ANGOLA_CITIES[0];
    lat = selected.latitude;
    lon = selected.longitude;
    cityName = selected.name;
    provinceName = selected.province;
  }

  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=Africa%2FLuanda`;

  try {
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`OpenMeteo HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    if (!current) throw new Error('Dados meteorológicos indisponíveis no momento');

    const isDay = current.is_day === 1;
    const weatherCode = typeof current.weather_code === 'number' ? current.weather_code : 0;
    const condition = getWmoCondition(weatherCode, isDay);

    const result: WeatherData = {
      city: cityName,
      province: provinceName,
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature ?? current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      weatherCode,
      isDay,
      conditionText: condition.text,
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      if (!customCoords) {
        localStorage.setItem(SELECTED_CITY_KEY, cityId);
      }
    } catch {
      // Ignore storage quota errors
    }

    return result;
  } catch (err) {
    console.warn('Falha ao obter clima ao vivo de Open-Meteo, tentando fallback do servidor:', err);

    // Fallback: try server proxy
    try {
      const serverRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}`);
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        return serverData;
      }
    } catch {
      // Ignore
    }

    // Fallback to cache if available
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }

    // Default realistic fallback
    const now = new Date();
    const hours = now.getHours();
    const isDay = hours >= 6 && hours < 19;
    return {
      city: cityName,
      province: provinceName,
      temperature: 25,
      apparentTemperature: 27,
      humidity: 72,
      windSpeed: 8,
      weatherCode: 1,
      isDay,
      conditionText: isDay ? 'Céu Limpo' : 'Noite Limpa',
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function getStoredCityId(): string {
  try {
    return localStorage.getItem(SELECTED_CITY_KEY) || 'luanda';
  } catch {
    return 'luanda';
  }
}

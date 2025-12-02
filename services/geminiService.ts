/// <reference types="vite/client" />
import { WeatherData, WeatherCondition } from "../types";

const CACHE_KEY_PREFIX = 'climatix_weather_cache_';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

interface CacheEntry {
  timestamp: number;
  data: WeatherData;
}

const pendingRequests = new Map<string, Promise<WeatherData>>();

const getCacheKey = (city: string) => CACHE_KEY_PREFIX + city.toLowerCase().trim();

const getCachedWeather = (city: string): { data: WeatherData | null; isExpired: boolean; entry: CacheEntry | null } => {
  try {
    const key = getCacheKey(city);
    const cachedStr = localStorage.getItem(key);
    if (!cachedStr) return { data: null, isExpired: true, entry: null };
    const entry = JSON.parse(cachedStr) as CacheEntry;
    const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
    return { data: entry.data, isExpired, entry };
  } catch (e) {
    return { data: null, isExpired: true, entry: null };
  }
};

const setCachedWeather = (city: string, data: WeatherData) => {
  try {
    const entry = { timestamp: Date.now(), data };
    const str = JSON.stringify(entry);
    localStorage.setItem(getCacheKey(city), str);
    if (data.location) localStorage.setItem(getCacheKey(data.location), str);
  } catch (e) {
    try {
      localStorage.clear();
      localStorage.setItem(getCacheKey(city), JSON.stringify({ timestamp: Date.now(), data }));
    } catch (inner) {}
  }
};

// Weather code to condition mapping for Open-Meteo
const getWeatherCondition = (code: number, isDay: boolean): { condition: string; icon: WeatherCondition } => {
  if (code === 0) return { condition: isDay ? "Sunny" : "Clear", icon: isDay ? WeatherCondition.Sunny : WeatherCondition.Clear };
  if (code === 1 || code === 2) return { condition: "Partly Cloudy", icon: WeatherCondition.PartlyCloudy };
  if (code === 3) return { condition: "Cloudy", icon: WeatherCondition.Cloudy };
  if (code >= 45 && code <= 48) return { condition: "Foggy", icon: WeatherCondition.Fog };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", icon: WeatherCondition.Rain };
  if (code >= 61 && code <= 67) return { condition: "Rainy", icon: WeatherCondition.Rain };
  if (code >= 71 && code <= 77) return { condition: "Snowy", icon: WeatherCondition.Snow };
  if (code >= 80 && code <= 82) return { condition: "Showers", icon: WeatherCondition.Rain };
  if (code >= 85 && code <= 86) return { condition: "Snow Showers", icon: WeatherCondition.Snow };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", icon: WeatherCondition.Storm };
  return { condition: "Cloudy", icon: WeatherCondition.Cloudy };
};

// Get weather tip based on conditions
const getWeatherTip = (temp: number, condition: string, uvIndex: number): string => {
  if (condition.includes("Rain") || condition.includes("Shower") || condition.includes("Drizzle")) {
    return "🌧️ Don't forget your umbrella today! Rainy conditions expected.";
  }
  if (condition.includes("Snow")) {
    return "❄️ Bundle up! Snowy conditions - wear warm layers and waterproof boots.";
  }
  if (condition.includes("Storm") || condition.includes("Thunder")) {
    return "⛈️ Thunderstorms expected. Stay indoors if possible and avoid open areas.";
  }
  if (uvIndex >= 8) {
    return "☀️ Very high UV index! Apply SPF 30+ sunscreen and wear protective clothing.";
  }
  if (temp > 35) {
    return "🥵 Extreme heat warning! Stay hydrated, avoid midday sun, and wear light clothing.";
  }
  if (temp < 5) {
    return "🥶 Very cold outside! Layer up and protect exposed skin from the cold.";
  }
  if (condition.includes("Sunny") || condition.includes("Clear")) {
    return "☀️ Beautiful weather today! Perfect for outdoor activities.";
  }
  return "🌤️ Have a great day! Check the forecast before heading out.";
};

// Known coordinates for small Indian towns/mandals not in geocoding APIs
const KNOWN_LOCATIONS: Record<string, { lat: number; lon: number; name: string; country: string }> = {
  // Prakasam District, Andhra Pradesh
  "singaraikonda": { lat: 15.6833, lon: 79.9833, name: "Singaraikonda", country: "India" },
  "singarayakonda": { lat: 15.6833, lon: 79.9833, name: "Singarayakonda", country: "India" },
  "kandukur": { lat: 15.2167, lon: 79.9000, name: "Kandukur", country: "India" },
  "chirala": { lat: 15.8167, lon: 80.3500, name: "Chirala", country: "India" },
  "markapur": { lat: 15.7333, lon: 79.2667, name: "Markapur", country: "India" },
  "addanki": { lat: 15.8167, lon: 79.9667, name: "Addanki", country: "India" },
  "darsi": { lat: 15.7667, lon: 79.6833, name: "Darsi", country: "India" },
  "giddalur": { lat: 15.3833, lon: 78.9167, name: "Giddalur", country: "India" },
  "podili": { lat: 15.6000, lon: 79.6167, name: "Podili", country: "India" },
  "kanigiri": { lat: 15.4000, lon: 79.5167, name: "Kanigiri", country: "India" },
  "cumbum": { lat: 15.5833, lon: 79.1167, name: "Cumbum", country: "India" },
  "yerragondapalem": { lat: 15.6167, lon: 78.9500, name: "Yerragondapalem", country: "India" },
  "donakonda": { lat: 15.8000, lon: 79.4833, name: "Donakonda", country: "India" },
  "chimakurthy": { lat: 15.5500, lon: 79.8500, name: "Chimakurthy", country: "India" },
  "pamur": { lat: 15.4667, lon: 79.8167, name: "Pamur", country: "India" },
  "tripuranthakam": { lat: 15.9500, lon: 79.4333, name: "Tripuranthakam", country: "India" },
  "santhanuthalapadu": { lat: 15.7333, lon: 79.8667, name: "Santhanuthalapadu", country: "India" },
  "konakanamitla": { lat: 15.6000, lon: 79.7000, name: "Konakanamitla", country: "India" },
  "bestavaripeta": { lat: 15.5333, lon: 79.1333, name: "Bestavaripeta", country: "India" },
  "maddipadu": { lat: 15.7000, lon: 80.0167, name: "Maddipadu", country: "India" },
  "parchur": { lat: 15.9667, lon: 80.0667, name: "Parchur", country: "India" },
  "vetapalem": { lat: 15.7833, lon: 80.3000, name: "Vetapalem", country: "India" },
  "inkollu": { lat: 15.8167, lon: 80.2000, name: "Inkollu", country: "India" },
  "korisapadu": { lat: 15.6833, lon: 80.2000, name: "Korisapadu", country: "India" },
  "ulavapadu": { lat: 15.3500, lon: 80.0667, name: "Ulavapadu", country: "India" },
  "marripudi": { lat: 15.5000, lon: 79.5000, name: "Marripudi", country: "India" },
  
  // Guntur District, Andhra Pradesh
  "mangalagiri": { lat: 16.4307, lon: 80.5525, name: "Mangalagiri", country: "India" },
  "tadepalli": { lat: 16.4833, lon: 80.6000, name: "Tadepalli", country: "India" },
  "thullur": { lat: 16.5500, lon: 80.4500, name: "Thullur", country: "India" },
  "sattenapalli": { lat: 16.3833, lon: 80.1500, name: "Sattenapalli", country: "India" },
  "ponnur": { lat: 16.0667, lon: 80.5500, name: "Ponnur", country: "India" },
  "bapatla": { lat: 15.9000, lon: 80.4667, name: "Bapatla", country: "India" },
  "repalle": { lat: 16.0167, lon: 80.8333, name: "Repalle", country: "India" },
  "macherla": { lat: 16.4833, lon: 79.4333, name: "Macherla", country: "India" },
  "vinukonda": { lat: 16.0500, lon: 79.7333, name: "Vinukonda", country: "India" },
  "piduguralla": { lat: 16.4667, lon: 79.8833, name: "Piduguralla", country: "India" },
  "dachepalli": { lat: 16.5833, lon: 79.7333, name: "Dachepalli", country: "India" },
  "gurazala": { lat: 16.5667, lon: 79.5333, name: "Gurazala", country: "India" },
  "phirangipuram": { lat: 16.3000, lon: 80.2833, name: "Phirangipuram", country: "India" },
  "prattipadu": { lat: 16.5500, lon: 80.6167, name: "Prattipadu", country: "India" },
  "chebrolu": { lat: 16.2000, lon: 80.5167, name: "Chebrolu", country: "India" },
  "duggirala": { lat: 16.3167, lon: 80.6667, name: "Duggirala", country: "India" },
  "tadikonda": { lat: 16.3500, lon: 80.5500, name: "Tadikonda", country: "India" },
  "pedakurapadu": { lat: 16.1667, lon: 80.0667, name: "Pedakurapadu", country: "India" },
  "tsunduru": { lat: 16.1333, lon: 80.5000, name: "Tsunduru", country: "India" },
  
  // Krishna District, Andhra Pradesh
  "jaggayyapeta": { lat: 16.8917, lon: 80.0979, name: "Jaggayyapeta", country: "India" },
  "nandigama": { lat: 16.7667, lon: 80.2833, name: "Nandigama", country: "India" },
  "tiruvuru": { lat: 17.1167, lon: 80.6167, name: "Tiruvuru", country: "India" },
  "nuzvid": { lat: 17.0833, lon: 80.8500, name: "Nuzvid", country: "India" },
  "mylavaram": { lat: 16.8667, lon: 80.6167, name: "Mylavaram", country: "India" },
  "gannavaram": { lat: 16.5333, lon: 80.8000, name: "Gannavaram", country: "India" },
  "vuyyuru": { lat: 16.3667, lon: 80.8500, name: "Vuyyuru", country: "India" },
  "pamarru": { lat: 16.3167, lon: 80.9667, name: "Pamarru", country: "India" },
  "pedana": { lat: 16.2667, lon: 81.1333, name: "Pedana", country: "India" },
  "avanigadda": { lat: 16.0167, lon: 80.9167, name: "Avanigadda", country: "India" },
  "movva": { lat: 16.1333, lon: 81.0167, name: "Movva", country: "India" },
  "kaikalur": { lat: 16.5500, lon: 81.2000, name: "Kaikalur", country: "India" },
  "gudlavalleru": { lat: 16.3500, lon: 81.0500, name: "Gudlavalleru", country: "India" },
  "bantumilli": { lat: 16.4833, lon: 81.2833, name: "Bantumilli", country: "India" },
  
  // Nellore District, Andhra Pradesh  
  "kavali": { lat: 14.9167, lon: 79.9833, name: "Kavali", country: "India" },
  "gudur": { lat: 14.1500, lon: 79.8500, name: "Gudur", country: "India" },
  "atmakur": { lat: 14.6500, lon: 79.6333, name: "Atmakur", country: "India" },
  "sullurpeta": { lat: 13.7500, lon: 80.0333, name: "Sullurpeta", country: "India" },
  "venkatagiri": { lat: 13.9667, lon: 79.5833, name: "Venkatagiri", country: "India" },
  "naidupeta": { lat: 13.9000, lon: 79.9000, name: "Naidupeta", country: "India" },
  "tada": { lat: 13.6500, lon: 80.1500, name: "Tada", country: "India" },
  
  // West Godavari District, Andhra Pradesh
  "tadepalligudem": { lat: 16.8167, lon: 81.5167, name: "Tadepalligudem", country: "India" },
  "tanuku": { lat: 16.7500, lon: 81.7000, name: "Tanuku", country: "India" },
  "narsapur": { lat: 16.4333, lon: 81.7000, name: "Narsapur", country: "India" },
  "palacole": { lat: 16.5333, lon: 81.7333, name: "Palacole", country: "India" },
  "kovvur": { lat: 17.0167, lon: 81.7333, name: "Kovvur", country: "India" },
  "nidadavole": { lat: 16.9167, lon: 81.6667, name: "Nidadavolu", country: "India" },
  "jangareddygudem": { lat: 17.1167, lon: 81.3000, name: "Jangareddygudem", country: "India" },
  "polavaram": { lat: 17.2500, lon: 81.6667, name: "Polavaram", country: "India" },
  "akividu": { lat: 16.5833, lon: 81.3833, name: "Akividu", country: "India" },
  
  // East Godavari District, Andhra Pradesh
  "amalapuram": { lat: 16.5833, lon: 82.0000, name: "Amalapuram", country: "India" },
  "mandapeta": { lat: 16.8667, lon: 81.9333, name: "Mandapeta", country: "India" },
  "peddapuram": { lat: 17.0833, lon: 82.1333, name: "Peddapuram", country: "India" },
  "samalkot": { lat: 17.0500, lon: 82.1833, name: "Samalkot", country: "India" },
  "tuni": { lat: 17.3500, lon: 82.5500, name: "Tuni", country: "India" },
  "pithapuram": { lat: 17.1167, lon: 82.2500, name: "Pithapuram", country: "India" },
  "ramachandrapuram": { lat: 16.8333, lon: 82.0333, name: "Ramachandrapuram", country: "India" },
  "mummidivaram": { lat: 16.6500, lon: 82.1167, name: "Mummidivaram", country: "India" },
  
  // Visakhapatnam District, Andhra Pradesh
  "anakapalli": { lat: 17.6833, lon: 83.0000, name: "Anakapalli", country: "India" },
  "narsipatnam": { lat: 17.6667, lon: 82.6167, name: "Narsipatnam", country: "India" },
  "yelamanchili": { lat: 17.5500, lon: 82.8667, name: "Yelamanchili", country: "India" },
  "chodavaram": { lat: 17.8333, lon: 82.9333, name: "Chodavaram", country: "India" },
  "gajuwaka": { lat: 17.7000, lon: 83.2167, name: "Gajuwaka", country: "India" },
  "pendurthi": { lat: 17.8000, lon: 83.2000, name: "Pendurthi", country: "India" },
  "bheemunipatnam": { lat: 17.8833, lon: 83.4500, name: "Bheemunipatnam", country: "India" },
  
  // Chittoor District, Andhra Pradesh
  "srikalahasti": { lat: 13.7500, lon: 79.7000, name: "Srikalahasti", country: "India" },
  "puttur": { lat: 13.4333, lon: 79.5500, name: "Puttur", country: "India" },
  "palamaner": { lat: 13.2000, lon: 78.7500, name: "Palamaner", country: "India" },
  "nagari": { lat: 13.3167, lon: 79.5833, name: "Nagari", country: "India" },
  "punganur": { lat: 13.3667, lon: 78.5833, name: "Punganur", country: "India" },
  "kuppam": { lat: 12.7500, lon: 78.3500, name: "Kuppam", country: "India" },
  "chandragiri": { lat: 13.5833, lon: 79.3000, name: "Chandragiri", country: "India" },
  "pakala": { lat: 13.4500, lon: 79.1167, name: "Pakala", country: "India" },
  "renigunta": { lat: 13.6500, lon: 79.5167, name: "Renigunta", country: "India" },
  
  // Telangana Mandals
  "ghatkesar": { lat: 17.4500, lon: 78.6833, name: "Ghatkesar", country: "India" },
  "keesara": { lat: 17.5167, lon: 78.6000, name: "Keesara", country: "India" },
  "shamirpet": { lat: 17.5833, lon: 78.5500, name: "Shamirpet", country: "India" },
  "medchal": { lat: 17.6333, lon: 78.4833, name: "Medchal", country: "India" },
  "kompally": { lat: 17.5333, lon: 78.4833, name: "Kompally", country: "India" },
  "pocharam": { lat: 17.4833, lon: 78.7333, name: "Pocharam", country: "India" },
  "ibrahimpatnam": { lat: 17.1500, lon: 78.6500, name: "Ibrahimpatnam", country: "India" },
  "maheshwaram": { lat: 17.1333, lon: 78.4333, name: "Maheshwaram", country: "India" },
  "shadnagar": { lat: 17.0667, lon: 78.2000, name: "Shadnagar", country: "India" },
  "chevella": { lat: 17.3167, lon: 78.1333, name: "Chevella", country: "India" },
  "moinabad": { lat: 17.3333, lon: 78.2667, name: "Moinabad", country: "India" },
  "shankarpally": { lat: 17.4500, lon: 78.1167, name: "Shankarpally", country: "India" },
  "patancheru": { lat: 17.5333, lon: 78.2667, name: "Patancheru", country: "India" },
  "sangareddy": { lat: 17.6167, lon: 78.0833, name: "Sangareddy", country: "India" },
  "zaheerabad": { lat: 17.6833, lon: 77.6000, name: "Zaheerabad", country: "India" },
  "narayankhed": { lat: 17.8833, lon: 77.8833, name: "Narayankhed", country: "India" },
  "siddipet": { lat: 18.1000, lon: 78.8500, name: "Siddipet", country: "India" },
  "gajwel": { lat: 17.8500, lon: 78.6833, name: "Gajwel", country: "India" },
  "dubbak": { lat: 17.9000, lon: 78.7833, name: "Dubbak", country: "India" },
  "bhongir": { lat: 17.5167, lon: 78.8833, name: "Bhongir", country: "India" },
  "yadagirigutta": { lat: 17.5833, lon: 78.9500, name: "Yadagirigutta", country: "India" },
  "choutuppal": { lat: 17.2500, lon: 78.8833, name: "Choutuppal", country: "India" },
  "kodad": { lat: 16.9833, lon: 79.9667, name: "Kodad", country: "India" },
  "suryapet": { lat: 17.1500, lon: 79.6333, name: "Suryapet", country: "India" },
  "miryalaguda": { lat: 16.8833, lon: 79.5667, name: "Miryalaguda", country: "India" },
  "huzurabad": { lat: 18.1167, lon: 79.4000, name: "Huzurabad", country: "India" },
  "jammikunta": { lat: 18.2833, lon: 79.4667, name: "Jammikunta", country: "India" },
  "peddapalli": { lat: 18.6167, lon: 79.3833, name: "Peddapalli", country: "India" },
  "godavarikhani": { lat: 18.7500, lon: 79.5000, name: "Godavarikhani", country: "India" },
  "mancherial": { lat: 18.8667, lon: 79.4500, name: "Mancherial", country: "India" },
  "sircilla": { lat: 18.3833, lon: 78.8333, name: "Sircilla", country: "India" },
  "vemulawada": { lat: 18.4667, lon: 78.8667, name: "Vemulawada", country: "India" },
  "jagtial": { lat: 18.7833, lon: 78.9167, name: "Jagtial", country: "India" },
  "armoor": { lat: 18.7833, lon: 78.2833, name: "Armoor", country: "India" },
  "bodhan": { lat: 18.6667, lon: 77.8833, name: "Bodhan", country: "India" },
  "kamareddy": { lat: 18.3167, lon: 78.3333, name: "Kamareddy", country: "India" },
  "banswada": { lat: 18.3833, lon: 77.8833, name: "Banswada", country: "India" },
  "yellareddy": { lat: 18.1833, lon: 78.0167, name: "Yellareddy", country: "India" },
  "jangaon": { lat: 17.7333, lon: 79.1500, name: "Jangaon", country: "India" },
  "mahabubabad": { lat: 17.6000, lon: 80.0000, name: "Mahabubabad", country: "India" },
  "narsampet": { lat: 17.9333, lon: 79.9000, name: "Narsampet", country: "India" },
  "parkal": { lat: 18.2000, lon: 79.7000, name: "Parkal", country: "India" },
  "madhira": { lat: 17.0167, lon: 80.3667, name: "Madhira", country: "India" },
  "wyra": { lat: 17.1833, lon: 80.3500, name: "Wyra", country: "India" },
  "sattupalli": { lat: 17.2500, lon: 80.5333, name: "Sattupalli", country: "India" },
  "yellandu": { lat: 17.6000, lon: 80.3333, name: "Yellandu", country: "India" },
  "bhadrachalam": { lat: 17.6667, lon: 80.8833, name: "Bhadrachalam", country: "India" },
  "kothagudem": { lat: 17.5500, lon: 80.6167, name: "Kothagudem", country: "India" },
  "manuguru": { lat: 17.9833, lon: 80.7667, name: "Manuguru", country: "India" },
  "palwancha": { lat: 17.6000, lon: 80.7000, name: "Palwancha", country: "India" },
  "wanaparthy": { lat: 16.3667, lon: 78.0667, name: "Wanaparthy", country: "India" },
  "nagarkurnool": { lat: 16.4833, lon: 78.3167, name: "Nagarkurnool", country: "India" },
  "achampet": { lat: 16.3833, lon: 78.8333, name: "Achampet", country: "India" },
  "kalwakurthy": { lat: 16.6667, lon: 78.4833, name: "Kalwakurthy", country: "India" },
};

// Geocode city name using multiple APIs for best coverage
const geocodeCity = async (city: string): Promise<{ lat: number; lon: number; name: string; country: string; timezone: string }> => {
  // Check if input is coordinates (lat, lon format)
  const coordMatch = city.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    // Reverse geocode to get city name
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    try {
      const response = await fetch(reverseUrl, {
        headers: { 'User-Agent': 'Climatix Weather App/1.0' }
      });
      const data = await response.json();
      const cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.state_district || "Unknown Location";
      const country = data.address?.country || "";
      return { lat, lon, name: cityName, country, timezone: "auto" };
    } catch {
      return { lat, lon, name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, country: "", timezone: "auto" };
    }
  }

  // Check our known locations database first (for small Indian towns/mandals)
  const searchKey = city.toLowerCase().trim().replace(/,?\s*(india|andhra pradesh|telangana|ap|ts)$/i, '').trim();
  const knownLocation = KNOWN_LOCATIONS[searchKey];
  if (knownLocation) {
    console.log(`Found "${city}" in known locations database`);
    return {
      lat: knownLocation.lat,
      lon: knownLocation.lon,
      name: knownLocation.name,
      country: knownLocation.country,
      timezone: "Asia/Kolkata"
    };
  }

  const searchCity = city.trim();
  
  // Try Open-Meteo first (faster, has timezone info)
  try {
    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=5&language=en&format=json`;
    const openMeteoResponse = await fetch(openMeteoUrl);
    const openMeteoData = await openMeteoResponse.json();
    
    if (openMeteoData.results && openMeteoData.results.length > 0) {
      const result = openMeteoData.results[0];
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name,
        country: result.country || "",
        timezone: result.timezone || "auto"
      };
    }
  } catch (e) {
    console.log("Open-Meteo geocoding failed, trying Nominatim...");
  }

  // Try Nominatim with multiple search strategies
  const searchQueries = [
    searchCity,
    `${searchCity}, India`, // Try with India suffix for Indian cities
    `${searchCity}, Andhra Pradesh, India`,
    `${searchCity}, Telangana, India`,
  ];

  for (const query of searchQueries) {
    try {
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: { 
          'User-Agent': 'Climatix Weather App/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log(`Nominatim returned ${response.status} for "${query}"`);
        continue;
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const address = result.address || {};
        const placeName = address.city || address.town || address.village || address.county || 
                         address.state_district || address.municipality || address.suburb || 
                         result.name || searchCity;
        const country = address.country || "";
        
        console.log(`Found "${placeName}, ${country}" for search "${query}"`);
        
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          name: placeName,
          country: country,
          timezone: "auto"
        };
      }
    } catch (e) {
      console.log(`Nominatim search failed for "${query}":`, e);
    }
  }

  // Last resort: Try a more permissive search
  try {
    const fuzzyUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchCity)}&format=json&limit=5&addressdetails=1&accept-language=en`;
    const response = await fetch(fuzzyUrl, {
      headers: { 
        'User-Agent': 'Climatix Weather App/1.0',
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    if (data && data.length > 0) {
      // Find the best match (prefer places over other types)
      const placeResult = data.find((r: any) => 
        r.type === 'city' || r.type === 'town' || r.type === 'village' || 
        r.type === 'administrative' || r.class === 'place'
      ) || data[0];
      
      const address = placeResult.address || {};
      const placeName = address.city || address.town || address.village || 
                       address.state_district || placeResult.name || searchCity;
      
      return {
        lat: parseFloat(placeResult.lat),
        lon: parseFloat(placeResult.lon),
        name: placeName,
        country: address.country || "",
        timezone: "auto"
      };
    }
  } catch (e) {
    console.log("Final Nominatim search failed:", e);
  }
  
  throw new Error(`City "${searchCity}" not found. Try:\n• Check spelling (e.g., "Visakhapatnam" not "Vishakhapatnam")\n• Add state/country (e.g., "${searchCity}, India")\n• Use the autocomplete suggestions`);
};

// Fetch real weather data from Open-Meteo API (FREE, no API key needed!)
const fetchFromOpenMeteo = async (city: string): Promise<WeatherData> => {
  // Step 1: Geocode the city
  const { lat, lon, name, country, timezone: geoTimezone } = await geocodeCity(city);
  const locationName = country ? `${name}, ${country}` : name;

  // Step 2: Fetch weather data - Always use "auto" to let Open-Meteo determine the correct timezone
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7`;
  
  const response = await fetch(weatherUrl);
  const data = await response.json();

  if (!data.current) {
    throw new Error("Unable to fetch weather data");
  }
  
  // Get the actual timezone from Open-Meteo response (this is always accurate!)
  const actualTimezone = data.timezone || geoTimezone || "UTC";
  console.log(`Timezone for ${locationName}: ${actualTimezone}`);

  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;
  const isDay = current.is_day === 1;
  
  const weatherInfo = getWeatherCondition(current.weather_code, isDay);
  const uvIndex = Math.round(daily.uv_index_max[0] || 0);

  // Format sunrise/sunset times
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Build hourly precipitation data (next 24 hours)
  const hourlyPrecip = hourly.precipitation_probability.slice(0, 24).map((prob: number, i: number) => ({
    time: new Date(hourly.time[i]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    percentage: prob || 0
  }));

  // Build hourly forecast (next 24 hours)
  const hourlyForecast = hourly.temperature_2m.slice(0, 24).map((temp: number, i: number) => {
    const hourWeather = getWeatherCondition(hourly.weather_code[i], true);
    return {
      time: new Date(hourly.time[i]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      temp: Math.round(temp),
      condition: hourWeather.condition,
      icon: hourWeather.icon
    };
  });

  // Build 7-day forecast
  const forecast = daily.time.map((dateStr: string, i: number) => {
    const date = new Date(dateStr);
    const dayWeather = getWeatherCondition(daily.weather_code[i], true);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      tempHigh: Math.round(daily.temperature_2m_max[i]),
      tempLow: Math.round(daily.temperature_2m_min[i]),
      condition: dayWeather.condition,
      icon: dayWeather.icon
    };
  });

  // Get air quality description based on humidity and pressure
  const getAirQuality = (humidity: number, pressure: number): string => {
    if (humidity > 85) return "Poor";
    if (humidity > 70) return "Moderate";
    if (pressure < 1000) return "Moderate";
    return "Good";
  };

  const weatherData: WeatherData = {
    location: locationName,
    lat,
    lon,
    timezone: actualTimezone, // Use the timezone from Open-Meteo API response
    dailyTip: getWeatherTip(current.temperature_2m, weatherInfo.condition, uvIndex),
    current: {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: weatherInfo.condition,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      visibility: 10, // Open-Meteo doesn't provide visibility, default to 10km
      pressure: Math.round(current.surface_pressure),
      description: `${weatherInfo.condition} with temperature around ${Math.round(current.temperature_2m)}°C`,
      sunrise: formatTime(daily.sunrise[0]),
      sunset: formatTime(daily.sunset[0]),
      uvIndex: uvIndex,
      airQuality: getAirQuality(current.relative_humidity_2m, current.surface_pressure),
      icon: weatherInfo.icon,
      hourly: hourlyPrecip
    },
    hourlyForecast,
    forecast
  };

  return weatherData;
};

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  const cleanCity = city.toLowerCase().trim();
  const { data: cachedData, isExpired, entry: fullCacheEntry } = getCachedWeather(cleanCity);
  
  // Return cached data if still valid
  if (cachedData && !isExpired) return cachedData;
  
  // Prevent duplicate requests
  if (pendingRequests.has(cleanCity)) return pendingRequests.get(cleanCity)!;

  const fetchPromise = (async () => {
    try {
      // Fetch REAL weather data from Open-Meteo API (FREE, no API key needed!)
      const weatherData = await fetchFromOpenMeteo(city);
      
      // Cache the result
      setCachedWeather(cleanCity, weatherData);
      
      return weatherData;
    } catch (error: any) {
      console.error("Weather fetch failed:", error);
      
      // Try stale cache first
      if (fullCacheEntry) {
        return { ...fullCacheEntry.data, dailyTip: "⚠️ Using cached data. " + (error.message || "Network error.") };
      }
      
      // Re-throw to show error to user
      throw new Error(error.message || "Failed to fetch weather data. Please try again.");
    } finally {
      pendingRequests.delete(cleanCity);
    }
  })();

  pendingRequests.set(cleanCity, fetchPromise);
  return fetchPromise;
};

// Smart ChatGPT-like responses based on user questions
const getMockResponse = (message: string): string => {
  const lower = message.toLowerCase().trim();
  
  // === GREETINGS ===
  if (/^(hi+|hey+|hello+|hola|good morning|good afternoon|good evening|yo|sup)$/i.test(lower) || 
      lower.includes('hello') || lower.includes('hi ') || lower === 'hi' || lower === 'hey') {
    const greetings = [
      "Hello! 👋 I'm **Climatix AI**, your personal weather assistant.\n\nI'm here to help you with weather forecasts, outfit recommendations, and safety tips. What would you like to know?",
      "Hey there! 🌤️ Great to see you!\n\nI can help you with:\n• Weather forecasts\n• What to wear today\n• Rain predictions\n• UV safety tips\n\nWhat's on your mind?",
      "Hi! 👋 Welcome to Climatix!\n\nI'm your AI weather companion. Ask me anything about the weather, and I'll do my best to help you out!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // === ABOUT / WHO ARE YOU ===
  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('your name') || lower.includes('about you')) {
    return "I'm **Climatix AI** 🤖, your intelligent weather assistant!\n\nI was designed to help you:\n• Understand weather conditions\n• Plan your day better\n• Stay safe in any weather\n• Get personalized recommendations\n\nThink of me as your personal meteorologist, available 24/7!";
  }
  
  // === HOW ARE YOU ===
  if (lower.includes('how are you') || lower.includes("what's up") || lower.includes('whats up') || lower.includes('how do you do')) {
    return "I'm doing fantastic, thank you for asking! ☀️\n\nI'm always ready to help you with weather updates. The real question is - how's the weather treating **you** today? Need any weather info?";
  }
  
  // === RAIN ===
  if (lower.includes('rain') || lower.includes('umbrella') || lower.includes('wet') || lower.includes('precipitation') || lower.includes('shower')) {
    return "🌧️ **Rain Information**\n\nTo check if it'll rain:\n• Look at the **'Chance of Rain'** chart on the Dashboard\n• It shows hourly precipitation probability\n• Above 50%? Definitely grab an umbrella!\n• Above 80%? Expect significant rainfall\n\n**Pro tip:** Check the hourly forecast to plan around the rain!";
  }
  
  // === WHAT TO WEAR ===
  if (lower.includes('wear') || lower.includes('clothes') || lower.includes('dress') || lower.includes('outfit') || lower.includes('jacket')) {
    return "👕 **What to Wear Guide**\n\nBased on temperature:\n• **Below 10°C:** Layer up! Warm jacket, scarf, gloves\n• **10-15°C:** Light jacket or sweater\n• **15-20°C:** Long sleeves, light layers\n• **20-25°C:** T-shirt weather! ☀️\n• **25-30°C:** Light, breathable clothes\n• **Above 30°C:** Stay cool - shorts, tank tops\n\n**Also consider:**\n• Rainy? Waterproof jacket\n• Sunny? Sunglasses & hat\n• Windy? Windbreaker";
  }
  
  // === FORECAST ===
  if (lower.includes('forecast') || lower.includes('7-day') || lower.includes('7 day') || lower.includes('week') || lower.includes('next few days')) {
    return "📅 **7-Day Forecast**\n\nYou can view the complete forecast on the **Dashboard**:\n• Daily high and low temperatures\n• Weather conditions for each day\n• Helpful icons showing what to expect\n\n**To access:** Click the Dashboard icon (grid) in the sidebar.\n\nWant me to explain anything specific about the forecast?";
  }
  
  // === TOMORROW ===
  if (lower.includes('tomorrow')) {
    return "🌤️ **Tomorrow's Weather**\n\nTo check tomorrow:\n1. Go to the **Dashboard** (first icon in sidebar)\n2. Look at the **second card** in the 7-day forecast\n3. You'll see the predicted high/low temps and conditions\n\n**Planning something?** Let me know and I can give you specific advice!";
  }
  
  // === SAFE TO GO OUTSIDE ===
  if (lower.includes('safe') || lower.includes('outside') || lower.includes('go out') || lower.includes('outdoor')) {
    return "🚶 **Is It Safe to Go Outside?**\n\nCheck these indicators:\n\n**✅ Safe conditions:**\n• UV Index below 6\n• Air Quality: Good/Moderate\n• Wind speed under 30 km/h\n• Low rain probability\n\n**⚠️ Be cautious if:**\n• UV Index above 8 (use sunscreen!)\n• Air Quality: Poor\n• Strong winds above 50 km/h\n• Storm warnings\n\nAll this info is in the **Highlights** section!";
  }
  
  // === TEMPERATURE ===
  if (lower.includes('hot') || lower.includes('cold') || lower.includes('temperature') || lower.includes('temp') || lower.includes('degrees')) {
    return "🌡️ **Temperature Info**\n\nThe **current temperature** is shown on the right panel.\n\n**Key things to know:**\n• **Actual temp:** What thermometers show\n• **Feels like:** Accounts for humidity & wind\n• **Daily high/low:** Expected range for the day\n\n**Feels Like** is often more useful for planning - it tells you how your body will actually perceive the temperature!";
  }
  
  // === UV INDEX ===
  if (lower.includes('uv') || lower.includes('sunscreen') || lower.includes('sunburn') || lower.includes('sun protection')) {
    return "☀️ **UV Index Guide**\n\n• **0-2 (Low):** No protection needed\n• **3-5 (Moderate):** Wear sunscreen SPF 30+\n• **6-7 (High):** Limit midday sun exposure\n• **8-10 (Very High):** Extra protection essential\n• **11+ (Extreme):** Avoid outdoor activities\n\n**Protection tips:**\n• Apply sunscreen 15 min before going out\n• Reapply every 2 hours\n• Wear sunglasses and a hat\n• Seek shade during peak hours (10am-4pm)";
  }
  
  // === SUNRISE/SUNSET ===
  if (lower.includes('sunrise') || lower.includes('sunset') || (lower.includes('sun') && (lower.includes('up') || lower.includes('down') || lower.includes('rise') || lower.includes('set')))) {
    return "🌅 **Sunrise & Sunset Times**\n\nYou can find these in the **Highlights** section on the Dashboard.\n\n**Why it matters:**\n• Plan outdoor photography 📸\n• Schedule morning workouts 🏃\n• Know when it gets dark\n• Golden hour for best lighting!\n\n**Fun fact:** The period just after sunrise and before sunset is called the 'golden hour' - perfect for photos!";
  }
  
  // === WIND ===
  if (lower.includes('wind') || lower.includes('windy') || lower.includes('breezy') || lower.includes('gust')) {
    return "💨 **Wind Conditions**\n\n**Wind Speed Guide:**\n• **0-10 km/h:** Calm, smoke rises vertically\n• **10-20 km/h:** Light breeze, leaves rustle\n• **20-40 km/h:** Moderate, small branches move\n• **40-60 km/h:** Strong, umbrellas difficult\n• **60+ km/h:** Very strong, walking difficult\n\n**Activities affected by wind:**\n• Cycling 🚴\n• Outdoor dining 🍽️\n• Flying drones 🚁\n• Hairstyles 💇";
  }
  
  // === HUMIDITY ===
  if (lower.includes('humidity') || lower.includes('humid') || lower.includes('muggy') || lower.includes('sticky')) {
    return "💧 **Humidity Levels**\n\n**What humidity means:**\n• **Below 30%:** Very dry (may irritate skin)\n• **30-50%:** Ideal, comfortable\n• **50-70%:** Slightly humid\n• **Above 70%:** Very humid, feels warmer\n\n**High humidity effects:**\n• Feels hotter than actual temp\n• Sweat doesn't evaporate well\n• Hair gets frizzy 😅\n• More energy needed to stay cool\n\n**Tip:** On humid days, stay hydrated and wear breathable fabrics!";
  }
  
  // === AIR QUALITY ===
  if (lower.includes('air') || lower.includes('pollution') || lower.includes('quality') || lower.includes('aqi') || lower.includes('smog')) {
    return "🌬️ **Air Quality Information**\n\n**AQI Levels:**\n• **Good (0-50):** Perfect for outdoor activities ✅\n• **Moderate (51-100):** Acceptable for most\n• **Unhealthy for Sensitive (101-150):** Limit prolonged outdoor\n• **Unhealthy (151-200):** Reduce outdoor activity\n• **Very Unhealthy (201+):** Stay indoors\n\n**Sensitive groups:** Children, elderly, those with respiratory conditions should be extra careful on poor air quality days.";
  }
  
  // === PRESSURE ===
  if (lower.includes('pressure') || lower.includes('barometer') || lower.includes('hpa') || lower.includes('millibar')) {
    return "📊 **Atmospheric Pressure**\n\nNormal pressure is around **1013 hPa**.\n\n**What it tells us:**\n• **Rising pressure:** Good weather coming ☀️\n• **Falling pressure:** Storms may approach 🌧️\n• **Stable pressure:** Weather staying same\n\n**Did you know?** Some people feel headaches or joint pain when pressure changes rapidly!";
  }
  
  // === SNOW ===
  if (lower.includes('snow') || lower.includes('blizzard') || lower.includes('sleet') || lower.includes('frost')) {
    return "❄️ **Snow & Winter Weather**\n\nWhen snow is expected:\n• Check the temperature (needs to be around 0°C)\n• Look for snowflake icons in forecast\n• Prepare warm clothing layers\n\n**Winter safety tips:**\n• Wear waterproof boots\n• Layer clothing for warmth\n• Be careful on icy surfaces\n• Keep your phone charged";
  }
  
  // === STORM/THUNDER ===
  if (lower.includes('storm') || lower.includes('thunder') || lower.includes('lightning')) {
    return "⛈️ **Storm Safety**\n\n**During thunderstorms:**\n• Stay indoors if possible\n• Avoid open fields & tall trees\n• Unplug electronic devices\n• Stay away from windows\n\n**Lightning safety:** The 30/30 rule - if time between lightning and thunder is less than 30 seconds, seek shelter. Wait 30 minutes after the last thunder before going outside.";
  }
  
  // === THANKS ===
  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('thx') || lower.includes('appreciate')) {
    const thanks = [
      "You're very welcome! 😊 I'm always here if you have more weather questions!",
      "Happy to help! 🌟 Feel free to ask me anything else about the weather!",
      "My pleasure! ☀️ Don't hesitate to come back anytime you need weather info!"
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }
  
  // === GOODBYE ===
  if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you') || lower.includes('later') || lower.includes('gotta go')) {
    return "Goodbye! 👋 Stay safe out there!\n\nRemember:\n• Check the weather before heading out\n• I'm here 24/7 whenever you need me\n\nHave an amazing day! 🌈";
  }
  
  // === HELP ===
  if (lower.includes('help') || lower.includes('what can you do') || lower.includes('features') || lower.includes('options')) {
    return "🤖 **I can help you with:**\n\n**Weather Info:**\n• Current conditions\n• 7-day forecasts\n• Rain predictions\n• Temperature details\n\n**Recommendations:**\n• What to wear\n• Is it safe to go out?\n• Best time for activities\n\n**Education:**\n• UV Index explained\n• Humidity effects\n• Weather phenomena\n\nJust ask me anything in natural language!";
  }
  
  // === JOKES/FUN ===
  if (lower.includes('joke') || lower.includes('funny') || lower.includes('laugh')) {
    const jokes = [
      "Why did the weather report go to school? 📚\n\nTo improve its **fore-casting**! 😄",
      "What does a cloud wear under their raincoat? ☁️\n\n**Thunderwear!** ⚡😂",
      "Why did the sun go to school? ☀️\n\nTo get a little **brighter**! 🌟"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // === LOVE/FEELINGS ===
  if (lower.includes('love you') || lower.includes('like you') || lower.includes('you are great') || lower.includes('awesome')) {
    return "Aww, thank you! 🥰 That's so kind of you!\n\nI love helping you with weather info! You're pretty awesome yourself for caring about the weather. Stay wonderful! ✨";
  }
  
  // === CURRENT WEATHER ===
  if (lower.includes('current') || lower.includes('right now') || lower.includes('now') || lower.includes('today')) {
    return "🌤️ **Current Weather**\n\nYou can see the current conditions on the **right panel**:\n• Temperature & feels like\n• Weather condition\n• Humidity level\n• Wind speed\n\nThe **Dashboard** also shows hourly forecasts for the rest of today!\n\nAnything specific you'd like to know?";
  }
  
  // === DEFAULT RESPONSE ===
  const defaults = [
    "I'm here to help with weather-related questions! 🌤️\n\n**Try asking me:**\n• Will it rain today?\n• What should I wear?\n• Is it safe to go outside?\n• What's the 7-day forecast?\n• Tell me about UV index\n\nI'm all ears! 👂",
    "Interesting question! 🤔 I'm best at answering weather-related queries.\n\n**I can help with:**\n• Forecasts & predictions\n• Clothing recommendations\n• Weather safety tips\n• Understanding weather data\n\nWhat would you like to know?",
    "I'd love to help! 💬 As a weather assistant, I'm great at:\n\n• Explaining weather conditions\n• Giving outfit suggestions\n• Providing safety tips\n• Interpreting weather data\n\nAsk me anything about the weather!"
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
};

export const chatWithAi = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `User: ${message}\nBot (Short weather answer):` });
    return response.text || getMockResponse(message);
  } catch (error) { 
    // Return helpful mock response when API is unavailable
    return getMockResponse(message);
  }
};
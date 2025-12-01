import { GoogleGenAI } from "@google/genai";
import { WeatherData, WeatherCondition } from "../types";
import { normalizeWeatherIcon } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CACHE_KEY_PREFIX = 'climatix_weather_cache_';
const CACHE_DURATION = 30 * 60 * 1000;

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

// --- Mock Data Generator for Development/Quota Limits ---
const generateMockData = (city: string): WeatherData => {
  return {
    location: city.charAt(0).toUpperCase() + city.slice(1) + " (Dev Mode)",
    lat: 0,
    lon: 0,
    timezone: "UTC",
    dailyTip: "API Quota limit reached. Showing development data to allow UI testing.",
    current: {
      temp: 22,
      feelsLike: 24,
      condition: "Partly Cloudy",
      humidity: 45,
      windSpeed: 12,
      visibility: 10,
      pressure: 1015,
      description: "Partly cloudy with development data",
      sunrise: "06:00",
      sunset: "18:00",
      uvIndex: 4,
      airQuality: "Good",
      icon: WeatherCondition.PartlyCloudy,
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        percentage: Math.floor(Math.random() * 30)
      }))
    },
    hourlyForecast: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      temp: 20 + Math.floor(Math.random() * 5),
      condition: "Cloudy",
      icon: WeatherCondition.Cloudy
    })),
    forecast: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
          tempHigh: 25 - i,
          tempLow: 15 - i,
          condition: i % 2 === 0 ? "Sunny" : "Rain",
          icon: i % 2 === 0 ? WeatherCondition.Sunny : WeatherCondition.Rain
        };
    })
  };
};

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  const cleanCity = city.toLowerCase().trim();
  const { data: cachedData, isExpired, entry: fullCacheEntry } = getCachedWeather(cleanCity);
  
  if (cachedData && !isExpired) return cachedData;
  if (pendingRequests.has(cleanCity)) return pendingRequests.get(cleanCity)!;

  const fetchPromise = (async () => {
    try {
      const prompt = `Task: Weather for "${city}". JSON Only.
      Schema: {
        "location": "City, Country", 
        "lat": 0.0, 
        "lon": 0.0, 
        "timezone": "IANA ID", 
        "dailyTip": "Tip", 
        "current": { "temp": 0, "feelsLike": 0, "condition": "Str", "humidity": 0, "windSpeed": 0, "visibility": 0, "pressure": 0, "description": "Str", "sunrise": "HH:MM", "sunset": "HH:MM", "uvIndex": 0, "airQuality": "Str", "hourly": [{"time": "HH:MM", "percentage": 0}] }, 
        "hourlyForecast": [{"time": "HH:MM", "temp": 0, "condition": "Str"}], 
        "forecast": [{"day": "Day D", "tempHigh": 0, "tempLow": 0, "condition": "Str"}]
      }`;

      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      let text = response.text || "";
      
      text = text.trim().replace(/```json/g, '').replace(/```/g, '');
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) text = text.substring(firstBrace, lastBrace + 1);
      
      const parsedData = JSON.parse(text);
      
      const transformedData: WeatherData = {
        location: parsedData.location || city,
        lat: parsedData.lat || 0,
        lon: parsedData.lon || 0,
        timezone: parsedData.timezone || "UTC",
        dailyTip: parsedData.dailyTip || "No tips available.",
        current: { ...parsedData.current, icon: normalizeWeatherIcon(parsedData.current?.condition || "") },
        hourlyForecast: (parsedData.hourlyForecast || []).slice(0, 24).map((hour: any) => ({ ...hour, icon: normalizeWeatherIcon(hour.condition || "") })),
        forecast: (parsedData.forecast || []).slice(0, 7).map((day: any) => ({ ...day, icon: normalizeWeatherIcon(day.condition || "") }))
      };
      
      setCachedWeather(cleanCity, transformedData);
      return transformedData;
    } catch (error: any) {
      // 1. Try Stale Cache
      if (fullCacheEntry) {
        return { ...fullCacheEntry.data, dailyTip: "⚠️ Using cached data (Network/API Error)." };
      }

      // 2. Check for Quota Limit (429) -> Return Mock Data for Development
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
         console.warn("Quota exceeded. Returning mock data for development.");
         return generateMockData(city);
      }
      
      console.error("Fetch failed:", error);
      // Fallback to mock data for other critical errors during dev to keep app usable
      return generateMockData(city);
    } finally {
      pendingRequests.delete(cleanCity);
    }
  })();

  pendingRequests.set(cleanCity, fetchPromise);
  return fetchPromise;
};

export const chatWithAi = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `User: ${message}\nBot (Short weather answer):` });
    return response.text || "I'm offline.";
  } catch (error) { return "I can't answer right now (Quota Exceeded)."; }
};
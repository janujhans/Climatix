
import { WeatherCondition, Unit } from './types';

// Helper to normalize the icon string from the AI to our enum
export const normalizeWeatherIcon = (iconStr: string): WeatherCondition => {
  const lower = iconStr.toLowerCase();
  if (lower.includes('snow')) return WeatherCondition.Snow;
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) return WeatherCondition.Rain;
  if (lower.includes('storm') || lower.includes('thunder')) return WeatherCondition.Storm;
  if (lower.includes('fog') || lower.includes('mist')) return WeatherCondition.Fog;
  if (lower.includes('cloud') && lower.includes('partly')) return WeatherCondition.PartlyCloudy;
  if (lower.includes('cloud')) return WeatherCondition.Cloudy;
  if (lower.includes('wind')) return WeatherCondition.Windy;
  if (lower.includes('clear')) return WeatherCondition.Clear;
  if (lower.includes('sunny')) return WeatherCondition.Sunny;
  return WeatherCondition.Cloudy; // Default
};

// --- Conversion Helpers ---

export const getTemp = (temp: number, unit: Unit): number => {
  if (unit === 'metric') return Math.round(temp);
  return Math.round((temp * 9/5) + 32);
};

export const getSpeed = (speedKmh: number, unit: Unit): number => {
  if (unit === 'metric') return Math.round(speedKmh);
  return Math.round(speedKmh * 0.621371);
};

export const getDistance = (km: number, unit: Unit): number => {
  if (unit === 'metric') return Math.round(km);
  return parseFloat((km * 0.621371).toFixed(1));
};

export const getTempUnit = (unit: Unit) => unit === 'metric' ? '°C' : '°F';
export const getSpeedUnit = (unit: Unit) => unit === 'metric' ? 'km/h' : 'mph';
export const getDistUnit = (unit: Unit) => unit === 'metric' ? 'km' : 'mi';

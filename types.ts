
export type View = 'dashboard' | 'map' | 'saved' | 'compare' | 'ai' | 'settings';
export type Theme = 'light' | 'dark' | 'system';
export type Unit = 'metric' | 'imperial';

export interface ForecastDay {
  day: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon: WeatherCondition;
}

export interface HourlyPrecipitation {
  time: string;
  percentage: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: WeatherCondition;
}

export interface CurrentWeather {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  icon: WeatherCondition;
  description: string;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  airQuality: string;
  visibility: number;
  pressure: number;
  hourly: HourlyPrecipitation[];
}

export interface WeatherData {
  location: string;
  lat: number;
  lon: number;
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  hourlyForecast: HourlyForecast[];
  dailyTip: string;
}

export enum WeatherCondition {
  Sunny = 'sunny',
  Cloudy = 'cloudy',
  PartlyCloudy = 'partly-cloudy',
  Rain = 'rain',
  Snow = 'snow',
  Storm = 'storm',
  Windy = 'windy',
  Fog = 'fog',
  Clear = 'clear',
  Mist = 'mist',
}

export interface SearchState {
  query: string;
  loading: boolean;
  error: string | null;
  data: WeatherData | null;
}

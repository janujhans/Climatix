import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  CloudFog, 
  CloudSun,
  Moon
} from 'lucide-react';
import { WeatherCondition } from '../types';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
  size?: number;
  animated?: boolean;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "", size = 24, animated = false }) => {
  
  const getAnimationClass = (cond: WeatherCondition) => {
    if (!animated) return '';
    switch (cond) {
      case WeatherCondition.Sunny:
        return 'animate-spin-slow';
      case WeatherCondition.Clear:
        return 'animate-pulse';
      case WeatherCondition.Cloudy:
      case WeatherCondition.PartlyCloudy:
      case WeatherCondition.Fog:
      case WeatherCondition.Mist:
        return 'animate-icon-float';
      case WeatherCondition.Rain:
      case WeatherCondition.Snow:
      case WeatherCondition.Storm:
        return 'animate-icon-float';
      case WeatherCondition.Windy:
        return 'animate-icon-shake';
      default:
        return '';
    }
  };

  const animClass = getAnimationClass(condition);

  switch (condition) {
    case WeatherCondition.Sunny:
      return <Sun className={`text-yellow-400 ${className} ${animClass}`} size={size} />;
    case WeatherCondition.Clear:
      return <Moon className={`text-blue-200 dark:text-blue-100 ${className} ${animClass}`} size={size} />;
    case WeatherCondition.Cloudy:
      return <Cloud className={`text-gray-400 ${className} ${animClass}`} size={size} />;
    case WeatherCondition.PartlyCloudy:
      return <CloudSun className={`text-yellow-200 ${className} ${animClass}`} size={size} />;
    case WeatherCondition.Rain:
      return <CloudRain className={`text-blue-400 ${className} ${animClass}`} size={size} />;
    case WeatherCondition.Snow:
      return <CloudSnow className={`text-white ${className} ${animClass}`} size={size} />;
    case WeatherCondition.Storm:
      return <CloudLightning className={`text-purple-400 ${className} ${animClass}`} size={size} />;
    case WeatherCondition.Windy:
      return <Wind className={`text-gray-300 ${className} ${animClass}`} size={size} />;
    case WeatherCondition.Fog:
    case WeatherCondition.Mist:
      return <CloudFog className={`text-gray-300 ${className} ${animClass}`} size={size} />;
    default:
      return <Sun className={`text-yellow-400 ${className} ${animClass}`} size={size} />;
  }
};

export default WeatherIcon;
import React, { useMemo } from 'react';
import { WeatherCondition } from '../types';

interface BackgroundEffectsProps {
  isNight: boolean;
  condition?: WeatherCondition;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ isNight, condition }) => {

  // --- Theme Configuration ---
  const theme = useMemo(() => {
    if (isNight) {
      return {
        bg: 'bg-slate-950', // Deep dark base
        blob1: 'bg-indigo-900',
        blob2: 'bg-blue-900',
        blob3: 'bg-purple-950',
        blobOpacity: 'opacity-40'
      };
    } else {
      // Vibrant Day Themes with Gradient Animation
      // Using bold, shifting hues for a "fresh, bright, and visually engaging" look
      if (condition === WeatherCondition.Rain || condition === WeatherCondition.Storm) {
        return {
          bg: 'bg-gradient-to-br from-blue-700 via-indigo-600 to-teal-500 animate-gradient-xy', // Bold Deep Storm
          blob1: 'bg-indigo-400',
          blob2: 'bg-blue-400',
          blob3: 'bg-teal-400',
          blobOpacity: 'opacity-30'
        };
      } else if (condition === WeatherCondition.Cloudy || condition === WeatherCondition.PartlyCloudy) {
         return {
          bg: 'bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-300 animate-gradient-xy', // Vibrant Overcast
          blob1: 'bg-white',
          blob2: 'bg-blue-200',
          blob3: 'bg-purple-200',
          blobOpacity: 'opacity-40'
        };
      } else {
        // Sunny / Clear Day (Strong, Fresh, Shifting Hues)
        return {
          bg: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-400 animate-gradient-xy', // Fresh Cyan-Blue-Violet shift
          blob1: 'bg-white',
          blob2: 'bg-cyan-200',
          blob3: 'bg-violet-300',
          blobOpacity: 'opacity-30'
        };
      }
    }
  }, [isNight, condition]);

  // --- Minimalist Elements ---

  const stars = useMemo(() => {
    if (!isNight) return [];
    return Array.from({ length: 25 }).map((_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, [isNight]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-colors duration-1000 -z-10 ${theme.bg}`}>
      
      {/* 1. Large Wandering Gradient Blobs (The "Modern" Look) */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-wander ${theme.blob1} ${theme.blobOpacity}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-wander-slow ${theme.blob2} ${theme.blobOpacity}`} />
      <div className={`absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full blur-[90px] animate-pulse-glow ${theme.blob3} ${theme.blobOpacity}`} />

      {/* 2. Minimalist Weather Elements */}

      {/* Stars (Night Only) */}
      {isNight && stars.map((star, i) => (
        <div 
          key={`star-${i}`}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            opacity: star.opacity
          }}
        />
      ))}

      {/* Sun Rays (Subtle Rotating Gradient for Day) */}
      {!isNight && (condition === WeatherCondition.Sunny || condition === WeatherCondition.Clear) && (
         <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-spin-slow opacity-40 blur-3xl pointer-events-none" style={{ animationDuration: '60s' }}></div>
      )}

      {/* Fog / Mist (Horizontal Flow) */}
      {(condition === WeatherCondition.Fog || condition === WeatherCondition.Mist) && (
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-fog opacity-30"></div>
      )}
      
    </div>
  );
};

export default BackgroundEffects;
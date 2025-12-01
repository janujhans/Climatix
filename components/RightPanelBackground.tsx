import React, { useMemo } from 'react';
import { CurrentWeather, WeatherCondition } from '../types';

interface RightPanelBackgroundProps {
  current: CurrentWeather;
}

const RightPanelBackground: React.FC<RightPanelBackgroundProps> = ({ current }) => {
  const { temp, condition } = current;
  const desc = current.condition.toLowerCase();

  // --- Helpers for generating particles ---
  const generateParticles = (count: number) => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 3 + 2}s`,
    size: Math.random() * 10 + 5
  }));

  const particles = useMemo(() => generateParticles(15), []);
  
  // --- Condition Logic ---

  // Hot Temperature (> 30°C): Heatwave / Warm Glow
  if (temp > 30) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
           {particles.slice(0, 5).map(p => (
             <div key={p.id} className="absolute bg-orange-400/20 rounded-full blur-xl animate-heat-ripple"
               style={{ left: p.left, top: p.top, width: '40px', height: '40px', animationDelay: p.delay }}
             />
           ))}
        </div>
      </div>
    );
  }

  // Warm Temperature (20°C - 30°C) + Sunny: Gentle Sun Glow
  if (temp > 20 && (current.icon === WeatherCondition.Sunny || current.icon === WeatherCondition.Clear)) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
        <div className="absolute -top-10 -right-10 w-[300px] h-[300px] bg-yellow-400/10 dark:bg-yellow-400/5 rounded-full blur-[60px] animate-spin-slow" style={{ animationDuration: '30s' }}></div>
        <div className="absolute top-20 right-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>
    );
  }

  // Cold Temperature (< 10°C): Cool Blue Glow / Frost
  if (temp < 10 && temp >= 0) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-[80px]"></div>
        {particles.slice(0, 8).map(p => (
           <div key={p.id} className="absolute bg-white/30 dark:bg-white/10 rounded-full blur-md animate-drift"
             style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay }}
           />
        ))}
      </div>
    );
  }

  // Freezing (< 0°C): Ice Crystals / Sharp Blue
  if (temp < 0) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-100/20 to-transparent dark:from-cyan-900/10"></div>
        {particles.map(p => (
           <div key={p.id} className="absolute bg-cyan-300/30 dark:bg-cyan-300/20 rotate-45 animate-ice-sparkle"
             style={{ left: p.left, top: p.top, width: '8px', height: '8px', animationDelay: p.delay }}
           />
        ))}
      </div>
    );
  }

  // Snow: Falling dots
  if (current.icon === WeatherCondition.Snow || desc.includes('snow')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
         {particles.map(p => (
           <div key={p.id} className="absolute bg-slate-300/40 dark:bg-white/20 rounded-full animate-snow"
             style={{ left: p.left, top: '-10px', width: '6px', height: '6px', animationDelay: p.delay, animationDuration: '6s' }}
           />
         ))}
      </div>
    );
  }

  // Storm: Darker + Flashes + Swirls
  if (current.icon === WeatherCondition.Storm || desc.includes('storm')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
        {/* Dark Overlay base */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-gray-900/20 dark:from-indigo-950/30 dark:to-gray-900/30 mix-blend-multiply"></div>
        
        {/* Lightning Flash Layer */}
        <div className="absolute inset-0 bg-white/10 dark:bg-white/5 animate-lightning z-10"></div>
        
        {/* Dark Swirling Cloud Effect */}
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-indigo-900/10 to-transparent animate-spin-slow opacity-60" style={{ animationDuration: '40s' }}></div>
        
        {/* Accent Glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 dark:bg-indigo-500/10 blur-[80px]"></div>
      </div>
    );
  }

  // Windy: Moving air lines
  if (current.icon === WeatherCondition.Windy || current.windSpeed > 20) {
    return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
          {particles.slice(0, 5).map(p => (
            <div key={p.id} className="absolute h-[2px] bg-gray-400/20 dark:bg-white/10 animate-wind rounded-full"
              style={{ top: p.top, width: '100px', left: '-100px', animationDelay: p.delay, animationDuration: '2s' }}
            />
          ))}
       </div>
    );
  }

  // Default: Subtle Ambient
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
      <div className="absolute bottom-[-50px] left-[-50px] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[60px]"></div>
    </div>
  );
};

export default RightPanelBackground;
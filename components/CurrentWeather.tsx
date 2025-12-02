
import React, { useMemo } from 'react';
import { WeatherData, WeatherCondition, Unit } from '../types';
import WeatherIcon from './WeatherIcon';
import { CloudRain } from 'lucide-react';
import { getTemp, getSpeed, getTempUnit, getSpeedUnit } from '../constants';

interface CurrentWeatherProps {
  data: WeatherData;
  unit: Unit;
}

interface WeatherBackgroundProps {
  condition: WeatherCondition;
  temp: number;
  description: string;
  windSpeed: number;
  humidity: number;
}

// ... (WeatherBackground component logic remains unchanged, omitted for brevity as it's large and not logically changed, just imported) ...
// Re-implementing just the CurrentWeather display logic below

// Importing the full WeatherBackground component content from previous context or keeping it as is.
// To satisfy the "Full content" requirement, I must include the full file content.

// --- FULL REPLACEMENT OF FILE TO ENSURE INTEGRITY ---
// Copying previous WeatherBackground logic and replacing the CurrentWeather export.

const WeatherBackground: React.FC<WeatherBackgroundProps> = React.memo(({ condition, temp, description, windSpeed, humidity }) => {
  // ... (Keeping exact same particles logic as before) ...
  const desc = description.toLowerCase();
  const isHeavyRain = humidity > 80 || desc.includes('heavy') || desc.includes('storm');
  const isWindy = windSpeed > 15;
  const isStrongWind = windSpeed > 30;

  const rainDrops = useMemo(() => {
    let baseCount = 50; 
    if (humidity > 0) baseCount = Math.floor(humidity * 0.8);
    if (desc.includes('heavy') || desc.includes('storm') || desc.includes('torrential')) baseCount *= 1.8;
    if (desc.includes('light') || desc.includes('drizzle')) baseCount *= 0.5;
    const count = Math.min(200, Math.max(20, Math.floor(baseCount)));

    return Array.from({ length: count }).map((_, i) => {
      const humidityFactor = humidity / 100;
      const baseDuration = 0.8 - (humidityFactor * 0.5);
      const isHeavy = desc.includes('heavy') || desc.includes('storm');
      const widthVal = isHeavy ? (2 + Math.random()) : (1 + Math.random());
      const heightVal = isHeavy ? (25 + Math.random() * 20) : (15 + Math.random() * 10);
      
      return {
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${Math.max(0.25, baseDuration + Math.random() * 0.2)}s`,
        width: `${widthVal}px`,
        height: `${heightVal}px`,
        opacity: Math.max(0.3, Math.random() * 0.5 + (humidityFactor * 0.2))
      };
    });
  }, [humidity, desc]);
  
  const drizzleDrops = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${1.5 + Math.random() * 0.5}s`
  })), []);

  const snowFlakes = useMemo(() => {
    const count = desc.includes('heavy') || desc.includes('blizzard') || temp < -10 ? 60 : 30;
    return Array.from({ length: count }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: isStrongWind ? `${0.5 + Math.random()}s` : `${3 + Math.random() * 3}s`,
      size: Math.random() * 6 + 4
    }));
  }, [desc, temp, isStrongWind]);

  const windLines = useMemo(() => {
    const count = Math.min(20, Math.floor(windSpeed / 3) + 5);
    return Array.from({ length: count }).map((_, i) => ({
      top: `${10 + Math.random() * 80}%`,
      width: `${50 + Math.random() * 150}px`,
      delay: `${Math.random() * 2}s`,
      duration: `${Math.max(0.3, 20 / (windSpeed || 1))}s`,
      opacity: 0.2 + Math.random() * 0.4
    }));
  }, [windSpeed]);
  
  const windSwirls = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    top: `${Math.random() * 90}%`,
    left: `${Math.random() * 90}%`,
    size: 40 + Math.random() * 60,
    duration: 3 + Math.random() * 3,
    delay: `${Math.random() * 2}s`,
    opacity: 0.1 + Math.random() * 0.2
  })), []);

  const clouds = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
    top: `${5 + Math.random() * 50}%`,
    left: `${Math.random() * 80}%`,
    scale: 0.8 + Math.random() * 0.6,
    opacity: 0.3 + Math.random() * 0.3,
  })), []);
  
  const denseClouds = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    top: `${Math.random() * 80 - 10}%`,
    left: `${Math.random() * 110 - 20}%`,
    width: `${180 + Math.random() * 220}px`,
    height: `${100 + Math.random() * 120}px`,
    opacity: 0.3 + Math.random() * 0.5,
    duration: `${20 + Math.random() * 20}s`,
    delay: `${Math.random() * -20}s`,
    color: Math.random() > 0.6 ? 'bg-white' : Math.random() > 0.3 ? 'bg-slate-100' : 'bg-blue-50',
    blur: Math.random() > 0.5 ? 'blur-3xl' : 'blur-2xl'
  })), []);

  const iceCrystals = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`
  })), []);

  const heatRipples = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({
    left: `${10 + Math.random() * 80}%`,
    delay: `${Math.random() * 2}s`
  })), []);

  const breathFog = useMemo(() => Array.from({ length: 3 }).map((_, i) => ({
    left: `${30 + Math.random() * 40}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${4 + Math.random()}s`
  })), []);

  const sunRays = useMemo(() => Array.from({ length: 12 }), []);

  const stars = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    delay: `${Math.random() * 3}s`
  })), []);

  if (desc.includes('tornado') || desc.includes('cyclone') || desc.includes('hurricane')) {
    return (
      <>
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-48 h-[120%] bg-gradient-to-b from-gray-700 via-gray-500 to-transparent blur-xl animate-tornado opacity-60"></div>
        <div className="absolute inset-0 bg-gray-900/30"></div>
        {windLines.map((line, i) => (
           <div key={i} className="absolute h-[2px] bg-white/40 animate-wind" style={{ top: line.top, width: line.width, animationDuration: '0.4s' }} />
        ))}
      </>
    );
  }

  if (desc.includes('rainbow')) {
    return (
      <>
        <div className="absolute -top-10 left-10 w-[120%] h-[600px] rounded-[100%] border-[40px] border-t-red-500/30 border-r-transparent border-b-transparent border-l-transparent blur-3xl animate-rainbow"></div>
        <div className="absolute -top-5 left-10 w-[115%] h-[580px] rounded-[100%] border-[40px] border-t-yellow-500/30 border-r-transparent border-b-transparent border-l-transparent blur-3xl animate-rainbow" style={{ animationDelay: '0.1s' }}></div>
        <div className="absolute top-0 left-10 w-[110%] h-[560px] rounded-[100%] border-[40px] border-t-blue-500/30 border-r-transparent border-b-transparent border-l-transparent blur-3xl animate-rainbow" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-100/20 rounded-full blur-3xl animate-pulse"></div>
      </>
    );
  }

  if ((condition === WeatherCondition.Sunny) && temp > 35) {
     return (
       <>
         <div className="absolute -top-20 -right-20 w-[150%] h-[150%] bg-gradient-to-br from-orange-500/30 to-transparent rounded-full animate-sun-pulse blur-3xl"></div>
         <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-200/40 rounded-full blur-2xl animate-pulse z-0"></div>
         <div className="absolute -top-32 -right-32 w-[600px] h-[600px] animate-spin-slow pointer-events-none" style={{ animationDuration: '80s' }}>
             {sunRays.map((_, i) => (
               <div 
                 key={i}
                 className="absolute top-1/2 left-1/2 w-[55%] h-[8px] bg-gradient-to-r from-orange-300/40 to-transparent origin-left animate-pulse"
                 style={{ 
                   transform: `rotate(${i * 30}deg)`,
                   animationDelay: `${i * 0.2}s`,
                   animationDuration: '4s'
                 }}
               />
             ))}
         </div>
         <div className="absolute inset-0 overflow-hidden">
            {heatRipples.map((ripple, i) => (
               <div key={i} className="absolute bottom-0 w-20 h-20 bg-orange-300/10 rounded-full blur-xl animate-heat-ripple" 
                    style={{ left: ripple.left, animationDelay: ripple.delay }} />
            ))}
         </div>
       </>
     );
  }

  if (desc.includes('ice') || desc.includes('freezing') || (temp <= 0 && (condition === WeatherCondition.Clear || condition === WeatherCondition.Snow))) {
     return (
       <>
         <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 to-cyan-200/20"></div>
         {iceCrystals.map((crystal, i) => (
            <div key={i} className="absolute w-6 h-6 bg-white/40 rotate-45 blur-sm animate-ice-sparkle"
                 style={{ top: crystal.top, left: crystal.left, animationDelay: crystal.delay }} />
         ))}
         {breathFog.map((fog, i) => (
            <div key={i} className="absolute bottom-10 w-32 h-20 bg-white/20 rounded-full blur-2xl animate-breath-fog"
                 style={{ left: fog.left, animationDelay: fog.delay, animationDuration: fog.duration }} />
         ))}
         {condition === WeatherCondition.Snow && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {snowFlakes.slice(0, 15).map((flake, i) => (
                <div key={i} className="absolute top-[-10px] bg-white/60 rounded-full blur-[1px] animate-snow"
                     style={{ left: flake.left, width: flake.size, height: flake.size, animationDuration: '5s' }} />
              ))}
            </div>
         )}
       </>
     );
  }

  if (condition === WeatherCondition.Storm || desc.includes('storm') || desc.includes('thunder')) {
    return (
      <>
        <div className="absolute inset-0 bg-indigo-900/30 animate-lightning pointer-events-none z-0"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] bg-gray-800/40 rounded-full blur-3xl z-0"></div>
        <div className={`absolute inset-0 overflow-hidden pointer-events-none z-10 ${isWindy ? 'rotate-12 scale-110' : ''}`}>
          {rainDrops.map((drop, i) => (
            <div key={i} className="absolute top-[-20px] bg-gray-200/50 animate-rain"
                 style={{ 
                    left: drop.left, 
                    width: drop.width, 
                    height: drop.height, 
                    opacity: drop.opacity,
                    animationDelay: drop.delay, 
                    animationDuration: drop.duration 
                 }} />
          ))}
        </div>
      </>
    );
  }

  if (condition === WeatherCondition.Snow) {
    return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {snowFlakes.map((flake, i) => (
          <div key={i} className={`absolute top-[-10px] bg-white/80 rounded-full blur-[1px] ${isStrongWind ? 'animate-blizzard' : (temp < -3 ? 'animate-snow' : 'animate-drift')}`}
               style={{ 
                 left: flake.left, 
                 width: flake.size, 
                 height: flake.size, 
                 animationDelay: flake.delay, 
                 animationDuration: flake.duration,
                 top: (!isStrongWind && temp >= -3) ? `${Math.random() * 100}%` : '-10px'
               }} />
        ))}
        {temp >= -3 && !isStrongWind && <div className="absolute inset-0 bg-white/5"></div>}
      </div>
    );
  }

  if (condition === WeatherCondition.Rain) {
    const isLightRain = desc.includes('light') || desc.includes('drizzle');
    if (isLightRain) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {drizzleDrops.map((drop, i) => (
            <div key={i} className="absolute top-[-20px] w-[1px] h-[15px] bg-blue-100/30 animate-drizzle"
                 style={{ left: drop.left, animationDelay: drop.delay, animationDuration: drop.duration }} />
          ))}
          <div className="absolute inset-0 bg-gray-900/10"></div>
        </div>
      );
    } else {
      return (
        <>
          <div className="absolute -top-20 left-0 w-full h-48 bg-gray-700/30 blur-2xl rounded-full"></div>
          <div className={`absolute inset-0 overflow-hidden pointer-events-none ${isWindy ? 'rotate-[15deg] scale-125 origin-top' : ''}`}>
            {rainDrops.map((drop, i) => (
              <div key={i} className="absolute top-[-20px] bg-blue-200/50 animate-rain"
                   style={{ 
                     left: drop.left, 
                     width: drop.width, 
                     height: drop.height,
                     opacity: drop.opacity,
                     animationDelay: drop.delay, 
                     animationDuration: drop.duration 
                   }} />
            ))}
             <div className="absolute inset-0 bg-gray-900/20"></div>
          </div>
        </>
      );
    }
  }

  if (condition === WeatherCondition.Fog || condition === WeatherCondition.Mist) {
    return (
       <>
         <div className="absolute top-[20%] left-[-10%] w-[120%] h-32 bg-white/20 blur-3xl animate-fog" style={{ animationDelay: '0s' }}></div>
         <div className="absolute top-[50%] left-[-10%] w-[120%] h-40 bg-white/10 blur-3xl animate-fog" style={{ animationDelay: '-4s' }}></div>
         <div className="absolute inset-0 bg-white/5"></div>
       </>
    );
  }

  if (condition === WeatherCondition.Windy || isStrongWind || windSpeed > 20) {
     return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {windLines.map((line, i) => (
           <div key={i} className="absolute h-[1px] bg-white/30 animate-wind rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                style={{
                  top: line.top,
                  width: line.width,
                  animationDelay: line.delay,
                  animationDuration: line.duration
                }} />
         ))}
         {windSwirls.map((swirl, i) => (
            <div key={`swirl-${i}`} 
                 className="absolute border-t-[3px] border-l-[1px] border-transparent border-t-white/20 border-l-white/10 rounded-full blur-[0.5px]"
                 style={{
                    top: swirl.top,
                    left: swirl.left,
                    width: `${swirl.size}px`,
                    height: `${swirl.size}px`,
                    opacity: swirl.opacity,
                    animation: `spin-slow ${swirl.duration}s linear infinite`,
                    animationDelay: swirl.delay
                 }}
            />
         ))}
          {clouds.slice(0, 3).map((cloud, i) => (
            <div key={i} className="absolute bg-white/10 rounded-full blur-xl animate-cloud-slide"
                  style={{ top: cloud.top, left: cloud.left, width: '150px', height: '70px', animationDuration: `${300 / (windSpeed || 20)}s` }} />
          ))}
       </div>
     );
  }

  if (condition === WeatherCondition.Cloudy) {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-300/20 via-blue-100/10 to-transparent pointer-events-none"></div>
        {denseClouds.map((cloud, i) => (
           <div key={i} className={`absolute rounded-full ${cloud.blur} ${cloud.color} animate-wander-slow`}
                style={{
                  top: cloud.top,
                  left: cloud.left,
                  width: cloud.width,
                  height: cloud.height,
                  opacity: cloud.opacity,
                  animationDuration: cloud.duration,
                  animationDelay: cloud.delay,
                  transform: 'translateZ(0)'
                }}
           />
        ))}
        <div className="absolute inset-0 bg-gray-500/5 mix-blend-multiply pointer-events-none"></div>
      </>
    );
  }

  if (condition === WeatherCondition.PartlyCloudy) {
     const duration = Math.max(8, 40 - (windSpeed / 2)) + 's';
     return (
        <>
           <div className={`absolute -top-16 -right-16 bg-yellow-100/10 rounded-full blur-2xl w-64 h-64 ${temp > 25 ? 'animate-sun-pulse' : 'opacity-60'}`}></div>
           {clouds.slice(0, 3).map((cloud, i) => (
              <div key={i} className={`absolute bg-white/10 rounded-full blur-xl animate-cloud-slide`}
                   style={{
                     top: cloud.top,
                     left: cloud.left,
                     width: '180px',
                     height: '90px',
                     transform: `scale(${cloud.scale})`,
                     animationDuration: duration
                   }}
              />
           ))}
        </>
      );
  }
  
  if (condition === WeatherCondition.Clear) {
      return (
          <>
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent pointer-events-none"></div>
             {stars.map((star, i) => (
                 <div key={i} className="absolute bg-white rounded-full animate-twinkle"
                      style={{
                          top: `${star.top}%`,
                          left: `${star.left}%`,
                          width: `${star.size}px`,
                          height: `${star.size}px`,
                          animationDelay: star.delay,
                          opacity: 0.7
                      }}
                 />
             ))}
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-100/10 rounded-full blur-2xl"></div>
          </>
      );
  }

  if (condition === WeatherCondition.Sunny) {
    if (temp > 20) {
      const spinDuration = Math.max(15, 60 - temp) + 's';
      return (
        <>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-100/20 rounded-full blur-3xl animate-pulse z-0"></div>
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] animate-spin-slow pointer-events-none" style={{ animationDuration: spinDuration }}>
            {sunRays.map((_, i) => (
              <div 
                key={i}
                className="absolute top-1/2 left-1/2 w-[50%] h-[6px] bg-gradient-to-r from-yellow-200/30 to-transparent origin-left animate-pulse"
                style={{ 
                  transform: `rotate(${i * 30}deg)`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '4s'
                }}
              />
            ))}
            {sunRays.map((_, i) => (
              <div 
                key={`sub-${i}`}
                className="absolute top-1/2 left-1/2 w-[35%] h-[2px] bg-gradient-to-r from-yellow-100/40 to-transparent origin-left"
                style={{ transform: `rotate(${i * 30 + 15}deg)` }}
              />
            ))}
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-yellow-100/60 to-orange-200/10 rounded-full blur-2xl z-10 animate-sun-pulse"></div>
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-gradient-to-br from-yellow-400/5 to-transparent rounded-full blur-3xl z-0"></div>
        </>
      );
    } else {
      return (
        <>
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-yellow-100/10 rounded-full blur-3xl animate-sun-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/0 to-yellow-100/10 opacity-50"></div>
        </>
      );
    }
  }
  
  return <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 to-transparent"></div>;
});

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, unit }) => {
  const { current, location } = data;

  // Convert Units
  const temp = getTemp(current.temp, unit);
  const feelsLike = getTemp(current.feelsLike, unit);
  const windSpeed = getSpeed(current.windSpeed, unit);
  const tempUnit = getTempUnit(unit);
  const speedUnit = getSpeedUnit(unit);

  return (
    <div className="flex flex-col space-y-8 animate-fade-in-up">
      {/* Main Blue Card */}
      <div className="w-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden transition-all z-0">
        
        <WeatherBackground 
          condition={current.icon} 
          temp={current.temp} // Background animations use metric for consistency in logic
          description={current.condition} 
          windSpeed={current.windSpeed}
          humidity={current.humidity}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex flex-col items-center space-y-1 mb-6">
            <div className="flex items-center space-x-2 opacity-90 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm border border-white/10">
               <span className="text-xs font-semibold tracking-wide uppercase">{location}</span>
            </div>
            {/* Show city's local time with GMT offset */}
            <div className="text-white/70 text-xs font-medium">
              🕐 {(() => {
                try {
                  const tz = data.timezone && data.timezone.includes('/') && data.timezone !== 'auto' 
                    ? data.timezone 
                    : undefined;
                  
                  const now = new Date();
                  const time = now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true,
                    timeZone: tz
                  });
                  
                  // Get GMT offset
                  let gmtOffset = '';
                  if (tz) {
                    try {
                      const offsetFormatter = new Intl.DateTimeFormat('en-US', {
                        timeZone: tz,
                        timeZoneName: 'shortOffset'
                      });
                      const parts = offsetFormatter.formatToParts(now);
                      const tzPart = parts.find((p) => p.type === 'timeZoneName');
                      if (tzPart) {
                        gmtOffset = ` (${tzPart.value})`;
                      }
                    } catch {}
                  }
                  
                  return `${time}${gmtOffset}`;
                } catch {
                  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                }
              })()}
            </div>
          </div>
          
          <div className="my-2 drop-shadow-2xl filter hover:scale-105 transition-transform duration-300">
            <WeatherIcon condition={current.icon} size={110} className="text-white" animated={true} />
          </div>

          <div className="mb-4 mt-4">
            <div className="text-8xl font-bold tracking-tighter leading-none">{temp}{tempUnit}</div>
            <p className="text-lg font-medium capitalize mt-2 opacity-90">{current.condition}</p>
          </div>

          <div className="w-full border-t border-white/20 mt-6 pt-6 grid grid-cols-3 gap-2">
             <div className="flex flex-col items-center">
                <span className="opacity-70 text-xs mb-1">Feels Like</span>
                <span className="font-semibold text-lg">{feelsLike}°</span>
             </div>
             <div className="flex flex-col items-center border-l border-white/20">
                <span className="opacity-70 text-xs mb-1">Humidity</span>
                <span className="font-semibold text-lg">{current.humidity}%</span>
             </div>
             <div className="flex flex-col items-center border-l border-white/20">
                <span className="opacity-70 text-xs mb-1">Wind</span>
                <span className="font-semibold text-lg">{windSpeed} <span className="text-xs font-normal">{speedUnit}</span></span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
         <h4 className="text-gray-800 dark:text-gray-200 font-bold mb-4 ml-1">Chance of Rain</h4>
         <div className="flex flex-col space-y-3">
            {current.hourly && current.hourly.length > 0 ? (
              current.hourly.map((hour, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-default group">
                   <div className="flex items-center flex-1">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-12 shrink-0">{hour.time}</span>
                      <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                         <div className="bg-blue-500 dark:bg-blue-400 h-4 rounded-full transition-all duration-500" style={{ width: `${hour.percentage}%` }}></div>
                      </div>
                   </div>
                   <div className="flex items-center space-x-2 shrink-0 w-16 justify-end">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{hour.percentage}%</span>
                      <CloudRain size={16} className="text-blue-400 dark:text-blue-400" />
                   </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm p-2">No rain expected soon.</div>
            )}
         </div>
      </div>
    </div>
  );
};

export default React.memo(CurrentWeather);

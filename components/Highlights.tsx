import React, { useRef } from 'react';
import { CurrentWeather, HourlyForecast, Unit } from '../types';
import { Sunrise, Sunset, Wind, Droplets, Eye, ThermometerSun, Gauge, ChevronLeft, ChevronRight } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getTemp, getSpeed, getDistance, getSpeedUnit, getDistUnit } from '../constants';

interface HighlightsProps {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  unit: Unit;
}

const Highlights: React.FC<HighlightsProps> = ({ current, hourly, unit }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll('right');
    }
  };

  const getWindDesc = (speedKmh: number) => {
    if (speedKmh < 5) return "Calm";
    if (speedKmh < 15) return "Light";
    if (speedKmh < 30) return "Moderate";
    if (speedKmh < 50) return "Strong";
    return "Gale";
  };

  const getAirQualityWidth = (aq: string) => {
     if (!aq) return '50%';
     const q = aq.toLowerCase();
     if (q.includes('good')) return '25%';
     if (q.includes('moderate')) return '50%';
     if (q.includes('unhealthy')) return '75%';
     if (q.includes('hazardous') || q.includes('poor')) return '95%';
     return '50%';
  };

  const getAirQualityColor = (aq: string) => {
     if (!aq) return 'bg-green-500 dark:bg-green-400';
     const q = aq.toLowerCase();
     if (q.includes('good')) return 'bg-green-500 dark:bg-green-400';
     if (q.includes('moderate')) return 'bg-yellow-500 dark:bg-yellow-400';
     if (q.includes('unhealthy')) return 'bg-orange-500 dark:bg-orange-400';
     return 'bg-red-500 dark:bg-red-400';
  };

  const aqWidth = getAirQualityWidth(current.airQuality);
  const aqColor = getAirQualityColor(current.airQuality);
  const cardClass = "bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-lg shadow-blue-900/5 dark:shadow-none border border-white/20 dark:border-white/5 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-default animate-fade-in-up backdrop-blur-md";

  // Conversions
  const windSpeed = getSpeed(current.windSpeed, unit);
  const speedUnit = getSpeedUnit(unit);
  const visibility = getDistance(current.visibility || 10, unit);
  const distUnit = getDistUnit(unit);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in" role="region" aria-label="Today's Highlights">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm">Today's Highlights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* UV Index */}
        <div className={cardClass} style={{ animationDelay: '0ms' }}>
           <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600 dark:text-gray-400 font-bold">UV Index</span>
              <ThermometerSun className="text-amber-500" size={28} aria-hidden="true" />
           </div>
           <div className="flex flex-col items-center justify-center mt-2">
              <div 
                className="relative w-full h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden" 
                role="progressbar" 
                aria-valuenow={current.uvIndex} 
                aria-valuemin={0} 
                aria-valuemax={11} 
              >
                 <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 w-full opacity-30"></div>
                 <div 
                   className="absolute top-0 h-full w-2 bg-white border border-amber-500 rounded-full shadow-md transform -translate-x-1/2 transition-all duration-1000"
                   style={{ left: `${Math.min((current.uvIndex / 11) * 100, 100)}%` }}
                 ></div>
              </div>
              <div className="flex flex-col items-center mt-4">
                 <span className="text-4xl font-black text-gray-800 dark:text-white leading-none">{current.uvIndex}</span>
                 <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold mt-2">
                   {current.uvIndex <= 2 ? 'Low' : current.uvIndex <= 5 ? 'Moderate' : current.uvIndex <= 7 ? 'High' : 'Very High'}
                 </span>
              </div>
           </div>
        </div>

        {/* Wind Status */}
        <div className={`${cardClass} overflow-hidden`} style={{ animationDelay: '100ms' }}>
           <div className="flex justify-between items-start mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-bold">Wind Status</span>
              <Wind className="text-blue-500 dark:text-blue-400" size={28} aria-hidden="true" />
           </div>
           
           <div className="flex items-center justify-between mt-2 mb-4 relative z-10">
              <div className="flex flex-col">
                 <div className="flex items-baseline">
                    <span className="text-4xl font-black text-gray-800 dark:text-white">{windSpeed}</span>
                    <span className="text-xl text-gray-600 dark:text-gray-400 ml-2 font-medium">{speedUnit}</span>
                 </div>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{getWindDesc(current.windSpeed)}</p>
              </div>
           </div>

           <div className="relative h-32 w-full rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-cyan-900/30 overflow-hidden flex items-end justify-center border border-white/20 shadow-inner group">
               <div className="absolute top-4 left-[-20%] w-[140%] h-[1px] bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-wind opacity-50"></div>
               <div className="absolute top-10 left-[-30%] w-[140%] h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-transparent animate-wind opacity-40" style={{ animationDelay: '0.5s' }}></div>
               <div className="absolute top-20 left-[-10%] w-[140%] h-[1px] bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-wind opacity-60" style={{ animationDelay: '1s' }}></div>

               <div className="relative flex flex-col items-center mb-[-5px]">
                  <div 
                    className="w-24 h-24 relative flex justify-center items-center"
                    style={{ animation: `spin-slow ${Math.max(0.5, 20 / (current.windSpeed || 1))}s linear infinite` }}
                  >
                     <div className="absolute w-2 h-24 bg-white dark:bg-gray-300 rounded-full shadow-sm"></div>
                     <div className="absolute w-2 h-24 bg-white dark:bg-gray-300 rounded-full shadow-sm rotate-[60deg]"></div>
                     <div className="absolute w-2 h-24 bg-white dark:bg-gray-300 rounded-full shadow-sm rotate-[120deg]"></div>
                     <div className="absolute w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full z-10"></div>
                  </div>
                  <div className="w-1.5 h-16 bg-gray-300 dark:bg-gray-500 rounded-full mt-[-10px] shadow-sm"></div>
               </div>
           </div>
        </div>

        {/* Sunrise & Sunset */}
        <div className={`${cardClass} group overflow-hidden relative`} style={{ animationDelay: '200ms' }}>
           <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="text-gray-600 dark:text-gray-400 font-bold">Sunrise & Sunset</span>
           </div>
           
           <div className="relative h-44 w-full rounded-3xl overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-sky-50 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 border border-white/20 dark:border-white/5 shadow-inner flex flex-col items-center">
              <div className="absolute top-4 left-10 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute top-10 left-24 w-0.5 h-0.5 bg-white rounded-full opacity-50"></div>
              <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-white rounded-full opacity-30"></div>
              <div className="absolute top-12 right-20 w-1 h-1 bg-white rounded-full opacity-40"></div>
              <div className="absolute -bottom-12 w-52 h-52 border-[2px] border-dashed border-white/40 dark:border-white/20 rounded-full z-0"></div>
              <div className="absolute bottom-[4.5rem] w-full h-[1px] bg-white/30 dark:bg-white/10 z-0"></div>
              <div className="absolute -bottom-12 w-52 h-52 flex justify-center items-center">
                  <div className="w-full h-full animate-sun-path-cycle relative">
                     <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 w-7 h-7 bg-gradient-to-br from-yellow-100 to-amber-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.9)] ring-2 ring-white/50 z-10"></div>
                  </div>
              </div>
              <div className="absolute bottom-0 w-full h-16 bg-white/30 dark:bg-black/20 backdrop-blur-md border-t border-white/20 flex justify-between items-center px-4 z-20">
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold tracking-widest text-slate-700 dark:text-slate-400 uppercase mb-1">Rise</span>
                    <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg shadow-sm">
                       <Sunrise size={14} className="text-amber-600 dark:text-amber-400" />
                       <span className="text-xs font-bold text-slate-800 dark:text-white">{current.sunrise}</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold tracking-widest text-slate-700 dark:text-slate-400 uppercase mb-1">Set</span>
                    <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg shadow-sm">
                       <Sunset size={14} className="text-orange-600 dark:text-orange-400" />
                       <span className="text-xs font-bold text-slate-800 dark:text-white">{current.sunset}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Humidity */}
        <div className={cardClass} style={{ animationDelay: '300ms' }}>
           <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600 dark:text-gray-400 font-bold">Humidity</span>
              <Droplets className="text-blue-400 dark:text-blue-400" size={28} aria-hidden="true" />
           </div>
           <div className="flex flex-col mt-2">
              <div className="flex items-baseline">
                 <span className="text-4xl font-black text-gray-800 dark:text-white">{current.humidity}</span>
                 <span className="text-xl text-gray-600 dark:text-gray-400 ml-1 font-medium">%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">The dew point is {getTemp(Math.round(current.temp - ((100 - current.humidity) / 5)), unit)}°</p>
           </div>
        </div>

        {/* Visibility */}
        <div className={cardClass} style={{ animationDelay: '400ms' }}>
           <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600 dark:text-gray-400 font-bold">Visibility</span>
              <Eye className="text-teal-500 dark:text-teal-400" size={28} aria-hidden="true" />
           </div>
           <div className="flex flex-col mt-2">
              <div className="flex items-baseline">
                 <span className="text-4xl font-black text-gray-800 dark:text-white">{visibility}</span>
                 <span className="text-xl text-gray-600 dark:text-gray-400 ml-2 font-medium">{distUnit}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Haze is affecting visibility</p>
           </div>
        </div>

        {/* Air Quality */}
        <div className={cardClass} style={{ animationDelay: '500ms' }}>
           <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600 dark:text-gray-400 font-bold" id="aqi-label">Air Quality</span>
              <Gauge className={`text-gray-400 ${aqColor.replace('bg-', 'text-')}`} size={28} aria-hidden="true" />
           </div>
           <div className="flex flex-col mt-auto">
              <div className="flex items-baseline mb-4">
                 <span className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">{current.airQuality}</span>
              </div>
              <div 
                className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden" 
                role="progressbar" 
                aria-label="Air Quality Level"
              >
                 <div className={`${aqColor} h-2 rounded-full transition-all duration-1000 ease-out`} style={{ width: aqWidth }}></div>
              </div>
           </div>
        </div>

        {/* Hourly Forecast */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-lg shadow-blue-900/5 dark:shadow-none border border-white/20 dark:border-white/5 transition-colors animate-fade-in-up flex flex-col justify-center backdrop-blur-md" style={{ animationDelay: '600ms' }}>
           <div className="flex justify-between items-center mb-6">
              <h4 className="text-gray-700 dark:text-gray-300 font-bold" id="hourly-heading">Hourly Forecast</h4>
              <div className="flex space-x-2">
                 <button 
                   onClick={() => scroll('left')}
                   className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-sm"
                   aria-label="Scroll hourly forecast left"
                 >
                   <ChevronLeft size={18} />
                 </button>
                 <button 
                   onClick={() => scroll('right')}
                   className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-sm"
                   aria-label="Scroll hourly forecast right"
                 >
                   <ChevronRight size={18} />
                 </button>
              </div>
           </div>
           
           <div 
             ref={scrollRef}
             className="flex space-x-4 overflow-x-auto pb-4 pt-4 scroll-smooth snap-x px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 rounded-xl"
             style={{
               scrollbarWidth: 'none',
             }}
             tabIndex={0}
             role="list"
             aria-labelledby="hourly-heading"
             onKeyDown={handleKeyDown}
           >
              {hourly && hourly.length > 0 ? (
                hourly.map((hour, i) => (
                  <div 
                    key={i} 
                    className="group flex flex-col items-center min-w-[90px] snap-start animate-fade-in-up 
                    bg-gray-50/50 dark:bg-slate-700/50 backdrop-blur-sm
                    hover:bg-blue-50 dark:hover:bg-slate-600
                    border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/50
                    transition-all duration-300 ease-out
                    transform hover:scale-105 hover:-translate-y-1
                    cursor-default py-4 px-2 rounded-3xl shadow-sm hover:shadow-lg"
                    style={{ animationDelay: `${i * 30 + 600}ms`, opacity: 0, willChange: 'transform, opacity' }}
                    role="listitem"
                  >
                     <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{hour.time}</span>
                     
                     <div className="mb-2 transform transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-md">
                        <WeatherIcon condition={hour.icon} size={28} />
                     </div>
                     
                     <span className="text-lg font-black text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors mb-2">{getTemp(hour.temp, unit)}°</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm p-4">Hourly forecast unavailable</div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(Highlights);
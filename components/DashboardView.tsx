
import React, { useMemo } from 'react';
import { SearchState, Theme, Unit } from '../types';
import ForecastList from './ForecastList';
import Highlights from './Highlights';
import BackgroundEffects from './BackgroundEffects';
import { Sun, Moon, Sunrise, Sunset, AlertTriangle, CloudOff, Lightbulb } from 'lucide-react';

interface DashboardViewProps {
  weatherState: SearchState;
  currentTime: Date;
  theme: Theme;
  onToggleTheme: () => void;
  unit: Unit;
}

const DashboardView: React.FC<DashboardViewProps> = ({ weatherState, currentTime, theme, onToggleTheme, unit }) => {
  // Get the city's timezone from weather data - ensure it's a valid IANA timezone
  const rawTimezone = weatherState.data?.timezone;
  
  // Validate timezone is a proper IANA format (contains '/') and is not 'auto'
  const isValidTimezone = rawTimezone && rawTimezone.includes('/') && rawTimezone !== 'auto';
  const cityTimezone = isValidTimezone ? rawTimezone : undefined;
  
  // Debug timezone
  console.log('Weather data timezone:', rawTimezone, '| Valid:', isValidTimezone, '| Using:', cityTimezone || 'local');
  
  // Calculate city time using useMemo for performance
  const { formattedTime, formattedDate, cityHour, gmtOffset } = useMemo(() => {
    const now = new Date();
    
    try {
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      };
      
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      };
      
      if (cityTimezone) {
        timeOptions.timeZone = cityTimezone;
        dateOptions.timeZone = cityTimezone;
      }
      
      const time = now.toLocaleTimeString('en-US', timeOptions);
      const date = now.toLocaleDateString('en-US', dateOptions);
      
      // Get GMT offset for the timezone
      let offset = '';
      if (cityTimezone) {
        try {
          // Get the timezone offset in the format like "GMT+11" or "GMT-5"
          const offsetFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: cityTimezone,
            timeZoneName: 'shortOffset'
          });
          const parts = offsetFormatter.formatToParts(now);
          const tzPart = parts.find((p) => p.type === 'timeZoneName');
          if (tzPart) {
            offset = tzPart.value; // e.g., "GMT+11"
          }
        } catch (e) {
          // Fallback: calculate offset manually
          try {
            const localTime = now.getTime();
            const localOffset = now.getTimezoneOffset() * 60000;
            const utc = localTime + localOffset;
            
            const cityFormatter = new Intl.DateTimeFormat('en-US', {
              timeZone: cityTimezone,
              hour: 'numeric',
              minute: 'numeric',
              hour12: false
            });
            const cityTimeStr = cityFormatter.format(now);
            offset = `(${cityTimezone.replace('_', ' ')})`;
          } catch {
            offset = '';
          }
        }
      }
      
      // Get hour for greeting
      let hour = now.getHours();
      if (cityTimezone) {
        try {
          const hourFormatter = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: cityTimezone,
          });
          const parts = hourFormatter.formatToParts(now);
          const hourPart = parts.find((p) => p.type === 'hour');
          if (hourPart) {
            hour = parseInt(hourPart.value, 10);
          }
        } catch (e) {
          console.warn('Hour parsing error:', e);
        }
      }
      
      return { formattedTime: time, formattedDate: date, cityHour: hour, gmtOffset: offset };
    } catch (e) {
      console.error('Timezone formatting error:', e);
      return { 
        formattedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }), 
        formattedDate: now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        cityHour: now.getHours(),
        gmtOffset: ''
      };
    }
  }, [cityTimezone, currentTime]);

  const getGreeting = () => {
    if (cityHour >= 5 && cityHour < 12) return { text: 'Good Morning', icon: <Sunrise className="text-amber-500" size={28} />, isNight: false };
    if (cityHour >= 12 && cityHour < 17) return { text: 'Good Afternoon', icon: <Sun className="text-orange-500" size={28} />, isNight: false };
    if (cityHour >= 17 && cityHour < 21) return { text: 'Good Evening', icon: <Sunset className="text-indigo-500" size={28} />, isNight: false };
    return { text: 'Good Night', icon: <Moon className="text-blue-900 dark:text-blue-300" size={28} />, isNight: true };
  };

  const greeting = getGreeting();
  const currentCondition = weatherState.data?.current.icon;
  
  // Use city's hour for dark theme calculation
  const isTimeForDark = cityHour >= 18 || cityHour < 5;
  const isDarkTheme = theme === 'dark' || (theme === 'system' && isTimeForDark);
  const showNightEffects = isDarkTheme; 

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col h-full">
      <BackgroundEffects isNight={showNightEffects} condition={currentCondition} />

      <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide flex flex-col h-full animate-fade-in relative z-10">
        <header className="mb-8 flex flex-col shrink-0">
           <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  {weatherState.loading && !weatherState.data ? '--:--' : formattedTime}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {weatherState.loading && !weatherState.data ? 'Loading...' : (
                    <>
                      {formattedDate}
                      {gmtOffset && <span className="text-blue-500 dark:text-blue-400 ml-2">({gmtOffset})</span>}
                    </>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                 <button
                    onClick={onToggleTheme}
                    className="p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full text-gray-600 dark:text-yellow-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all border border-white/20 dark:border-white/10 group active:scale-95"
                    aria-label="Toggle Theme"
                 >
                    {isDarkTheme ? (
                        <Sun size={24} className="text-yellow-400" />
                    ) : (
                        <Moon size={24} className="text-blue-600" />
                    )}
                 </button>
                 <div className="md:hidden">
                    {greeting.icon}
                 </div>
              </div>
           </div>
           
           <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                {greeting.icon}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{greeting.text}!</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {weatherState.data ? `Weather in ${weatherState.data.location}` : 'Welcome to Climatix'}
                </p>
              </div>
           </div>
        </header>

        {weatherState.loading && !weatherState.data && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {weatherState.error && (
           <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-950/30 rounded-[2.5rem] text-center animate-fade-in border border-red-100 dark:border-red-900/50 my-auto">
              <div className="bg-red-100 dark:bg-red-900/40 p-5 rounded-full mb-6 text-red-500 dark:text-red-400">
                 {weatherState.error.includes("Network") ? <CloudOff size={40} /> : <AlertTriangle size={40} />}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Something went wrong</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md text-lg leading-relaxed">{weatherState.error}</p>
           </div>
        )}

        {weatherState.data && (
          <div className="flex flex-col space-y-8 pb-8">
             <ForecastList key={`${weatherState.data.location}-forecast`} forecast={weatherState.data.forecast} unit={unit} />
             <Highlights 
               key={`${weatherState.data.location}-highlights`}
               current={weatherState.data.current} 
               hourly={weatherState.data.hourlyForecast}
               unit={unit}
             />
             
             <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                {weatherState.data.dailyTip && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/60 p-6 rounded-3xl border border-amber-100 dark:border-slate-700 flex items-start gap-5 shadow-sm hover:shadow-md transition-shadow">
                       <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl text-amber-500 shadow-sm shrink-0">
                         <Lightbulb size={24} className="fill-current" />
                       </div>
                       <div>
                         <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Daily Tip</h4>
                         <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed">"{weatherState.data.dailyTip}"</p>
                       </div>
                    </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;

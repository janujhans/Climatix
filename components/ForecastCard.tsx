
import React, { useState } from 'react';
import { ForecastDay, Unit } from '../types';
import WeatherIcon from './WeatherIcon';
import { getTemp } from '../constants';

interface ForecastCardProps {
  day: ForecastDay;
  active?: boolean;
  unit: Unit;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ day, active, unit }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`flex flex-col items-center justify-center p-3 rounded-[1.5rem] min-w-[80px] md:min-w-[90px] transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 aspect-[3/5] backdrop-blur-sm
      ${active 
        ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-xl shadow-blue-900/20 dark:shadow-blue-900/40 ring-blue-400 transform -translate-y-1' 
        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-700 border border-white/50 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/20 hover:-translate-y-1 hover:scale-105'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="article"
      aria-label={`Forecast for ${day.day}: High of ${getTemp(day.tempHigh, unit)} degrees`}
    >
      <p className={`text-xs font-bold mb-2 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors'}`}>
        {day.day}
      </p>
      
      <div className={`transform transition-transform duration-500 ${isHovered || active ? 'scale-110 drop-shadow-md' : 'scale-100'}`}>
        <WeatherIcon 
          condition={day.icon} 
          size={32} 
          className={`mb-2 ${active ? 'text-white' : ''}`} 
          animated={active || isHovered} 
        />
      </div>
      
      <div className="flex flex-col items-center gap-0.5 mt-1">
        <p className="text-lg font-black tracking-tight">
          {getTemp(day.tempHigh, unit)}°
        </p>
        <p className={`text-[10px] font-medium ${active ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
          {getTemp(day.tempLow, unit)}°
        </p>
      </div>
    </div>
  );
};

export default ForecastCard;

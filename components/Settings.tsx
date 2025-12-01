import React from 'react';
import { Thermometer } from 'lucide-react';
import { Unit } from '../types';
import BackgroundEffects from './BackgroundEffects';

interface SettingsProps {
  unit: Unit;
  setUnit: (unit: Unit) => void;
  isDark: boolean;
}

const Settings: React.FC<SettingsProps> = ({ unit, setUnit, isDark }) => {
  return (
    <div className="relative flex-1 h-full overflow-hidden animate-fade-in">
      
      {/* Background Animation Layer */}
      <BackgroundEffects isNight={isDark} />

      <div className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col overflow-y-auto scrollbar-hide">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 drop-shadow-sm">Settings</h2>
        
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-[2rem] p-8 shadow-lg border border-white/40 dark:border-white/10 space-y-8 transition-colors backdrop-blur-md">
          
          {/* Units */}
          <div>
             <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
               <Thermometer size={20} aria-hidden="true" />
               Units
             </h3>
             <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-white/30 dark:border-slate-700 transition-colors">
                <span className="text-gray-700 dark:text-gray-300 font-medium" id="temp-unit-label">Temperature & Speed</span>
                <div 
                  className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-slate-700"
                  role="group"
                  aria-labelledby="temp-unit-label"
                >
                   <button 
                     onClick={() => setUnit('metric')}
                     className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                       unit === 'metric' 
                         ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                         : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                     }`}
                     aria-pressed={unit === 'metric'}
                     aria-label="Metric (Celsius, km/h)"
                   >Metric (°C)</button>
                   <button 
                     onClick={() => setUnit('imperial')}
                     className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                       unit === 'imperial' 
                         ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                         : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                     }`}
                     aria-pressed={unit === 'imperial'}
                     aria-label="Imperial (Fahrenheit, mph)"
                   >Imperial (°F)</button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { GitCompare, Search, Thermometer, Wind, Droplets, Eye, Sun, Gauge, Sunrise, Sunset, CloudFog } from 'lucide-react';
import { fetchWeather } from '../services/geminiService';
import { WeatherData, Unit } from '../types';
import CurrentWeather from './CurrentWeather';
import BackgroundEffects from './BackgroundEffects';
import { getTemp, getSpeed, getDistance, getTempUnit, getSpeedUnit, getDistUnit } from '../constants';

interface CompareCitiesProps {
  isDark: boolean;
  unit: Unit;
}

const CompareCities: React.FC<CompareCitiesProps> = ({ isDark, unit }) => {
  const [city1, setCity1] = useState('');
  const [city2, setCity2] = useState('');
  const [data1, setData1] = useState<WeatherData | null>(null);
  const [data2, setData2] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city1 || !city2) return;
    
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchWeather(city1),
        fetchWeather(city2)
      ]);

      if (results[0].status === 'fulfilled') {
        setData1(results[0].value);
      } else {
        console.error("Failed to fetch City 1", results[0].reason);
        setData1(null);
        alert(`Could not find weather data for "${city1}". Please check spelling.`);
      }

      if (results[1].status === 'fulfilled') {
        setData2(results[1].value);
      } else {
        console.error("Failed to fetch City 2", results[1].reason);
        setData2(null);
        alert(`Could not find weather data for "${city2}". Please check spelling.`);
      }

    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const tempUnit = getTempUnit(unit);
  const speedUnit = getSpeedUnit(unit);
  const distUnit = getDistUnit(unit);

  return (
    <div className="relative flex-1 h-full overflow-hidden animate-fade-in">
      <BackgroundEffects isNight={isDark} />

      <div className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col overflow-y-auto scrollbar-hide">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3 drop-shadow-sm">
          <GitCompare className="text-blue-500 dark:text-blue-400" size={32} aria-hidden="true" />
          Compare Weather
        </h2>

        <form onSubmit={handleCompare} className="flex flex-col md:flex-row gap-4 mb-10 bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2rem] shadow-lg transition-colors border border-white/40 dark:border-white/10 items-center backdrop-blur-md">
          <div className="flex-1 relative w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
             <label htmlFor="city1-input" className="sr-only">First City</label>
             <input 
               id="city1-input"
               value={city1}
               onChange={(e) => setCity1(e.target.value)}
               placeholder="First City (e.g. London)"
               className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-white/30 dark:border-white/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 transition-all placeholder-gray-500"
             />
          </div>
          
          <div className="flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold bg-white/50 dark:bg-slate-700/50 rounded-full w-12 h-12 shrink-0 border border-white/30 dark:border-white/10 shadow-sm" aria-hidden="true">
            VS
          </div>
          
          <div className="flex-1 relative w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
             <label htmlFor="city2-input" className="sr-only">Second City</label>
             <input 
               id="city2-input"
               value={city2}
               onChange={(e) => setCity2(e.target.value)}
               placeholder="Second City (e.g. Paris)"
               className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-white/30 dark:border-white/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 transition-all placeholder-gray-500"
             />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors disabled:opacity-70 shadow-lg shadow-blue-200/50 dark:shadow-none whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {loading ? 'Comparing...' : 'Compare Cities'}
          </button>
        </form>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-8">
           {data1 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                 <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 text-center drop-shadow-sm">{data1.location}</h3>
                 <div className="transform origin-top">
                    <CurrentWeather data={data1} unit={unit} />
                 </div>
              </div>
           )}
           {data2 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                 <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 text-center drop-shadow-sm">{data2.location}</h3>
                 <div className="transform origin-top">
                    <CurrentWeather data={data2} unit={unit} />
                 </div>
              </div>
           )}
           {!data1 && !loading && (
             <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-20 bg-white/30 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center backdrop-blur-sm">
               <GitCompare size={48} className="mb-4 opacity-50" aria-hidden="true" />
               <p className="font-medium">Enter two cities above to compare their current weather conditions side by side.</p>
             </div>
           )}
        </div>

        {data1 && data2 && (
          <div className="bg-white/70 dark:bg-slate-800/70 rounded-[2rem] p-8 shadow-lg border border-white/40 dark:border-white/10 animate-fade-in-up mb-8 backdrop-blur-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Detailed Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th scope="col" className="p-4 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-white/10 w-1/3">Metric</th>
                    <th scope="col" className="p-4 text-gray-800 dark:text-white font-bold border-b border-gray-200 dark:border-white/10 w-1/3 text-lg">{data1.location}</th>
                    <th scope="col" className="p-4 text-gray-800 dark:text-white font-bold border-b border-gray-200 dark:border-white/10 w-1/3 text-lg">{data2.location}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                    <td scope="row" className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 font-medium">
                      <Thermometer size={18} className="text-gray-400" aria-hidden="true" /> Temperature
                    </td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5 font-semibold text-lg">{getTemp(data1.current.temp, unit)}{tempUnit}</td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5 font-semibold text-lg">{getTemp(data2.current.temp, unit)}{tempUnit}</td>
                  </tr>
                   <tr className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                    <td scope="row" className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 font-medium">
                      <Thermometer size={18} className="text-gray-400" aria-hidden="true" /> Feels Like
                    </td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{getTemp(data1.current.feelsLike, unit)}{tempUnit}</td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{getTemp(data2.current.feelsLike, unit)}{tempUnit}</td>
                  </tr>
                  <tr className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                    <td scope="row" className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 font-medium">
                      <Droplets size={18} className="text-blue-400" aria-hidden="true" /> Humidity
                    </td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{data1.current.humidity}%</td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{data2.current.humidity}%</td>
                  </tr>
                  <tr className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                    <td scope="row" className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 font-medium">
                      <Wind size={18} className="text-teal-400" aria-hidden="true" /> Wind Speed
                    </td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{getSpeed(data1.current.windSpeed, unit)} {speedUnit}</td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{getSpeed(data2.current.windSpeed, unit)} {speedUnit}</td>
                  </tr>
                  <tr className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                    <td scope="row" className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 font-medium">
                       <Gauge size={18} className="text-green-500" aria-hidden="true" /> Pressure
                    </td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{data1.current.pressure || '--'} hPa</td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{data2.current.pressure || '--'} hPa</td>
                  </tr>
                   <tr className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                    <td scope="row" className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 font-medium">
                      <Sun size={18} className="text-amber-500" aria-hidden="true" /> UV Index
                    </td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{data1.current.uvIndex}</td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{data2.current.uvIndex}</td>
                  </tr>
                   <tr className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                    <td scope="row" className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 font-medium">
                       <Eye size={18} className="text-gray-400" aria-hidden="true" /> Visibility
                    </td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{getDistance(data1.current.visibility, unit)} {distUnit}</td>
                    <td className="p-4 border-b border-gray-100 dark:border-white/5">{getDistance(data2.current.visibility, unit)} {distUnit}</td>
                  </tr>
                  {/* ... Rest of the rows ... */}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareCities;

import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import BackgroundEffects from './BackgroundEffects';

interface FavouritesProps {
  onSelectCity: (city: string) => void;
  isDark: boolean;
}

const Favourites: React.FC<FavouritesProps> = ({ onSelectCity, isDark }) => {
  const [savedCities, setSavedCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState('');

  // Mock loading from local storage
  useEffect(() => {
    const stored = localStorage.getItem('climatix_favs');
    if (stored) {
      setSavedCities(JSON.parse(stored));
    } else {
      setSavedCities(['London', 'New York', 'Tokyo', 'Sydney']);
    }
  }, []);

  const saveToStorage = (cities: string[]) => {
    localStorage.setItem('climatix_favs', JSON.stringify(cities));
    setSavedCities(cities);
  };

  const addCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCity && !savedCities.includes(newCity)) {
      saveToStorage([...savedCities, newCity]);
      setNewCity('');
    }
  };

  const removeCity = (city: string) => {
    saveToStorage(savedCities.filter(c => c !== city));
  };

  return (
    <div className="relative flex-1 h-full overflow-hidden animate-fade-in">
      
      {/* Background Animation Layer */}
      <BackgroundEffects isNight={isDark} />

      <div className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col overflow-y-auto scrollbar-hide">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3 drop-shadow-sm">
          <Heart className="text-rose-500 fill-rose-500" size={32} aria-hidden="true" />
          Saved Locations
        </h2>

        <form onSubmit={addCity} className="flex gap-4 mb-8">
          <label htmlFor="add-city-input" className="sr-only">Add a new city</label>
          <input 
             id="add-city-input"
             type="text" 
             value={newCity} 
             onChange={(e) => setNewCity(e.target.value)}
             placeholder="Add a new city..."
             className="flex-1 p-4 rounded-2xl border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white/60 dark:bg-slate-700/60 dark:text-white dark:placeholder-gray-300 transition-colors backdrop-blur-md shadow-sm"
          />
          <button type="submit" className="bg-rose-500 text-white px-6 rounded-2xl font-medium hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-md">
            Add
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {savedCities.map((city) => (
            <div key={city} className="bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 p-6 rounded-[2rem] shadow-lg hover:shadow-2xl border border-white/40 dark:border-white/10 transition-all duration-300 ease-out transform hover:scale-[1.03] flex justify-between items-center group backdrop-blur-md">
               <button 
                 onClick={() => onSelectCity(city)} 
                 className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl p-1 -m-1"
                 aria-label={`View weather for ${city}`}
               >
                 <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                   <MapPin size={16} aria-hidden="true" />
                   <span className="text-xs uppercase tracking-wider font-semibold">Location</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white">{city}</h3>
               </button>
               <button 
                 onClick={() => removeCity(city)}
                 className="group/trash p-3 bg-white/50 dark:bg-slate-700/50 rounded-full text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 ml-2 shadow-sm"
                 aria-label={`Remove ${city} from favorites`}
               >
                 <Trash2 
                  size={18} 
                  className="transition-all duration-150 ease-out fill-transparent group-hover/trash:fill-purple-500"
                 />
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favourites;
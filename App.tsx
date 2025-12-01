import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchState, View, Theme, Unit } from './types';
import { fetchWeather } from './services/geminiService';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import { MapLocation } from './components/MapLocation';
import AiAssistant from './components/AiAssistant';
import Favourites from './components/Favourites';
import CompareCities from './components/CompareCities';
import Settings from './components/Settings';
import RightPanelBackground from './components/RightPanelBackground';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('climatix_theme') as Theme) || 'system');
  const [unit, setUnit] = useState<Unit>(() => (localStorage.getItem('climatix_unit') as Unit) || 'metric');
  const [weatherState, setWeatherState] = useState<SearchState>({ query: '', loading: true, error: null, data: null });
  const [currentTime, setCurrentTime] = useState(new Date());
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getAutoTheme = useCallback((date: Date) => {
    const hour = date.getHours();
    if (hour >= 18 || hour < 5) return 'dark';
    return 'light';
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('climatix_theme', theme);
    let effectiveTheme = theme;
    if (theme === 'system') effectiveTheme = getAutoTheme(currentTime);
    if (effectiveTheme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme, currentTime, getAutoTheme]);

  useEffect(() => localStorage.setItem('climatix_unit', unit), [unit]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === 'system') return getAutoTheme(new Date()) === 'dark' ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [getAutoTheme]);

  const handleSearch = useCallback(async (city: string) => {
    if (!city.trim()) return;
    if (isLoadingRef.current && city === weatherState.query) return;

    isLoadingRef.current = true;
    setWeatherState((prev) => ({ ...prev, loading: true, error: null, query: city }));
    
    try {
      const data = await fetchWeather(city);
      setWeatherState({ query: city, loading: false, error: null, data });
    } catch (err: any) {
      setWeatherState((prev) => ({ ...prev, loading: false, error: err.message || "Failed to fetch weather", data: null }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [weatherState.query]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => handleSearch(`${position.coords.latitude}, ${position.coords.longitude}`),
        () => handleSearch('Dhaka'),
        { timeout: 10000, maximumAge: 60000 }
      );
    } else handleSearch('Dhaka');
  }, []);

  useEffect(() => {
    if (!weatherState.query) return;
    const performRefresh = () => {
      if (!document.hidden) handleSearch(weatherState.query);
    };
    const intervalId = setInterval(performRefresh, 15 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [weatherState.query, handleSearch]);

  const hour = currentTime.getHours();
  const isSystemDark = hour >= 18 || hour < 5;
  const isDark = theme === 'dark' || (theme === 'system' && isSystemDark);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView weatherState={weatherState} currentTime={currentTime} theme={theme} onToggleTheme={toggleTheme} unit={unit} />;
      case 'map': return <MapLocation data={weatherState.data} unit={unit} />;
      case 'ai': return <AiAssistant isDark={isDark} weatherCondition={weatherState.data?.current.icon} />;
      case 'saved': return <Favourites onSelectCity={(city) => { setCurrentView('dashboard'); handleSearch(city); }} isDark={isDark} />;
      case 'compare': return <CompareCities isDark={isDark} unit={unit} />;
      case 'settings': return <Settings unit={unit} setUnit={setUnit} isDark={isDark} />;
      default: return <DashboardView weatherState={weatherState} currentTime={currentTime} theme={theme} onToggleTheme={toggleTheme} unit={unit} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-0 md:p-8 font-sans text-gray-800 dark:text-white transition-colors duration-300">
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-3xl md:rounded-[3rem] w-full max-w-[1400px] h-screen md:h-[850px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/50 dark:border-white/10 relative transition-colors duration-300 mb-16 md:mb-0">
        <Sidebar activeView={currentView} onViewChange={setCurrentView} />
        <div key={currentView} className="w-full h-full animate-fade-in relative">{renderContent()}</div>
        {currentView !== 'compare' && (
          <div className="hidden lg:flex w-[400px] bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl p-8 border-l border-white/40 dark:border-white/10 flex-col overflow-y-auto transition-colors duration-300 relative shrink-0">
            {weatherState.data && <RightPanelBackground current={weatherState.data.current} />}
            <div className="relative z-10 w-full flex flex-col h-full">
              <SearchBar onSearch={handleSearch} isLoading={weatherState.loading} />
              {weatherState.data && <CurrentWeather data={weatherState.data} unit={unit} />}
              {!weatherState.data && !weatherState.loading && <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center"><p>Search for a city</p></div>}
              {weatherState.loading && !weatherState.data && <div className="flex-1 flex flex-col items-center justify-center text-gray-400"><div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div><p className="text-sm">Fetching weather...</p></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
import React, { useRef, useState, useEffect } from 'react';
import { ForecastDay, Unit } from '../types';
import ForecastCard from './ForecastCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

const ForecastList: React.FC<ForecastListProps> = ({ forecast, unit }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [forecast]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.5; 
      
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

  return (
    <div className="w-full animate-fade-in" role="region" aria-label="Forecast">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white drop-shadow-sm" id="forecast-heading">Day Forecast</h3>
        
        <div className={`flex space-x-2 transition-opacity duration-300 ${!canScrollLeft && !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
           <button 
             onClick={() => scroll('left')}
             disabled={!canScrollLeft}
             className={`w-8 h-8 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md
               ${canScrollLeft 
                 ? 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer active:scale-95' 
                 : 'bg-white/50 dark:bg-slate-800/50 text-gray-300 dark:text-gray-700 cursor-default'
               }`}
             aria-label="Scroll forecast left"
             aria-hidden={!canScrollLeft}
           >
             <ChevronLeft size={18} />
           </button>
           <button 
             onClick={() => scroll('right')}
             disabled={!canScrollRight}
             className={`w-8 h-8 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md
               ${canScrollRight
                 ? 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer active:scale-95' 
                 : 'bg-white/50 dark:bg-slate-800/50 text-gray-300 dark:text-gray-700 cursor-default'
               }`}
             aria-label="Scroll forecast right"
             aria-hidden={!canScrollRight}
           >
             <ChevronRight size={18} />
           </button>
        </div>
      </div>
      
      <div className="relative group">
        <div 
          ref={scrollRef}
          onScroll={checkScrollButtons}
          className="flex space-x-3 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-xl px-1"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' 
          }}
          tabIndex={0}
          role="list"
          aria-labelledby="forecast-heading"
          onKeyDown={handleKeyDown}
        >
          {forecast.map((day, index) => (
            <div 
              key={`${day.day}-${index}`} 
              className="snap-start shrink-0 animate-fade-in-up"
              style={{ 
                animationDelay: `${Math.round(Math.pow(index, 0.7) * 100)}ms`, 
                opacity: 0 
              }}
              role="listitem"
            >
              <ForecastCard day={day} active={index === 0} unit={unit} />
            </div>
          ))}
          {forecast.length === 0 && (
            <div className="w-full text-center py-4 text-gray-400 text-sm">
               No forecast data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ForecastList);
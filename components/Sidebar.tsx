import React from 'react';
import { LayoutGrid, Map, Heart, GitCompare, MessageCircle, Settings } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

interface NavButtonProps {
  view: View;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: (view: View) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ view, icon: Icon, label, isActive, onClick }) => {
  return (
    <button 
      onClick={() => onClick(view)}
      className={`group relative flex items-center justify-center w-full p-4 rounded-2xl transition-all duration-200 ease-out ${
        isActive 
          ? 'bg-white shadow-md text-blue-600 dark:bg-slate-800 dark:text-blue-400 scale-105 z-10' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-blue-500 dark:hover:text-blue-300 hover:shadow-sm'
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110 group-hover:-translate-y-1'}`}>
        <Icon 
          size={32} 
          className={`transition-all duration-200 ease-out fill-none ${
            isActive 
              ? 'stroke-[2.5px] text-blue-600 dark:text-blue-400' 
              : 'stroke-2 text-current'
          }`} 
        />
      </div>
      
      {/* Bottom Color Indicator */}
      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-200 ease-out ${
        isActive ? 'w-6 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-70'
      }`} aria-hidden="true"></span>

      {/* Custom Animated Hover Label */}
      <span className="absolute left-[85%] top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-gray-700 dark:text-gray-200 text-sm font-semibold tracking-wider rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:left-full transition-all duration-300 ease-out whitespace-nowrap z-50 pointer-events-none border border-white/20 dark:border-white/5 shadow-blue-900/5">
        {label}
      </span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <nav 
      className="hidden md:flex flex-col items-center py-8 w-24 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border-r border-white/40 dark:border-white/5 z-20 md:rounded-l-[3rem] shadow-sm" 
      aria-label="Main Navigation"
    >
      <div className="mb-10 w-full flex items-center justify-center">
        <div className="w-14 h-14 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200 dark:shadow-none transition-transform duration-300 hover:scale-110 hover:rotate-3 group" role="img" aria-label="Climatix Logo">
          <LayoutGrid size={30} strokeWidth={2.5} className="fill-none group-hover:stroke-white transition-all duration-300" />
        </div>
      </div>
      
      <div className="flex flex-col space-y-5 flex-1 w-full px-4">
        <NavButton view="dashboard" icon={LayoutGrid} label="Dashboard" isActive={activeView === 'dashboard'} onClick={onViewChange} />
        <NavButton view="map" icon={Map} label="Map Location" isActive={activeView === 'map'} onClick={onViewChange} />
        <NavButton view="saved" icon={Heart} label="Saved Cities" isActive={activeView === 'saved'} onClick={onViewChange} />
        <NavButton view="compare" icon={GitCompare} label="Compare" isActive={activeView === 'compare'} onClick={onViewChange} />
        <NavButton view="ai" icon={MessageCircle} label="AI Assistant" isActive={activeView === 'ai'} onClick={onViewChange} />
        <NavButton view="settings" icon={Settings} label="Settings" isActive={activeView === 'settings'} onClick={onViewChange} />
      </div>
    </nav>
  );
};

export default React.memo(Sidebar);

import React, { useEffect, useRef } from 'react';
import { WeatherData, Unit } from '../types';
import * as L from 'leaflet';
import { getTemp, getSpeed, getTempUnit, getSpeedUnit } from '../constants';

interface MapLocationProps {
  data: WeatherData | null;
  unit: Unit;
}

export const MapLocation: React.FC<MapLocationProps> = ({ data, unit }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!data || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const { lat, lon, location, current } = data;
    const temp = getTemp(current.temp, unit);
    const speed = getSpeed(current.windSpeed, unit);
    const tempUnit = getTempUnit(unit);
    const speedUnit = getSpeedUnit(unit);

    const map = L.map(mapContainerRef.current).setView([lat, lon], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #3b82f6; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center;" role="img" aria-label="Temperature badge">
              <span style="color: white; font-weight: bold; font-size: 14px;">${temp}°</span>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    const marker = L.marker([lat, lon], { 
      icon: customIcon,
      title: `${location}: ${temp}${tempUnit}, ${current.condition}`,
      alt: `Weather location marker for ${location}.`
    }).addTo(map);

    const popupContent = `
      <div style="font-family: 'Inter', sans-serif; text-align: center; min-width: 150px;">
        <h3 style="margin: 0 0 4px 0; font-weight: 700; font-size: 16px; color: #1e293b;">${location}</h3>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: capitalize;">${current.condition}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px;">
           <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 10px; color: #94a3b8;">Temp</span>
              <span style="font-weight: 600; color: #334155;">${temp}${tempUnit}</span>
           </div>
           <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 10px; color: #94a3b8;">Wind</span>
              <span style="font-weight: 600; color: #334155;">${speed} ${speedUnit}</span>
           </div>
           <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 10px; color: #94a3b8;">Hum</span>
              <span style="font-weight: 600; color: #334155;">${current.humidity}%</span>
           </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent).openPopup();

    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data, unit]);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-400">
        Search for a city to view its location.
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 md:p-12 flex flex-col h-full animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Location Map</h2>
      <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 relative z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>
    </div>
  );
};

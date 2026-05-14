import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserLocation } from '../types';

interface LocationContextType {
  location: UserLocation | null;
  setLocation: (location: UserLocation | null) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  requestLocation: () => Promise<void>;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<UserLocation | null>(() => {
    const saved = localStorage.getItem('sellscan_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('sellscan_currency') || 'GBP';
  });
  const [isLoading, setIsLoading] = useState(false);

  const setLocation = (newLocation: UserLocation | null) => {
    setLocationState(newLocation);
    if (newLocation) {
      localStorage.setItem('sellscan_location', JSON.stringify(newLocation));
    } else {
      localStorage.removeItem('sellscan_location');
    }
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('sellscan_currency', newCurrency);
  };

  const requestLocation = async () => {
    setIsLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Use a free reverse geocoding service
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      const data = await response.json();

      const newLocation: UserLocation = {
        country: data.countryName || 'Unknown',
        state: data.principalSubdivision || undefined,
        method: 'auto',
        timestamp: Date.now()
      };

      setLocation(newLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      // We don't set location here, the UI should handle the fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, currency, setCurrency, requestLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

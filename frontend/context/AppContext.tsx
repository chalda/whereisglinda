import React, { createContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { AppState, Location, UserRole } from '../types';
import useSubscribe from '../utils/useSubscribe'; // Corrected import path for useSubscribe

export interface AppContextProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  appState: AppState | null;
  setAppState: (state: AppState) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const AppProvider: React.FC = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  // Fetch initial locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await apiFetch<Location[]>(null, '/api/locations'); // Fetch locations without an API key
        setLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err.message);
      }
    };

    fetchLocations();
  }, []);

  // Subscribe to the latest location updates
  useSubscribe({
    onLocationUpdate: (location) => {
      setLocations((prevLocations) => [...prevLocations, location]); // Append the new location to the array
    },
  });

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        userRole,
        setUserRole,
        appState,
        setAppState,
        locations,
        setLocations,
      }}>
      {children}
    </AppContext.Provider>
  );
};

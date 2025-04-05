import React, { createContext, useState, useEffect } from 'react';

import { AppState, Location, UserRole } from '../types';
import { fetchLocations, fetchAppState } from '../utils/api';
import useSubscribe from '../utils/useSubscribe';

export interface AppContextProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  appState: AppState | null;
  setAppState: (state: AppState) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  activeTripId: number | null;
  setActiveTripId: (tripId: number) => void;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const AppProvider: React.FC = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTripId, setActiveTripId] = useState<number | null>(null);
  const [locationSubscriptionEnabled, setLocationSubscriptionEnabled] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const data = await fetchAppState();
        setAppState(data);
      } catch (err) {
        console.error('Failed to fetch app state:', err.message);
      }
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (appState && appState?.rideStatus !== 'Home') {
      setLocationSubscriptionEnabled(true);
    } else {
      setLocationSubscriptionEnabled(false);
    }
  }, [appState]);

  const loadAppState = async () => {
    try {
      const data = await fetchAppState(); // Fetch app state without an API key
      setAppState(data);
    } catch (err) {
      console.error('Failed to fetch app state:', err.message);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await fetchLocations(); // Fetch locations without an API key
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err.message);
    }
  };

  const handleRefresh = async () => {
    await loadAppState();
    await loadLocations();
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  // Subscribe to the latest location updates
  useSubscribe({
    onLocationUpdate: (location) => {
      setLocations((prevLocations) => [...prevLocations, location]); // Append the new location to the array
    },
    enabled: locationSubscriptionEnabled,
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
        activeTripId,
        setActiveTripId,
      }}>
      {children}
    </AppContext.Provider>
  );
};

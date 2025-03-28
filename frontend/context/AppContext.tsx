import React, { createContext, useState, useEffect } from 'react';
import { fetchLocations, fetchAppState } from '../utils/api';
import { AppState, Location, UserRole } from '../types';
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
  tripId: number | null;
  setTripId: (tripId: number) => void;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const AppProvider: React.FC = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tripId, setTripId] = useState<number | null>(null);
  const [locationSubscriptionEnabled, setLocationSubscriptionEnabled] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const data = await fetchAppState(apiKey);
        setAppState(data);

        if (data.rideStatus !== 'Home') {
          setLocationSubscriptionEnabled(true);
        } else {
          setLocationSubscriptionEnabled(false);
        }
      } catch (err) {
        console.error('Failed to fetch app state:', err.message);
      }
    }, 40 * 1000); // 40 seconds

    return () => clearInterval(intervalId);
  }, [apiKey]);

  // Fetch initial locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchLocations(); // Fetch locations without an API key
        setLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err.message);
      }
    };

    loadLocations();
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
        tripId,
        setTripId,
      }}>
      {children}
    </AppContext.Provider>
  );
};

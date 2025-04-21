import React, { createContext, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

import { Trip, Location, UserRole } from './types';
import { fetchLocations, fetchActiveTrip, fetchGeobox } from './utils/api';
import useSubscribe from './utils/useSubscribe';

export interface AppContextProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTrip: Trip | null;
  setActiveTrip: (trip: Trip | null) => void;
  activeTripId: number | null;
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  geobox: Location[] | null;
  setGeobox: (geobox: Location[] | null) => void;
  locationSubscriptionEnabled: boolean;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [activeTripId, setActiveTripId] = useState<number | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [geobox, setGeobox] = useState<Location[] | null>(null);
  const [locationSubscriptionEnabled, setLocationSubscriptionEnabled] = useState(false);

  useEffect(() => {
    const fetchGeoboxData = async () => {
      try {
        const geoboxData = await fetchGeobox();
        setGeobox(geoboxData);
      } catch (err) {
        console.error('Failed to fetch geobox:', err.message);
      }
    };

    fetchGeoboxData();
  }, []);

  useEffect(() => {
    const fetchActiveTripData = async () => {
      try {
        const trip = await fetchActiveTrip(apiKey);
        setActiveTrip(trip);

        // Update activeTripId whenever activeTrip changes
        setActiveTripId(trip?.tripId || null);

        // Fetch locations if there is an active trip
        if (trip) {
          const tripLocations = await fetchLocations();
          setLocations(tripLocations);
        } else {
          setLocations([]);
        }
      } catch (err) {
        console.error('Failed to fetch active trip or locations:', err.message);
      }
    };

    const intervalId = setInterval(fetchActiveTripData, 30 * 1000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [apiKey]);

  useEffect(() => {
    const debounceSetSubscription = debounce((enabled: boolean) => {
      setLocationSubscriptionEnabled(enabled);
    }, 1000); // Debounce to 1 second

    if (activeTrip && activeTrip.rideStatus !== 'Not active') {
      debounceSetSubscription(true);
    } else {
      debounceSetSubscription(false);
    }

    return () => {
      debounceSetSubscription.cancel(); // Cancel debounce on cleanup
    };
  }, [activeTrip]);

  useSubscribe({
    onLocationUpdate: (location) => {
      setLocations((prevLocations) => [...prevLocations, location]);
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
        activeTrip,
        setActiveTrip,
        activeTripId,
        locations,
        setLocations,
        geobox,
        setGeobox,
        locationSubscriptionEnabled,
      }}>
      {children}
    </AppContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

import { Trip, Location, UserRole, TripLocation } from './types';
import { fetchLocations, fetchActiveTrip, fetchGeofence } from './utils/api';
import useSubscribe from './utils/useSubscribe';

const LOCATIONS_UPDATE_INTERVAL = 60 * 1000; // 30 seconds
const ACTIVE_TRIP_UPDATE_INTERVAL = 30 * 1000; // 30 seconds

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
  geofence: Location[] | null;
  setGeofence: (geofence: Location[] | null) => void;
  latestLocation: TripLocation | null;
  setLatestLocation: (location: TripLocation | null) => void;
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
  const [geofence, setGeofence] = useState<Location[] | null>(null);
  const [latestLocation, setLatestLocation] = useState<TripLocation | null>(null);
  const [locationSubscriptionEnabled, setLocationSubscriptionEnabled] = useState(false);

  useEffect(() => {
    const fetchGeofenceData = async () => {
      try {
        const geofenceData = await fetchGeofence();
        setGeofence(geofenceData);
      } catch (err) {
        console.error('Failed to fetch the latest geofence:', err.message);
      }
    };

    fetchGeofenceData();
  }, []); // Fetch geofence only once when the component mounts

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

    const intervalId = setInterval(fetchActiveTripData, ACTIVE_TRIP_UPDATE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const debounceSetSubscription = debounce((enabled: boolean) => {
      setLocationSubscriptionEnabled(enabled);
    }, 1000); // Debounce to 1 second

    if (activeTripId) {
      debounceSetSubscription(true);
    } else {
      debounceSetSubscription(false);
    }

    return () => {
      debounceSetSubscription.cancel(); // Cancel debounce on cleanup
    };
  }, [activeTripId]);

  useSubscribe({
    onLocationUpdate: (location: TripLocation) => {
      setLatestLocation(location); // Save the latest location update
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
        geofence,
        setGeofence,
        latestLocation,
        setLatestLocation,
        locationSubscriptionEnabled,
      }}>
      {children}
    </AppContext.Provider>
  );
};

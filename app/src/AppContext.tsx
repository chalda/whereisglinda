import React, { createContext, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

import { Trip, Location, UserRole, TripLocation } from './types';
import { fetchLocations, fetchActiveTrip, fetchGeofence } from './utils/api';
import useSubscribe from './utils/useSubscribe';
import LocationTracker from './components/LocationTracker';

const LOCATIONS_UPDATE_INTERVAL = 60 * 1000; // 30 seconds
const ACTIVE_TRIP_UPDATE_INTERVAL = 30 * 1000; // 30 seconds

export interface AppContextProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTrip: Trip | null;
  setActiveTrip: (trip: Trip | null) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  geofence: Location[] | null;
  setGeofence: (geofence: Location[] | null) => void;
  latestLocation: TripLocation | null;
  setLatestLocation: (location: TripLocation | null) => void;
  locationSubscriptionEnabled: boolean;
  locationTrackerForTripId: number | null;
  setLocationTrackerForTripId: (number) => void;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [geofence, setGeofence] = useState<Location[] | null>(null);
  const [latestLocation, setLatestLocation] = useState<TripLocation | null>(null);
  const [locationSubscriptionEnabled, setLocationSubscriptionEnabled] = useState(false);
  const [locationTrackerForTripId, setLocationTrackerForTripId] = useState(null);

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout | null = null;
    let cancelled = false;

    const fetchGeofenceData = async () => {
      try {
        const geofenceData = await fetchGeofence();
        setGeofence(geofenceData);
        cancelled = true; // Stop retrying after success
      } catch (err) {
        console.error('Failed to fetch the latest geofence:', err.message);
        if (!cancelled) {
          retryTimeout = setTimeout(fetchGeofenceData, 60000); // Retry after 60 seconds
        }
      }
    };

    fetchGeofenceData();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []); // Fetch geofence only once when the component mounts

  useEffect(() => {
    let everyOther = 0;
    const fetchActiveTripData = async () => {
      try {
        const trip = await fetchActiveTrip(apiKey);
        setActiveTrip(trip);

        // Fetch locations if there is an active trip
        if (trip) {
          everyOther = everyOther % 2;
          if (everyOther) {
            const tripLocations = await fetchLocations();
            setLocations(tripLocations);
          }
          everyOther++;
        } else {
          setLocations([]);
        }
      } catch (err) {
        console.error('Failed to fetch active trip or locations:', err.message);
      }
    };
    fetchActiveTripData();

    const intervalId = setInterval(fetchActiveTripData, ACTIVE_TRIP_UPDATE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const debounceSetSubscription = debounce((enabled: boolean) => {
      setLocationSubscriptionEnabled(enabled);
    }, 1000); // Debounce to 1 second

    if (activeTrip?.tripId) {
      debounceSetSubscription(true);
    } else {
      debounceSetSubscription(false);
    }

    return () => {
      debounceSetSubscription.cancel(); // Cancel debounce on cleanup
    };
  }, [activeTrip]);

  useSubscribe({
    onLocationUpdate: (location: TripLocation) => {
      setLatestLocation(location); // Save the latest location update
      setLocations((prevLocations) => [...prevLocations, location]);
    },
    enabled: locationSubscriptionEnabled,
  });

  return (
    <>
      <AppContext.Provider
        value={{
          apiKey,
          setApiKey,
          userRole,
          setUserRole,
          activeTrip,
          setActiveTrip,
          locations,
          setLocations,
          geofence,
          setGeofence,
          latestLocation,
          setLatestLocation,
          locationSubscriptionEnabled,
          locationTrackerForTripId,
          setLocationTrackerForTripId,
        }}>
        {children}
      </AppContext.Provider>
      <LocationTracker
        apiKey={apiKey}
        trackingEnabled={
          !!(locationTrackerForTripId && locationTrackerForTripId === activeTrip?.tripId)
        }
        activeTripId={activeTrip?.tripId}
      />
    </>
  );
};

// export const LocationTrackerContext = createContext({});

// export const LocationTracker: React.FC<AppProviderProps> = ({ children }) => {
//   return <LocationTrackerContext.Provider>{children}</LocationTrackerContext.Provider>;
// };

import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState(''); // Store API key globally
  const [userRole, setUserRole] = useState('');
  const [appState, setAppState] = useState({ rideStatus: '', homeGeobox: [] });
  const [locations, setLocations] = useState([]); // Store location data globally

  // Fetch app state and locations from the backend
  const fetchAppStateAndLocations = async () => {
    try {
      // Fetch app state
      const appStateResponse = await fetch('http://localhost:8080/state', {
        headers: { Authorization: apiKey },
      });
      if (appStateResponse.ok) {
        const appStateData = await appStateResponse.json();
        setAppState(appStateData);
      }

      // Fetch locations
      const locationsResponse = await fetch('http://localhost:8080/api/location-updates', {
        headers: { Authorization: apiKey },
      });
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        setLocations(locationsData);
      }
    } catch (err) {
      console.error('Failed to fetch app state or locations:', err);
    }
  };

  // Fetch app state and locations every 60 seconds
  useEffect(() => {
    fetchAppStateAndLocations();
    const interval = setInterval(fetchAppStateAndLocations, 60000); // Fetch every 60 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [apiKey]);

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
        fetchAppStateAndLocations, // Expose the refresh function
      }}>
      {children}
    </AppContext.Provider>
  );
};

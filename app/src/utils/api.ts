import Constants from 'expo-constants';

import { Location, AppState } from '../types'; // Import the Location and AppState types

const backendUrl: string = Constants?.expoConfig?.extra?.backendUrl;

/**
 * Utility function to make API calls
 * @param apiKey - Optional API key for authentication
 * @param endpoint - The API endpoint (e.g., '/api/example')
 * @param options - Fetch options (e.g., method, headers, body)
 * @returns A promise resolving to the JSON response
 */
export const apiFetch = async <T>(endpoint: string, apiKey?: string, options?: any): Promise<T> => {
  const url = `${backendUrl}${endpoint}`; // Ensure the endpoint is appended correctly
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: apiKey } : {}), // Include Authorization header only if apiKey is provided
    ...(options?.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
};

/**
 * Fetch the app state
 * @param apiKey - Optional API key for authentication
 * @returns The app state
 */
export const fetchAppState = async (apiKey?: string) => {
  return apiFetch<AppState>('/state', apiKey);
};

/**
 * Update the app state
 * @param apiKey - The API key for authentication
 * @param updatedState - The updated app state
 * @returns The updated app state
 */
export const updateAppState = async (apiKey: string, updatedState: AppState) => {
  return apiFetch<AppState>('/state', apiKey, {
    method: 'PUT',
    body: JSON.stringify(updatedState),
  });
};

export const setRideStatus = async (apiKey: string, rideStatus: string) => {
  return apiFetch<AppState>('/state/rideStatus', apiKey, {
    method: 'POST',
    body: JSON.stringify({ rideStatus }),
  });
};

export const setHomeGeobox = async (
  apiKey: string,
  homeGeobox: [number, number, number, number]
) => {
  return apiFetch<AppState>('/state/homeGeobox', apiKey, {
    method: 'POST',
    body: JSON.stringify({ homeGeobox }),
  });
};

/**
 * Fetch locations
 * @returns The list of locations
 */
export const fetchLocations = async () => {
  return apiFetch<Location[]>('/locations'); // No API key required
};

/**
 * Validate the API key
 * @param apiKey - The API key to validate
 * @returns The validation result
 */
export const validateApiKey = async (apiKey: string) => {
  return apiFetch<{ success: boolean; role: string }>('/validate', apiKey, {
    method: 'POST',
    body: JSON.stringify({ apiKey }),
  });
};

/**
 * Send location to the backend
 * @param apiKey - The API key for authentication
 * @param latitude - The latitude of the location
 * @param longitude - The longitude of the location
 * @param tripID - The ID of the trip
 * @returns The result of the location update
 */
export const sendLocation = async (
  apiKey: string,
  latitude: number,
  longitude: number,
  tripId: number
) => {
  const locationData = {
    latitude: latitude,
    longitude: longitude,
    tripId: tripId,
  };

  return apiFetch<Location>('/locations', apiKey, {
    method: 'POST',
    body: JSON.stringify(locationData),
  });
};

/**
 * Create a new trip and get a new trip ID
 * @param apiKey - The API key for authentication
 * @returns The new trip ID
 */
export const createNewTrip = async (apiKey: string) => {
  return apiFetch<{ tripId: number }>('/trip', apiKey, {
    method: 'POST',
  });
};

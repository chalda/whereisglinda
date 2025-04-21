import Constants from 'expo-constants';

import { Location, Trip } from '../types'; // Import the Location and AppState types

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
 * Fetch locations
 * @returns The list of locations
 */
export const fetchLocations = async (): Promise<Location[]> => {
  return apiFetch<Location[]>('/locations'); // No API key required
};

/**
 * Validate the API key
 * @param apiKey - The API key to validate
 * @returns The validation result
 */
export const validateApiKey = async (
  apiKey: string
): Promise<{ success: boolean; role: string }> => {
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
 * @param tripId - The ID of the trip
 * @returns The result of the location update
 */
export const sendLocation = async (
  apiKey: string,
  latitude: number,
  longitude: number,
  tripId: number
): Promise<Location> => {
  const locationData = {
    latitude,
    longitude,
    tripId,
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
export const createNewTrip = async (apiKey: string): Promise<{ tripId: number }> => {
  return apiFetch<{ tripId: number }>('/trip', apiKey, {
    method: 'POST',
  });
};

/**
 * End the current trip
 * @param apiKey - The API key for authentication
 * @returns A success message
 */
export const endTrip = async (apiKey: string): Promise<void> => {
  return apiFetch<void>('/trip/end', apiKey, {
    method: 'POST',
  });
};

/**
 * Update the trip with the given trip ID
 * @param apiKey - The API key for authentication
 * @param tripId - The ID of the trip to update
 * @param updates - The updates to apply (e.g., rideStatus)
 * @returns A success message
 */
export const updateTrip = async (
  apiKey: string,
  tripId: number,
  updates: { rideStatus?: string }
): Promise<void> => {
  return apiFetch<void>(`/trip/${tripId}`, apiKey, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

/**
 * Fetch the active trip
 * @param apiKey - Optional API key for authentication
 * @returns The active trip
 */
export const fetchActiveTrip = async (apiKey?: string): Promise<Trip | null> => {
  try {
    return await apiFetch<Trip>('/trips/active', apiKey);
  } catch (err) {
    if (err.message.includes('404')) {
      return null; // No active trip
    }
    throw err;
  }
};

/**
 * Fetch the latest geobox
 * @returns The latest geobox
 */
export const fetchGeobox = async (): Promise<Location[]> => {
  return apiFetch<Location[]>('/geobox');
};
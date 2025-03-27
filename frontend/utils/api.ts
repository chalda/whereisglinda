import Constants from 'expo-constants'; // Import expo-constants for accessing environment variables

const backendUrl: string = Constants.expoConfig.extra.backendUrl;

/**
 * Utility function to make API calls
 * @param apiKey - The API key for authentication
 * @param endpoint - The API endpoint (e.g., '/api/example')
 * @param options - Fetch options (e.g., method, headers, body)
 * @returns A promise resolving to the JSON response
 */
export const apiFetch = async <T>(
  apiKey: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  if (!apiKey) {
    throw new Error('API key is missing. Please log in.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: apiKey,
    ...(options.headers || {}),
  };

  const url = `${backendUrl}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
};

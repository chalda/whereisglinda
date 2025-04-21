export interface Location {
  latitude: number;
  longitude: number;
}

export interface TripLocation extends Location {
  tripId: number;
  id?: number; // Optional because it may not exist before being saved to the database
  timestamp?: string; // Use string for ISO timestamps
}

export interface Trip {
  tripId: number;
  name: string;
  startTime: string | null; // Use string for ISO timestamps
  endTime: string | null; // Use string for ISO timestamps
  status: string;
  rideStatus: string;
  locations?: Location[]; // Optional array of locations
}

export type UserRole = 'admin' | 'driver' | 'bus' | null;
export interface Location {
  latitude: number;
  longitude: number;
}
export interface TripLocation {
    latitude: number;
    longitude: number;
    tripId: number;
    timestamp: any;
  }

export interface Trip {
  tripId: number;
  name: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  rideStatus: string;
  locations?: Location[]; // Include locations as part of the trip
}

export type UserRole = 'admin' | 'driver' | 'bus' | null;
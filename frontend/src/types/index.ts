export type Location = {
  latitude: number;
  longitude: number;
  tripId: number;
};

export type AppState = {
  rideStatus: string;
  homeGeobox: Location[];
  activeTripId: number | null;
};

export type UserRole = 'admin' | 'driver' | 'bus' | null;

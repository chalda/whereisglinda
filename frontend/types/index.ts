export type Location = {
  latitude: number;
  longitude: number;
  tripID: number;
};

export type AppState = {
  rideStatus: string;
  homeGeobox: Location[];
  tripId: number | null;
};

export type UserRole = 'admin' | 'driver' | 'bus' | null;

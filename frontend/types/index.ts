export type Location = {
  latitude: number;
  longitude: number;
};

export type AppState = {
  rideStatus: string;
  homeGeobox: Location[];
};

export type UserRole = 'admin' | 'driver' | 'bus' | null;

package models

type AppState struct {
	RideStatus   string     `json:"rideStatus"`
	HomeGeobox   []Location `json:"homeGeobox"`
	ActiveTripID *int       `json:"activeTripId"`
}

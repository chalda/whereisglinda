package models

type AppState struct {
	RideStatus    string      `json:"rideStatus"`
	HomeGeobox    [4]Location `json:"homeGeobox"`
	ActiveTripID  *int        `json:"activeTripId"`
	TrackerActive bool        `json:"trackerActive"`
}

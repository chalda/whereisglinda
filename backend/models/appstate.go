package models

type AppState struct {
    RideStatus string      `json:"rideStatus"`
    HomeGeobox [4]Location `json:"homeGeobox"`
}

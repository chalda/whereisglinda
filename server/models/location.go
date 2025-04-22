package models

import "time"

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type TripLocation struct {
	Location
	ID         int        `json:"id"`
	TripID     int        `json:"tripId"`
	InGeofence bool       `json:"inGeofence"`
	Timestamp  *time.Time `json:"timestamp"`
}

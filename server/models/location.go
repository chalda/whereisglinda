package models

import "time"

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type TripLocation struct {
	Location
	TripID    int        `json:"tripId"`
	ID        int        `json:"id"`
	Timestamp *time.Time `json:"timestamp"`
}

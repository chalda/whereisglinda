package models

import (
	"database/sql"
	"time"
)

type Trip struct {
	TripID     int        `json:"tripId"`
	Name       string     `json:"name"`
	StartTime  time.Time  `json:"startTime"`
	EndTime    *time.Time `json:"endTime,omitempty"`
	Active     bool       `json:"active"`
	RideStatus string     `json:"rideStatus"`
}

type TripWithLocation struct {
	TripID     int          `json:"tripId"`
	Name       string       `json:"name"`
	StartTime  time.Time    `json:"startTime"`
	EndTime    *time.Time   `json:"endTime,omitempty"`
	Active     bool         `json:"active"`
	RideStatus string       `json:"rideStatus"`
	InGeofence sql.NullBool `json:"inGeofence"`
	Timestamp  sql.NullTime `json:"timestamp"`
}

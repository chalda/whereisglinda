package models

import "time"

type Trip struct {
	TripID     int        `json:"tripId"`
	Name       string     `json:"name"`
	StartTime  time.Time  `json:"startTime"`
	EndTime    *time.Time `json:"endTime,omitempty"`
	Active     bool       `json:"active"`
	RideStatus string     `json:"rideStatus"`
}

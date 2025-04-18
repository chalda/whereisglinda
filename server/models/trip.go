package models

import "time"

type Trip struct {
	TripID    int        `json:"tripId"`
	Name      string     `json:"tripName"`
	StartTime *time.Time `json:"startTime"`
	EndTime   *time.Time `json:"endTime"`
	Status    string     `json:"status"`
}

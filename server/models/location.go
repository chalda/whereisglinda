package models

import "time"
import (
	"math"
)


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


func PointInPolygon(p Location, polygon []Location) bool {
	n := len(polygon)
	inside := false
	j := n - 1
	for i := 0; i < n; i++ {
		xi, yi := polygon[i].Latitude, polygon[i].Longitude
		xj, yj := polygon[j].Latitude, polygon[j].Longitude
		intersect := ((yi > p.Longitude) != (yj > p.Longitude)) &&
			(p.Latitude < (xj-xi)*(p.Longitude-yi)/(yj-yi)+xi)
		if intersect {
			inside = !inside
		}
		j = i
	}
	return inside
}


// ExpandPolygon expands each point of a polygon outwards by `deltaMeters`.
func ExpandPolygon(polygon []Location, deltaMeters float64) []Location {
	if len(polygon) == 0 {
		return nil
	}

	const earthRadius = 6378137.0 // in meters

	// Compute centroid
	var centroidLat, centroidLon float64
	for _, pt := range polygon {
		centroidLat += pt.Latitude
		centroidLon += pt.Longitude
	}
	n := float64(len(polygon))
	centroidLat /= n
	centroidLon /= n

	// Convert delta in meters to degrees
	degLatPerMeter := 1 / (earthRadius * (math.Pi / 180))
	degLonPerMeter := 1 / (earthRadius * (math.Pi / 180) * math.Cos(centroidLat*math.Pi/180))

	expanded := make([]Location, 0, len(polygon))

	for _, pt := range polygon {
		dLat := pt.Latitude - centroidLat
		dLon := pt.Longitude - centroidLon

		// Convert to meters
		x := dLon / degLonPerMeter
		y := dLat / degLatPerMeter

		length := math.Hypot(x, y)
		if length == 0 {
			expanded = append(expanded, pt)
			continue
		}

		scale := (length + deltaMeters) / length
		x *= scale
		y *= scale

		newLat := centroidLat + y*degLatPerMeter
		newLon := centroidLon + x*degLonPerMeter
		expanded = append(expanded, Location{Latitude: newLat, Longitude: newLon})
	}

	return expanded
}

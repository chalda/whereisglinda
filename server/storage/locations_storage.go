package storage

import (
	"log"
	"whereisglinda-backend/models"
)

// SaveTripLocation saves a location to the database
func SaveTripLocation(location models.TripLocation) error {
	_, err := DB.Exec(
		"INSERT INTO locations (trip_id, latitude, longitude, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
		location.TripID, location.Latitude, location.Longitude,
	)
	if err != nil {
		log.Printf("Error saving location to database: %v", err)
		return err
	}
	log.Printf("Location saved to database: %+v", location)
	return nil
}

func GetLocationsForTrip(tripID int) ([]models.TripLocation, error) {
	rows, err := DB.Query("SELECT id, trip_id, latitude, longitude, timestamp FROM locations WHERE trip_id = ? ORDER BY id", tripID)
	if err != nil {
		log.Printf("Error querying locations for tripID %d: %v", tripID, err)
		return nil, err
	}
	defer rows.Close()

	locations := make([]models.TripLocation, 0)
	for rows.Next() {
		var location models.TripLocation
		err := rows.Scan(&location.ID, &location.TripID, &location.Latitude, &location.Longitude, &location.Timestamp)
		if err != nil {
			log.Printf("Error scanning location row: %v", err)
			return nil, err
		}
		locations = append(locations, location)
	}
	if err := rows.Err(); err != nil {
		log.Printf("Error iterating over location rows: %v", err)
		return nil, err
	}

	log.Printf("Retrieved %d locations for tripID %d", len(locations), tripID)
	return locations, nil
}

func PointInPolygon(p models.Location, polygon []models.Location) bool {
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

package storage

import (
	"fmt"
	"whereisglinda-backend/models"
)

// SaveTripLocation saves a location to the database with the provided trip ID
func SaveTripLocation(location models.TripLocation) error {
	_, err := DB.Exec("INSERT INTO locations (tripID, latitude, longitude) VALUES (?, ?, ?)", location.TripID, location.Latitude, location.Longitude)
	if err != nil {
		return fmt.Errorf("failed to save location to database: %w", err)
	}
	return nil
}

func GetLocationsForTrip(tripID int) ([]models.TripLocation, error) {
	rows, err := DB.Query("SELECT * FROM locations WHERE trip_id = ?", tripID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	locations := make([]models.TripLocation, 0)
	for rows.Next() {
		var location models.TripLocation
		err := rows.Scan(&location.ID, &location.TripID, &location.Latitude, &location.Longitude)
		if err != nil {
			return nil, err
		}
		locations = append(locations, location)
	}
	return locations, nil
}

// IncrementTripID increments the current trip ID in the database
func IncrementTripID() error {
	_, err := DB.Exec("UPDATE trips SET currentTripID = currentTripID + 1 WHERE id = 1")
	if err != nil {
		return fmt.Errorf("failed to increment trip ID: %w", err)
	}
	return nil
}

// SetCurrentTripID updates the current trip ID in the database
func SetCurrentTripID(tripID int) error {
	_, err := DB.Exec("UPDATE trips SET currentTripID = ? WHERE id = 1", tripID)
	if err != nil {
		return fmt.Errorf("failed to set current trip ID: %w", err)
	}
	return nil
}

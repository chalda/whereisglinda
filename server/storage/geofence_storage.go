package storage

import (
	"database/sql"
	"fmt"
	"whereisglinda-backend/models"
)

var HOME_GEOFENCE = []models.Location{}

// SaveGeofence saves a set of geofence coordinates to the database
func SaveGeofence(geofence []models.Location) error {
	if len(geofence) < 1 {
		return fmt.Errorf("geofence must contain at least 1 coordinate")
	}

	// Generate a new geofence_id
	var geofenceID int64
	err := DB.QueryRow("SELECT IFNULL(MAX(geofence_id), 0) + 1 FROM geofence").Scan(&geofenceID)
	if err != nil {
		return fmt.Errorf("failed to generate geofence ID: %w", err)
	}

	// Insert all coordinates with the same geofence_id
	for _, point := range geofence {
		_, err := DB.Exec("INSERT INTO geofence (geofence_id, latitude, longitude) VALUES (?, ?, ?)", geofenceID, point.Latitude, point.Longitude)
		if err != nil {
			return fmt.Errorf("failed to save geofence point: %w", err)
		}
	}

	return nil
}

// GetGeofence retrieves the latest set of geofence coordinates from the database
func GetGeofence() ([]models.Location, error) {
	// Query the latest geofence_id
	var geofenceID int
	err := DB.QueryRow("SELECT MAX(geofence_id) FROM geofence").Scan(&geofenceID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No geofence found
		}
		return nil, fmt.Errorf("failed to fetch latest geofence ID: %w", err)
	}

	return GetGeofenceByID(geofenceID)
}

// GetGeofenceByID retrieves a geofence by its ID
func GetGeofenceByID(geofenceID int) ([]models.Location, error) {
	// Query the coordinates for the given geofence_id
	rows, err := DB.Query("SELECT latitude, longitude FROM geofence WHERE geofence_id = ?", geofenceID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch geofence: %w", err)
	}
	defer rows.Close()

	var geofence []models.Location
	for rows.Next() {
		var point models.Location
		err := rows.Scan(&point.Latitude, &point.Longitude)
		if err != nil {
			return nil, fmt.Errorf("failed to scan geofence point: %w", err)
		}
		geofence = append(geofence, point)
	}

	return geofence, nil
}

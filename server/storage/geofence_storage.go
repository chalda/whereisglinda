package storage

import (
	"database/sql"
	"fmt"
	"log"
	"whereisglinda-backend/models"
)

var HOME_GEOFENCE = []models.Location{}

// SaveGeofence saves a set of geofence coordinates to the database
func SaveGeofence(geofence []models.Location) error {
	if len(geofence) < 1 {
		log.Println("Error: Geofence must contain at least 1 coordinate")
		return fmt.Errorf("geofence must contain at least 1 coordinate")
	}

	// Generate a new geofence_id
	var geofenceID int64
	err := DB.QueryRow("SELECT IFNULL(MAX(geofence_id), 0) + 1 FROM geofence").Scan(&geofenceID)
	if err != nil {
		log.Printf("Error generating geofence ID: %v", err)
		return fmt.Errorf("failed to generate geofence ID: %w", err)
	}

	// Insert all coordinates with the same geofence_id
	for _, point := range geofence {
		_, err := DB.Exec("INSERT INTO geofence (geofence_id, latitude, longitude) VALUES (?, ?, ?)", geofenceID, point.Latitude, point.Longitude)
		if err != nil {
			log.Printf("Error saving geofence point (lat: %f, lng: %f): %v", point.Latitude, point.Longitude, err)
			return fmt.Errorf("failed to save geofence point: %w", err)
		}
	}

	log.Printf("Geofence saved successfully with ID: %d", geofenceID)
	return nil
}

// GetLatestGeofence retrieves the latest set of geofence coordinates from the database
func GetLatestGeofence() ([]models.Location, error) {
	// Query the latest geofence_id
	var geofenceID int
	err := DB.QueryRow("SELECT geofence_id FROM geofence ORDER BY geofence_id DESC LIMIT 1").Scan(&geofenceID)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("No geofence found in the database")
			return nil, nil // No geofence found
		}
		log.Printf("Error fetching latest geofence ID: %v", err)
		return nil, fmt.Errorf("failed to fetch latest geofence ID: %w", err)
	}

	log.Printf("Latest geofence ID retrieved: %d", geofenceID)
	return GetGeofenceByID(geofenceID)
}

// GetGeofenceByID retrieves a geofence by its ID
func GetGeofenceByID(geofenceID int) ([]models.Location, error) {
	// Query the coordinates for the given geofence_id
	rows, err := DB.Query("SELECT latitude, longitude FROM geofence WHERE geofence_id = ?", geofenceID)
	if err != nil {
		log.Printf("Error fetching geofence with ID %d: %v", geofenceID, err)
		return nil, fmt.Errorf("failed to fetch geofence: %w", err)
	}
	defer rows.Close()

	var geofence []models.Location
	for rows.Next() {
		var point models.Location
		err := rows.Scan(&point.Latitude, &point.Longitude)
		if err != nil {
			log.Printf("Error scanning geofence point for geofence ID %d: %v", geofenceID, err)
			return nil, fmt.Errorf("failed to scan geofence point: %w", err)
		}
		geofence = append(geofence, point)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error iterating over geofence rows for geofence ID %d: %v", geofenceID, err)
		return nil, fmt.Errorf("failed to iterate over geofence rows: %w", err)
	}

	log.Printf("Geofence with ID %d retrieved successfully: %+v", geofenceID, geofence)
	return geofence, nil
}

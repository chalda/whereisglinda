package storage

import (
	"database/sql"
	"fmt"
	"whereisglinda-backend/logger"
	"whereisglinda-backend/models"
)

var HOME_GEOFENCE = []models.Location{}

// SaveGeofence saves a set of geofence coordinates to the database
func SaveGeofence(geofence []models.Location) error {
	if len(geofence) < 1 {
		logger.Log.Error().Msg("Geofence must contain at least 1 coordinate")
		return fmt.Errorf("geofence must contain at least 1 coordinate")
	}

	// Generate a new geofence_id
	var geofenceID int64
	err := DB.QueryRow("SELECT IFNULL(MAX(geofence_id), 0) + 1 FROM geofence").Scan(&geofenceID)
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error generating geofence ID")
		return fmt.Errorf("failed to generate geofence ID: %w", err)
	}

	// Insert all coordinates with the same geofence_id
	for _, point := range geofence {
		_, err := DB.Exec("INSERT INTO geofence (geofence_id, latitude, longitude) VALUES (?, ?, ?)", geofenceID, point.Latitude, point.Longitude)
		if err != nil {
			logger.Log.Error().Err(err).Float64("latitude", point.Latitude).Float64("longitude", point.Longitude).Msg("Error saving geofence point")
			return fmt.Errorf("failed to save geofence point: %w", err)
		}
	}

	logger.Log.Debug().Int64("geofenceID", geofenceID).Msg("Geofence saved successfully")
	return nil
}

// GetLatestGeofence retrieves the latest set of geofence coordinates from the database
func GetLatestGeofence() ([]models.Location, error) {
	// Query the latest geofence_id
	var geofenceID int
	err := DB.QueryRow("SELECT geofence_id FROM geofence ORDER BY geofence_id DESC LIMIT 1").Scan(&geofenceID)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.Log.Debug().Msg("No geofence found in the database")
			return nil, nil // No geofence found
		}
		logger.Log.Error().Err(err).Msg("Error fetching latest geofence ID")
		return nil, fmt.Errorf("failed to fetch latest geofence ID: %w", err)
	}

	logger.Log.Debug().Int("geofenceID", geofenceID).Msg("Latest geofence ID retrieved")
	return GetGeofenceByID(geofenceID)
}

// GetGeofenceByID retrieves a geofence by its ID
func GetGeofenceByID(geofenceID int) ([]models.Location, error) {
	// Query the coordinates for the given geofence_id
	rows, err := DB.Query("SELECT latitude, longitude FROM geofence WHERE geofence_id = ?", geofenceID)
	if err != nil {
		logger.Log.Error().Err(err).Int("geofenceID", geofenceID).Msg("Error fetching geofence")
		return nil, fmt.Errorf("failed to fetch geofence: %w", err)
	}
	defer rows.Close()

	var geofence []models.Location
	for rows.Next() {
		var point models.Location
		err := rows.Scan(&point.Latitude, &point.Longitude)
		if err != nil {
			logger.Log.Error().Err(err).Int("geofenceID", geofenceID).Msg("Error scanning geofence point")
			return nil, fmt.Errorf("failed to scan geofence point: %w", err)
		}
		geofence = append(geofence, point)
	}

	if err := rows.Err(); err != nil {
		logger.Log.Error().Err(err).Int("geofenceID", geofenceID).Msg("Error iterating over geofence rows")
		return nil, fmt.Errorf("failed to iterate over geofence rows: %w", err)
	}

	logger.Log.Debug().Int("geofenceID", geofenceID).Msgf("Geofence retrieved successfully: %+v", geofence)
	return geofence, nil
}

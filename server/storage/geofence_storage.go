package storage

import (
	"database/sql"
	"fmt"
	"whereisglinda-backend/logger"
	"whereisglinda-backend/models"
)

var HOME_GEOFENCE = []models.Location{}
var HOME_GEOFENCE_EXP = []models.Location{}

// SaveGeofence saves a set of geofence coordinates to the database

func SaveGeofence(realGeofence []models.Location, expandedGeofence []models.Location) error {
	const insertWithExpand = "INSERT INTO geofence (geofence_id, latitude, longitude, exp_latitude, exp_longitude) VALUES "
	const insertNoExpand = "INSERT INTO geofence (geofence_id, latitude, longitude) VALUES "

	if len(realGeofence) < 1 {
		logger.Log.Error().Msg("Geofence must contain at least 1 coordinate")
		return fmt.Errorf("geofence must contain at least 1 coordinate")
	}

	hasExpand := len(expandedGeofence) == len(realGeofence) && len(expandedGeofence) > 0

	var geofenceID int64
	err := DB.QueryRow("SELECT IFNULL(MAX(geofence_id), 0) + 1 FROM geofence").Scan(&geofenceID)
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error generating geofence ID")
		return fmt.Errorf("failed to generate geofence ID: %w", err)
	}

	var (
		query string
		args  []interface{}
	)

	if hasExpand {
		query = insertWithExpand
		for i, pt := range realGeofence {
			if i > 0 {
				query += ","
			}
			ex := expandedGeofence[i]
			query += "(?, ?, ?, ?, ?)"
			args = append(args, geofenceID, pt.Latitude, pt.Longitude, ex.Latitude, ex.Longitude)
		}
	} else {
		query = insertNoExpand
		for i, pt := range realGeofence {
			if i > 0 {
				query += ","
			}
			query += "(?, ?, ?)"
			args = append(args, geofenceID, pt.Latitude, pt.Longitude)
		}
	}

	_, err = DB.Exec(query, args...)
	if err != nil {
		logEvent := logger.Log.Error().Err(err).Int64("geofence_id", geofenceID)
		for i, pt := range realGeofence {
			logEvent = logEvent.Float64(fmt.Sprintf("latitude_%d", i), pt.Latitude).
				Float64(fmt.Sprintf("longitude_%d", i), pt.Longitude)
			if hasExpand {
				ex := expandedGeofence[i]
				logEvent = logEvent.Float64(fmt.Sprintf("exp_latitude_%d", i), ex.Latitude).
					Float64(fmt.Sprintf("exp_longitude_%d", i), ex.Longitude)
			}
		}
		logEvent.Msg("Error saving geofence points")
		return fmt.Errorf("failed to save geofence points: %w", err)
	}

	return nil
}

// GetLatestGeofence retrieves the latest set of geofence coordinates from the database
func GetLatestGeofence() ([]models.Location, []models.Location, error) {
	// Query the latest geofence_id
	var geofenceID int
	err := DB.QueryRow("SELECT geofence_id FROM geofence ORDER BY geofence_id DESC LIMIT 1").Scan(&geofenceID)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.Log.Debug().Msg("No geofence found in the database")
			return nil, nil, nil // No geofence found
		}
		logger.Log.Error().Err(err).Msg("Error fetching latest geofence ID")
		return nil, nil, fmt.Errorf("failed to fetch latest geofence ID: %w", err)
	}

	logger.Log.Debug().Int("geofenceID", geofenceID).Msg("Latest geofence ID retrieved")
	return GetGeofenceByID(geofenceID)
}

// GetGeofenceByID retrieves a geofence by its ID
func GetGeofenceByID(geofenceID int) ([]models.Location, []models.Location, error) {
	// Query the coordinates for the given geofence_id
	rows, err := DB.Query("SELECT latitude, longitude, exp_latitude, exp_longitude FROM geofence WHERE geofence_id = ?", geofenceID)
	if err != nil {
		logger.Log.Error().Err(err).Int("geofenceID", geofenceID).Msg("Error fetching geofence")
		return nil, nil, fmt.Errorf("failed to fetch geofence: %w", err)
	}
	defer rows.Close()

	var geofence, expGeofence []models.Location
	for rows.Next() {
		var point models.Location
		var exp_latitude, exp_longitude *float64

		err := rows.Scan(&point.Latitude, &point.Longitude, &exp_latitude, &exp_longitude)

		if err != nil {
			logger.Log.Error().Err(err).Int("geofenceID", geofenceID).Msg("Error scanning geofence point")
			return nil, nil, fmt.Errorf("failed to scan geofence point: %w", err)
		}
		geofence = append(geofence, point)
		if exp_latitude != nil && exp_longitude != nil {
			expGeofence = append(expGeofence, models.Location{Latitude: *exp_latitude, Longitude: *exp_longitude})
		}
	}

	if err := rows.Err(); err != nil {
		logger.Log.Error().Err(err).Int("geofenceID", geofenceID).Msg("Error iterating over geofence rows")
		return nil, nil, fmt.Errorf("failed to iterate over geofence rows: %w", err)
	}

	logger.Log.Debug().Int("geofenceID", geofenceID).Msgf("Geofence retrieved successfully: %+v", geofence)
	return geofence, expGeofence, nil
}

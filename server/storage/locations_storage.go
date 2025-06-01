package storage

import (
	"whereisglinda-backend/logger"
	"whereisglinda-backend/models"
)

// SaveTripLocation saves a location to the database
func SaveTripLocation(location models.TripLocation) error {
	_, err := DB.Exec(
		"INSERT INTO locations (trip_id, latitude, longitude, in_geofence, timestamp) VALUES (?, ?, ?, ?,CURRENT_TIMESTAMP)",
		location.TripID, location.Latitude, location.Longitude, location.InGeofence,
	)
	if err != nil {
		logger.Log.Error().Err(err).Interface("location", location).Msg("Error saving location to database")
		return err
	}
	logger.Log.Debug().Interface("location", location).Msg("Location saved to database")
	return nil
}

// GetLocationsForTrip retrieves all locations for a specific trip
func GetLocationsForTrip(tripID int) ([]models.TripLocation, error) {
	rows, err := DB.Query("SELECT id, trip_id, latitude, longitude, timestamp FROM locations WHERE trip_id = ? ORDER BY id", tripID)
	if err != nil {
		logger.Log.Error().Err(err).Int("tripID", tripID).Msg("Error querying locations for trip")
		return nil, err
	}
	defer rows.Close()

	var locations []models.TripLocation
	for rows.Next() {
		var location models.TripLocation
		err := rows.Scan(&location.ID, &location.TripID, &location.Latitude, &location.Longitude, &location.Timestamp)
		if err != nil {
			logger.Log.Error().Err(err).Msg("Error scanning location row")
			return nil, err
		}
		locations = append(locations, location)
	}

	if err := rows.Err(); err != nil {
		logger.Log.Error().Err(err).Int("tripID", tripID).Msg("Error iterating over location rows")
		return nil, err
	}

	logger.Log.Debug().Int("tripID", tripID).Int("count", len(locations)).Msg("Locations retrieved successfully")
	return locations, nil
}

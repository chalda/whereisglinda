package storage

import (
	"database/sql"
	"fmt"
	"time"
	"whereisglinda-backend/logger"
	"whereisglinda-backend/models"
)

// GetActiveTripWithLatestLocation retrieves the active trip and its latest location from the database.
func GetActiveTripWithLatestLocation(db *sql.DB) (*models.TripWithLocation, error) {
	query := `
	SELECT t.trip_id, t.active, t.ride_status, t.start_time, t.end_time,
	       l.in_geofence, l.timestamp
	FROM trips t
	LEFT JOIN locations l ON l.id = (
		SELECT MAX(id) FROM locations WHERE trip_id = t.trip_id
	)
	WHERE t.active = 1
	LIMIT 1;
	`

	var trip models.TripWithLocation
	err := db.QueryRow(query).Scan(
		&trip.TripID, &trip.Active, &trip.RideStatus,
		&trip.StartTime, &trip.EndTime,
		&trip.InGeofence, &trip.Timestamp,
	)
	if err == sql.ErrNoRows {
		logger.Log.Debug().Msg("No active trip found")
		return nil, nil
	}
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error fetching active trip with latest location")
		return nil, err
	}
	logger.Log.Debug().Interface("trip", trip).Msg("Active trip with latest location retrieved successfully")
	return &trip, nil
}

// GetActiveTripID returns the ID of the currently active trip, or nil if none is active.
func GetActiveTripID() (*int, error) {
	query := "SELECT trip_id FROM trips WHERE active = 1 LIMIT 1"
	row := DB.QueryRow(query)

	var tripID sql.NullInt64
	if err := row.Scan(&tripID); err != nil {
		logger.Log.Error().Err(err).Msg("Error fetching active trip ID")
		return nil, err
	}
	if !tripID.Valid {
		logger.Log.Debug().Msg("No active trip found")
		return nil, nil
	}
	result := int(tripID.Int64)
	logger.Log.Debug().Int("tripID", result).Msg("Active trip ID retrieved successfully")
	return &result, nil
}

// CreateTrip inserts a new trip into the database.
func CreateTrip(db *sql.DB, trip *models.Trip) error {
	query := "INSERT INTO trips (name, start_time, end_time, ride_status, active) VALUES (?, ?, ?, ?, ?)"
	_, err := db.Exec(query, trip.Name, trip.StartTime, trip.EndTime, trip.RideStatus, trip.Active)
	if err != nil {
		logger.Log.Error().Err(err).Interface("trip", trip).Msg("Error creating trip")
		return err
	}
	logger.Log.Debug().Interface("trip", trip).Msg("Trip created successfully")
	return nil
}

// UpdateTrip updates an existing trip in the database.
func UpdateTrip(db *sql.DB, tripID int, trip *models.Trip) error {
	query := "UPDATE trips SET name = ?, start_time = ?, end_time = ?, ride_status = ?, active = ? WHERE trip_id = ?"
	_, err := db.Exec(query, trip.Name, trip.StartTime, trip.EndTime, trip.RideStatus, trip.Active, tripID)
	if err != nil {
		logger.Log.Error().Err(err).Interface("trip", trip).Msg("Error updating trip")
		return err
	}
	logger.Log.Debug().Interface("trip", trip).Msg("Trip updated successfully")
	return nil
}

// GetTripByID retrieves a trip by its ID from the database.
func GetTripByID(tripID int) (*models.Trip, error) {
	query := "SELECT trip_id, name, start_time, end_time, active FROM trips WHERE trip_id = ?"
	row := DB.QueryRow(query, tripID)
	trip := &models.Trip{}
	err := row.Scan(&trip.TripID, &trip.Name, &trip.StartTime, &trip.EndTime, &trip.Active)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.Log.Debug().Int("tripID", tripID).Msg("Trip not found")
			return nil, nil
		}
		logger.Log.Error().Err(err).Int("tripID", tripID).Msg("Error fetching trip by ID")
		return nil, err
	}
	logger.Log.Debug().Interface("trip", trip).Msg("Trip retrieved successfully")
	return trip, nil
}

// EndTrip marks a trip as ended in the database.
func EndTrip(tripID int) error {
	query := "UPDATE trips SET end_time = CURRENT_TIMESTAMP, active = 0 WHERE trip_id = ?"
	_, err := DB.Exec(query, tripID)
	if err != nil {
		logger.Log.Error().Err(err).Int("tripID", tripID).Msg("Error ending trip")
		return err
	}
	logger.Log.Debug().Int("tripID", tripID).Msg("Trip ended successfully")
	return nil
}

// StartTrip ends any currently active trip and starts a new trip.
func StartTrip(name string, rideStatus string) error {
	tx, err := DB.Begin()
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error starting transaction for new trip")
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// End any currently active trip
	_, err = tx.Exec("UPDATE trips SET end_time = CURRENT_TIMESTAMP, active = 0 WHERE active = 1")
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error ending previous active trip")
		tx.Rollback()
		return fmt.Errorf("failed to end previous trip: %w", err)
	}

	// Start the new trip
	_, err = tx.Exec(
		"INSERT INTO trips (name, start_time, ride_status, active) VALUES (?, CURRENT_TIMESTAMP, ?, 1)",
		name, rideStatus,
	)
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error starting new trip")
		tx.Rollback()
		return fmt.Errorf("failed to start new trip: %w", err)
	}

	if err := tx.Commit(); err != nil {
		logger.Log.Error().Err(err).Msg("Error committing new trip transaction")
		return fmt.Errorf("failed to commit new trip: %w", err)
	}

	logger.Log.Debug().Str("name", name).Str("rideStatus", rideStatus).Msg("New trip started successfully")
	return nil
}

// GetLocationsForTripFiltered retrieves locations for a trip, optionally filtered by timestamp.
func GetLocationsForTripFiltered(tripID int, after *time.Time) ([]models.TripLocation, error) {
	query := `
	SELECT id, trip_id, latitude, longitude, in_geofence, timestamp
	FROM locations
	WHERE trip_id = ? AND in_geofence = FALSE`
	args := []interface{}{tripID}

	if after != nil {
		query += " AND timestamp > ?"
		args = append(args, *after)
	}

	query += " ORDER BY timestamp"
	rows, err := DB.Query(query, args...)
	if err != nil {
		logger.Log.Error().Err(err).Int("tripID", tripID).Interface("after", after).Msg("Error querying filtered locations for trip")
		return nil, err
	}
	defer rows.Close()

	var locations []models.TripLocation
	for rows.Next() {
		var loc models.TripLocation
		err := rows.Scan(&loc.ID, &loc.TripID, &loc.Latitude, &loc.Longitude, &loc.InGeofence, &loc.Timestamp)
		if err != nil {
			logger.Log.Error().Err(err).Int("tripID", tripID).Msg("Error scanning location row")
			return nil, err
		}
		locations = append(locations, loc)
	}

	logger.Log.Debug().Int("tripID", tripID).Int("count", len(locations)).Msg("Filtered locations retrieved successfully")
	return locations, nil
}

// EndInactiveTrips ends trips that have not received location updates in the last 2 hours.
func EndInactiveTrips() error {
	cutoff := time.Now().Add(-2 * time.Hour)
	_, err := DB.Exec(`
		UPDATE trips
		SET end_time = CURRENT_TIMESTAMP, active = 0
		WHERE trip_id IN (
			SELECT trip_id
			FROM locations
			GROUP BY trip_id
			HAVING MAX(timestamp) < ?
		) AND active = 1
	`, cutoff)
	if err != nil {
		logger.Log.Error().Err(err).Time("cutoff", cutoff).Msg("Error ending inactive trips")
		return err
	}
	logger.Log.Debug().Time("cutoff", cutoff).Msg("Inactive trips ended successfully")
	return nil
}

// MonitorTripInactivity periodically checks for inactive trips and ends them if necessary.
func MonitorTripInactivity() {
	for {
		time.Sleep(10 * time.Minute)

		trip, err := GetActiveTripWithLatestLocation(DB)
		if err != nil {
			logger.Log.Error().Err(err).Msg("Error fetching active trip for inactivity monitoring")
			continue
		}
		if trip == nil {
			logger.Log.Debug().Msg("No active trip found for inactivity monitoring")
			continue
		}

		// Check if any location outside geofence in the last 2 hours
		cutoff := time.Now().Add(-2 * time.Hour)
		row := DB.QueryRow(`
			SELECT COUNT(*) FROM locations
			WHERE trip_id = ? AND in_geofence = FALSE AND timestamp > ?
		`, trip.TripID, cutoff)

		var count int
		if err := row.Scan(&count); err != nil {
			logger.Log.Error().Err(err).Int("tripID", trip.TripID).Msg("Error checking geofence status")
			continue
		}

		if count == 0 {
			if err := EndTrip(trip.TripID); err == nil {
				logger.Log.Debug().Int("tripID", trip.TripID).Msg("Trip ended due to 2 hours of only at-home updates")
			} else {
				logger.Log.Error().Err(err).Int("tripID", trip.TripID).Msg("Error ending inactive trip")
			}
		}
	}
}

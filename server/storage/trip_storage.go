package storage

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
	"whereisglinda-backend/models"
)

func GetActiveTrip() (*models.Trip, error) {
	var trip models.Trip
	err := DB.QueryRow(`
        SELECT trip_id, name, start_time, end_time, status, ride_status
        FROM trips
        WHERE end_time IS NULL
        ORDER BY trip_id DESC
        LIMIT 1
    `).Scan(&trip.TripID, &trip.Name, &trip.StartTime, &trip.EndTime, &trip.Status, &trip.RideStatus)

	if err == sql.ErrNoRows {
		return nil, nil // No active trip
	}

	if err != nil {
		return nil, err
	}

	return &trip, nil
}

func GetActiveTripID() (*int, error) {
	query := "SELECT MAX(trip_id) FROM trips WHERE end_time IS NULL"
	row := DB.QueryRow(query)
	var tripID sql.NullInt64
	err := row.Scan(&tripID)
	if err != nil {
		return nil, err
	}
	if !tripID.Valid {
		return nil, nil
	}
	result := int(tripID.Int64)
	return &result, nil
}

func CreateTrip(db *sql.DB, trip *models.Trip) error {
	query := "INSERT INTO trips (name, start_time, end_time, status, ride_status) VALUES (?, ?, ?, ?, ?)"
	_, err := db.Exec(query, trip.Name, trip.StartTime, trip.EndTime, trip.Status, trip.RideStatus)
	return err
}

func UpdateTrip(db *sql.DB, trip *models.Trip) error {
	query := "UPDATE trips SET name = ?, start_time = ?, end_time = ?, status = ?, ride_status = ? WHERE trip_id = ?"
	_, err := db.Exec(query, trip.Name, trip.StartTime, trip.EndTime, trip.Status, trip.RideStatus, trip.TripID)
	return err
}

func GetTripByID(tripID int) (*models.Trip, error) {
	query := "SELECT trip_id, name, start_time, end_time, status FROM trips WHERE trip_id = ?"
	row := DB.QueryRow(query, tripID)
	trip := &models.Trip{}
	err := row.Scan(&trip.TripID, &trip.Name, &trip.StartTime, &trip.EndTime, &trip.Status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return trip, nil
}

func EndTrip(tripID int) error {
	query := "UPDATE trips SET end_time = CURRENT_TIMESTAMP WHERE trip_id = ?"
	_, err := DB.Exec(query, tripID)
	return err
}

// EndInactiveTrips ends trips with no location updates in the last 2 hours
func EndInactiveTrips() error {
	// Define the cutoff time (2 hours ago)
	cutoffTime := time.Now().Add(-2 * time.Hour)

	// Update trips where the last location timestamp is older than the cutoff time
	_, err := DB.Exec(`
		UPDATE trips
		SET end_time = CURRENT_TIMESTAMP, status = 'Ended'
		WHERE trip_id IN (
			SELECT trip_id
			FROM locations
			GROUP BY trip_id
			HAVING MAX(timestamp) < ?
		) AND status = 'Active'
	`, cutoffTime)
	if err != nil {
		return fmt.Errorf("failed to end inactive trips: %w", err)
	}
	return nil
}

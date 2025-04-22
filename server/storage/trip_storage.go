package storage

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"
	"whereisglinda-backend/models"
)

func GetActiveTripWithLatestLocation(db *sql.DB) (*models.TripWithLocation, error) {
	query := `
	SELECT t.id, t.active, t.ride_status, t.start_time, t.end_time,
	       l.in_geofence, l.timestamp
	FROM trips t
	LEFT JOIN locations l ON l.id = (
		SELECT MAX(id) FROM locations WHERE trip_id = t.id
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
		return nil, nil
	}
	return &trip, err
}

func GetActiveTripID() (*int, error) {
	query := "SELECT trip_id FROM trips WHERE active = 1 LIMIT 1"
	row := DB.QueryRow(query)

	var tripID sql.NullInt64
	if err := row.Scan(&tripID); err != nil {
		return nil, err
	}
	if !tripID.Valid {
		return nil, nil
	}
	result := int(tripID.Int64)
	return &result, nil
}

func CreateTrip(db *sql.DB, trip *models.Trip) error {
	query := "INSERT INTO trips (name, start_time, end_time, ride_status, active) VALUES (?, ?, ?, ?, ?)"
	_, err := db.Exec(query, trip.Name, trip.StartTime, trip.EndTime, trip.RideStatus, trip.Active)
	return err
}

func UpdateTrip(db *sql.DB, trip *models.Trip) error {
	query := "UPDATE trips SET name = ?, start_time = ?, end_time = ?, ride_status = ?, active = ? WHERE trip_id = ?"
	_, err := db.Exec(query, trip.Name, trip.StartTime, trip.EndTime, trip.RideStatus, trip.Active, trip.TripID)
	return err
}

func GetTripByID(tripID int) (*models.Trip, error) {
	query := "SELECT trip_id, name, start_time, end_time, active FROM trips WHERE trip_id = ?"
	row := DB.QueryRow(query, tripID)
	trip := &models.Trip{}
	err := row.Scan(&trip.TripID, &trip.Name, &trip.StartTime, &trip.EndTime, &trip.Active)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return trip, nil
}

func EndTrip(tripID int) error {
	query := "UPDATE trips SET end_time = CURRENT_TIMESTAMP, active = 0 WHERE trip_id = ?"
	_, err := DB.Exec(query, tripID)
	return err
}

func StartTrip(name string, rideStatus string) error {
	tx, err := DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// End any currently active trip
	_, err = tx.Exec("UPDATE trips SET end_time = CURRENT_TIMESTAMP, active = 0 WHERE active = 1")
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to end previous trip: %w", err)
	}

	// Start the new trip
	_, err = tx.Exec(
		"INSERT INTO trips (name, start_time, ride_status, active) VALUES (?, CURRENT_TIMESTAMP, ?, 1)",
		name, rideStatus,
	)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to start new trip: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit new trip: %w", err)
	}

	return nil
}

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
		return nil, err
	}
	defer rows.Close()

	var locations []models.TripLocation
	for rows.Next() {
		var loc models.TripLocation
		err := rows.Scan(&loc.ID, &loc.TripID, &loc.Latitude, &loc.Longitude, &loc.InGeofence, &loc.Timestamp)
		if err != nil {
			return nil, err
		}
		locations = append(locations, loc)
	}
	return locations, nil
}

// EndInactiveTrips ends trips with no location updates in the last 2 hours
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
	return err
}

func MonitorTripInactivity() {
	for {
		time.Sleep(10 * time.Minute)

		trip, err := GetActiveTripWithLatestLocation(DB)
		if err != nil || trip == nil {
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
			log.Printf("Error checking geofence status: %v", err)
			continue
		}

		if count == 0 {
			if err := EndTrip(trip.TripID); err == nil {
				log.Println("Trip ended due to 2h of only at-home updates.")
			}
		}
	}
}

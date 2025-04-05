package storage

import (
	"database/sql"
	"errors"
	"whereisglinda-backend/models"
)

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
	query := "INSERT INTO trips (name, start_time, end_time, status) VALUES (?, ?, ?, ?)"
	_, err := db.Exec(query, trip.Name, trip.StartTime, trip.EndTime, trip.Status)
	return err
}

func UpdateTrip(db *sql.DB, trip *models.Trip) error {
	query := "UPDATE trips SET name = ?, start_time = ?, end_time = ?, status = ? WHERE trip_id = ?"
	_, err := db.Exec(query, trip.Name, trip.StartTime, trip.EndTime, trip.Status, trip.TripID)
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

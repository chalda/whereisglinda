package storage

import (
    "database/sql"
    "fmt"
    "whereisglinda-backend/models"
)

// SaveLocation saves a location to the database with the provided trip ID
func SaveLocation(location models.Location) error {
    _, err := DB.Exec("INSERT INTO locations (tripID, latitude, longitude) VALUES (?, ?, ?)", location.TripID, location.Latitude, location.Longitude)
    if err != nil {
        return fmt.Errorf("failed to save location to database: %w", err)
    }
    return nil
}

// GetCurrentTripID retrieves the current trip ID from the database
func GetCurrentTripID() (int, error) {
    var tripID int
    err := DB.QueryRow("SELECT currentTripID FROM trips WHERE id = 1").Scan(&tripID)
    if err != nil {
        if err == sql.ErrNoRows {
            return 0, fmt.Errorf("no trip ID found")
        }
        return 0, err
    }
    return tripID, nil
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

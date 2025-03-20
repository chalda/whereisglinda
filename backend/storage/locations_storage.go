package storage

import (
    "fmt"
    "whereisglinda-backend/handlers"
)

// SaveLocation saves a location to the database
func SaveLocation(location handlers.Location) error {
    _, err := DB.Exec("INSERT INTO locations (latitude, longitude) VALUES (?, ?)", location.Latitude, location.Longitude)
    if err != nil {
        return fmt.Errorf("failed to save location to database: %w", err)
    }
    return nil
}

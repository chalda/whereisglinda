package storage

import (
	"database/sql"
	"fmt"
)

// GetTripByID retrieves a trip by its ID from the database
func GetTripByID(tripID int) (int, error) {
	var id int
	err := DB.QueryRow("SELECT id FROM trips WHERE id = ?", tripID).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("no trip found with ID: %d", tripID)
		}
		return 0, fmt.Errorf("failed to get trip by ID: %w", err)
	}
	return id, nil
}

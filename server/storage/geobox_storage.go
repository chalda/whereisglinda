package storage

import (
	"database/sql"
	"fmt"
	"whereisglinda-backend/models"
)

// SaveGeobox saves a set of geobox coordinates to the database
func SaveGeobox(geobox []models.Location) error {
	if len(geobox) < 1 {
		return fmt.Errorf("geobox must contain at least 1 coordinate")
	}

	// Generate a new geobox_id
	var geoboxID int64
	err := DB.QueryRow("SELECT IFNULL(MAX(geobox_id), 0) + 1 FROM geobox").Scan(&geoboxID)
	if err != nil {
		return fmt.Errorf("failed to generate geobox ID: %w", err)
	}

	// Insert all coordinates with the same geobox_id
	for _, point := range geobox {
		_, err := DB.Exec("INSERT INTO geobox (geobox_id, latitude, longitude) VALUES (?, ?, ?)", geoboxID, point.Latitude, point.Longitude)
		if err != nil {
			return fmt.Errorf("failed to save geobox point: %w", err)
		}
	}

	return nil
}

// GetGeobox retrieves the latest set of geobox coordinates from the database
func GetGeobox() ([]models.Location, error) {
	// Query the latest geobox_id
	var geoboxID int
	err := DB.QueryRow("SELECT MAX(geobox_id) FROM geobox").Scan(&geoboxID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No geobox found
		}
		return nil, fmt.Errorf("failed to fetch latest geobox ID: %w", err)
	}

	return GetGeoboxByID(geoboxID)
}

// GetGeoboxByID retrieves a geobox by its ID
func GetGeoboxByID(geoboxID int) ([]models.Location, error) {
	// Query the coordinates for the given geobox_id
	rows, err := DB.Query("SELECT latitude, longitude FROM geobox WHERE geobox_id = ?", geoboxID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch geobox: %w", err)
	}
	defer rows.Close()

	var geobox []models.Location
	for rows.Next() {
		var point models.Location
		err := rows.Scan(&point.Latitude, &point.Longitude)
		if err != nil {
			return nil, fmt.Errorf("failed to scan geobox point: %w", err)
		}
		geobox = append(geobox, point)
	}

	return geobox, nil
}

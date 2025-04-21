package storage

import (
    "database/sql"
    "fmt"
    "whereisglinda-backend/models"
)

// SaveGeobox saves a set of 4 geobox coordinates to the database
func SaveGeobox(geobox []models.Location) error {
    if len(geobox) != 4 {
        return fmt.Errorf("geobox must contain exactly 4 coordinates")
    }

    // Generate a new geobox_id
    result, err := DB.Exec("INSERT INTO geobox (latitude, longitude) VALUES (?, ?)", geobox[0].Latitude, geobox[0].Longitude)
    if err != nil {
        return fmt.Errorf("failed to insert geobox: %w", err)
    }

    // Retrieve the generated geobox_id
    geoboxID, err := result.LastInsertId()
    if err != nil {
        return fmt.Errorf("failed to retrieve geobox ID: %w", err)
    }

    // Insert the remaining 3 coordinates with the same geobox_id
    for i := 1; i < len(geobox); i++ {
        _, err := DB.Exec("INSERT INTO geobox (geobox_id, latitude, longitude) VALUES (?, ?, ?)", geoboxID, geobox[i].Latitude, geobox[i].Longitude)
        if err != nil {
            return fmt.Errorf("failed to save geobox point: %w", err)
        }
    }

    return nil
}

// GetGeobox retrieves the latest set of 4 geobox coordinates from the database
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

    // Query the coordinates for the latest geobox_id
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

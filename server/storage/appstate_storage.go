package storage

import (
	"database/sql"
	"fmt"
	"whereisglinda-backend/models"
)

// GetAppState retrieves the app state by querying the active trip
func GetAppState() (models.AppState, error) {
	var appState models.AppState

	// Query the latest active trip
	row := DB.QueryRow(`
        SELECT trip_id, ride_status
        FROM trips
        WHERE end_time IS NULL
        ORDER BY trip_id DESC
        LIMIT 1
    `)

	var tripID sql.NullInt64
	var rideStatus sql.NullString
	err := row.Scan(&tripID, &rideStatus)
	if err != nil {
		if err == sql.ErrNoRows {
			// No active trip
			appState.RideStatus = "No Active Trip"
			appState.ActiveTripID = nil
			return appState, nil
		}
		return appState, fmt.Errorf("failed to query active trip: %w", err)
	}

	// Populate the app state
	appState.ActiveTripID = intPointer(int(tripID.Int64))
	appState.RideStatus = rideStatus.String

	// Fetch geobox
	geobox, err := GetGeobox()
	if err != nil {
		return appState, fmt.Errorf("failed to fetch geobox: %w", err)
	}
	appState.HomeGeobox = geobox

	return appState, nil
}

// Helper function to convert int to *int
func intPointer(i int) *int {
	return &i
}

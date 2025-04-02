package storage

import (
	"encoding/json"
	"fmt"
	"whereisglinda-backend/models"
)

// UpdateAppState updates the app state in the database
func UpdateAppState(state models.AppState) error {
	homeGeoboxJSON, err := json.Marshal(state.HomeGeobox)
	if err != nil {
		return fmt.Errorf("failed to marshal home geobox: %w", err)
	}

	_, err = DB.Exec("UPDATE app_state SET ride_status = ?, home_geobox = ? WHERE id = 1", state.RideStatus, string(homeGeoboxJSON))
	if err != nil {
		return fmt.Errorf("failed to update app state: %w", err)
	}
	return nil
}

// UpdateRideStatus updates only the ride status in the database
func UpdateRideStatus(rideStatus string) error {
	_, err := DB.Exec("UPDATE app_state SET ride_status = ? WHERE id = 1", rideStatus)
	if err != nil {
		return fmt.Errorf("failed to update ride status: %w", err)
	}
	return nil
}

// UpdateHomeGeobox updates only the home geobox in the database
func UpdateHomeGeobox(homeGeobox [4]models.Location) error {
	homeGeoboxJSON, err := json.Marshal(homeGeobox)
	if err != nil {
		return fmt.Errorf("failed to marshal home geobox: %w", err)
	}

	_, err = DB.Exec("UPDATE app_state SET home_geobox = ? WHERE id = 1", string(homeGeoboxJSON))
	if err != nil {
		return fmt.Errorf("failed to update home geobox: %w", err)
	}
	return nil
}

// GetAppState retrieves the app state from the database
func GetAppState() (models.AppState, error) {
	var state models.AppState
	var homeGeoboxJSON string

	row := DB.QueryRow("SELECT ride_status, home_geobox FROM app_state WHERE id = 1")
	err := row.Scan(&state.RideStatus, &homeGeoboxJSON)
	if err != nil {
		return state, fmt.Errorf("failed to fetch app state: %w", err)
	}

	err = json.Unmarshal([]byte(homeGeoboxJSON), &state.HomeGeobox)
	if err != nil {
		return state, fmt.Errorf("failed to unmarshal home geobox: %w", err)
	}

	return state, nil
}

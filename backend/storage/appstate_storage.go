package storage

import (
    "encoding/json"
    "fmt"
    "whereisglinda-backend/handlers"
)

// UpdateAppState updates the app state in the database
func UpdateAppState(state handlers.AppState) error {
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

// GetAppState retrieves the app state from the database
func GetAppState() (handlers.AppState, error) {
    var state handlers.AppState
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

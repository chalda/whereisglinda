package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"whereisglinda-backend/logger"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"
)

// GetGeofenceHandler retrieves a geofence by ID
func GetGeofenceHandler(w http.ResponseWriter, r *http.Request) {
	// Extract geofence_id from query parameters
	geofenceIDStr := r.URL.Query().Get("id")
	if geofenceIDStr == "" {
		logger.Log.Error().Msg("Missing geofence ID parameter")
		http.Error(w, "Missing geofence ID parameter", http.StatusBadRequest)
		return
	}

	geofenceID, err := strconv.Atoi(geofenceIDStr)
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error parsing geofence ID")
		http.Error(w, "Invalid geofence ID parameter", http.StatusBadRequest)
		return
	}

	geofence, err := storage.GetGeofenceByID(geofenceID)
	if err != nil {
		logger.Log.Error().Err(err).Int("geofenceID", geofenceID).Msg("Error fetching geofence")
		http.Error(w, "Failed to fetch geofence", http.StatusInternalServerError)
		return
	}

	if geofence == nil {
		logger.Log.Debug().Int("geofenceID", geofenceID).Msg("Geofence not found")
		http.Error(w, "Geofence not found", http.StatusNotFound)
		return
	}

	logger.Log.Debug().Int("geofenceID", geofenceID).Msg("Geofence retrieved successfully")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(geofence)
}

// GetLatestGeofenceHandler retrieves the latest geofence
func GetLatestGeofenceHandler(w http.ResponseWriter, r *http.Request) {
	geofence, err := storage.GetLatestGeofence()
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error fetching latest geofence")
		http.Error(w, "Failed to fetch latest geofence", http.StatusInternalServerError)
		return
	}

	if geofence == nil {
		logger.Log.Debug().Msg("No geofence found")
		http.Error(w, "No geofence found", http.StatusNotFound)
		return
	}

	logger.Log.Debug().Msg("Latest geofence retrieved successfully")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(geofence)
}

// SaveGeofenceHandler saves a new geofence
func SaveGeofenceHandler(w http.ResponseWriter, r *http.Request) {
	var geofence []models.Location
	if err := json.NewDecoder(r.Body).Decode(&geofence); err != nil {
		logger.Log.Error().Err(err).Msg("Error decoding geofence payload")
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if len(geofence) != 4 {
		logger.Log.Error().Msg("Geofence must contain exactly 4 coordinates")
		http.Error(w, "Geofence must contain exactly 4 coordinates", http.StatusBadRequest)
		return
	}

	if err := storage.SaveGeofence(geofence); err != nil {
		logger.Log.Error().Err(err).Msg("Error saving geofence")
		http.Error(w, "Failed to save geofence", http.StatusInternalServerError)
		return
	}

	logger.Log.Debug().Interface("geofence", geofence).Msg("Geofence saved successfully")
	w.WriteHeader(http.StatusCreated)
}

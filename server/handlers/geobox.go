package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"
)

// GetGeofenceHandler retrieves a geofence by ID
func GetGeofenceHandler(w http.ResponseWriter, r *http.Request) {
	// Extract geofence_id from query parameters
	geofenceIDStr := r.URL.Query().Get("id")
	if geofenceIDStr == "" {
		http.Error(w, "Missing geofence ID parameter", http.StatusBadRequest)
		return
	}

	geofenceID, err := strconv.Atoi(geofenceIDStr)
	if err != nil {
		http.Error(w, "Invalid geofence ID parameter", http.StatusBadRequest)
		return
	}

	geofence, err := storage.GetGeofenceByID(geofenceID)
	if err != nil {
		http.Error(w, "Failed to fetch geofence", http.StatusInternalServerError)
		return
	}

	if geofence == nil {
		http.Error(w, "Geofence not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(geofence)
}

// GetLatestGeofenceHandler retrieves the latest geofence
func GetLatestGeofenceHandler(w http.ResponseWriter, r *http.Request) {
	geofence, err := storage.GetGeofence()
	if err != nil {
		http.Error(w, "Failed to fetch latest geofence", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(geofence)
}

// SaveGeofenceHandler saves a new geofence
func SaveGeofenceHandler(w http.ResponseWriter, r *http.Request) {
	var geofence []models.Location
	if err := json.NewDecoder(r.Body).Decode(&geofence); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if len(geofence) != 4 {
		http.Error(w, "Geofence must contain exactly 4 coordinates", http.StatusBadRequest)
		return
	}

	if err := storage.SaveGeofence(geofence); err != nil {
		http.Error(w, "Failed to save geofence", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

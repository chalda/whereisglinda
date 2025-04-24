package handlers

import (
	"encoding/json"
	"log"
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
		log.Println("Error: Missing geofence ID parameter")
		http.Error(w, "Missing geofence ID parameter", http.StatusBadRequest)
		return
	}

	geofenceID, err := strconv.Atoi(geofenceIDStr)
	if err != nil {
		log.Printf("Error parsing geofence ID: %v", err)
		http.Error(w, "Invalid geofence ID parameter", http.StatusBadRequest)
		return
	}

	geofence, err := storage.GetGeofenceByID(geofenceID)
	if err != nil {
		log.Printf("Error fetching geofence with ID %d: %v", geofenceID, err)
		http.Error(w, "Failed to fetch geofence", http.StatusInternalServerError)
		return
	}

	if geofence == nil {
		log.Printf("Geofence with ID %d not found", geofenceID)
		http.Error(w, "Geofence not found", http.StatusNotFound)
		return
	}

	log.Printf("Geofence with ID %d retrieved successfully", geofenceID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(geofence)
}

// GetLatestGeofenceHandler retrieves the latest geofence
func GetLatestGeofenceHandler(w http.ResponseWriter, r *http.Request) {
	geofence, err := storage.GetLatestGeofence()
	if err != nil {
		log.Printf("Error fetching latest geofence: %v", err)
		http.Error(w, "Failed to fetch latest geofence", http.StatusInternalServerError)
		return
	}

	if geofence == nil {
		log.Println("No geofence found")
		http.Error(w, "No geofence found", http.StatusNotFound)
		return
	}

	log.Println("Latest geofence retrieved successfully")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(geofence)
}

// SaveGeofenceHandler saves a new geofence
func SaveGeofenceHandler(w http.ResponseWriter, r *http.Request) {
	var geofence []models.Location
	if err := json.NewDecoder(r.Body).Decode(&geofence); err != nil {
		log.Printf("Error decoding geofence payload: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if len(geofence) != 4 {
		log.Println("Error: Geofence must contain exactly 4 coordinates")
		http.Error(w, "Geofence must contain exactly 4 coordinates", http.StatusBadRequest)
		return
	}

	if err := storage.SaveGeofence(geofence); err != nil {
		log.Printf("Error saving geofence: %v", err)
		http.Error(w, "Failed to save geofence", http.StatusInternalServerError)
		return
	}

	log.Printf("Geofence saved successfully: %+v", geofence)
	w.WriteHeader(http.StatusCreated)
}

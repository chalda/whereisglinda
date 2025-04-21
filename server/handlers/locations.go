package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"
)

var (
	locations   []models.TripLocation // Changed to store TripLocation
	locationsMu sync.Mutex
)

func AddLocation(w http.ResponseWriter, r *http.Request) {
	var location models.TripLocation
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate that tripID, latitude, and longitude are provided
	if location.TripID == 0 {
		http.Error(w, "tripID is required", http.StatusBadRequest)
		return
	}
	if location.Latitude == 0 {
		http.Error(w, "latitude is required", http.StatusBadRequest)
		return
	}
	if location.Longitude == 0 {
		http.Error(w, "longitude is required", http.StatusBadRequest)
		return
	}
	// Check if the tripID exists
	_, err := storage.GetTripByID(location.TripID)
	if err != nil {
		http.Error(w, "Invalid tripID", http.StatusBadRequest)
		return
	}

	// Save location to memory
	locationsMu.Lock()
	locations = append(locations, location)
	locationsMu.Unlock()

	// Save location to the database asynchronously
	go func() {
		if err := storage.SaveTripLocation(location); err != nil {
			fmt.Printf("Failed to save location to database: %v\n", err)
		}
	}()

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(location) // Respond with the saved location including tripID, lat, long
}

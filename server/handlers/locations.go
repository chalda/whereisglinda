package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"
)

// In memory push channel for new updates
var locationChan = make(chan models.TripLocation, 10)

// AddLocation receives a ping from the bus
func AddLocation(w http.ResponseWriter, r *http.Request) {
	var location models.TripLocation
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		log.Printf("Error decoding location payload: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate that tripID, latitude, and longitude are provided
	if location.TripID == 0 {
		log.Println("Error: tripID is required")
		http.Error(w, "tripID is required", http.StatusBadRequest)
		return
	}
	if location.Latitude == 0 || location.Longitude == 0 {
		log.Println("Error: latitude and longitude are required")
		http.Error(w, "latitude and longitude are required", http.StatusBadRequest)
		return
	}

	// Save location to the database
	if err := storage.SaveTripLocation(location); err != nil {
		log.Printf("Error saving location to database: %v", err)
		http.Error(w, "Failed to save location", http.StatusInternalServerError)
		return
	}

	log.Printf("Location added successfully: %+v", location)
	w.WriteHeader(http.StatusCreated)
}

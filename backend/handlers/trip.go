package handlers

import (
	"encoding/json"
	"net/http"
	"whereisglinda-backend/storage"
)

// CreateNewTrip increments the current trip ID and returns the new trip ID.
func CreateNewTrip(w http.ResponseWriter, r *http.Request) {
	// Increment the trip ID
	if err := storage.IncrementTripID(); err != nil {
		http.Error(w, "Failed to increment trip ID", http.StatusInternalServerError)
		return
	}

	// Get the new trip ID
	newTripID, err := storage.GetCurrentTripID()
	if err != nil {
		http.Error(w, "Failed to get new trip ID", http.StatusInternalServerError)
		return
	}

	// Respond with the new trip ID
	response := struct {
		TripID int `json:"tripID"`
	}{
		TripID: newTripID,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

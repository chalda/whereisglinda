package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"

	"github.com/gorilla/mux"
)

func CreateNewTrip(w http.ResponseWriter, r *http.Request) {
	// Create a new trip
	trip := &models.Trip{}
	err := storage.CreateTrip(storage.DB, trip)
	if err != nil {
		http.Error(w, "Failed to create new trip", http.StatusInternalServerError)
		return
	}

	// Get the new trip ID
	newTripID, err := storage.GetActiveTripID()
	if err != nil {
		http.Error(w, "Failed to get new trip ID", http.StatusInternalServerError)
		return
	}

	// Respond with the new trip ID
	response := struct {
		TripID int `json:"tripId"`
	}{
		TripID: *newTripID,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func GetTrip(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	tripID, err := strconv.Atoi(params["tripID"])
	if err != nil {
		http.Error(w, "Invalid trip ID", http.StatusBadRequest)
		return
	}

	trip, err := storage.GetTripByID(tripID)
	if err != nil {
		http.Error(w, "Failed to get trip", http.StatusInternalServerError)
		return
	}

	if trip == nil {
		http.Error(w, "Trip not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trip)
}

func EndTrip(w http.ResponseWriter, r *http.Request) {
	latestTripID, err := storage.GetActiveTripID()
	if err != nil {
		http.Error(w, "Failed to get latest trip ID", http.StatusInternalServerError)
		return
	}

	trip, err := storage.GetTripByID(*latestTripID)
	if err != nil {
		http.Error(w, "Failed to get latest trip", http.StatusInternalServerError)
		return
	}

	if trip.EndTime != nil {
		http.Error(w, "Trip is already ended", http.StatusBadRequest)
		return
	}

	err = storage.EndTrip(*latestTripID)
	if err != nil {
		http.Error(w, "Failed to end trip", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"

	"github.com/gorilla/mux"
)

// CreateNewTrip creates a new trip
func CreateNewTrip(w http.ResponseWriter, r *http.Request) {
	trip := &models.Trip{}
	err := storage.CreateTrip(storage.DB, trip)
	if err != nil {
		log.Printf("Error creating new trip: %v", err)
		http.Error(w, "Failed to create new trip", http.StatusInternalServerError)
		return
	}

	// Get the new trip ID
	newTripID, err := storage.GetActiveTripID()
	if err != nil {
		log.Printf("Error fetching new trip ID: %v", err)
		http.Error(w, "Failed to fetch new trip ID", http.StatusInternalServerError)
		return
	}

	// Respond with the new trip ID
	response := struct {
		TripID int `json:"tripId"`
	}{
		TripID: *newTripID,
	}

	log.Printf("New trip created successfully with ID: %d", *newTripID)
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

// EndTrip ends the currently active trip
func EndTrip(w http.ResponseWriter, r *http.Request) {
	latestTripID, err := storage.GetActiveTripID()
	if err != nil {
		log.Printf("Error fetching latest trip ID: %v", err)
		http.Error(w, "Failed to fetch latest trip ID", http.StatusInternalServerError)
		return
	}

	trip, err := storage.GetTripByID(*latestTripID)
	if err != nil {
		log.Printf("Error fetching trip with ID %d: %v", *latestTripID, err)
		http.Error(w, "Failed to fetch trip", http.StatusInternalServerError)
		return
	}

	if trip.EndTime != nil {
		log.Printf("Trip with ID %d is already ended", *latestTripID)
		http.Error(w, "Trip is already ended", http.StatusBadRequest)
		return
	}

	err = storage.EndTrip(*latestTripID)
	if err != nil {
		log.Printf("Error ending trip with ID %d: %v", *latestTripID, err)
		http.Error(w, "Failed to end trip", http.StatusInternalServerError)
		return
	}

	log.Printf("Trip with ID %d ended successfully", *latestTripID)
	w.WriteHeader(http.StatusOK)
}

// GetActiveTrip retrieves the currently active trip
func GetActiveTrip(w http.ResponseWriter, r *http.Request) {
	trip, err := storage.GetActiveTripWithLatestLocation(storage.DB)
	if err != nil {
		log.Printf("Error fetching active trip: %v", err)
		http.Error(w, "Failed to fetch active trip", http.StatusInternalServerError)
		return
	}

	if trip == nil {
		log.Println("No active trip found")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "No active trip found"})
		return
	}

	rideStatus := trip.RideStatus
	if trip.InGeofence.Valid && trip.InGeofence.Bool {
		rideStatus = "Home"
	}

	resp := map[string]interface{}{
		"tripId":     trip.TripID,
		"active":     trip.Active,
		"rideStatus": rideStatus,
		"startTime":  trip.StartTime,
	}
	if trip.EndTime != nil {
		resp["endTime"] = trip.EndTime
	}
	if trip.Timestamp.Valid {
		resp["lastUpdate"] = trip.Timestamp.Time
	}

	log.Printf("Active trip retrieved: %+v", resp)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetLatestTripLocations retrieves the latest locations for the active trip
func GetLatestTripLocations(w http.ResponseWriter, r *http.Request) {
	tripID, err := storage.GetActiveTripID()
	if err != nil || tripID == nil {
		log.Printf("Error fetching active trip ID: %v", err)
		http.Error(w, "No active trip", http.StatusNotFound)
		return
	}

	var after *time.Time
	if afterParam := r.URL.Query().Get("after"); afterParam != "" {
		if t, err := time.Parse(time.RFC3339, afterParam); err == nil {
			after = &t
		}
	}

	locations, err := storage.GetLocationsForTripFiltered(*tripID, after)
	if err != nil {
		log.Printf("Error fetching locations for trip ID %d: %v", *tripID, err)
		http.Error(w, "Failed to fetch trip locations", http.StatusInternalServerError)
		return
	}

	log.Printf("Retrieved %d locations for trip ID %d", len(locations), *tripID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(locations)
}

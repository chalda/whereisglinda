package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
	"whereisglinda-backend/logger"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"

	"github.com/gorilla/mux"
)

// StartNewTrip creates a new active trip, ends the previous one if it exists, and returns the new trip ID
func StartNewTrip(w http.ResponseWriter, r *http.Request) {
	err := storage.StartTrip("", "Riding")
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error creating new trip")
		http.Error(w, "Failed to create new trip", http.StatusInternalServerError)
		return
	}

	// Get the new trip ID
	newTripID, err := storage.GetActiveTripID()
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error fetching new trip ID")
		http.Error(w, "Failed to fetch new trip ID", http.StatusInternalServerError)
		return
	}

	// Respond with the new trip ID
	response := struct {
		TripID int `json:"tripId"`
	}{
		TripID: *newTripID,
	}

	logger.Log.Debug().Int("tripID", *newTripID).Msg("New trip created successfully")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// UpdateTrip updates the details of an existing trip
func UpdateTrip(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	tripID, err := strconv.Atoi(params["tripID"])
	if err != nil {
		logger.Log.Error().Err(err).Msg("Invalid trip ID")
		http.Error(w, "Invalid trip ID", http.StatusBadRequest)
		return
	}

	var trip models.Trip
	if err := json.NewDecoder(r.Body).Decode(&trip); err != nil {
		logger.Log.Error().Err(err).Msg("Error decoding request body")
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = storage.UpdateTrip(storage.DB, tripID, &trip)
	if err != nil {
		logger.Log.Error().Err(err).Int("tripID", tripID).Msg("Error updating trip")
		http.Error(w, "Failed to update trip", http.StatusInternalServerError)
		return
	}

	logger.Log.Debug().Int("tripID", tripID).Msg("Trip updated successfully")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(trip)
}

// GetTrip retrieves a trip by its ID`
func GetTrip(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	tripID, err := strconv.Atoi(params["tripID"])
	if err != nil {
		logger.Log.Error().Err(err).Msg("Invalid trip ID")
		http.Error(w, "Invalid trip ID", http.StatusBadRequest)
		return
	}

	trip, err := storage.GetTripByID(tripID)
	if err != nil {
		logger.Log.Error().Err(err).Int("tripID", tripID).Msg("Failed to get trip")
		http.Error(w, "Failed to get trip", http.StatusInternalServerError)
		return
	}

	if trip == nil {
		logger.Log.Debug().Int("tripID", tripID).Msg("Trip not found")
		http.Error(w, "Trip not found", http.StatusNotFound)
		return
	}

	logger.Log.Debug().Int("tripID", tripID).Msg("Trip retrieved successfully")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trip)
}

// EndTrip ends the currently active trip
func EndTrip(w http.ResponseWriter, r *http.Request) {
	latestTripID, err := storage.GetActiveTripID()
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error fetching latest trip ID")
		http.Error(w, "Failed to fetch latest trip ID", http.StatusInternalServerError)
		return
	}

	trip, err := storage.GetTripByID(*latestTripID)
	if err != nil {
		logger.Log.Error().Err(err).Int("tripID", *latestTripID).Msg("Error fetching trip")
		http.Error(w, "Failed to fetch trip", http.StatusInternalServerError)
		return
	}

	if trip.EndTime != nil {
		logger.Log.Debug().Int("tripID", *latestTripID).Msg("Trip is already ended")
		http.Error(w, "Trip is already ended", http.StatusBadRequest)
		return
	}

	err = storage.EndTrip(*latestTripID)
	if err != nil {
		logger.Log.Error().Err(err).Int("tripID", *latestTripID).Msg("Error ending trip")
		http.Error(w, "Failed to end trip", http.StatusInternalServerError)
		return
	}

	logger.Log.Debug().Int("tripID", *latestTripID).Msg("Trip ended successfully")
	w.WriteHeader(http.StatusOK)
}

// GetActiveTrip retrieves the currently active trip
func GetActiveTrip(w http.ResponseWriter, r *http.Request) {
	trip, err := storage.GetActiveTripWithLatestLocation(storage.DB)
	if err != nil {
		logger.Log.Error().Err(err).Msg("Error fetching active trip")
		http.Error(w, "Failed to fetch active trip", http.StatusInternalServerError)
		return
	}

	if trip == nil {
		logger.Log.Debug().Msg("No active trip found")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "No active trip found"})
		return
	}

	// If trip is in geofence, set rideStatus to "Home"
	// Otherwise, use the rideStatus from the trip
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

	logger.Log.Debug().Interface("trip", resp).Msg("Active trip retrieved")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// GetLatestTripLocations retrieves the latest locations for the active trip
func GetLatestTripLocations(w http.ResponseWriter, r *http.Request) {
	tripID, err := storage.GetActiveTripID()
	if err != nil || tripID == nil {
		logger.Log.Error().Err(err).Msg("Error fetching active trip ID")
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
		logger.Log.Error().Err(err).Int("tripID", *tripID).Msg("Error fetching trip locations")
		http.Error(w, "Failed to fetch trip locations", http.StatusInternalServerError)
		return
	}

	logger.Log.Debug().Int("tripID", *tripID).Msgf("Locations retrieved: %v", locations)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(locations)
}

package handlers

import (
	"encoding/json"
	"net/http"
	"whereisglinda-backend/logger"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"
)

// In memory push channel for new updates
var locationChan = make(chan models.TripLocation, 10)

// AddLocation receives a ping from the bus
func AddLocation(w http.ResponseWriter, r *http.Request) {
	var location models.TripLocation
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		logger.Log.Error().Err(err).Msg("Error decoding location payload")
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate that tripID, latitude, and longitude are provided
	if location.TripID == 0 {
		logger.Log.Error().Msg("Error: tripID is required")
		http.Error(w, "tripID is required", http.StatusBadRequest)
		return
	}
	if location.Latitude == 0 || location.Longitude == 0 {
		logger.Log.Error().Msg("Error: latitude and longitude are required")
		http.Error(w, "latitude and longitude are required", http.StatusBadRequest)
		return
	}

	// Save location to the database
	if err := storage.SaveTripLocation(location); err != nil {
		logger.Log.Error().Err(err).Msg("Error saving location to database")
		http.Error(w, "Failed to save location", http.StatusInternalServerError)
		return
	}

	// Push location to the in-memory channel
	select {
	case locationChan <- location:
		logger.Log.Debug().Interface("location", location).Msg("Location pushed to channel")
	default:
		logger.Log.Error().Msg("Location channel is full, dropping location")
	}

	logger.Log.Debug().Interface("location", location).Msg("Location added successfully")
	w.WriteHeader(http.StatusCreated)
}

package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
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
	if len(storage.HOME_GEOFENCE) > 0 {
		location.InGeofence = storage.PointInPolygon(location.Location, storage.HOME_GEOFENCE)
	}

	// Save location to the database
	if err := storage.SaveTripLocation(location); err != nil {
		logger.Log.Error().Err(err).Msg("Error saving location to database")
		http.Error(w, "Failed to save location", http.StatusInternalServerError)
		return
	}

	logger.Log.Debug().Interface("location", location).Msg("Location added successfully")
	w.WriteHeader(http.StatusCreated)

	if !location.InGeofence {
		// Non-blocking send to channel
		select {
		case locationChan <- location:
			logger.Log.Debug().Interface("location", location).Msg("Location pushed to channel")
		default:
			logger.Log.Error().Msg("Location channel is full, dropping location")
		}
	}
}

// SubscribeLocation handles the subscription to real-time location updates
// It uses Server-Sent Events (SSE) to push updates to the client
// The client can subscribe to this endpoint to receive real-time location updates
// The client should set the Accept header to "text/event-stream" to receive SSE
// The client should also handle reconnections in case of network issues
// The client should also handle the "ping" event to keep the connection alive
// The client should also handle the "error" event in case of errors
// The client should also handle the "data" event to receive location updates
// The client should also handle the "close" event to close the connection
// The client should also handle the "retry" event to set the retry interval
// The client should also handle the "id" event to set the last event ID
func SubscribeLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		logger.Log.Error().Msg("Streaming unsupported")
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	// Set SSE retry interval to 5 seconds (client will retry after disconnect)
	fmt.Fprintf(w, "retry: 5000\n\n")
	flusher.Flush()

	notify := w.(http.CloseNotifier).CloseNotify()
	// Set ping interval to less than server's WriteTimeout (30s)
	pingTicker := time.NewTicker(10 * time.Second)
	defer pingTicker.Stop()

	logger.Log.Debug().Msg("SSE subscription started")

	for {
		select {
		case <-notify:
			logger.Log.Debug().Msg("Client disconnected from subscription")
			return
		case loc := <-locationChan:
			logger.Log.Debug().Interface("location", loc).Msg("Received location from channel")
			data, err := json.Marshal(loc)
			if err != nil {
				logger.Log.Error().Err(err).Msg("Error marshaling location data")
				fmt.Fprintf(w, "event: error\ndata: %s\n\n", err.Error())
				flusher.Flush()
				continue
			}
			logger.Log.Debug().Int("data_len", len(data)).Msg("Marshaled location data")

			// Write data event
			_, writeErr := fmt.Fprintf(w, "data: %s\n\n", data)
			if writeErr != nil {
				logger.Log.Error().Err(writeErr).Msg("Error writing data to SSE connection")
				// Depending on the nature of the write error, you might want to return here
				// return // Consider returning on write errors
			} else {
				logger.Log.Debug().Msg("Successfully wrote data to SSE connection")
			}


			// Flush data
			flusher.Flush()
			logger.Log.Debug().Msg("Successfully flushed data to SSE connection")


		case <-pingTicker.C:
			// Send a ping event every 10 seconds to keep the connection alive
			logger.Log.Debug().Msg("Sending SSE ping event")
			_, writeErr := fmt.Fprint(w, "event: ping\ndata: {}\n\n")
			if writeErr != nil {
				logger.Log.Error().Err(writeErr).Msg("Error writing ping to SSE connection")
				// Consider returning on write errors
				// return
			} else {
				logger.Log.Debug().Msg("Successfully wrote ping to SSE connection")
			}
			flusher.Flush()
			logger.Log.Debug().Msg("Successfully flushed ping to SSE connection")
		}
	}
}

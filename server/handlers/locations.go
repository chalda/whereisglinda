package handlers

import (
	"encoding/json"
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
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if location.TripID == 0 || location.Latitude == 0 || location.Longitude == 0 {
		http.Error(w, "tripID, latitude, and longitude are required", http.StatusBadRequest)
		return
	}

	if _, err := storage.GetTripByID(location.TripID); err != nil {
		http.Error(w, "Invalid tripID", http.StatusBadRequest)
		return
	}

	location.InGeofence = storage.PointInPolygon(location.Location, storage.HOME_GEOFENCE)

	go func() {
		_ = storage.SaveTripLocation(location)
		if !location.InGeofence {
			locationChan <- location
		}
	}()

	w.WriteHeader(http.StatusCreated)
}

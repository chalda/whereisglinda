package handlers

import (
	"encoding/json"
	"net/http"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"
)

// GetGeoboxHandler retrieves the latest geobox
func GetGeoboxHandler(w http.ResponseWriter, r *http.Request) {
	geobox, err := storage.GetGeobox()
	if err != nil {
		http.Error(w, "Failed to fetch geobox", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(geobox)
}

// SaveGeoboxHandler saves a new geobox
func SaveGeoboxHandler(w http.ResponseWriter, r *http.Request) {
	var geobox []models.Location
	if err := json.NewDecoder(r.Body).Decode(&geobox); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if len(geobox) != 4 {
		http.Error(w, "Geobox must contain exactly 4 coordinates", http.StatusBadRequest)
		return
	}

	if err := storage.SaveGeobox(geobox); err != nil {
		http.Error(w, "Failed to save geobox", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

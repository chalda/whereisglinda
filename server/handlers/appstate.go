package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"log"
	"sync"
	"whereisglinda-backend/models"
	"whereisglinda-backend/storage"
)

var (
	appState   models.AppState
	appStateMu sync.Mutex
)

func GetAppState(w http.ResponseWriter, r *http.Request) {
	appState, err := storage.GetAppState()
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to get app state", http.StatusInternalServerError)
		return
	}

	activeTripId, err := storage.GetActiveTripID()
	appState.ActiveTripID = activeTripId

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(appState)
}

func SetAppState(w http.ResponseWriter, r *http.Request) {
	var newState models.AppState
	if err := json.NewDecoder(r.Body).Decode(&newState); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := storage.UpdateAppState(newState); err != nil {
		http.Error(w, "Failed to update app state", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "App state updated successfully")
}

func SetRideStatus(w http.ResponseWriter, r *http.Request) {
	var request struct {
		RideStatus string `json:"rideStatus"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := storage.UpdateRideStatus(request.RideStatus); err != nil {
		http.Error(w, "Failed to update ride status", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Ride status updated successfully")
}

func SetHomeGeobox(w http.ResponseWriter, r *http.Request) {
	var request struct {
		HomeGeobox [4]models.Location `json:"homeGeobox"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := storage.UpdateHomeGeobox(request.HomeGeobox); err != nil {
		http.Error(w, "Failed to update home geobox", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Home geobox updated successfully")
}

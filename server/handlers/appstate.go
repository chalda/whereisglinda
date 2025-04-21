package handlers

import (
	"encoding/json"
	"log"
	"net/http"
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
		log.Printf("Error fetching app state: %v", err)
		http.Error(w, "Failed to get app state", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(appState)
}

package handlers

import (
    "encoding/json"
    "fmt"
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
    state, err := storage.GetAppState()
    if err != nil {
        http.Error(w, "Failed to fetch app state", http.StatusInternalServerError)
        return
    }

    if err := json.NewEncoder(w).Encode(state); err != nil {
        http.Error(w, "Failed to encode app state", http.StatusInternalServerError)
        return
    }
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

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
    locations   []models.Location
    locationsMu sync.Mutex
)

func AddLocation(w http.ResponseWriter, r *http.Request) {
    var location models.Location
    if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Validate that tripID is provided
    if location.TripID == 0 {
        http.Error(w, "tripID is required", http.StatusBadRequest)
        return
    }

    // Save location to memory
    locationsMu.Lock()
    locations = append(locations, location)
    locationsMu.Unlock()

    // Save location to the database asynchronously
    go func() {
        if err := storage.SaveLocation(location); err != nil {
            fmt.Printf("Failed to save location to database: %v\n", err)
        }
    }()

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(location) // Respond with the saved location including tripID
}

func SetTrip(w http.ResponseWriter, r *http.Request) {
    var request struct {
        TripID int `json:"tripID"`
    }

    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Validate that tripID is provided
    if request.TripID == 0 {
        http.Error(w, "tripID is required", http.StatusBadRequest)
        return
    }

    // Update the current trip ID in the database
    if err := storage.SetCurrentTripID(request.TripID); err != nil {
        http.Error(w, "Failed to set trip ID", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    fmt.Fprintln(w, "Trip ID set successfully")
}

package handlers

import (
    "encoding/json"
    "fmt"
    "net/http"
    "sync"
    "whereisglinda-backend/storage"
)

type Location struct {
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
}

var (
    locations   []Location
    locationsMu sync.Mutex
)

func AddLocation(w http.ResponseWriter, r *http.Request) {
    var location Location
    if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
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
    fmt.Fprintln(w, "Location added successfully")
}

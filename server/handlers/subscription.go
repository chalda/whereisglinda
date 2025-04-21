package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

var (
	locationUpdates []map[string]interface{}
	mu              sync.Mutex
)

// AddLocationHandler handles incoming location updates
func AddLocationHandler(w http.ResponseWriter, r *http.Request) {
	var locationUpdate map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&locationUpdate); err != nil {
		http.Error(w, "Invalid location update", http.StatusBadRequest)
		return
	}

	mu.Lock()
	locationUpdates = append(locationUpdates, locationUpdate)
	if len(locationUpdates) > 100 {
		locationUpdates = locationUpdates[1:] // Keep only the last 100 updates
	}
	mu.Unlock()

	w.WriteHeader(http.StatusOK)
}

// SubscribeLocation streams location updates to clients
func SubscribeLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	for {
		mu.Lock()
		if len(locationUpdates) == 0 {
			mu.Unlock()
			continue
		}

		latestUpdate := locationUpdates[len(locationUpdates)-1]
		mu.Unlock()

		data, err := json.Marshal(latestUpdate)
		if err != nil {
			http.Error(w, "Failed to encode location update", http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "data: %s\n\n", data)
		w.(http.Flusher).Flush()
	}
}

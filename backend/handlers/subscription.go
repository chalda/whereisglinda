package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func SubscribeLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	for {
		locationsMu.Lock()
		if len(locations) == 0 {
			locationsMu.Unlock()
			time.Sleep(2 * time.Second)
			continue
		}

		latestLocation := locations[len(locations)-1]
		locationsMu.Unlock()

		data, err := json.Marshal(latestLocation)
		if err != nil {
			http.Error(w, "Failed to encode location", http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "data: %s\n\n", data)
		w.(http.Flusher).Flush()
		time.Sleep(2 * time.Second)
	}
}

package routes

import (
	"log"
	"net/http"
	"time"
	"whereisglinda-backend/handlers"

	"github.com/gorilla/mux"
)

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s %s", r.Method, r.RequestURI, r.RemoteAddr, time.Since(start))
	})
}

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()
	router.Use(loggingMiddleware)

	all := []string{"driver", "bus", "admin"}

	// Geofence Endpoints
	router.HandleFunc("/geofence", handlers.GetLatestGeofenceHandler).Methods("GET") // Fetch latest geofence
	router.HandleFunc("/geofence/{id}", handlers.GetGeofenceHandler).Methods("GET")  // Fetch geofence by ID
	router.HandleFunc("/geofence", handlers.SaveGeofenceHandler).Methods("POST")     // Save geofence

	// Location Endpoints
	router.HandleFunc("/locations", handlers.Authorize(all, handlers.AddLocation)).Methods("POST")  // Add location
	router.HandleFunc("/locations", handlers.GetLatestTripLocations).Methods("GET")                 // Get latest trip locations
	router.HandleFunc("/locations/subscribe", handlers.SubscribeLocation).Methods("OPTIONS", "GET") // Subscribe to real-time location updates

	// Trip Endpoints
	router.HandleFunc("/trip", handlers.CreateNewTrip).Methods("POST")       // Create a new trip
	router.HandleFunc("/trip/end", handlers.EndTrip).Methods("POST")         // End a trip
	router.HandleFunc("/trip/active", handlers.GetActiveTrip).Methods("GET") // Fetch active trip

	// API Key Validation
	router.HandleFunc("/validate", handlers.ValidateKey).Methods("POST") // Validate API key

	return router
}

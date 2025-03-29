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

	// App State Endpoints
	router.HandleFunc("/state", handlers.GetAppState).Methods("GET")                                             // Fetch app state
	router.HandleFunc("/state/rideStatus", handlers.Authorize("driver", handlers.SetRideStatus)).Methods("POST") // Set ride status
	router.HandleFunc("/state/homeGeobox", handlers.Authorize("admin", handlers.SetHomeGeobox)).Methods("POST")  // Set home geobox

	// Location Endpoints
	router.HandleFunc("/locations", handlers.Authorize("bus", handlers.AddLocation)).Methods("POST") // Add location
	router.HandleFunc("/locations/subscribe", handlers.SubscribeLocation).Methods("GET")             // Subscribe to real-time location updates

	// Trip Endpoints
	router.HandleFunc("/trip", handlers.Authorize("driver", handlers.CreateNewTrip)).Methods("POST") // Create a new trip

	// API Key Validation
	router.HandleFunc("/validate", handlers.ValidateKey).Methods("POST") // Validate API key

	return router
}

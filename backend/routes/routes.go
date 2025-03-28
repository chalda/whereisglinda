package routes

import (
	"whereisglinda-backend/handlers"

	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

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

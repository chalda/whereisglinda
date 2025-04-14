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
	// App State Endpoints
	router.HandleFunc("/state", handlers.GetAppState).Methods("GET")                                        // Fetch app state
	router.HandleFunc("/state/rideStatus", handlers.Authorize(all, handlers.SetRideStatus)).Methods("POST") // Set ride status
	router.HandleFunc("/state/homeGeobox", handlers.Authorize(all, handlers.SetHomeGeobox)).Methods("POST") // Set home geobox

	// Location Endpoints
	router.HandleFunc("/locations", handlers.Authorize(all, handlers.AddLocation)).Methods("POST") // Add location
	router.HandleFunc("/locations", handlers.GetLatestTripLocations).Methods("GET")
	// Subscribe to real-time location updates
	// Trip Endpoints
	router.HandleFunc("/locations/subscribe", handlers.SubscribeLocation).Methods("OPTIONS", "GET")
	tripRouter := router.PathPrefix("/trip").Subrouter()
	tripRouter.HandleFunc("", handlers.CreateNewTrip).Methods("POST")
	tripRouter.HandleFunc("/end", handlers.EndTrip).Methods("POST")

	//tripRouter.HandleFunc("/{tripID}", handlers.GetTrip).Methods("GET")

	// API Key Validation
	router.HandleFunc("/validate", handlers.ValidateKey).Methods("POST") // Validate API key

	return router
}

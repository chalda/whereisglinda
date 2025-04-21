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

	// Geobox Endpoints
	router.HandleFunc("/geobox", handlers.GetGeoboxHandler).Methods("GET")   // Fetch geobox
	router.HandleFunc("/geobox", handlers.SaveGeoboxHandler).Methods("POST") // Save geobox

	// Location Endpoints
	router.HandleFunc("/locations", handlers.Authorize(all, handlers.AddLocation)).Methods("POST")  // Add location
	router.HandleFunc("/locations", handlers.GetLatestTripLocations).Methods("GET")                 // Get latest trip locations
	router.HandleFunc("/locations/subscribe", handlers.SubscribeLocation).Methods("OPTIONS", "GET") // Subscribe to real-time location updates

	// Trip Endpoints
	tripRouter := router.PathPrefix("/trip").Subrouter()
	tripRouter.HandleFunc("", handlers.CreateNewTrip).Methods("POST")       // Create a new trip
	tripRouter.HandleFunc("/end", handlers.EndTrip).Methods("POST")         // End a trip
	tripRouter.HandleFunc("/active", handlers.GetActiveTrip).Methods("GET") // Fetch active trip

	// API Key Validation
	router.HandleFunc("/validate", handlers.ValidateKey).Methods("POST") // Validate API key

	return router
}

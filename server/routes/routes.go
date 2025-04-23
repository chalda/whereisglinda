package routes

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"
	"whereisglinda-backend/handlers"

	muxHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	// Geofence Endpoints
	router.HandleFunc("/geofence", handlers.GetLatestGeofenceHandler).Methods("GET") // Fetch latest geofence
	router.HandleFunc("/geofence/{id}", handlers.GetGeofenceHandler).Methods("GET")  // Fetch geofence by ID
	router.HandleFunc("/geofence", handlers.SaveGeofenceHandler).Methods("POST")     // Save geofence

	// Location Endpoints
	router.HandleFunc("/locations", handlers.Authorize([]string{"driver", "bus", "admin"}, handlers.AddLocation)).Methods("POST") // Add location
	router.HandleFunc("/locations", handlers.GetLatestTripLocations).Methods("GET")                                               // Get latest trip locations
	router.HandleFunc("/locations/subscribe", handlers.SubscribeLocation).Methods("OPTIONS", "GET")                               // Subscribe to real-time location updates

	// Trip Endpoints
	router.HandleFunc("/trip", handlers.CreateNewTrip).Methods("POST")       // Create a new trip
	router.HandleFunc("/trip/end", handlers.EndTrip).Methods("POST")         // End a trip
	router.HandleFunc("/trip/active", handlers.GetActiveTrip).Methods("GET") // Fetch active trip

	// API Key Validation
	router.HandleFunc("/validate", handlers.ValidateKey).Methods("POST") // Validate API key

	return router
}

func StartServer() {
	router := SetupRoutes()

	// Wrap the router with middleware
	loggedRouter := muxHandlers.LoggingHandler(os.Stdout, router) // Log all requests to stdout
	recoveryRouter := muxHandlers.RecoveryHandler()(loggedRouter) // Recover from panics
	corsRouter := muxHandlers.CORS(                               // Handle OPTIONS requests and CORS
		muxHandlers.AllowedOrigins([]string{"*"}),
		muxHandlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
		muxHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(recoveryRouter)

	// Create the HTTP server
	server := &http.Server{
		Addr:         ":8080",
		Handler:      corsRouter,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown handling
	go func() {
		log.Printf("Server is running on http://localhost%s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on %s: %v\n", server.Addr, err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, os.Kill)

	<-stop
	log.Println("Shutting down the server...")

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server stopped gracefully")
}

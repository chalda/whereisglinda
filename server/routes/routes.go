package routes

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"time"
	"whereisglinda-backend/handlers"
	"whereisglinda-backend/logger"

	muxHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

// SetupRoutes configures all HTTP routes for the server.
func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	// Geofence Endpoints
	router.HandleFunc("/geofence", handlers.GetLatestGeofenceHandler).Methods("GET") // Fetch latest geofence
	router.HandleFunc("/geofence/{id}", handlers.GetGeofenceHandler).Methods("GET")  // Fetch geofence by ID
	router.HandleFunc("/geofence", handlers.SaveGeofenceHandler).Methods("POST")     // Save geofence

	// Location Endpoints
	router.HandleFunc("/locations", handlers.Authorize([]string{"driver", "bus", "admin"}, handlers.AddLocation)).Methods("POST") // Add location
	router.HandleFunc("/locations", handlers.GetLatestTripLocations).Methods("GET")                                               // Get latest trip locations
	router.HandleFunc("/locations/subscribe", handlers.SubscribeLocation).Methods("GET")                                          // Subscribe to real-time location updates

	// Trip Endpoints
	router.HandleFunc("/trip", handlers.StartNewTrip).Methods("POST") // Create a new trip
	// @TODO replace /end with update active=0 /trip/{id}/
	router.HandleFunc("/trip/{tripID}", handlers.UpdateTrip).Methods("PUT")                     // End a trip by ID
	router.HandleFunc("/trip/end", handlers.EndTrip).Methods("POST")                            // End a trip
	router.HandleFunc("/trip/active", handlers.GetActiveTrip).Methods("GET")                    // Fetch active trip
	router.HandleFunc("/trip/active/locations", handlers.GetLatestTripLocations).Methods("GET") // Fetch active trip

	// API Key Validation
	router.HandleFunc("/validate", handlers.ValidateKey).Methods("POST") // Validate API key

	return router
}

// zerologRecoveryLogger is a custom recovery logger for gorilla/handlers that writes to zerolog.
type zerologRecoveryLogger struct{}

func (z zerologRecoveryLogger) Println(args ...interface{}) {
	logger.Log.Error().Msgf("PANIC: %v", args)
}

func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Content-Security-Policy", "default-src 'self'")
		w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		next.ServeHTTP(w, r)
	})
}

// Handle OPTIONS requests and CORS
func corsHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("CORS middleware: Origin=%s, Method=%s\n", r.Header.Get("Origin"), r.Method)
		if os.Getenv("ENV") == "development" {
			muxHandlers.CORS(
				muxHandlers.AllowedOrigins([]string{"*"}),
				muxHandlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
				muxHandlers.AllowedHeaders([]string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "X-User-Agent", "Origin"}),
				muxHandlers.ExposedHeaders([]string{"Content-Length", "Transfer-Encoding", "Connection", "Cache-Control", "Content-Type"}),
			)(next).ServeHTTP(w, r)
		} else {
			muxHandlers.CORS(
				muxHandlers.AllowedOrigins([]string{os.Getenv("DOMAIN")}),
				muxHandlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
				muxHandlers.AllowedHeaders([]string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "X-User-Agent", "Origin"}),
				muxHandlers.ExposedHeaders([]string{"Content-Length", "Transfer-Encoding", "Connection", "Cache-Control", "Content-Type"}),
			)(next).ServeHTTP(w, r)
		}
	})
}

// StartServer starts the HTTP server with logging, recovery, CORS, and graceful shutdown.
func StartServer() {
	router := SetupRoutes()

	// Use zerolog for access logging to both stdout and access.log
	accessLogWriter := logger.AccessLog
	loggedRouter := muxHandlers.LoggingHandler(accessLogWriter, router)

	recoveryRouter := muxHandlers.RecoveryHandler(
		muxHandlers.PrintRecoveryStack(true),
		muxHandlers.RecoveryLogger(zerologRecoveryLogger{}),
	)(loggedRouter) // Recover from panics

	// Add security headers middleware
	secureRouter := securityHeadersMiddleware(recoveryRouter)
	corsRouter := corsHeadersMiddleware(secureRouter)

	server := &http.Server{
		Addr:         ":8080",
		Handler:      corsRouter,
		ReadTimeout:  300 * time.Second,
		WriteTimeout: 0,
		IdleTimeout:  0,
	}

	go func() {
		logger.Log.Info().Str("addr", server.Addr).Msg("Server is running")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Log.Fatal().Err(err).Msgf("Could not listen on %s", server.Addr)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, os.Kill)

	<-stop
	logger.Log.Info().Msg("Shutting down the server...")

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	logger.Log.Info().Msg("Server stopped gracefully")
}

package main

import (
	"log"
	"net/http"
	"os"
	"whereisglinda-backend/models"
	"whereisglinda-backend/routes"
	"whereisglinda-backend/storage"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

var (
	AdminAPIKey  string
	DriverAPIKey string
	BusAPIKey    string
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Load API keys
	AdminAPIKey = os.Getenv("ADMIN_API_KEY")
	DriverAPIKey = os.Getenv("DRIVER_API_KEY")
	BusAPIKey = os.Getenv("BUS_API_KEY")

	// Initialize the database
	storage.InitDB()

	// Populate the database with dummy data
	populateDummyData()

	// Set up routes
	router := routes.SetupRoutes()

	// Configure CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8081"}, // Frontend origin
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}).Handler(router)

	// Start the server
	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", corsHandler); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}

func populateDummyData() {
	// Insert dummy app state with a square mile in Bushwick, Brooklyn, NY
	err := storage.UpdateAppState(models.AppState{
		RideStatus: "Riding",
		HomeGeobox: [4]models.Location{
			{Latitude: 40.7062, Longitude: -73.9336}, // Top-Left
			{Latitude: 40.7062, Longitude: -73.9202}, // Top-Right
			{Latitude: 40.6952, Longitude: -73.9202}, // Bottom-Right
			{Latitude: 40.6952, Longitude: -73.9336}, // Bottom-Left
		},
	})
	if err != nil {
		log.Printf("Failed to insert dummy app state: %v", err)
	}

	// Insert dummy locations using SaveLocation
	dummyLocations := []models.TripLocation{
		{Location: models.Location{Latitude: 40.7000, Longitude: -73.9300}, TripID: 1},
		{Location: models.Location{Latitude: 40.7020, Longitude: -73.9250}, TripID: 1},
		{Location: models.Location{Latitude: 40.7040, Longitude: -73.9280}, TripID: 1},
	}
	for _, location := range dummyLocations {
		err := storage.SaveTripLocation(location)
		if err != nil {
			log.Printf("Failed to insert dummy location: %v", err)
		}
	}
}

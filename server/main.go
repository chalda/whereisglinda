package main

import (
	"log"
	"os"
	"whereisglinda-backend/logger"
	"whereisglinda-backend/routes"
	"whereisglinda-backend/storage"

	"github.com/joho/godotenv"
)

var (
	AdminAPIKey  string
	DriverAPIKey string
	BusAPIKey    string
	Env          string
)

// main is the entry point for the server. It loads environment variables, initializes logging and the database, and starts the HTTP server.
func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Load API keys
	AdminAPIKey = os.Getenv("ADMIN_API_KEY")
	DriverAPIKey = os.Getenv("DRIVER_API_KEY")
	BusAPIKey = os.Getenv("BUS_API_KEY")
	Env = os.Getenv("ENV")
	LogLevel := os.Getenv("LOG_LEVEL")

	logger.InitLogger(LogLevel)

	// Initialize the database
	storage.InitDB()

	// Start http server
	routes.StartServer()
}

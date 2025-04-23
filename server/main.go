package main

import (
	"log"
	"os"
	"whereisglinda-backend/routes"
	"whereisglinda-backend/storage"

	"github.com/joho/godotenv"
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

	// Start http server
	routes.StartServer()
}

package main

import (
    "log"
    "net/http"
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

    // Set up routes
    router := routes.SetupRoutes()

    // Start the server
    log.Println("Starting server on :8080...")
    if err := http.ListenAndServe(":8080", router); err != nil {
        log.Fatalf("Could not start server: %s\n", err.Error())
    }
}

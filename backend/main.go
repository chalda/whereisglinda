package main

import (
    "log"
    "net/http"
    "whereisglinda-backend/routes"
    "whereisglinda-backend/storage"
)

func main() {
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

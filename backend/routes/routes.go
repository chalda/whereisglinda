package routes

import (
    "github.com/gorilla/mux"
    "whereisglinda-backend/handlers"
)

func SetupRoutes() *mux.Router {
    router := mux.NewRouter()

    router.HandleFunc("/locations", handlers.Authorize("bus", handlers.AddLocation)).Methods("POST")
    router.HandleFunc("/subscribe", handlers.SubscribeLocation).Methods("GET") // No API key required
    router.HandleFunc("/state/ride-status", handlers.Authorize("driver", handlers.SetRideStatus)).Methods("POST")
    router.HandleFunc("/state/home-geobox", handlers.Authorize("admin", handlers.SetHomeGeobox)).Methods("POST")
    router.HandleFunc("/trip", handlers.Authorize("driver", handlers.SetTrip)).Methods("POST")
    router.HandleFunc("/validate-key", handlers.ValidateKey).Methods("POST") // New endpoint

    return router
}

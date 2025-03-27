package routes

import (
    "github.com/gorilla/mux"
    "whereisglinda-backend/handlers"
)

func SetupRoutes() *mux.Router {
    router := mux.NewRouter()

    router.HandleFunc("/locations", handlers.Authorize("bus", handlers.AddLocation)).Methods("POST")
    router.HandleFunc("/subscribe", handlers.SubscribeLocation).Methods("GET") // No API key required
    router.HandleFunc("/state", handlers.Authorize("driver", handlers.GetAppState)).Methods("GET")
    router.HandleFunc("/state", handlers.Authorize("driver", handlers.SetAppState)).Methods("POST")
    router.HandleFunc("/trip", handlers.Authorize("driver", handlers.SetTrip)).Methods("POST")
    router.HandleFunc("/validate-key", handlers.ValidateKey).Methods("POST") // New endpoint

    return router
}

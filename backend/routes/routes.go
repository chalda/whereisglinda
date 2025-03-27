package routes

import (
    "github.com/gorilla/mux"
    "whereisglinda-backend/handlers"
)

func SetupRoutes() *mux.Router {
    router := mux.NewRouter()

    router.HandleFunc("/locations", handlers.AddLocation).Methods("POST")
    router.HandleFunc("/subscribe", handlers.SubscribeLocation).Methods("GET")
    router.HandleFunc("/state", handlers.GetAppState).Methods("GET")
    router.HandleFunc("/state", handlers.SetAppState).Methods("POST")
    router.HandleFunc("/trip", handlers.SetTrip).Methods("POST")

    return router
}

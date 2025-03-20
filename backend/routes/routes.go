package routes

import (
    "net/http"

    "github.com/gorilla/mux"
    "whereisglinda-backend/handlers"
)

func SetupRoutes() *mux.Router {
    router := mux.NewRouter()

    router.HandleFunc("/locations", handlers.AddLocation).Methods("POST")
    router.HandleFunc("/subscribe", handlers.SubscribeLocation).Methods("GET")

    return router
}

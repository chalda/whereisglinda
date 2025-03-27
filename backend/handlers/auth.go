package handlers

import (
    "encoding/json"
    "net/http"
    "os"
)

// Middleware to validate API key and role
func Authorize(requiredRole string, next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        apiKey := r.Header.Get("Authorization")
        if apiKey == "" {
            http.Error(w, "Missing API key", http.StatusUnauthorized)
            return
        }

        // Determine the role based on the API key
        role := getRoleForKey(apiKey)
        if role == "" {
            http.Error(w, "Invalid API key", http.StatusUnauthorized)
            return
        }

        // Check if the user's role has sufficient permissions
        if !hasPermission(role, requiredRole) {
            http.Error(w, "Insufficient permissions", http.StatusForbidden)
            return
        }

        next(w, r)
    }
}

// Get the role for a given API key
func getRoleForKey(apiKey string) string {
    if apiKey == os.Getenv("ADMIN_API_KEY") {
        return "admin"
    }
    if apiKey == os.Getenv("DRIVER_API_KEY") {
        return "driver"
    }
    if apiKey == os.Getenv("BUS_API_KEY") {
        return "bus"
    }
    return ""
}

// Check if the user's role has sufficient permissions
func hasPermission(userRole, requiredRole string) bool {
    roles := map[string]int{
        "bus":    1,
        "driver": 2,
        "admin":  3,
    }

    return roles[userRole] >= roles[requiredRole]
}

func ValidateKey(w http.ResponseWriter, r *http.Request) {
    var request struct {
        APIKey string `json:"apiKey"`
    }

    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    role := getRoleForKey(request.APIKey)
    if role == "" {
        http.Error(w, "Invalid API key", http.StatusUnauthorized)
        return
    }

    response := struct {
        Role string `json:"role"`
    }{
        Role: role,
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(response)
}
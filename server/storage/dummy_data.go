package storage

import (
	"bytes"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"time"
	"whereisglinda-backend/models"
)

// PopulateDummyData populates the database with dummy data for testing
func PopulateDummyData() {
	// Create a new trip
	trip := models.Trip{
		Name:       "Dummy Trip",
		Status:     "Active",
		RideStatus: "Riding",
	}
	err := CreateTrip(DB, &trip)
	if err != nil {
		log.Printf("Failed to insert dummy trip: %v", err)
		return
	}

	// Insert a dummy geobox
	dummyGeobox := []models.Location{
		{Latitude: 40.6896606, Longitude: -73.9338723},
		{Latitude: 40.690362, Longitude: -73.9428729},
		{Latitude: 40.6874401, Longitude: -73.9363585},
		{Latitude: 40.6888631, Longitude: -73.9359374},
	}
	err = SaveGeobox(dummyGeobox)
	if err != nil {
		log.Printf("Failed to insert dummy geobox: %v", err)
		return
	}

	// Insert another dummy geobox
	anotherGeobox := []models.Location{
		{Latitude: 40.7000, Longitude: -73.9300},
		{Latitude: 40.7020, Longitude: -73.9250},
		{Latitude: 40.7040, Longitude: -73.9280},
		{Latitude: 40.7060, Longitude: -73.9320},
	}
	err = SaveGeobox(anotherGeobox)
	if err != nil {
		log.Printf("Failed to insert another dummy geobox: %v", err)
	}

	// Get the active trip ID
	tripID, err := GetActiveTripID()
	if err != nil {
		log.Printf("Failed to get active trip ID: %v", err)
		return
	}

	// Insert dummy locations for the active trip
	dummyLocations := []models.TripLocation{
		{Location: models.Location{Latitude: 40.7000, Longitude: -73.9300}, TripID: *tripID},
		{Location: models.Location{Latitude: 40.7020, Longitude: -73.9250}, TripID: *tripID},
		{Location: models.Location{Latitude: 40.7040, Longitude: -73.9280}, TripID: *tripID},
	}
	for _, location := range dummyLocations {
		err := SaveTripLocation(location)
		if err != nil {
			log.Printf("Failed to insert dummy location: %v", err)
		}
	}
}

// GenerateDummyLocationUpdates simulates periodic location updates for the active trip
func GenerateDummyLocationUpdates() {
	go func() {
		for {
			// Get the active trip ID
			tripID, err := GetActiveTripID()
			if err != nil || tripID == nil {
				log.Printf("No active trip found: %v", err)
				time.Sleep(10 * time.Second)
				continue
			}

			// Generate a random location within a small range
			latitude := 40.7000 + (rand.Float64()-0.5)*0.01
			longitude := -73.9300 + (rand.Float64()-0.5)*0.01

			// Save the location update
			location := models.TripLocation{
				Location: models.Location{
					Latitude:  latitude,
					Longitude: longitude,
				},
				TripID: *tripID,
			}
			err = SaveTripLocation(location)
			if err != nil {
				log.Printf("Failed to insert dummy location update: %v", err)
			} else {
				log.Printf("Inserted dummy location update: %+v", location)
			}

			// Wait for a random interval between 5 and 10 seconds
			time.Sleep(time.Duration(5+rand.Intn(5)) * time.Second)
		}
	}()
}

// StartDummyClient simulates a client sending location updates to the server
func StartDummyClient() {
	go func() {
		for {
			// Get the active trip ID
			tripID, err := GetActiveTripID()
			if err != nil || tripID == nil {
				log.Printf("No active trip found: %v", err)
				time.Sleep(10 * time.Second)
				continue
			}

			// Simulate a random location update
			currentTime := time.Now()
			locationUpdate := models.TripLocation{
				TripID: *tripID, // Use the dynamically fetched active trip ID
				Location: models.Location{
					Latitude:  40.7000 + (rand.Float64()-0.5)*0.01, // Generate random latitude
					Longitude: -73.9300 + (rand.Float64()-0.5)*0.01, // Generate random longitude
				},
				Timestamp: &currentTime, // Use a pointer to time.Time
			}

			// Marshal the location update into JSON
			data, err := json.Marshal(locationUpdate)
			if err != nil {
				log.Printf("Failed to marshal location update: %v", err)
				continue
			}

			// Send the location update to the server
			resp, err := http.Post("http://localhost:8080/locations", "application/json", bytes.NewBuffer(data))
			if err != nil {
				log.Printf("Failed to send location update: %v", err)
				continue
			}
			defer resp.Body.Close()

			// Log the successful update
			if resp.StatusCode == http.StatusOK {
				log.Printf("Sent location update: %+v", locationUpdate)
			} else {
				log.Printf("Failed to send location update, server responded with status: %d", resp.StatusCode)
			}

			// Wait for a random interval between 5 and 10 seconds
			time.Sleep(time.Duration(5+rand.Intn(5)) * time.Second)
		}
	}()
}

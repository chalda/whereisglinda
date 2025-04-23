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
	// trip := models.Trip{
	// 	Name:       "Dummy Trip",
	// 	RideStatus: "Riding",
	// 	Active:     true,
	// }
	err := StartTrip("", "Riding")
	if err != nil {
		log.Printf("Failed to insert dummy trip: %v", err)
		return
	}

	// Geofence 1
	dummyGeofence := []models.Location{
		{Latitude: 40.6896606, Longitude: -73.9338723},
		{Latitude: 40.690362, Longitude: -73.9428729},
		{Latitude: 40.6874401, Longitude: -73.9363585},
		{Latitude: 40.6888631, Longitude: -73.9359374},
	}
	if err := SaveGeofence(dummyGeofence); err != nil {
		log.Printf("Failed to insert dummy geofence: %v", err)
	}

	// Geofence 2
	anotherGeofence := []models.Location{
		{Latitude: 40.7000, Longitude: -73.9300},
		{Latitude: 40.7020, Longitude: -73.9250},
		{Latitude: 40.7040, Longitude: -73.9280},
		{Latitude: 40.7060, Longitude: -73.9320},
	}
	if err := SaveGeofence(anotherGeofence); err != nil {
		log.Printf("Failed to insert another dummy geofence: %v", err)
	}

	tripID, err := GetActiveTripID()
	if err != nil || tripID == nil {
		log.Printf("Failed to get active trip ID: %v", err)
		return
	}

	dummyLocations := []models.TripLocation{
		{Location: models.Location{Latitude: 40.7000, Longitude: -73.9300}, TripID: *tripID},
		{Location: models.Location{Latitude: 40.7020, Longitude: -73.9250}, TripID: *tripID},
		{Location: models.Location{Latitude: 40.7040, Longitude: -73.9280}, TripID: *tripID},
	}
	for _, location := range dummyLocations {
		if err := SaveTripLocation(location); err != nil {
			log.Printf("Failed to insert dummy location: %v", err)
		}
	}
}

// GenerateDummyLocationUpdates simulates periodic location updates for the active trip
func GenerateDummyLocationUpdates() {
	go func() {
		for {
			tripID, err := GetActiveTripID()
			if err != nil || tripID == nil {
				log.Printf("No active trip found: %v", err)
				time.Sleep(10 * time.Second)
				continue
			}

			lat := 40.7000 + (rand.Float64()-0.5)*0.01
			lng := -73.9300 + (rand.Float64()-0.5)*0.01

			location := models.TripLocation{
				TripID: *tripID,
				Location: models.Location{
					Latitude:  lat,
					Longitude: lng,
				},
			}

			if err := SaveTripLocation(location); err != nil {
				log.Printf("Failed to insert dummy location update: %v", err)
			} else {
				log.Printf("Inserted dummy location update: %+v", location)
			}

			time.Sleep(time.Duration(5+rand.Intn(5)) * time.Second)
		}
	}()
}

// StartDummyClient simulates a client sending location updates to the server
func StartDummyClient() {
	go func() {
		for {
			tripID, err := GetActiveTripID()
			if err != nil || tripID == nil {
				log.Printf("No active trip found: %v", err)
				time.Sleep(10 * time.Second)
				continue
			}

			locationUpdate := models.TripLocation{
				TripID: *tripID,
				Location: models.Location{
					Latitude:  40.7000 + (rand.Float64()-0.5)*0.01,
					Longitude: -73.9300 + (rand.Float64()-0.5)*0.01,
				},
			}

			data, err := json.Marshal(locationUpdate)
			if err != nil {
				log.Printf("Failed to marshal location update: %v", err)
				continue
			}

			resp, err := http.Post("http://localhost:8080/locations", "application/json", bytes.NewBuffer(data))
			if err != nil {
				log.Printf("Failed to send location update: %v", err)
				continue
			}
			defer resp.Body.Close()

			if resp.StatusCode == http.StatusCreated {
				log.Printf("Sent location update: %+v", locationUpdate)
			} else {
				log.Printf("Failed to send location update, server responded with status: %d", resp.StatusCode)
			}

			time.Sleep(time.Duration(5+rand.Intn(5)) * time.Second)
		}
	}()
}

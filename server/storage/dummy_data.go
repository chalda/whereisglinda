package storage

import (
	"log"
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

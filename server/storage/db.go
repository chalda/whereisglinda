package storage

import (
	"database/sql"
	"time"
	"whereisglinda-backend/logger"
	"whereisglinda-backend/models"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

// InitDB initializes the SQLite database
func InitDB() {
	// Initialize the database connection
	var err error
	DB, err = sql.Open("sqlite3", "./whereisglinda.db")
	if err != nil {
		logger.Log.Error().Err(err).Msg("Failed to connect to the database")
		panic(err)
	}

	// Create tables
	createTables()

	// populate dummy data
	//@TODO: remove this in production
	//PopulateDummyData()

	anotherGeofence := []models.Location{
		{Latitude: 40.7000, Longitude: -73.9300},
		{Latitude: 40.7020, Longitude: -73.9250},
		{Latitude: 40.7040, Longitude: -73.9280},
		{Latitude: 40.7060, Longitude: -73.9320},
	}
	SaveGeofence(anotherGeofence)

	HOME_GEOFENCE, err = GetLatestGeofence()
	if err != nil {
		logger.Log.Error().Err(err).Msg("Failed to get geofence")
		panic(err)
	}

	// Start a background routine to end inactive trips
	go func() {
		for {
			err := EndInactiveTrips()
			if err != nil {
				logger.Log.Error().Err(err).Msg("Error ending inactive trips")
			}
			time.Sleep(1 * time.Hour) // Run every hour
		}
	}()

	//go MonitorTripInactivity()
}

func createTables() {
	// Create trips table
	_, err := DB.Exec(`
        CREATE TABLE IF NOT EXISTS trips (
			trip_id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			start_time DATETIME NOT NULL,
			end_time DATETIME,
			ride_status TEXT DEFAULT '',
			active BOOLEAN DEFAULT 1
		);
    `)

	if err != nil {
		logger.Log.Error().Err(err).Msg("Failed to create trips table")
		panic(err)
	}

	_, err = DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS one_active_trip ON trips (active) WHERE active = 1;`)

	if err != nil {
		logger.Log.Error().Err(err).Msg("Failed to create trips indexx")
		panic(err)
	}
	// Create locations table
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
			in_geofence BOOLEAN,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
        )
    `)
	if err != nil {
		logger.Log.Error().Err(err).Msg("Failed to create locations table")
		panic(err)
	}

	// Create geofence table
	_, err = DB.Exec(`
	 CREATE TABLE IF NOT EXISTS geofence (
		 id INTEGER PRIMARY KEY AUTOINCREMENT,
		 geofence_id INTEGER NOT NULL,
		 latitude REAL NOT NULL,
		 longitude REAL NOT NULL
	 )
 `)
	if err != nil {
		logger.Log.Error().Err(err).Msg("Failed to create geofence table")
		panic(err)
	}
}

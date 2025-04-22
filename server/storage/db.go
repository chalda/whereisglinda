package storage

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

// InitDB initializes the SQLite database
func InitDB() {
	// Initialize the database connection
	var err error
	DB, err = sql.Open("sqlite3", "./whereisglinda.db")
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	// Create tables
	createTables()

	HOME_GEOFENCE, err = GetGeobox()
	if err != nil {
		log.Fatalf("Failed to get geobox: %v", err)
	}

	// Start a background routine to end inactive trips
	go func() {
		for {
			err := EndInactiveTrips()
			if err != nil {
				log.Printf("Error ending inactive trips: %v", err)
			}
			time.Sleep(1 * time.Hour) // Run every hour
		}
	}()

	go MonitorTripInactivity()
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
		log.Fatalf("Failed to create trips table: %v", err)
	}

	_, err = DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS one_active_trip ON trips (active) WHERE active = 1;`)

	if err != nil {
		log.Fatalf("Failed to create trips indexx: %v", err)
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
		log.Fatalf("Failed to create locations table: %v", err)
	}

	// Create geobox table
	_, err = DB.Exec(`
	 CREATE TABLE IF NOT EXISTS geobox (
		 id INTEGER PRIMARY KEY AUTOINCREMENT,
		 geobox_id INTEGER NOT NULL,
		 latitude REAL NOT NULL,
		 longitude REAL NOT NULL
	 )
 `)
	if err != nil {
		log.Fatalf("Failed to create geobox table: %v", err)
	}
}

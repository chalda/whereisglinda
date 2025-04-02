package storage

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

// InitDB initializes the SQLite database
func InitDB() {
	var err error
	DB, err = sql.Open("sqlite3", "./app.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	// Create tables if they don't exist
	createTables()
}

func createTables() {
	// Create trips table to manage the current trip ID
	_, err := DB.Exec(`
        CREATE TABLE IF NOT EXISTS trips (
            trip_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_time DATETIME,
            status TEXT
        )
    `)

	if err != nil {
		log.Fatalf("Failed to create trips table: %v", err)
	}

	// Insert default trip ID if not exists
	_, err = DB.Exec(`
        INSERT OR IGNORE INTO trips (currentTripID)
        VALUES (1)
    `)
	if err != nil {
		log.Fatalf("Failed to insert default trip ID: %v", err)
	}

	// Create locations table
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
        )
    `)
	if err != nil {
		log.Fatalf("Failed to create locations table: %v", err)
	}

	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            ride_status TEXT NOT NULL,
            home_geobox TEXT NOT NULL
        )
    `)
	if err != nil {
		log.Fatalf("Failed to create app_state table: %v", err)
	}

	// Insert default app state if not exists
	_, err = DB.Exec(`
        INSERT OR IGNORE INTO app_state (id, ride_status, home_geobox)
        VALUES (1, 'Chilling', '[]')
    `)
	if err != nil {
		log.Fatalf("Failed to insert default app state: %v", err)
	}
}

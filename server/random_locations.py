import requests
import random
import time

# Set API endpoint and headers
# base_url = "https://glindabus.hopto.org/api"
base_url = "http://localhost:8080"

headers = {
    "Authorization": "admin-key",
    "Content-Type": "application/json"
}

while True:
    # Create a new trip
    trip_url = f"{base_url}/trip"
    trip_payload = {
        "rideStatus": "Riding"
    }
    trip_response = requests.post(trip_url, headers=headers, json=trip_payload)

    # Check if trip creation was successful
    if trip_response.status_code != 201:
        print(f"Error creating trip: {trip_response.text}")
        exit(1)

    # Get the trip ID from the response
    trip_id = trip_response.json()["tripId"]

    # Set initial latitude and longitude values for Brooklyn, NY
    lat = 40.6900698
    lng = -73.9692725
    try:
        while True:
            # Generate random latitude and longitude values near Brooklyn, NY
            lat += random.uniform(-0.005, 0.005)
            lng += random.uniform(-0.005, 0.005)

            # Ensure latitude and longitude values are within reasonable bounds
            lat = max(40.5, min(lat, 40.8))
            lng = max(-74.1, min(lng, -73.8))

            # Create JSON payload for location update
            location_payload = {
                "latitude": lat,
                "longitude": lng,
                "tripID": trip_id
            }

            # Send POST request to API endpoint
            location_url = f"{base_url}/locations"
            location_response = requests.post(location_url, headers=headers, json=location_payload)

            # Check if request was successful
            if location_response.status_code != 201:
                print(f"Error updating location: {location_response.text}")

            # Wait 15 seconds before sending next request
            time.sleep(3)
    except:
        print("error")
    
import React, { useState } from 'react';
import LocationTracker from '../components/LocationTracker';

const Tracker = () => {
  const [apiKey, setApiKey] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [rideStatus, setRideStatus] = useState('Riding');
  const [tripID, setTripID] = useState('');
  const [homeGeobox, setHomeGeobox] = useState([
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 0 },
  ]);

  const handleApiKeySubmit = async () => {
    try {
      const response = await fetch('/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsKeyValid(true);
        setUserRole(data.role); // Assume server returns role: "admin", "driver", or "bus"
      } else {
        alert('Invalid API Key');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
    }
  };

  const updateAppState = async () => {
    try {
      const response = await fetch('/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: JSON.stringify({ rideStatus, homeGeobox }),
      });

      if (response.ok) {
        alert('App state updated successfully!');
      } else {
        alert('Failed to update app state.');
      }
    } catch (error) {
      console.error('Error updating app state:', error);
    }
  };

  const updateTripID = async () => {
    try {
      const response = await fetch('/trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: JSON.stringify({ tripID: parseInt(tripID, 10) }),
      });

      if (response.ok) {
        alert('Trip ID updated successfully!');
      } else {
        alert('Failed to update trip ID.');
      }
    } catch (error) {
      console.error('Error updating trip ID:', error);
    }
  };

  const renderInputs = () => {
    return (
      <div>
        {(userRole === 'admin' || userRole === 'driver') && (
          <div>
            <label>
              Ride Status:
              <select value={rideStatus} onChange={(e) => setRideStatus(e.target.value)}>
                <option value="Riding">Riding</option>
                <option value="Private">Private</option>
                <option value="Home">Home</option>
              </select>
            </label>
            <button onClick={updateAppState}>Update Ride Status</button>
          </div>
        )}

        {(userRole === 'admin' || userRole === 'driver') && (
          <div>
            <label>
              Trip ID:
              <input
                type="text"
                value={tripID}
                onChange={(e) => setTripID(e.target.value)}
                placeholder="Enter Trip ID"
              />
            </label>
            <button onClick={updateTripID}>Update Trip ID</button>
          </div>
        )}

        {userRole === 'admin' && (
          <div>
            <h3>Home Geobox</h3>
            {homeGeobox.map((point, index) => (
              <div key={index}>
                <label>
                  Latitude {index + 1}:
                  <input
                    type="number"
                    value={point.latitude}
                    onChange={(e) =>
                      setHomeGeobox((prev) =>
                        prev.map((p, i) =>
                          i === index ? { ...p, latitude: parseFloat(e.target.value) } : p
                        )
                      )
                    }
                  />
                </label>
                <label>
                  Longitude {index + 1}:
                  <input
                    type="number"
                    value={point.longitude}
                    onChange={(e) =>
                      setHomeGeobox((prev) =>
                        prev.map((p, i) =>
                          i === index ? { ...p, longitude: parseFloat(e.target.value) } : p
                        )
                      )
                    }
                  />
                </label>
              </div>
            ))}
            <button onClick={updateAppState}>Update Home Geobox</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {!isKeyValid ? (
        <div>
          <h1>Enter API Key</h1>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
          <button onClick={handleApiKeySubmit}>Submit</button>
        </div>
      ) : (
        <div>
          <h1>Tracker</h1>
          {renderInputs()}
          {userRole === 'bus' && <LocationTracker apiKey={apiKey} trackingEnabled={true} />}
        </div>
      )}
    </div>
  );
};

export default Tracker;

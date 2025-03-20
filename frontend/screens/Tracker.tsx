import React, { useState } from 'react';
import LocationTracker from './Tracker/LocationTracker'; // Import the new component

const Tracker = () => {
  const [apiKey, setApiKey] = useState('');
  const [userType, setUserType] = useState(null);
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [status, setStatus] = useState('Riding');

  const handleApiKeySubmit = async () => {
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsKeyValid(true);
        setUserType(data.userType); // Assume server returns userType: "bus" or "driver"
      } else {
        alert('Invalid API Key');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
    }
  };

  const renderInputs = () => {
    if (userType === 'bus') {
      return (
        <div>
          <label>
            Enable Tracking:
            <input
              type="checkbox"
              checked={trackingEnabled}
              onChange={(e) => setTrackingEnabled(e.target.checked)}
            />
          </label>
        </div>
      );
    } else if (userType === 'driver') {
      return (
        <div>
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Riding">Riding</option>
              <option value="Private">Private</option>
              <option value="Home">Home</option>
            </select>
          </label>
        </div>
      );
    }
    return null;
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
          <LocationTracker apiKey={apiKey} trackingEnabled={trackingEnabled} />
        </div>
      )}
    </div>
  );
};

export default Tracker;

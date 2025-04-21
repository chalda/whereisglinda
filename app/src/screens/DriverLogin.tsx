import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

import { AppContext } from '../AppContext';
import { validateApiKey } from '../utils/api';
import AppControls from '../components/AppControls';

const DriverLogin = () => {
  const { activeTripId, activeTrip, apiKey, userRole, setApiKey, setUserRole } =
    useContext(AppContext);
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    try {
      const response = await validateApiKey(inputApiKey);

      if (response.success) {
        setApiKey(inputApiKey); // Save the API key in context
        //@ts-ignore-next-line
        setUserRole(response.role);
        console.log('Login successful');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (userRole === 'admin') {
    return (
      <View style={styles.container}>
        <AppControls />
        {/* Optionally include the map component here if needed */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter API Key:</Text>
      <TextInput
        style={styles.input}
        value={inputApiKey}
        onChangeText={setInputApiKey}
        placeholder="API Key"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  loginButton: {
    width: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
});

export default DriverLogin;

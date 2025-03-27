import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';

const DriverLogin = ({ navigation }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const { setUserRole, setApiKey: setGlobalApiKey } = useContext(AppContext);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        setError('Invalid API key');
        return;
      }

      const data = await response.json();
      setGlobalApiKey(apiKey);
      setUserRole(data.role);
      navigation.navigate('Map'); // Navigate to the Map screen
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter API Key"
        value={apiKey}
        onChangeText={setApiKey}
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
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '80%',
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

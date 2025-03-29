import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

import { AppContext } from '../context/AppContext'; // Import AppContext for global state
import { validateApiKey } from '../utils/api';

const DriverLogin: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { setApiKey, setUserRole } = useContext(AppContext);
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    try {
      const response = await validateApiKey(inputApiKey);

      if (response.success) {
        setApiKey(inputApiKey); // Save the API key in context
        setUserRole(response.role); // Save the user role in context
        console.log('Login successful');
        navigation.navigate('Map'); // Navigate to the Map screen
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

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

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAsyncStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        setValue(storedValue === null ? defaultValue : JSON.parse(storedValue));
      } catch (error) {
        console.error('Error loading from AsyncStorage:', error);
        setValue(defaultValue);
      }
    };
    loadStoredValue();
  }, [key, defaultValue]);

  const setValueInStorage = async (newValue) => {
    try {
      const valueToStore = typeof newValue === 'function' ? newValue(value) : newValue;
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      setValue(valueToStore);
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  };

  return [value, setValueInStorage];
}
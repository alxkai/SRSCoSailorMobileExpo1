import React, { useState, useEffect, createContext } from 'react';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname } from 'expo-router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {
    const [isMobile, setIsMobile] = useState(Dimensions.get('window').width < 500);

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setIsMobile(window.width < 500);
        });

        return () => subscription?.remove();
    }, []);

    const [testing, setTesting] = useState(false);
    const [token, setToken] = useState(null);

    const loadStorageData = async () => {
        try {
            const storedTesting = await AsyncStorage.getItem('testingStatus');
            const storedToken = await AsyncStorage.getItem('token');
            
            setTesting(storedTesting === 'true');
            setToken(storedToken);
        } catch (error) {
            console.error('Error loading storage data:', error);
        }
    };

    const setTestingStatus = async (value) => {
        try {
            await AsyncStorage.setItem('testingStatus', String(value));
            setTesting(value);
        } catch (error) {
            console.error('Error saving testing status:', error);
        }
    };

    const setTokenValue = async (value) => {
        try {
            await AsyncStorage.setItem('token', value);
            setToken(value);
        } catch (error) {
            console.error('Error saving token:', error);
        }
    };

    useEffect(() => {
        loadStorageData();
        const isTesting = __DEV__;
        setTestingStatus(isTesting);

        const fetchToken = async () => {
            const accessToken = await getAccessToken(isTesting);
            setTokenValue(accessToken || null);
        };

        fetchToken();
    }, []);

    // Add other state and functions as needed

    return (
        <AppContext.Provider
            value={{
                isMobile, testing, token,
                // Add other context values here
            }}
        >
            {children}
        </AppContext.Provider>
    );
};


import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAccessToken = async (isTesting = false) => {
  try {
    // For testing environment
    if (isTesting) {
      return 'test-token';
    }

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const getLoggedInUser = async (isTesting = false) => {
  try {
    // For testing environment
    if (isTesting) {
      return {
        userId: 'test-user-id',
        firstName: 'Test',
        lastName: 'User'
      };
    }

    // Get user from AsyncStorage
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting logged in user:', error);
    return null;
  }
};